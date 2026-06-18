"use client";
import React, { useState, useEffect } from "react";
import { Shield, Users, Eye, Lock, AlertTriangle, CheckCircle, XCircle, ArrowRight, ArrowDown, ChevronDown, ChevronRight, Zap, FileText, Activity, Layers, GitBranch, Database, Clock, Play, Pause, RotateCcw, ThumbsUp, ThumbsDown, MessageSquare, Bell, Settings, Search, Filter, ChevronLeft, MoreHorizontal, ExternalLink, Info, Hash, Tag, User, Inbox, BarChart3, ShieldCheck, Code } from "lucide-react";

const C = {
  bg: "#0A0D12", surface: "#12161E", surface2: "#181D28", surface3: "#1E2433",
  border: "#252D3D", borderHi: "#3B4563", borderActive: "#4A7CFF40",
  text: "#E4E7ED", textSoft: "#9BA3B5", textDim: "#5A6478", textGhost: "#3D4555",
  blue: "#4A7CFF", blueBg: "#4A7CFF10", blueBorder: "#4A7CFF25", blueText: "#8FB5FF",
  amber: "#E5A830", amberBg: "#E5A83010", amberBorder: "#E5A83025", amberText: "#F0CA6E",
  green: "#34D399", greenBg: "#34D39910", greenBorder: "#34D39925", greenText: "#6EE7B4",
  red: "#F87171", redBg: "#F8717110", redBorder: "#F8717125", redText: "#FCA5A5",
  coral: "#FB923C", coralBg: "#FB923C10",
  purple: "#A78BFA", purpleBg: "#A78BFA10", purpleBorder: "#A78BFA25", purpleText: "#C4B5FD",
};

const mono = "'JetBrains Mono', 'Fira Code', monospace";
const sans = "'DM Sans', -apple-system, sans-serif";

// ─── SHARED COMPONENTS ────────────────────────────

const Badge = ({ color = "blue", children, size = "sm" }) => {
  const s = size === "xs" ? { px: 6, py: 1, fs: 9 } : { px: 10, py: 2, fs: 11 };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: `${s.py}px ${s.px}px`, borderRadius: 20, fontSize: s.fs, fontWeight: 650,
      letterSpacing: "0.04em", textTransform: "uppercase", whiteSpace: "nowrap",
      background: C[color + "Bg"] || C.blueBg, color: C[color + "Text"] || C.blueText,
      border: `1px solid ${C[color + "Border"] || C.blueBorder}`,
    }}>{children}</span>
  );
};

const Pill = ({ active, onClick, children }) => (
  <button onClick={onClick} style={{
    padding: "7px 16px", borderRadius: 8, border: `1px solid ${active ? C.blue : C.border}`,
    background: active ? C.blueBg : "transparent", color: active ? C.blueText : C.textSoft,
    fontSize: 13, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: sans, transition: "all 0.15s",
  }}>{children}</button>
);

