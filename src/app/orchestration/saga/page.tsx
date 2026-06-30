"use client";
import React, { useState, useCallback, useEffect, useRef } from "react";

// ─────────────────────────────────────────────────────────────
// 1. TYPE DEFINITIONS — Saga-aware Blueprint Data Model
// ─────────────────────────────────────────────────────────────

type NodeType = "blueprint" | "group" | "action" | "decision" | "marker";
type SagaStepStatus = "pending" | "running" | "completed" | "failed" | "compensating" | "compensated" | "skipped";
type SagaMode = "orchestration" | "choreography";
type ExecutionMode = "sequential" | "parallel";

interface CompensationConfig {
  action_ref: string;            // Reference to compensating action
  timeout_ms: number;            // Max time before compensation is force-failed
  retry_policy: {
    max_retries: number;
    backoff_ms: number;
    backoff_multiplier: number;
  };
  idempotency_key_expr?: string; // Expression to derive idempotency key
}

interface SagaNodeConfig {
  compensation?: CompensationConfig;
  saga_participant_id?: string;  // Service/module responsible
  isolation_level?: "read_committed" | "serializable";
  timeout_ms?: number;
}

interface EntryLogic {
  preconditions?: Array<{ field: string; operator: string; value: unknown }>;
  guard_expression?: string;     // OPA policy ref or inline expression
}

interface ExitLogic {
  success_criteria?: Array<{ field: string; operator: string; value: unknown }>;
  failure_triggers?: string[];
  on_failure: "compensate" | "retry" | "skip" | "halt";
}

interface ActionHooks {
  pre_execute?: string;          // Hook ref before execution
  post_execute?: string;         // Hook ref after execution
  on_compensation?: string;      // Hook ref when compensating
}

// The blueprint node — maps directly to your orch_blueprint schema
interface BlueprintNode {
  id: string;
  type: NodeType;
  label: string;
  sequence: number;
  parent_group_id?: string;
  entry_logic: EntryLogic;
  exit_logic: ExitLogic;
  node_config: SagaNodeConfig;
  action_hooks: ActionHooks;
}

// Blueprint definition
interface SagaBlueprintDef {
  id: string;
  name: string;
  version: number;
  saga_mode: SagaMode;
  execution_mode: ExecutionMode;
  nodes: BlueprintNode[];
  metadata: {
    tenant_id: string;
    created_by_party_role_mapping_id: string;
    description: string;
  };
}

// Runtime instance — maps to orch_instance
interface SagaInstance {
  id: string;
  blueprint_id: string;
  status: "active" | "completed" | "compensating" | "failed" | "compensated";
  current_node_index: number;
  compensation_stack: string[];  // Node IDs to compensate in reverse
  step_states: Record<string, SagaStepState>;
  started_at: number;
  completed_at?: number;
  context: Record<string, unknown>; // Shared saga context / payload
}

interface SagaStepState {
  node_id: string;
  status: SagaStepStatus;
  started_at?: number;
  completed_at?: number;
  error?: string;
  result?: unknown;
  compensation_result?: unknown;
  retry_count: number;
}

// ─────────────────────────────────────────────────────────────
// 2. SAGA COORDINATOR — Core advancement + compensation logic
// ─────────────────────────────────────────────────────────────

// Simulated async action executor
const simulateAction = (
  label: string,
  failureChance: number
): Promise<{ success: boolean; data?: string; error?: string }> =>
  new Promise((resolve) => {
    const duration = 600 + Math.random() * 1400;
    setTimeout(() => {
      if (Math.random() < failureChance) {
        resolve({ success: false, error: `${label} failed: service unavailable` });
      } else {
        resolve({ success: true, data: `${label} result OK` });
      }
    }, duration);
  });

const simulateCompensation = (label: string): Promise<{ success: boolean }> =>
  new Promise((resolve) => {
    setTimeout(() => resolve({ success: true }), 400 + Math.random() * 600);
  });

// ─────────────────────────────────────────────────────────────
// 3. EXAMPLE BLUEPRINT — Employee Onboarding Saga
// ─────────────────────────────────────────────────────────────