const CodeBlock = ({ children, title }) => (
  <div style={{ background: C.bg, borderRadius: 10, border: `1px solid ${C.border}`, overflow: "hidden" }}>
    {title && <div style={{ padding: "8px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 11, fontWeight: 700, color: C.textDim, letterSpacing: "0.05em", textTransform: "uppercase", background: C.surface }}>{title}</div>}
    <pre style={{ margin: 0, padding: 18, fontFamily: mono, fontSize: 11.5, lineHeight: 1.85, color: C.textSoft, overflowX: "auto", whiteSpace: "pre-wrap" }}>{children}</pre>
  </div>
);

const P = ({ children }) => <p style={{ fontSize: 13.5, lineHeight: 1.75, color: C.textSoft, margin: "0 0 14px 0", fontFamily: sans }}>{children}</p>;

const Section = ({ icon: Icon, title, color = "blue", children, subtitle }) => (
  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
    <div style={{ padding: "20px 24px", borderBottom: `1px solid ${C.border}`, background: C.surface2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {Icon && <Icon size={17} color={C[color]} />}
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: C.text, fontFamily: sans }}>{title}</h3>
      </div>
      {subtitle && <div style={{ fontSize: 12, color: C.textSoft, marginTop: 6, lineHeight: 1.6 }}>{subtitle}</div>}
    </div>
    <div style={{ padding: 24 }}>{children}</div>
  </div>
);

const KeyValue = ({ label, children }) => (
  <div style={{ display: "grid", gridTemplateColumns: "160px 1fr", gap: 12, fontSize: 12, padding: "8px 0", borderBottom: `1px solid ${C.border}08` }}>
    <span style={{ color: C.blueText, fontWeight: 700 }}>{label}</span>
    <span style={{ color: C.textSoft, lineHeight: 1.6 }}>{children}</span>
  </div>
);

// ─── OPA PATTERNS TAB ─────────────────────────────

const POLICY_PATTERNS = [
  {
    id: "hierarchy",
    title: "Policy Hierarchy & Resolution",
    icon: Layers,
    desc: "How policies are organized, inherited, and resolved when multiple policies apply to the same action.",
  },
  {
    id: "gate",
    title: "Gate Level Determination",
    icon: Shield,
    desc: "The core pattern — evaluating an AI action proposal and determining which HITL gate level applies.",
  },
  {
    id: "boundary",
    title: "Organizational Boundary Policies",
    icon: Users,
    desc: "Policies that enforce org structure: department boundaries, role escalation, delegation chains.",
  },
  {
    id: "data",
    title: "Data Protection Policies",
    icon: Lock,
    desc: "PII handling, data residency enforcement, cross-border transfer rules, field-level access control.",
  },
  {
    id: "temporal",
    title: "Time & Context-Aware Policies",
    icon: Clock,
    desc: "Policies that change behavior based on time, calendar, SLA state, or operational context.",
  },
  {
    id: "composite",
    title: "Composite & Meta-Policies",
    icon: GitBranch,
    desc: "Policies that combine multiple policy results into a final decision. The 'policy of policies.'",
  },
];

function PolicyHierarchy() {
  return (<>
    <P>Apps4x policies follow a four-tier hierarchy. When multiple policies apply, the <em style={{ color: C.amberText }}>most restrictive result wins</em> (deny-by-default). Each tier can only tighten constraints set by the tier above, never loosen them.</P>
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
      {[
        { tier: "T0 — Platform", desc: "Hardcoded by Apps4x. Cannot be overridden. Examples: 'No AI action may execute without a reasoning trace', 'All mutations must have a trust chain record', 'PII may never appear in AI training data.'", color: C.red, badge: "Immutable" },
        { tier: "T1 — Regulatory", desc: "PDPL, NCA, ZATCA requirements encoded as policy. Tenant admins can see but not modify. Updated by Apps4x when regulations change. Versioned with effective dates.", color: C.amber, badge: "Read-Only" },
        { tier: "T2 — Organization", desc: "Tenant-specific policies set by the org admin. Department boundaries, financial thresholds, working hours, approval chains. This is where most customization happens.", color: C.blue, badge: "Configurable" },
        { tier: "T3 — Blueprint", desc: "Per-blueprint overrides. A WorkOrder blueprint may have stricter financial controls than a Ticket blueprint. These refine T2 policies for specific work types.", color: C.green, badge: "Inheritable" },
      ].map(t => (
        <div key={t.tier} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, padding: 16, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}`, borderLeft: `3px solid ${t.color}` }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: t.color }}>{t.tier}</div>
            <Badge color={t.color === C.red ? "red" : t.color === C.amber ? "amber" : t.color === C.blue ? "blue" : "green"} size="xs">{t.badge}</Badge>
          </div>
          <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.7 }}>{t.desc}</div>
        </div>
      ))}
    </div>
    <CodeBlock title="resolution algorithm — most restrictive wins">
      <span style={{ color: C.textDim }}>{"# Policy resolution: collect all applicable policies, take strictest"}</span>{"\n"}
      <span style={{ color: C.blueText }}>package</span>{" apps4x.governance.resolver\n\n"}
      <span style={{ color: C.textDim }}>{"# Import all policy tiers"}</span>{"\n"}
      {"import data.platform    "}  <span style={{ color: C.textDim }}>{"# T0"}</span>{"\n"}
      {"import data.regulatory  "}  <span style={{ color: C.textDim }}>{"# T1"}</span>{"\n"}
      {"import data.organization"} <span style={{ color: C.textDim }}>{"# T2"}</span>{"\n"}
      {"import data.blueprint   "}  <span style={{ color: C.textDim }}>{"# T3"}</span>{"\n\n"}
      <span style={{ color: C.textDim }}>{"# Collect gate levels from all tiers"}</span>{"\n"}
      {"gate_levels[level] {\n"}
      {"    level := platform.gate_level\n}\n"}
      {"gate_levels[level] {\n"}
      {"    level := regulatory.gate_level\n}\n"}
      {"gate_levels[level] {\n"}
      {"    level := organization.gate_level\n}\n"}
      {"gate_levels[level] {\n"}
      {"    level := blueprint.gate_level\n}\n\n"}
      <span style={{ color: C.textDim }}>{"# Gate level ordering: L4 > L3 > L2 > L1 > L0"}</span>{"\n"}
      {"gate_order := {\"L0\": 0, \"L1\": 1, \"L2\": 2, \"L3\": 3, \"L4\": 4}\n\n"}
      <span style={{ color: C.textDim }}>{"# Final result: highest (most restrictive) gate level"}</span>{"\n"}
      <span style={{ color: C.amberText }}>{"final_gate_level"}</span>{" := level {\n"}
      {"    level := max({l | l := gate_levels[_]})\n}\n\n"}
      <span style={{ color: C.textDim }}>{"# Collect all deny reasons for the audit trail"}</span>{"\n"}
      <span style={{ color: C.redText }}>{"deny_reasons"}</span>{"[reason] {\n"}
      {"    reason := platform.deny[_]\n}\n"}
      {"deny_reasons[reason] {\n"}
      {"    reason := regulatory.deny[_]\n}"}
    </CodeBlock>
  </>);
}

function GateDetermination() {
  return (<>
    <P>This is the most-used pattern. Every AI action proposal is evaluated against a gate determination policy that considers: action type, confidence score, financial impact, data sensitivity, and organizational context.</P>
    <CodeBlock title="gate_determination.rego — core pattern">
      <span style={{ color: C.blueText }}>package</span>{" apps4x.governance.gate\n\n"}
      <span style={{ color: C.textDim }}>{"# ── INPUT SCHEMA ──\n# input.action       = { type, entity, proposed_mutation, estimated_cost }\n# input.ai           = { confidence, model_version, reasoning_trace_id }\n# input.context      = { actor, department, tenant, timestamp, sla_state }\n# input.entity       = { blueprint, current_state, sensitivity_level }\n"}</span>{"\n"}
      <span style={{ color: C.amberText }}>{"default gate_level = \"L2\""}</span>{"    "}
      <span style={{ color: C.textDim }}>{"# Safe default: require approval"}</span>{"\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ L0: AUTO-EXECUTE ═══\n# High confidence + low risk + known-safe action type"}</span>{"\n"}
      {"gate_level = \"L0\" {\n"}
      {"    input.ai.confidence >= 0.85\n"}
      {"    input.action.type in low_risk_actions\n"}
      {"    input.action.estimated_cost <= cost_threshold_auto\n"}
      {"    not crosses_department_boundary\n"}
      {"    not involves_pii\n"}
      {"    input.entity.sensitivity_level in {\"public\", \"internal\"}\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ L1: NOTIFY & PROCEED ═══\n# High confidence but medium-risk indicators"}</span>{"\n"}
      {"gate_level = \"L1\" {\n"}
      {"    input.ai.confidence >= 0.85\n"}
      {"    input.action.type in medium_risk_actions\n"}
      {"    input.action.estimated_cost <= cost_threshold_notify\n"}
      {"    not involves_pii\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ L3: REVIEW & MODIFY ═══\n# Low confidence — AI is advisory only"}</span>{"\n"}
      {"gate_level = \"L3\" {\n"}
      {"    input.ai.confidence < 0.60\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ L4: HARD BLOCK ═══\n# Absolute prohibitions — no AI execution path"}</span>{"\n"}
      {"gate_level = \"L4\" {\n"}
      {"    input.action.type in blocked_actions\n}\n"}
      {"gate_level = \"L4\" {\n"}
      {"    input.action.estimated_cost > cost_threshold_block\n}\n"}
      {"gate_level = \"L4\" {\n"}
      {"    crosses_tenant_boundary\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ HELPER RULES ═══"}</span>{"\n"}
      {"crosses_department_boundary {\n"}
      {"    input.action.target_department != input.context.department\n}\n\n"}
      {"crosses_tenant_boundary {\n"}
      {"    input.action.target_tenant != input.context.tenant\n}\n\n"}
      {"involves_pii {\n"}
      {"    input.entity.fields[_].classification == \"pii\"\n"}
      {"    input.action.proposed_mutation.changed_fields[_] == input.entity.fields[_].name\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ CONFIGURABLE SETS (loaded from tenant config) ═══"}</span>{"\n"}
      {"low_risk_actions := data.tenant_config.action_risk_map.low\n"}
      {"medium_risk_actions := data.tenant_config.action_risk_map.medium\n"}
      {"blocked_actions := data.tenant_config.action_risk_map.blocked\n"}
      {"cost_threshold_auto := data.tenant_config.financial.auto_approve_limit\n"}
      {"cost_threshold_notify := data.tenant_config.financial.notify_limit\n"}
      {"cost_threshold_block := data.tenant_config.financial.block_limit"}
    </CodeBlock>
    <div style={{ marginTop: 16, padding: 16, background: C.amberBg, border: `1px solid ${C.amberBorder}`, borderRadius: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.amberText, marginBottom: 6 }}>Design Decision: Default to L2</div>
      <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.7 }}>The default gate level is L2 (require approval), not L0. This is intentional — if no rule explicitly grants a lower gate level, the action requires human approval. This is the "deny by default" principle applied to AI autonomy. New action types automatically require approval until an admin explicitly classifies their risk level.</div>
    </div>
  </>);
}

function BoundaryPolicies() {
  return (<>
    <P>Organizational boundary policies encode the invisible rules of enterprise structure: who can assign work to whom, which escalation paths are valid, and when delegation is permitted.</P>
    <CodeBlock title="org_boundary.rego — department & role enforcement">
      <span style={{ color: C.blueText }}>package</span>{" apps4x.governance.org_boundary\n\n"}
      <span style={{ color: C.textDim }}>{"# Cross-department assignment requires L2 gate"}</span>{"\n"}
      {"gate_level = \"L2\" {\n"}
      {"    input.action.type == \"work_item.assign\"\n"}
      {"    target_dept := data.users[input.action.target_assignee].department\n"}
      {"    target_dept != input.context.department\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# Escalation must follow the defined chain"}</span>{"\n"}
      {"deny[reason] {\n"}
      {"    input.action.type == \"work_item.escalate\"\n"}
      {"    target := input.action.escalation_target\n"}
      {"    not valid_escalation_target(input.context.actor, target)\n"}
      {"    reason := sprintf(\"Invalid escalation: %s cannot escalate to %s. \"\n"}
      {"        \"Valid targets: %v\", [input.context.actor, target,\n"}
      {"         get_valid_targets(input.context.actor)])\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# Delegation rules — who can approve on behalf of whom"}</span>{"\n"}
      {"allow_delegation {\n"}
      {"    delegator := input.context.original_approver\n"}
      {"    delegate := input.context.actor\n"}
      {"    data.delegation_registry[delegator].delegates[_] == delegate\n"}
      {"    data.delegation_registry[delegator].valid_until > input.context.timestamp\n"}
      {"    input.action.type in data.delegation_registry[delegator].permitted_actions\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# Span-of-control: max direct reports for auto-assignment"}</span>{"\n"}
      {"deny[reason] {\n"}
      {"    input.action.type == \"work_item.assign\"\n"}
      {"    assignee := input.action.target_assignee\n"}
      {"    current_load := count(data.active_items[assignee])\n"}
      {"    max_load := data.tenant_config.capacity[assignee].max_items\n"}
      {"    current_load >= max_load\n"}
      {"    reason := sprintf(\"%s is at capacity (%d/%d items)\",\n"}
      {"        [assignee, current_load, max_load])\n}"}
    </CodeBlock>
  </>);
}

function DataProtectionPolicies() {
  return (<>
    <P>Data protection policies run at the field level — they inspect what data is being accessed, modified, or exposed, and enforce PDPL requirements structurally.</P>
    <CodeBlock title="data_protection.rego — field-level enforcement">
      <span style={{ color: C.blueText }}>package</span>{" apps4x.governance.data_protection\n\n"}
      <span style={{ color: C.textDim }}>{"# ═══ PII EXPOSURE PREVENTION ═══\n# Block AI from including PII in generated outputs"}</span>{"\n"}
      {"deny[reason] {\n"}
      {"    input.action.type == \"ai.generate_response\"\n"}
      {"    output_fields := input.action.proposed_output_fields\n"}
      {"    field := output_fields[_]\n"}
      {"    data.field_registry[field].classification == \"pii\"\n"}
      {"    not input.action.pii_masking_applied\n"}
      {"    reason := sprintf(\"AI output contains unmasked PII field: %s\", [field])\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ DATA RESIDENCY ═══\n# Ensure data never leaves permitted geographic zones"}</span>{"\n"}
      {"deny[reason] {\n"}
      {"    input.context.request_origin_region != \"\"\n"}
      {"    entity_zone := data.residency_map[input.entity.tenant].zone\n"}
      {"    not region_in_zone(input.context.request_origin_region, entity_zone)\n"}
      {"    reason := sprintf(\"Data residency violation: request from %s, \"\n"}
      {"        \"data restricted to %s\",\n"}
      {"        [input.context.request_origin_region, entity_zone])\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ CONSENT-BASED PROCESSING ═══\n# Verify consent exists before processing personal data"}</span>{"\n"}
      {"deny[reason] {\n"}
      {"    input.action.type in {\"ai.classify\", \"ai.analyze\", \"ai.suggest\"}\n"}
      {"    data_subject := input.entity.data_subject_id\n"}
      {"    data_subject != \"\"\n"}
      {"    purpose := input.action.processing_purpose\n"}
      {"    not has_valid_consent(data_subject, purpose)\n"}
      {"    reason := sprintf(\"No consent for purpose '%s' from subject %s\",\n"}
      {"        [purpose, data_subject])\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ FIELD-LEVEL ACCESS ═══\n# Role-based field visibility"}</span>{"\n"}
      {"field_visible(field_name) {\n"}
      {"    role := input.context.actor_role\n"}
      {"    field_acl := data.field_registry[field_name].acl\n"}
      {"    field_acl.visible_to[_] == role\n}\n\n"}

      {"field_editable(field_name) {\n"}
      {"    field_visible(field_name)\n"}
      {"    role := input.context.actor_role\n"}
      {"    field_acl := data.field_registry[field_name].acl\n"}
      {"    field_acl.editable_by[_] == role\n"}
      {"    input.entity.current_state in field_acl.editable_in_states\n}"}
    </CodeBlock>
  </>);
}

function TemporalPolicies() {
  return (<>
    <P>Context-aware policies change behavior based on time, SLA state, operational load, or calendar events. These handle the reality that a safe action at 10am on Tuesday may be risky at 2am on Friday.</P>
    <CodeBlock title="temporal_context.rego — time & state aware">
      <span style={{ color: C.blueText }}>package</span>{" apps4x.governance.temporal\n\n"}
      <span style={{ color: C.textDim }}>{"# ═══ WORKING HOURS GATE ═══\n# Elevate gate level for after-hours AI actions"}</span>{"\n"}
      {"gate_level = \"L2\" {\n"}
      {"    not within_working_hours(input.context.timestamp,\n"}
      {"        data.tenant_config.working_hours)\n"}
      {"    input.action.type in data.tenant_config.time_sensitive_actions\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ SLA PRESSURE ═══\n# Relax gate level when SLA breach is imminent"}</span>{"\n"}
      {"gate_level = \"L0\" {\n"}
      {"    input.entity.sla_remaining_pct < 15\n"}
      {"    input.ai.confidence >= 0.75\n"}
      {"    input.action.type in sla_critical_actions\n"}
      {"    "}
      <span style={{ color: C.textDim }}>{"# Override: even under SLA pressure, financial actions stay gated"}</span>{"\n"}
      {"    not input.action.type in financial_actions\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ RAMADAN / HOLIDAY AWARENESS ═══\n# Adjust expectations during known calendar periods"}</span>{"\n"}
      {"gate_level = \"L1\" {\n"}
      {"    is_holiday_period(input.context.timestamp, data.tenant_config.calendar)\n"}
      {"    input.action.type == \"work_item.assign\"\n"}
      {"    "}
      <span style={{ color: C.textDim }}>{"# During holidays, auto-assign but notify (skeleton crew)"}</span>{"\n"}
      {"    input.ai.confidence >= 0.80\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ INCIDENT MODE ═══\n# When org declares an incident, widen AI autonomy for speed"}</span>{"\n"}
      {"gate_level = \"L0\" {\n"}
      {"    data.org_state.incident_mode == true\n"}
      {"    input.action.type in incident_response_actions\n"}
      {"    input.ai.confidence >= 0.70\n"}
      {"    "}
      <span style={{ color: C.textDim }}>{"# Log reason: relaxed due to incident mode"}</span>{"\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ COOLDOWN AFTER OVERRIDE ═══\n# If human overrode AI recently, require approval for same pattern"}</span>{"\n"}
      {"gate_level = \"L2\" {\n"}
      {"    similar_action := data.recent_overrides[_]\n"}
      {"    similar_action.action_type == input.action.type\n"}
      {"    similar_action.entity_blueprint == input.entity.blueprint\n"}
      {"    time_since(similar_action.timestamp, input.context.timestamp) < \"4h\"\n}"}
    </CodeBlock>
    <div style={{ marginTop: 16, padding: 16, background: C.greenBg, border: `1px solid ${C.greenBorder}`, borderRadius: 10 }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: C.greenText, marginBottom: 6 }}>Key Pattern: SLA Pressure Override</div>
      <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.7 }}>The SLA pressure rule is a controlled override — when a ticket is about to breach SLA (under 15% time remaining), the gate level drops to L0 even if confidence is slightly below the normal threshold (0.75 vs 0.85). This encodes the business reality that a slightly-wrong fast action is better than a perfect action that comes after the SLA breach. But note: financial actions are explicitly excluded — urgency never bypasses financial controls.</div>
    </div>
  </>);
}

function CompositePolicies() {
  return (<>
    <P>Composite policies combine results from multiple policy evaluations into a final decision. This is the "policy of policies" — the meta-layer that resolves conflicts and produces the final gate determination with a complete audit trail.</P>
    <CodeBlock title="composite_resolver.rego — final decision assembly">
      <span style={{ color: C.blueText }}>package</span>{" apps4x.governance.composite\n\n"}
      <span style={{ color: C.textDim }}>{"# Import all policy domains"}</span>{"\n"}
      {"import data.apps4x.governance.gate as core_gate\n"}
      {"import data.apps4x.governance.org_boundary as org\n"}
      {"import data.apps4x.governance.data_protection as data_prot\n"}
      {"import data.apps4x.governance.temporal as temporal\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ COLLECT ALL GATE LEVELS ═══"}</span>{"\n"}
      {"all_gates[{\"source\": \"core\", \"level\": level}] {\n"}
      {"    level := core_gate.gate_level\n}\n"}
      {"all_gates[{\"source\": \"org_boundary\", \"level\": level}] {\n"}
      {"    level := org.gate_level\n}\n"}
      {"all_gates[{\"source\": \"data_protection\", \"level\": level}] {\n"}
      {"    level := data_prot.gate_level\n}\n"}
      {"all_gates[{\"source\": \"temporal\", \"level\": level}] {\n"}
      {"    level := temporal.gate_level\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ COLLECT ALL DENIALS ═══"}</span>{"\n"}
      {"all_denials[{\"source\": s, \"reason\": r}] {\n"}
      {"    r := core_gate.deny[_]; s := \"core\"\n}\n"}
      {"all_denials[{\"source\": s, \"reason\": r}] {\n"}
      {"    r := org.deny[_]; s := \"org_boundary\"\n}\n"}
      {"all_denials[{\"source\": s, \"reason\": r}] {\n"}
      {"    r := data_prot.deny[_]; s := \"data_protection\"\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# ═══ FINAL DECISION ═══"}</span>{"\n"}
      <span style={{ color: C.amberText }}>{"decision"}</span>{" := {\n"}
      {"    \"gate_level\": final_level,\n"}
      {"    \"gate_sources\": all_gates,\n"}
      {"    \"denied\": count(all_denials) > 0,\n"}
      {"    \"deny_reasons\": all_denials,\n"}
      {"    \"policy_versions\": policy_versions,\n"}
      {"    \"evaluated_at\": input.context.timestamp,\n"}
      {"} {\n"}
      {"    final_level := max_gate(all_gates)\n}\n\n"}

      <span style={{ color: C.textDim }}>{"# This entire 'decision' object is stored in the Trust Chain"}</span>
    </CodeBlock>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
      {[
        { title: "Policy Versioning", desc: "Every policy file is versioned (semver). The composite decision records which version of each policy was active. This enables: 'What would have happened under policy v2.1 instead of v3.0?'" },
        { title: "Dry-Run Mode", desc: "Evaluate policies without executing. Used for: testing policy changes before rollout, impact analysis ('how many items would this new policy have blocked last month?'), and CI/CD policy validation." },
        { title: "Policy Simulation", desc: "Admin UI lets you paste a hypothetical action and see which policies fire, what gate level results, and which specific rules contributed. Essential for policy debugging." },
        { title: "Staged Rollout", desc: "New policies deploy through: shadow mode (evaluate but don't enforce, compare with current) → canary (enforce for 5% of actions) → gradual rollout → full enforcement. Rollback at any stage." },
      ].map(item => (
        <div key={item.title} style={{ padding: 14, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.purpleText, marginBottom: 6 }}>{item.title}</div>
          <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6 }}>{item.desc}</div>
        </div>
      ))}
    </div>
  </>);
}

function OPATab() {
  const [activePattern, setActivePattern] = useState("hierarchy");
  const patternContent = {
    hierarchy: <PolicyHierarchy />,
    gate: <GateDetermination />,
    boundary: <BoundaryPolicies />,
    data: <DataProtectionPolicies />,
    temporal: <TemporalPolicies />,
    composite: <CompositePolicies />,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 8px", fontFamily: sans }}>OPA Policy Patterns</h2>
        <P>The policy engine is the brain of governance. These six patterns cover 95% of enterprise policy needs. Each pattern is shown with real Rego code that maps to the Apps4x input schema.</P>
      </div>

      {/* Pattern Selector */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {POLICY_PATTERNS.map(p => {
          const Icon = p.icon;
          const active = activePattern === p.id;
          return (
            <button key={p.id} onClick={() => setActivePattern(p.id)} style={{
              padding: "14px 16px", borderRadius: 10, border: `1px solid ${active ? C.blueBorder : C.border}`,
              background: active ? C.blueBg : C.surface, cursor: "pointer", textAlign: "left", transition: "all 0.15s",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <Icon size={14} color={active ? C.blue : C.textDim} />
                <span style={{ fontSize: 12, fontWeight: 700, color: active ? C.blueText : C.textSoft }}>{p.title}</span>
              </div>
              <div style={{ fontSize: 11, color: C.textDim, lineHeight: 1.5 }}>{p.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Pattern Content */}
      <Section icon={Code} title={POLICY_PATTERNS.find(p => p.id === activePattern).title} color="blue" subtitle={POLICY_PATTERNS.find(p => p.id === activePattern).desc}>
        {patternContent[activePattern]}
      </Section>

      {/* Input Schema Reference */}
      <Section icon={Database} title="OPA Input Schema Reference" color="purple" subtitle="The standard input object passed to every policy evaluation">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { obj: "input.action", fields: "type, entity_id, proposed_mutation, target_assignee, target_department, estimated_cost, processing_purpose, escalation_target" },
            { obj: "input.ai", fields: "confidence, model_version, reasoning_trace_id, alternatives_count, input_quality_score" },
            { obj: "input.context", fields: "actor, actor_role, department, tenant, timestamp, request_origin_region, original_approver" },
            { obj: "input.entity", fields: "blueprint, current_state, sensitivity_level, data_subject_id, sla_remaining_pct, fields[].classification, tenant" },
          ].map(s => (
            <div key={s.obj} style={{ padding: 14, background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, color: C.purpleText, marginBottom: 8 }}>{s.obj}</div>
              <div style={{ fontSize: 11, color: C.textSoft, lineHeight: 1.7 }}>{s.fields}</div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

// ─── HITL UX TAB ──────────────────────────────────

function HITLTab() {
  const [activeScreen, setActiveScreen] = useState("inbox");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 8px", fontFamily: sans }}>HITL UX Flows</h2>
        <P>The human-in-the-loop experience must be frictionless — approvals that take too long defeat the purpose of AI automation. These screens show the complete approval lifecycle: from the reviewer's inbox, through the decision interface, to the feedback loop.</P>
      </div>

      {/* Screen Selector */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { id: "inbox", label: "Approval Inbox", icon: Inbox },
          { id: "detail", label: "Decision Interface", icon: Eye },
          { id: "trace", label: "Reasoning Trace View", icon: GitBranch },
          { id: "override", label: "Override & Feedback", icon: MessageSquare },
          { id: "config", label: "Gate Configuration", icon: Settings },
          { id: "analytics", label: "Governance Analytics", icon: BarChart3 },
        ].map(s => {
          const Icon = s.icon;
          return (
            <button key={s.id} onClick={() => setActiveScreen(s.id)} style={{
              display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${activeScreen === s.id ? C.blue : C.border}`,
              background: activeScreen === s.id ? C.blueBg : "transparent",
              color: activeScreen === s.id ? C.blueText : C.textSoft,
              fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: sans,
            }}><Icon size={13} />{s.label}</button>
          );
        })}
      </div>

      {activeScreen === "inbox" && <ApprovalInbox />}
      {activeScreen === "detail" && <DecisionInterface />}
      {activeScreen === "trace" && <ReasoningTraceView />}
      {activeScreen === "override" && <OverrideFeedback />}
      {activeScreen === "config" && <GateConfig />}
      {activeScreen === "analytics" && <GovernanceAnalytics />}
    </div>
  );
}

function MockScreen({ title, subtitle, children }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      {/* Mock App Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: C.surface2 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={16} color={C.blue} />
          <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</span>
          {subtitle && <span style={{ fontSize: 11, color: C.textDim }}>— {subtitle}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Search size={14} color={C.textDim} />
          <Filter size={14} color={C.textDim} />
          <Bell size={14} color={C.amber} />
        </div>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  );
}

function ApprovalInbox() {
  const items = [
    { id: "APR-2841", type: "Reassignment", entity: "TK-4821", gate: "L2", confidence: 0.82, priority: "P1", sla: "2h 14m", age: "4m ago", status: "pending", reason: "SLA pressure — current agent overloaded" },
    { id: "APR-2840", type: "Auto-Response", entity: "TK-4819", gate: "L2", confidence: 0.71, priority: "P2", sla: "6h 30m", age: "12m ago", status: "pending", reason: "Customer-facing reply — confidence below threshold" },
    { id: "APR-2839", type: "Escalation", entity: "CS-1102", gate: "L3", confidence: 0.58, priority: "P1", sla: "45m", age: "18m ago", status: "pending", reason: "Low confidence — AI recommends but requires human decision" },
    { id: "APR-2838", type: "Cost Approval", entity: "WO-3301", gate: "L2", confidence: 0.91, priority: "P3", sla: "—", age: "1h ago", status: "pending", reason: "Estimated cost 8,500 SAR exceeds auto-approve limit" },
    { id: "APR-2835", type: "Classification", entity: "TK-4815", gate: "L2", confidence: 0.67, priority: "P2", sla: "4h", age: "2h ago", status: "approved", reason: "Category ambiguous between Billing and Account Access" },
  ];

  return (<>
    <MockScreen title="Governance Inbox" subtitle="5 pending approvals">
      {/* Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Pending", value: "4", color: C.amber },
          { label: "Avg Decision Time", value: "3.2m", color: C.blue },
          { label: "Auto-Approved Today", value: "142", color: C.green },
          { label: "Override Rate", value: "8%", color: C.purple },
        ].map(s => (
          <div key={s.label} style={{ padding: "12px 14px", background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color, fontFamily: mono }}>{s.value}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {items.map(item => (
          <div key={item.id} style={{
            display: "grid", gridTemplateColumns: "80px 100px 1fr 70px 80px 90px 80px",
            gap: 10, padding: "12px 16px", background: item.status === "approved" ? "transparent" : C.surface2,
            borderRadius: 8, border: `1px solid ${C.border}`, alignItems: "center",
            opacity: item.status === "approved" ? 0.5 : 1,
          }}>
            <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 600, color: C.blueText }}>{item.id}</span>
            <Badge color={item.gate === "L3" ? "red" : item.gate === "L2" ? "amber" : "green"} size="xs">{item.gate} · {item.type}</Badge>
            <div>
              <div style={{ fontSize: 12, color: C.text, fontWeight: 600 }}>{item.entity} — {item.reason}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{
                width: 36, height: 6, borderRadius: 3, background: C.border, overflow: "hidden",
              }}>
                <div style={{
                  width: `${item.confidence * 100}%`, height: "100%", borderRadius: 3,
                  background: item.confidence >= 0.8 ? C.green : item.confidence >= 0.6 ? C.amber : C.red,
                }} />
              </div>
              <span style={{ fontFamily: mono, fontSize: 10, color: C.textDim }}>{item.confidence}</span>
            </div>
            <Badge color={item.priority === "P1" ? "red" : item.priority === "P2" ? "amber" : "blue"} size="xs">{item.priority}</Badge>
            <span style={{ fontSize: 11, color: item.sla === "45m" ? C.red : C.textSoft, fontWeight: item.sla === "45m" ? 700 : 400 }}>{item.sla !== "—" ? `⏱ ${item.sla}` : "No SLA"}</span>
            <span style={{ fontSize: 11, color: C.textDim }}>{item.age}</span>
          </div>
        ))}
      </div>
    </MockScreen>

    <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
      {[
        { title: "Priority Sorting", desc: "Inbox sorts by: SLA urgency (breach imminent first), then gate level (L3 before L2), then age (oldest first). Approvers always see the most critical items at top." },
        { title: "Batch Approve", desc: "Select multiple items of the same type/gate level and approve in batch. Each still gets its own trust chain record. Batch-reject not available — rejections require individual reasoning." },
        { title: "Timeout Escalation", desc: "If no decision within the configured timeout (default: 4h for L2, 1h for L3 during SLA pressure), the item auto-escalates to the next approver in the chain." },
      ].map(item => (
        <div key={item.title} style={{ padding: 14, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.blueText, marginBottom: 6 }}>{item.title}</div>
          <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6 }}>{item.desc}</div>
        </div>
      ))}
    </div>
  </>);
}

function DecisionInterface() {
  return (<>
    <MockScreen title="Approval Detail" subtitle="APR-2841 · Reassignment">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
        {/* Left: Context */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Header */}
          <div style={{ padding: 16, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Badge color="amber">L2 · Approval Required</Badge>
                <Badge color="red" size="xs">P1</Badge>
              </div>
              <span style={{ fontFamily: mono, fontSize: 11, color: C.textDim }}>4 min ago</span>
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 6 }}>
              AI proposes reassigning TK-4821 to Agent Khalid
            </div>
            <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.7 }}>
              Ticket "Payment gateway timeout in Riyadh datacenter" is currently assigned to Agent Omar, who has 12 active items. SLA has 2h 14m remaining. AI recommends reassignment to Agent Khalid (4 active items, Arabic proficiency, payment systems expertise).
            </div>
          </div>

          {/* AI Recommendation Panel */}
          <div style={{ padding: 16, background: C.amberBg, borderRadius: 10, border: `1px solid ${C.amberBorder}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <Zap size={14} color={C.amber} />
              <span style={{ fontSize: 13, fontWeight: 700, color: C.amberText }}>AI Recommendation</span>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 11, color: C.textDim }}>Confidence</span>
                <span style={{ fontFamily: mono, fontSize: 14, fontWeight: 800, color: C.amber }}>0.82</span>
              </div>
            </div>
            <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.7, marginBottom: 12 }}>
              Reassign to <strong style={{ color: C.text }}>Agent Khalid</strong>. He has the lowest queue depth among qualified agents, native Arabic proficiency for this Arabic-language ticket, and has resolved 23 similar payment gateway issues with an average resolution time of 1.8 hours.
            </div>
            <div style={{ fontSize: 11, color: C.textDim, fontStyle: "italic" }}>
              Alternatives considered: Agent Sara (score: 0.71, higher queue), Agent Fahad (score: 0.68, no payment expertise)
            </div>
          </div>

          {/* Current State */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={{ padding: 14, background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Assignment</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Agent Omar</div>
              <div style={{ fontSize: 11, color: C.red, marginTop: 4 }}>12 active items · 94% utilization</div>
            </div>
            <div style={{ padding: 14, background: C.surface2, borderRadius: 8, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Proposed Assignment</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>Agent Khalid</div>
              <div style={{ fontSize: 11, color: C.green, marginTop: 4 }}>4 active items · 38% utilization</div>
            </div>
          </div>
        </div>

        {/* Right: Action Panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Approve */}
          <button style={{
            padding: "14px 20px", borderRadius: 10, border: `1px solid ${C.greenBorder}`,
            background: C.greenBg, cursor: "pointer", textAlign: "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <CheckCircle size={18} color={C.green} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.greenText }}>Approve</span>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>Accept AI recommendation as-is. Action executes immediately.</div>
          </button>

          {/* Approve with modification */}
          <button style={{
            padding: "14px 20px", borderRadius: 10, border: `1px solid ${C.blueBorder}`,
            background: C.blueBg, cursor: "pointer", textAlign: "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Settings size={18} color={C.blue} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.blueText }}>Approve with Changes</span>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>Accept intent but modify parameters (e.g., different assignee).</div>
          </button>

          {/* Reject */}
          <button style={{
            padding: "14px 20px", borderRadius: 10, border: `1px solid ${C.redBorder}`,
            background: C.redBg, cursor: "pointer", textAlign: "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <XCircle size={18} color={C.red} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.redText }}>Reject</span>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>Reject recommendation. Requires a reason (feeds AI learning).</div>
          </button>

          {/* Delegate */}
          <button style={{
            padding: "14px 20px", borderRadius: 10, border: `1px solid ${C.border}`,
            background: C.surface2, cursor: "pointer", textAlign: "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Users size={18} color={C.textSoft} />
              <span style={{ fontSize: 14, fontWeight: 700, color: C.textSoft }}>Delegate</span>
            </div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 4 }}>Forward to another approver. Original SLA clock continues.</div>
          </button>

          {/* Policy Info */}
          <div style={{ padding: 14, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}`, marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.textDim, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>Why This Needs Approval</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { policy: "core_gate", reason: "Confidence 0.82 < 0.85 threshold" },
                { policy: "org_boundary", reason: "Cross-team assignment (Support → Payment Ops)" },
              ].map(p => (
                <div key={p.policy} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11, color: C.textSoft }}>
                  <ShieldCheck size={12} color={C.blue} style={{ marginTop: 2, flexShrink: 0 }} />
                  <div><span style={{ color: C.blueText, fontWeight: 600 }}>{p.policy}:</span> {p.reason}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeout */}
          <div style={{ padding: 10, background: C.amberBg, borderRadius: 8, border: `1px solid ${C.amberBorder}`, display: "flex", alignItems: "center", gap: 8 }}>
            <Clock size={13} color={C.amber} />
            <span style={{ fontSize: 11, color: C.amberText }}>Auto-escalates in <strong>3h 56m</strong> if no decision</span>
          </div>
        </div>
      </div>
    </MockScreen>

    <div style={{ marginTop: 16, padding: 16, background: C.surface, borderRadius: 10, border: `1px solid ${C.border}` }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>UX Design Principles for the Decision Interface</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { title: "Context Before Action", desc: "The left panel shows everything the reviewer needs to make a decision: the AI recommendation with reasoning, current vs. proposed state, confidence breakdown, and entity context. No clicking required to gather information." },
          { title: "One-Tap Approve, Multi-Step Reject", desc: "Approval is one tap — speed matters. Rejection requires a reason selection (from a taxonomy) plus optional free text — because rejections are training signals for the AI. This asymmetry is intentional." },
          { title: "Policy Transparency", desc: "The 'Why This Needs Approval' panel shows exactly which policies triggered the gate. Reviewers understand the system's reasoning, not just 'approval needed.' Builds trust in the governance layer." },
          { title: "Mobile-First Approval", desc: "The approval interface is designed for WhatsApp and mobile push. Reviewers can approve/reject from a notification without opening the full app. Essential for GCC workflow where managers are often mobile." },
        ].map(item => (
          <div key={item.title}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.blueText, marginBottom: 4 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </div>
  </>);
}