const ONBOARDING_SAGA: SagaBlueprintDef = {
  id: "bp_onboard_001",
  name: "Employee Onboarding",
  version: 1,
  saga_mode: "orchestration",
  execution_mode: "sequential",
  nodes: [
    {
      id: "n1", type: "action", label: "Create User Account", sequence: 1,
      entry_logic: { preconditions: [{ field: "employee.name", operator: "exists", value: true }] },
      exit_logic: { on_failure: "compensate" },
      node_config: {
        compensation: {
          action_ref: "deleteUserAccount",
          timeout_ms: 5000,
          retry_policy: { max_retries: 2, backoff_ms: 500, backoff_multiplier: 2 },
        },
        saga_participant_id: "iam-service",
        timeout_ms: 10000,
      },
      action_hooks: { post_execute: "audit.log.user_created", on_compensation: "audit.log.user_deleted" },
    },
    {
      id: "n2", type: "action", label: "Provision Qiwa Record", sequence: 2,
      entry_logic: { guard_expression: "opa:policy/qiwa_eligibility" },
      exit_logic: { on_failure: "compensate" },
      node_config: {
        compensation: {
          action_ref: "revokeQiwaRecord",
          timeout_ms: 8000,
          retry_policy: { max_retries: 3, backoff_ms: 1000, backoff_multiplier: 2 },
        },
        saga_participant_id: "gov-integration-service",
        timeout_ms: 15000,
      },
      action_hooks: { pre_execute: "validate.iqama_number" },
    },
    {
      id: "n3", type: "action", label: "Register in GOSI", sequence: 3,
      entry_logic: {},
      exit_logic: { on_failure: "compensate" },
      node_config: {
        compensation: {
          action_ref: "deregisterGOSI",
          timeout_ms: 8000,
          retry_policy: { max_retries: 2, backoff_ms: 1000, backoff_multiplier: 2 },
        },
        saga_participant_id: "gov-integration-service",
        timeout_ms: 12000,
      },
      action_hooks: {},
    },
    {
      id: "n4", type: "marker", label: "Gov Registration Complete", sequence: 4,
      entry_logic: {},
      exit_logic: { on_failure: "halt" },
      node_config: {},
      action_hooks: {},
    },
    {
      id: "n5", type: "action", label: "Assign to Project", sequence: 5,
      entry_logic: { preconditions: [{ field: "project.id", operator: "exists", value: true }] },
      exit_logic: { on_failure: "compensate" },
      node_config: {
        compensation: {
          action_ref: "unassignFromProject",
          timeout_ms: 5000,
          retry_policy: { max_retries: 1, backoff_ms: 500, backoff_multiplier: 1 },
        },
        saga_participant_id: "project-service",
      },
      action_hooks: {},
    },
    {
      id: "n6", type: "action", label: "Send Welcome Email", sequence: 6,
      entry_logic: {},
      exit_logic: { on_failure: "skip" },
      node_config: { saga_participant_id: "notification-service" },
      action_hooks: {},
    },
  ],
  metadata: {
    tenant_id: "tenant_acme_001",
    created_by_party_role_mapping_id: "prm_hr_admin_042",
    description: "Full employee onboarding with Saudi gov integrations (Qiwa, GOSI)",
  },
};

// ─────────────────────────────────────────────────────────────
// 4. VISUAL SAGA MONITOR — React Component
// ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<SagaStepStatus, { color: string; bg: string; icon: string; glow?: string }> = {
  pending:      { color: "#7a8599", bg: "#1e2233", icon: "○" },
  running:      { color: "#4fc3f7", bg: "#0d2a3d", icon: "◉", glow: "0 0 12px #4fc3f740" },
  completed:    { color: "#66bb6a", bg: "#1a2e1a", icon: "✓" },
  failed:       { color: "#ef5350", bg: "#2e1a1a", icon: "✗", glow: "0 0 12px #ef535040" },
  compensating: { color: "#ffa726", bg: "#2e2510", icon: "⟲", glow: "0 0 12px #ffa72640" },
  compensated:  { color: "#ab47bc", bg: "#251a2e", icon: "↩" },
  skipped:      { color: "#546e7a", bg: "#1a2028", icon: "⊘" },
};