function ReasoningTraceView() {
  return (
    <Section icon={GitBranch} title="Reasoning Trace Explorer" color="blue" subtitle="How reviewers inspect the AI's complete decision chain">
      <P>The Reasoning Trace is not just a log — it's an interactive explorer. Reviewers can drill into each stage of the AI's decision, see what data it considered, what alternatives it rejected, and what policies constrained it.</P>

      {/* Trace Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: 0, marginBottom: 20 }}>
        {[
          { time: "14:32:01.102", stage: "Trigger", detail: "SLA monitor detected TK-4821 at 78% elapsed, current agent queue depth 12 (threshold: 10)", color: C.amber, icon: AlertTriangle },
          { time: "14:32:01.245", stage: "Input Assembly", detail: "Collected: ticket fields (14), agent roster (8 eligible), skill matrix, queue depths, SLA config, customer tier (Gold)", color: C.blue, icon: Database },
          { time: "14:32:01.512", stage: "Candidate Scoring", detail: "Scored 8 agents: Khalid (0.82), Sara (0.71), Fahad (0.68), Omar [current] (0.31), ... 4 others below 0.50", color: C.purple, icon: BarChart3 },
          { time: "14:32:01.634", stage: "Policy Evaluation", detail: "5 policies evaluated: core_gate (L0), org_boundary (L2), data_protection (PASS), temporal (L0), composite → L2", color: C.blue, icon: Shield },
          { time: "14:32:01.651", stage: "Gate Decision", detail: "L2 applied. Reason: org_boundary triggered (cross-team), confidence 0.82 < 0.85 auto-execute threshold", color: C.amber, icon: Shield },
          { time: "14:32:01.672", stage: "Queued for Approval", detail: "Routed to Team Lead queue (Approval Group: support-leads). Timeout: 4h → escalate to dept manager.", color: C.green, icon: Inbox },
        ].map((step, i) => (
          <div key={i} style={{ display: "flex", gap: 16 }}>
            {/* Timeline */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: step.color, flexShrink: 0, marginTop: 4, boxShadow: `0 0 8px ${step.color}40` }} />
              {i < 5 && <div style={{ width: 1, flex: 1, background: C.border, minHeight: 20 }} />}
            </div>
            {/* Content */}
            <div style={{ padding: "4px 0 16px 0", flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: C.textDim }}>{step.time}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: step.color }}>{step.stage}</span>
              </div>
              <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6, padding: "8px 12px", background: C.surface2, borderRadius: 6, border: `1px solid ${C.border}` }}>{step.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { title: "Input Snapshot Tab", desc: "Frozen copy of all data the AI saw at decision time. If the ticket fields changed after the AI made its recommendation, the reviewer sees what the AI actually worked with — not current state." },
          { title: "Alternatives Tab", desc: "Full scoring breakdown for all candidates considered, not just the winner. Shows why each alternative scored lower. Lets the reviewer pick an alternative without starting from scratch." },
          { title: "Policy Detail Tab", desc: "Click any policy evaluation to see the full Rego input/output, which specific rule matched, and the policy version. Links to the policy admin page for editing." },
          { title: "Replay Button", desc: "Re-run the same decision with current data (fields may have changed since the AI decided). Shows: 'If we re-evaluated now, the result would be: [same / different].' Builds confidence in approval." },
        ].map(item => (
          <div key={item.title} style={{ padding: 14, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.blueText, marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function OverrideFeedback() {
  return (
    <Section icon={MessageSquare} title="Override & Feedback Loop" color="amber" subtitle="How human decisions flow back into AI improvement">
      <P>Every human decision on an AI proposal — approve, modify, or reject — is a training signal. The feedback loop is the mechanism by which the governance system makes the AI smarter over time, not just safer.</P>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {/* Override Types */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { type: "Approve As-Is", pct: "72%", signal: "Positive reinforcement. The AI's scoring model, candidate selection, and confidence calibration were all correct. Strongest training signal.", color: C.green },
            { type: "Approve Modified", pct: "20%", signal: "Partial reinforcement. The AI's intent was correct but parameters need adjustment. Logged with diff: what changed and (optionally) why. Medium training signal.", color: C.amber },
            { type: "Reject", pct: "8%", signal: "Negative signal. Requires structured reason from a taxonomy: wrong action type, wrong target, wrong timing, policy violation, insufficient context, other. Strongest corrective signal.", color: C.red },
          ].map(o => (
            <div key={o.type} style={{ padding: 16, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}`, borderLeft: `3px solid ${o.color}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 14, fontWeight: 800, color: o.color }}>{o.type}</span>
                <span style={{ fontFamily: mono, fontSize: 18, fontWeight: 800, color: o.color }}>{o.pct}</span>
              </div>
              <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6 }}>{o.signal}</div>
            </div>
          ))}
        </div>

        {/* Rejection Taxonomy */}
        <div style={{ padding: 16, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Rejection Reason Taxonomy</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { code: "R01", reason: "Wrong action type", example: "AI suggested reassign, but should have escalated" },
              { code: "R02", reason: "Wrong target", example: "Right action, wrong person/team" },
              { code: "R03", reason: "Wrong timing", example: "Action premature — need more info first" },
              { code: "R04", reason: "Insufficient context", example: "AI missed critical information in the ticket" },
              { code: "R05", reason: "Policy disagreement", example: "AI was technically correct but org preference differs" },
              { code: "R06", reason: "Customer sensitivity", example: "Technically correct but wrong for this customer relationship" },
            ].map(r => (
              <div key={r.code} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 8, padding: "10px 12px", background: C.bg, borderRadius: 6, border: `1px solid ${C.border}` }}>
                <span style={{ fontFamily: mono, fontSize: 11, fontWeight: 700, color: C.redText }}>{r.code}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: C.text }}>{r.reason}</div>
                  <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{r.example}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback → Model Pipeline */}
        <div style={{ padding: 16, background: C.blueBg, borderRadius: 10, border: `1px solid ${C.blueBorder}` }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.blueText, marginBottom: 10 }}>Feedback-to-Model Pipeline</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {["Human Decision", "→", "Structured Feedback Log", "→", "Weekly Aggregation", "→", "Drift Report", "→", "Model Retuning", "→", "Shadow Evaluation", "→", "Canary Deploy"].map((step, i) => (
              step === "→" ? <ArrowRight key={i} size={14} color={C.textDim} /> :
              <div key={i} style={{ padding: "6px 12px", background: C.surface, borderRadius: 6, fontSize: 11, fontWeight: 600, color: C.blueText, border: `1px solid ${C.blueBorder}` }}>{step}</div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: C.textSoft, marginTop: 12, lineHeight: 1.7 }}>
            Feedback is not applied to the live model in real-time. It's aggregated weekly, analyzed for patterns (e.g., "rejections for R04 increased 40% for payment-related tickets"), and fed into model retuning. New model versions go through shadow evaluation (run against historical decisions, compare outcomes) before canary deployment.
          </div>
        </div>
      </div>
    </Section>
  );
}