const NODE_TYPE_BADGE: Record<NodeType, { label: string; color: string }> = {
  blueprint: { label: "BP", color: "#7c4dff" },
  group:     { label: "GRP", color: "#00bcd4" },
  action:    { label: "ACT", color: "#4fc3f7" },
  decision:  { label: "DEC", color: "#ffa726" },
  marker:    { label: "MRK", color: "#66bb6a" },
};

export default function SagaBlueprintMonitor() {
  const [instance, setInstance] = useState<SagaInstance | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [log, setLog] = useState<Array<{ ts: number; msg: string; level: "info" | "warn" | "error" | "success" }>>([]);
  const [failAt, setFailAt] = useState<string>("n3");
  const logEndRef = useRef<HTMLDivElement>(null);
  const blueprint = ONBOARDING_SAGA;

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

  const addLog = useCallback((msg: string, level: "info" | "warn" | "error" | "success" = "info") => {
    setLog((prev) => [...prev, { ts: Date.now(), msg, level }]);
  }, []);

  const initInstance = useCallback((): SagaInstance => {
    const stepStates: Record<string, SagaStepState> = {};
    blueprint.nodes.forEach((n) => {
      stepStates[n.id] = { node_id: n.id, status: "pending", retry_count: 0 };
    });
    return {
      id: `saga_${Date.now()}`,
      blueprint_id: blueprint.id,
      status: "active",
      current_node_index: 0,
      compensation_stack: [],
      step_states: stepStates,
      started_at: Date.now(),
      context: { employee: { name: "Ahmed Al-Rashid", iqama: "2412XXXXXX" }, project: { id: "proj_riyadh_metro" } },
    };
  }, [blueprint]);

  const updateStep = useCallback((inst: SagaInstance, nodeId: string, patch: Partial<SagaStepState>): SagaInstance => {
    return {
      ...inst,
      step_states: {
        ...inst.step_states,
        [nodeId]: { ...inst.step_states[nodeId], ...patch },
      },
    };
  }, []);

  // ── Forward execution (orchestration-based) ──
  const runSaga = useCallback(async () => {
    setIsRunning(true);
    setLog([]);
    let inst = initInstance();
    setInstance(inst);
    addLog(`Saga ${inst.id} started — mode: ${blueprint.saga_mode}`, "info");

    const actionNodes = blueprint.nodes.filter((n) => n.type === "action" || n.type === "marker");

    for (let i = 0; i < actionNodes.length; i++) {
      const node = actionNodes[i];
      inst = { ...inst, current_node_index: i };

      // Marker nodes pass through
      if (node.type === "marker") {
        addLog(`⊳ Milestone reached: "${node.label}"`, "success");
        inst = updateStep(inst, node.id, { status: "completed", started_at: Date.now(), completed_at: Date.now() });
        setInstance({ ...inst });
        continue;
      }

      // Start action
      addLog(`▸ Executing: "${node.label}" [${node.node_config.saga_participant_id}]`, "info");
      inst = updateStep(inst, node.id, { status: "running", started_at: Date.now() });
      setInstance({ ...inst });

      // Simulate — deterministic failure at selected node
      const shouldFail = node.id === failAt;
      const result = await simulateAction(node.label, shouldFail ? 1.0 : 0.0);

      if (result.success) {
        addLog(`  ✓ "${node.label}" completed`, "success");
        inst = updateStep(inst, node.id, { status: "completed", completed_at: Date.now(), result: result.data });
        // Push to compensation stack (only if it has a compensation config)
        if (node.node_config.compensation) {
          inst = { ...inst, compensation_stack: [...inst.compensation_stack, node.id] };
        }
        setInstance({ ...inst });
      } else {
        addLog(`  ✗ "${node.label}" failed: ${result.error}`, "error");
        inst = updateStep(inst, node.id, { status: "failed", completed_at: Date.now(), error: result.error });

        const failureAction = node.exit_logic.on_failure;

        if (failureAction === "skip") {
          addLog(`  ⊘ Skipping "${node.label}" per exit_logic`, "warn");
          inst = updateStep(inst, node.id, { status: "skipped" });
          setInstance({ ...inst });
          continue;
        }

        if (failureAction === "compensate") {
          // ── Begin compensation (reverse walk) ──
          addLog(`⟲ Triggering compensation — ${inst.compensation_stack.length} step(s) to reverse`, "warn");
          inst = { ...inst, status: "compensating" };
          setInstance({ ...inst });

          // Walk compensation stack in reverse
          const stack = [...inst.compensation_stack].reverse();
          for (const compensateNodeId of stack) {
            const cNode = blueprint.nodes.find((n) => n.id === compensateNodeId)!;
            const comp = cNode.node_config.compensation!;

            addLog(`  ↩ Compensating: "${cNode.label}" → ${comp.action_ref}`, "warn");
            inst = updateStep(inst, compensateNodeId, { status: "compensating" });
            setInstance({ ...inst });

            const compResult = await simulateCompensation(cNode.label);
            if (compResult.success) {
              addLog(`  ↩ "${cNode.label}" compensated successfully`, "success");
              inst = updateStep(inst, compensateNodeId, { status: "compensated", compensation_result: "reversed" });
            } else {
              addLog(`  ✗ Compensation failed for "${cNode.label}" — manual intervention required`, "error");
            }
            setInstance({ ...inst });
          }

          // Mark remaining pending nodes as skipped
          blueprint.nodes.forEach((n) => {
            if (inst.step_states[n.id].status === "pending") {
              inst = updateStep(inst, n.id, { status: "skipped" });
            }
          });

          inst = { ...inst, status: "compensated", completed_at: Date.now() };
          setInstance({ ...inst });
          addLog(`Saga ${inst.id} — fully compensated`, "warn");
          setIsRunning(false);
          return;
        }

        if (failureAction === "halt") {
          inst = { ...inst, status: "failed", completed_at: Date.now() };
          setInstance({ ...inst });
          addLog(`Saga ${inst.id} — halted (no compensation)`, "error");
          setIsRunning(false);
          return;
        }
      }
    }

    inst = { ...inst, status: "completed", completed_at: Date.now() };
    setInstance({ ...inst });
    addLog(`Saga ${inst.id} — completed successfully`, "success");
    setIsRunning(false);
  }, [blueprint, failAt, initInstance, updateStep, addLog]);

  const elapsed = instance
    ? ((instance.completed_at || Date.now()) - instance.started_at) / 1000
    : 0;

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', system-ui, sans-serif",
      background: "linear-gradient(145deg, #0a0e1a 0%, #111827 50%, #0d1117 100%)",
      color: "#c9d1d9",
      minHeight: "100vh",
      padding: "32px 24px",
    }}>
      {/* Header */}
      <div style={{ maxWidth: 960, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 4 }}>
          <h1 style={{
            fontSize: 22, fontWeight: 700, color: "#e6edf3", margin: 0,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            letterSpacing: "-0.5px",
          }}>
            saga<span style={{ color: "#4fc3f7" }}>.</span>monitor
          </h1>
          <span style={{
            fontSize: 11, color: "#4fc3f7", background: "#4fc3f710",
            padding: "2px 8px", borderRadius: 4, fontFamily: "monospace",
          }}>
            {blueprint.saga_mode.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: 13, color: "#6b7b8d", margin: "4px 0 24px", fontFamily: "monospace" }}>
          Blueprint: {blueprint.name} v{blueprint.version} — {blueprint.metadata.description}
        </p>

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, marginBottom: 28, alignItems: "center", flexWrap: "wrap" }}>
          <button
            onClick={runSaga}
            disabled={isRunning}
            style={{
              padding: "8px 20px", fontSize: 13, fontWeight: 600,
              background: isRunning ? "#1e2233" : "linear-gradient(135deg, #4fc3f7, #2196f3)",
              color: isRunning ? "#546e7a" : "#fff",
              border: "none", borderRadius: 6, cursor: isRunning ? "not-allowed" : "pointer",
              fontFamily: "'DM Sans', sans-serif",
              boxShadow: isRunning ? "none" : "0 2px 12px #2196f330",
              transition: "all 0.2s",
            }}
          >
            {isRunning ? "Running…" : "▶ Execute Saga"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "#6b7b8d", fontFamily: "monospace" }}>fail_at:</label>
            <select
              value={failAt}
              onChange={(e) => setFailAt(e.target.value)}
              disabled={isRunning}
              style={{
                padding: "4px 8px", fontSize: 12, background: "#1e2233", color: "#c9d1d9",
                border: "1px solid #2d3748", borderRadius: 4, fontFamily: "monospace",
              }}
            >
              <option value="">None (all succeed)</option>
              {blueprint.nodes.filter(n => n.type === "action").map((n) => (
                <option key={n.id} value={n.id}>{n.label}</option>
              ))}
            </select>
          </div>

          {instance && (
            <div style={{
              marginLeft: "auto", display: "flex", gap: 16, fontSize: 12,
              fontFamily: "monospace", color: "#6b7b8d",
            }}>
              <span>
                status:{" "}
                <span style={{
                  color: instance.status === "completed" ? "#66bb6a"
                    : instance.status === "compensated" ? "#ab47bc"
                    : instance.status === "failed" ? "#ef5350"
                    : instance.status === "compensating" ? "#ffa726"
                    : "#4fc3f7",
                  fontWeight: 600,
                }}>
                  {instance.status}
                </span>
              </span>
              <span>elapsed: {elapsed.toFixed(1)}s</span>
            </div>
          )}
        </div>

        {/* Pipeline View */}
        <div style={{
          background: "#0d1117", border: "1px solid #1e2233", borderRadius: 10,
          padding: "24px 20px", marginBottom: 20,
        }}>
          <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "monospace", marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>
            Pipeline — {blueprint.nodes.length} nodes
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 0, overflowX: "auto", paddingBottom: 8 }}>
            {blueprint.nodes.map((node, i) => {
              const stepState = instance?.step_states[node.id];
              const status = stepState?.status || "pending";
              const cfg = STATUS_CONFIG[status];
              const badge = NODE_TYPE_BADGE[node.type];

              return (
                <React.Fragment key={node.id}>
                  {i > 0 && (
                    <div style={{
                      width: 32, height: 2, flexShrink: 0,
                      background: status === "completed" || status === "compensated"
                        ? cfg.color + "60"
                        : "#2d3748",
                      transition: "background 0.4s",
                    }} />
                  )}
                  <div style={{
                    minWidth: 120, padding: "14px 12px", borderRadius: 8,
                    background: cfg.bg,
                    border: `1px solid ${cfg.color}30`,
                    boxShadow: cfg.glow || "none",
                    transition: "all 0.3s",
                    flexShrink: 0,
                    position: "relative",
                  }}>
                    {/* Node type badge */}
                    <div style={{
                      position: "absolute", top: -8, left: 8,
                      fontSize: 9, fontWeight: 700, fontFamily: "monospace",
                      color: badge.color, background: "#0d1117",
                      padding: "1px 6px", borderRadius: 3,
                      border: `1px solid ${badge.color}40`,
                      letterSpacing: 0.5,
                    }}>
                      {badge.label}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                      <span style={{
                        fontSize: 16, color: cfg.color, lineHeight: 1,
                        animation: status === "running" ? "pulse 1.2s infinite" : status === "compensating" ? "spin 1s linear infinite" : "none",
                      }}>
                        {cfg.icon}
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#e6edf3", lineHeight: 1.3 }}>
                        {node.label}
                      </span>
                    </div>

                    {node.node_config.saga_participant_id && (
                      <div style={{
                        fontSize: 10, color: "#4a5568", fontFamily: "monospace",
                        marginTop: 6,
                      }}>
                        {node.node_config.saga_participant_id}
                      </div>
                    )}

                    {node.node_config.compensation && (
                      <div style={{
                        fontSize: 10, color: "#ab47bc80", fontFamily: "monospace",
                        marginTop: 3,
                      }}>
                        ↩ {node.node_config.compensation.action_ref}
                      </div>
                    )}

                    {stepState?.error && (
                      <div style={{
                        fontSize: 10, color: "#ef5350", marginTop: 6,
                        wordBreak: "break-word", lineHeight: 1.3,
                      }}>
                        {stepState.error}
                      </div>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Execution Log */}
        <div style={{
          background: "#0d1117", border: "1px solid #1e2233", borderRadius: 10,
          padding: "16px 20px", maxHeight: 280, overflowY: "auto",
        }}>
          <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "monospace", marginBottom: 10, textTransform: "uppercase", letterSpacing: 1 }}>
            Execution Log
          </div>
          {log.length === 0 && (
            <div style={{ fontSize: 12, color: "#2d3748", fontFamily: "monospace", padding: "20px 0", textAlign: "center" }}>
              Press "Execute Saga" to begin
            </div>
          )}
          {log.map((entry, i) => (
            <div key={i} style={{
              fontSize: 12, fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              padding: "3px 0", lineHeight: 1.5,
              color: entry.level === "error" ? "#ef5350"
                : entry.level === "warn" ? "#ffa726"
                : entry.level === "success" ? "#66bb6a"
                : "#8b949e",
            }}>
              <span style={{ color: "#2d3748", marginRight: 8, fontSize: 10 }}>
                {new Date(entry.ts).toLocaleTimeString()}
              </span>
              {entry.msg}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>

        {/* Schema Reference */}
        <div style={{
          marginTop: 20, background: "#0d1117", border: "1px solid #1e2233",
          borderRadius: 10, padding: "16px 20px",
        }}>
          <div style={{ fontSize: 11, color: "#4a5568", fontFamily: "monospace", marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>
            Blueprint Schema — orch_blueprint + saga extensions
          </div>
          <pre style={{
            fontSize: 11, fontFamily: "'JetBrains Mono', monospace",
            color: "#8b949e", lineHeight: 1.7, margin: 0,
            whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}>
{`-- Saga-aware blueprint node (extends orch_blueprint)
CREATE TABLE orch_blueprint (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  name            TEXT NOT NULL,
  version         INT NOT NULL DEFAULT 1,
  saga_mode       TEXT CHECK (saga_mode IN ('orchestration','choreography')),
  execution_mode  TEXT CHECK (execution_mode IN ('sequential','parallel')),
  created_by_prm  UUID REFERENCES party_role_mapping(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE orch_blueprint_node (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id    UUID NOT NULL REFERENCES orch_blueprint(id),
  type            TEXT NOT NULL CHECK (type IN ('blueprint','group','action','decision','marker')),
  label           TEXT NOT NULL,
  sequence        INT NOT NULL,
  parent_group_id UUID REFERENCES orch_blueprint_node(id),
  entry_logic     JSONB NOT NULL DEFAULT '{}',
  exit_logic      JSONB NOT NULL DEFAULT '{"on_failure":"halt"}',
  node_config     JSONB NOT NULL DEFAULT '{}',   -- saga compensation lives here
  action_hooks    JSONB NOT NULL DEFAULT '{}'
);

-- Runtime instance
CREATE TABLE orch_instance (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id        UUID NOT NULL REFERENCES orch_blueprint(id),
  tenant_id           UUID NOT NULL,
  status              TEXT NOT NULL DEFAULT 'active',
  current_node_index  INT NOT NULL DEFAULT 0,
  compensation_stack  UUID[] DEFAULT '{}',
  step_states         JSONB NOT NULL DEFAULT '{}',
  context             JSONB NOT NULL DEFAULT '{}',
  started_at          TIMESTAMPTZ DEFAULT now(),
  completed_at        TIMESTAMPTZ,
  -- Advisory lock for saga instance advancement
  CONSTRAINT saga_instance_lock UNIQUE (id)
);`}
          </pre>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2d3748; border-radius: 3px; }
      `}</style>
    </div>
  );
}