function GateConfig() {
  return (
    <Section icon={Settings} title="Gate Configuration Admin" color="purple" subtitle="How org admins configure HITL gate levels per blueprint and action type">
      <P>The Gate Configuration admin is where governance gets customized per organization. It's a matrix of blueprint types × action types → gate levels, with overrides for specific conditions.</P>

      {/* Config Matrix */}
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "140px repeat(5, 1fr)", gap: 1, background: C.border, borderRadius: 10, overflow: "hidden", minWidth: 700 }}>
          {/* Header */}
          <div style={{ padding: 10, background: C.surface2, fontSize: 11, fontWeight: 700, color: C.textDim }} />
          {["Assign", "Escalate", "Auto-Reply", "Close", "Cost Approve"].map(h => (
            <div key={h} style={{ padding: 10, background: C.surface2, fontSize: 11, fontWeight: 700, color: C.textSoft, textAlign: "center" }}>{h}</div>
          ))}
          {/* Rows */}
          {[
            { bp: "Ticket", vals: ["L0", "L1", "L2", "L0", "—"] },
            { bp: "Case", vals: ["L1", "L2", "L2", "L2", "—"] },
            { bp: "WorkOrder", vals: ["L1", "L2", "—", "L2", "L2"] },
            { bp: "Project Task", vals: ["L0", "L1", "—", "L0", "L3"] },
          ].map(row => (<React.Fragment key={row.bp}>
            <div style={{ padding: 10, background: C.surface, fontSize: 12, fontWeight: 700, color: C.text }}>{row.bp}</div>
            {row.vals.map((v, i) => (
              <div key={i} style={{
                padding: 10, background: C.surface, textAlign: "center",
                fontSize: 12, fontWeight: 700, fontFamily: mono,
                color: v === "L0" ? C.green : v === "L1" ? "#4ADE80" : v === "L2" ? C.amber : v === "L3" ? C.red : C.textDim,
              }}>{v}</div>
            ))}
          </React.Fragment>))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { title: "Condition Overrides", desc: "Any cell in the matrix can have conditional overrides: 'Ticket.Assign = L0 normally, but L2 when estimated_cost > 5000 SAR or when crossing department boundary.' Overrides stack with the most restrictive winning." },
          { title: "Change Audit", desc: "Every gate configuration change is version-controlled: who changed what, when, with required justification text. Changes can be rolled back to any previous version. Used for compliance audits." },
          { title: "Simulation Mode", desc: "Before saving a configuration change, admins can run a simulation: 'Apply this new config to last month's actions — how many would have been gated differently?' Shows the delta before it goes live." },
          { title: "Blueprint Inheritance", desc: "New blueprints inherit gate config from a parent blueprint or from the org default. Admins only need to configure the exceptions. If no config exists for a blueprint × action pair, it defaults to L2." },
        ].map(item => (
          <div key={item.title} style={{ padding: 14, background: C.bg, borderRadius: 8, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.purpleText, marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function GovernanceAnalytics() {
  return (
    <Section icon={BarChart3} title="Governance Analytics Dashboard" color="green" subtitle="Operational metrics for the governance system itself">
      <P>Governance isn't just about control — it's about learning. These metrics tell the org: how is our AI performing, where are humans adding the most value, and where can we safely expand automation?</P>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 20 }}>
        {[
          { label: "AI Accuracy Rate", value: "91.2%", trend: "+2.1%", color: C.green },
          { label: "Avg Approval Time", value: "3.2m", trend: "-18s", color: C.blue },
          { label: "Override Rate", value: "8.4%", trend: "-1.2%", color: C.amber },
          { label: "Policy Violations Blocked", value: "47", trend: "this month", color: C.red },
        ].map(m => (
          <div key={m.label} style={{ padding: 16, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 24, fontWeight: 800, color: m.color, fontFamily: mono }}>{m.value}</div>
            <div style={{ fontSize: 11, color: C.textDim, marginTop: 2 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: C.greenText, marginTop: 6 }}>{m.trend}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { title: "Gate Level Distribution", desc: "Pie chart of actions by gate level over time. Goal: increase L0 (auto-execute) percentage month over month as AI accuracy improves. Target: 80% L0 within 6 months of deployment." },
          { title: "Override Heatmap", desc: "Matrix of blueprint × action type showing override rates. Red hotspots indicate where the AI struggles — candidates for model retraining or policy adjustment. Cool areas are candidates for lowering gate levels." },
          { title: "Approval Latency by Approver", desc: "Track which approvers are fast vs. slow. Identify bottlenecks. Feed into timeout configuration: if an approver consistently takes >2h, suggest shorter timeout for their queue." },
          { title: "Policy Hit Frequency", desc: "Which policies fire most often? A policy that fires on 90% of actions might be too broad. One that never fires might be obsolete. Both are signals for policy refinement." },
          { title: "Confidence Calibration", desc: "Plot: AI confidence score vs. actual human agreement rate. If the AI says 0.85 confidence but humans agree only 70% of the time, the confidence model needs recalibration. Target: perfect diagonal." },
          { title: "Feedback Loop Velocity", desc: "Time from human override → pattern detection → model retune → deployment. Goal: under 2 weeks. Current: track weekly. Shows the governance system is learning, not just controlling." },
        ].map(item => (
          <div key={item.title} style={{ padding: 14, background: C.surface2, borderRadius: 10, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.greenText, marginBottom: 6 }}>{item.title}</div>
            <div style={{ fontSize: 12, color: C.textSoft, lineHeight: 1.6 }}>{item.desc}</div>
          </div>
        ))}
      </div>
    </Section>
  );
}

// ─── MAIN ─────────────────────────────────────────

const MAIN_TABS = [
  { id: "opa", label: "OPA Policy Patterns", icon: Code },
  { id: "hitl", label: "HITL UX Flows", icon: Users },
];

const RAIL_FONT_STACK = {
  display: "'Newsreader', Georgia, serif",
  body: "'Inter', -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

const MODULES = [
  { key: "inbox", label: "Inbox", glyph: "📥", live: true, count: 5, href: "/inbox" },
  { key: "cx", label: "Helpdesk", glyph: "◈", live: true, count: 12, href: "/helpdesk" },
  { key: "crm", label: "CRM", glyph: "◇", count: 4, href: "/crm" },
  { key: "hrm", label: "HRM", glyph: "○", count: 7 },
  { key: "erp", label: "ERP", glyph: "□", count: 2 },
  { key: "gov", label: "Governance", glyph: "🛡️", live: true, href: "/governance" },
  { key: "del", label: "Delegation", glyph: "🤝", live: true, count: 2, href: "/delegation" },
  { key: "proto", label: "Prototype", glyph: "🧪", live: true, href: "/prototype" },
  { key: "queue", label: "Queue", glyph: "🚦", live: true, href: "/queue" },
  { key: "blueprint", label: "Blueprint", glyph: "📐", live: true, href: "/blueprint" },
  { key: "grc", label: "GRC", glyph: "🏛️", live: true, href: "/GRC" },
];

function Rail({ active }) {
  const T = {
    bg: "#0A0B0D", panelHi: "#15181D", line: "#1F242B", lineHi: "#2B323B",
    text: "#E7E9EC", textDim: "#9099A3", textFaint: "#5C656F",
    govern: "#3B82F6", intel: "#A78BFA", railBg: "#0A0B0D", badgeFill: "#06121F",
  };
  return (
    <div style={{ width: 76, height: "100vh", background: T.railBg, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 6, flexShrink: 0, zIndex: 10 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, marginBottom: 18, background: `linear-gradient(135deg, ${T.govern}, ${T.intel})`, display: "grid", placeItems: "center", font: `700 16px ${RAIL_FONT_STACK.display}`, color: "#fff" }}>4x</div>
      {MODULES.map((m) => {
        const on = active === m.key;
        return (
          <a key={m.key} href={m.href || "#"} title={m.label} style={{ position: "relative", width: 52, height: 52, borderRadius: 12, cursor: "pointer", background: on ? T.panelHi : "transparent", border: `1px solid ${on ? T.lineHi : "transparent"}`, color: on ? T.text : T.textFaint, transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, textDecoration: "none" }}>
            <span style={{ font: `400 18px ${RAIL_FONT_STACK.body}` }}>{m.glyph}</span>
            <span style={{ font: `500 9px ${RAIL_FONT_STACK.body}` }}>{m.label}</span>
            {m.count && <span style={{ position: "absolute", top: 4, right: 6, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: m.live ? T.govern : T.lineHi, color: m.live ? T.badgeFill : T.textDim, font: `600 9px ${RAIL_FONT_STACK.mono}`, display: "grid", placeItems: "center" }}>{m.count}</span>}
          </a>
        );
      })}
    </div>
  );
}

export default function OPAandHITL() {
  const [tab, setTab] = useState("opa");

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: C.bg, overflow: "hidden" }}>
      <Rail active="grc" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: sans, color: C.text, overflowY: "auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* Header */}
      <div style={{ padding: "28px 36px 0", borderBottom: `1px solid ${C.border}`, background: `linear-gradient(180deg, ${C.surface2} 0%, ${C.bg} 100%)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <Shield size={18} color={C.blue} />
          <span style={{ fontSize: 10, fontWeight: 700, color: C.blueText, letterSpacing: "0.12em", textTransform: "uppercase" }}>Apps4x · Deep Dive</span>
        </div>
        <h1 style={{ margin: "0 0 4px", fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em" }}>OPA Policies & HITL UX</h1>
        <div style={{ fontSize: 13, color: C.textSoft, marginBottom: 20 }}>Policy patterns that enforce governance + the human approval experience</div>

        <div style={{ display: "flex", gap: 0 }}>
          {MAIN_TABS.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                display: "flex", alignItems: "center", gap: 7, padding: "10px 20px",
                border: "none", cursor: "pointer", fontFamily: sans,
                background: active ? C.surface : "transparent",
                color: active ? C.text : C.textSoft,
                fontSize: 13, fontWeight: active ? 700 : 500,
                borderRadius: "8px 8px 0 0",
                borderBottom: active ? `2px solid ${C.blue}` : "2px solid transparent",
              }}><Icon size={14} />{t.label}</button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "28px 36px 60px", width: "100%" }}>
        {tab === "opa" ? <OPATab /> : <HITLTab />}
      </div>
      </div>
    </div>
  );
}
