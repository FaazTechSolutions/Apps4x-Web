"use client";
import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useState } from "react";
import {
  GitBranch, Layers, Activity, ChevronRight, ChevronDown, Shield,
  CheckCircle2, Zap, User, Bot, Hash, ArrowRight, Diamond, Flag,
  Workflow, Users, FileText, Clock, DollarSign, ArrowLeftRight,
  Headphones, AlertTriangle, Eye, CircleDot, Lock, Unlock
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// SHARED UTILITIES
// ═══════════════════════════════════════════════════════════════

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: "bg-emerald-950/60", text: "text-emerald-300", dot: "bg-emerald-400" },
  active: { bg: "bg-sky-950/60", text: "text-sky-300", dot: "bg-sky-400" },
  pending: { bg: "bg-zinc-800/60", text: "text-zinc-400", dot: "bg-zinc-500" },
  failed: { bg: "bg-red-950/60", text: "text-red-300", dot: "bg-red-400" },
  paused: { bg: "bg-amber-950/60", text: "text-amber-300", dot: "bg-amber-400" },
  waiting: { bg: "bg-orange-950/60", text: "text-orange-300", dot: "bg-orange-400" },
  skipped: { bg: "bg-zinc-800/40", text: "text-zinc-500", dot: "bg-zinc-600" },
  cancelled: { bg: "bg-zinc-800/40", text: "text-zinc-500", dot: "bg-zinc-600" },
};

const NODE_ICONS: Record<string, { icon: any; color: string }> = {
  blueprint: { icon: Workflow, color: "text-sky-400" },
  group: { icon: Layers, color: "text-teal-400" },
  action: { icon: Zap, color: "text-amber-400" },
  decision: { icon: Diamond, color: "text-violet-400" },
  marker: { icon: Flag, color: "text-rose-400" },
};

const ACTIVATION_COLORS: Record<string, string> = {
  auto: "text-zinc-500", signal: "text-amber-400", dependency: "text-teal-400",
  event: "text-violet-400", manual: "text-rose-400",
};

function Badge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{status}
    </span>
  );
}

function Json({ data, max = "max-h-44" }: { data: any; max?: string }) {
  if (!data) return <span className="text-zinc-600 text-[10px] font-mono">null</span>;
  return (
    <pre className={`${max} overflow-auto text-[11px] font-mono leading-relaxed p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/50 text-zinc-400 whitespace-pre-wrap break-all`}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[9px] font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-1">{children}</div>;
}

function PatternTag({ children, color = "sky" }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    sky: "bg-sky-950/40 text-sky-300 border-sky-800/40",
    teal: "bg-teal-950/40 text-teal-300 border-teal-800/40",
    violet: "bg-violet-950/40 text-violet-300 border-violet-800/40",
    amber: "bg-amber-950/40 text-amber-300 border-amber-800/40",
    rose: "bg-rose-950/40 text-rose-300 border-rose-800/40",
    emerald: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${colors[color]}`}>
      {children}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT 1: EMPLOYEE EXIT & FINAL SETTLEMENT
// ═══════════════════════════════════════════════════════════════

const BP_EXIT = {
  meta: {
    code: "EMPLOYEE_EXIT_SA",
    name: "Employee Exit & Final Settlement",
    description: "Full employee offboarding: resignation acceptance, asset recovery, government deregistration (GOSI, Muqeem, Qiwa), final settlement calculation per Saudi Labor Law, and exit visa processing.",
    category: "offboarding",
    icon: Users,
    iconColor: "text-rose-400",
    patterns: [
      { label: "Parallel Deregistration", color: "teal" },
      { label: "Labor Law Calculation", color: "amber" },
      { label: "HITL Approval Gate", color: "rose" },
    ],
  },
  contract: {
    inputs: { employee_id: { type: "uuid", required: true }, resignation_date: { type: "date", required: true }, last_working_day: { type: "date", required: true }, reason: { type: "string", enum: ["resignation", "termination", "end_of_contract", "mutual"] } },
    outputs: { final_settlement_amount: { type: "number" }, exit_visa_ref: { type: "string" }, clearance_status: { type: "string" } },
  },
  nodes: [
    { node_id: "ex-root", parent: null, type: "blueprint", code: "EXIT_ROOT", name: "Employee Exit Process", ordinal: 0, activation_mode: "auto", child_mode: "sequential", policy: { mode: "all" },
      exit_logic: { hooks: [{ type: "webhook", url: "https://api.alrayyan.sa/webhooks/exit", method: "POST" }] } },

    { node_id: "ex-accept", parent: "ex-root", type: "action", code: "RESIGNATION_ACCEPTANCE", name: "Resignation Acceptance", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "human", executor_ref: null, parameters: { form: "resignation_acceptance_v2", require_reason: true }, timeout_seconds: 172800 },
      assignment_config: { strategy: "role", role_code: "hr_manager", fallback_strategy: "escalate", escalation_timeout_seconds: 86400 },
      contract: { inputs: { employee_id: { type: "uuid" }, resignation_letter: { type: "file_ref" } }, outputs: { accepted: { type: "boolean" }, notice_period_days: { type: "number" }, last_working_day: { type: "date" } } } },

    { node_id: "ex-clearance", parent: "ex-root", type: "group", code: "CLEARANCE", name: "Clearance & Asset Recovery", ordinal: 1, activation_mode: "auto", child_mode: "parallel", policy: { mode: "all" },
      sla_config: { slas: [{ sla_code: "clearance_window", target_seconds: 604800, warning_pct: 70, business_calendar_id: "cal-sa-sun-thu", breach_action: "escalate" }] } },

    { node_id: "ex-it-clear", parent: "ex-clearance", type: "action", code: "IT_CLEARANCE", name: "IT Asset Return & Access Revocation", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { checklist: ["laptop", "phone", "badge", "vpn_token", "email_disable", "drive_backup"] } },
      assignment_config: { strategy: "role", role_code: "it_admin" },
      contract: { inputs: { employee_id: { type: "uuid" } }, outputs: { assets_returned: { type: "boolean" }, pending_items: { type: "array" }, access_revoked: { type: "boolean" } } } },

    { node_id: "ex-fin-clear", parent: "ex-clearance", type: "action", code: "FINANCE_CLEARANCE", name: "Finance Clearance", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { check: ["advances", "loans", "petty_cash", "credit_cards", "travel_claims"] } },
      assignment_config: { strategy: "role", role_code: "finance_officer" },
      contract: { inputs: { employee_id: { type: "uuid" } }, outputs: { outstanding_amount: { type: "number" }, cleared: { type: "boolean" } } } },

    { node_id: "ex-housing", parent: "ex-clearance", type: "action", code: "HOUSING_CLEARANCE", name: "Housing & Accommodation Clearance", ordinal: 2, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { check: ["room_inspection", "keys_return", "damage_assessment"] } },
      assignment_config: { strategy: "role", role_code: "camp_supervisor" },
      contract: { inputs: { employee_id: { type: "uuid" } }, outputs: { cleared: { type: "boolean" }, deductions: { type: "number" } } } },

    { node_id: "ex-gov-dereg", parent: "ex-root", type: "group", code: "GOV_DEREGISTRATION", name: "Government Deregistration", ordinal: 2, activation_mode: "dependency", child_mode: "parallel", policy: { mode: "all" },
      exit_logic: { signals: [{ name: "deregistered", emit_on: "complete" }] } },

    { node_id: "ex-gosi-dereg", parent: "ex-gov-dereg", type: "action", code: "GOSI_DEREGISTER", name: "GOSI Deregistration", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://gosi/deregister", parameters: { reason_code: "end_of_service" }, retry_policy: { max_retries: 3, backoff: "exponential" }, timeout_seconds: 180 },
      contract: { inputs: { gosi_number: { type: "string" }, last_working_day: { type: "date" } }, outputs: { deregistered: { type: "boolean" }, final_contribution_date: { type: "date" } } } },

    { node_id: "ex-muqeem-cancel", parent: "ex-gov-dereg", type: "action", code: "MUQEEM_CANCEL", name: "Muqeem Iqama Cancellation", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://muqeem/cancel-iqama", timeout_seconds: 300 },
      contract: { inputs: { iqama_number: { type: "string" } }, outputs: { cancelled: { type: "boolean" }, cancellation_ref: { type: "string" } } } },

    { node_id: "ex-qiwa-dereg", parent: "ex-gov-dereg", type: "action", code: "QIWA_DEREGISTER", name: "Qiwa Work Permit Cancellation", ordinal: 2, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://qiwa/cancel-permit", timeout_seconds: 180 },
      contract: { inputs: { qiwa_ref: { type: "string" } }, outputs: { cancelled: { type: "boolean" } } } },

    { node_id: "ex-settlement", parent: "ex-root", type: "action", code: "FINAL_SETTLEMENT", name: "Final Settlement Calculation", ordinal: 3, activation_mode: "dependency",
      execution_config: { executor_type: "agent", executor_ref: "atlas_agent", parameters: { model: "sa_labor_law_settlement_v3", components: ["basic_salary", "eos_gratuity", "leave_balance", "air_ticket", "deductions", "loan_recovery"] }, timeout_seconds: 30 },
      entry_logic: { conditions: [{ field: "clearance.output.all_cleared", operator: "==", value: true }], condition_mode: "all" },
      contract: {
        inputs: { employee_id: { type: "uuid" }, last_working_day: { type: "date" }, service_years: { type: "number" }, reason: { type: "string" }, outstanding_deductions: { type: "number" } },
        outputs: { eos_gratuity: { type: "number" }, leave_encashment: { type: "number" }, air_ticket_allowance: { type: "number" }, total_deductions: { type: "number" }, net_settlement: { type: "number" }, breakdown: { type: "object" } }
      } },

    { node_id: "ex-approve", parent: "ex-root", type: "action", code: "SETTLEMENT_APPROVAL", name: "CFO Settlement Approval", ordinal: 4, activation_mode: "manual",
      execution_config: { executor_type: "human", parameters: { form: "settlement_approval_v2", require_signature: true }, timeout_seconds: 172800 },
      assignment_config: { strategy: "specific", assignee_party_role: "prm-cfo-khalid", fallback_strategy: "escalate" },
      sla_config: { slas: [{ sla_code: "approval_turnaround", target_seconds: 86400, warning_pct: 80, breach_action: "notify" }] },
      contract: { inputs: { settlement_breakdown: { type: "object" }, net_amount: { type: "number" } }, outputs: { approved: { type: "boolean" }, adjustments: { type: "object" } } } },

    { node_id: "ex-pay", parent: "ex-root", type: "action", code: "SETTLEMENT_PAYMENT", name: "Settlement Payment via WPS", ordinal: 5, activation_mode: "dependency",
      execution_config: { executor_type: "api", executor_ref: "api://mudad/wps-payment", parameters: { payment_type: "final_settlement" }, timeout_seconds: 120 },
      contract: { inputs: { amount: { type: "number" }, iban: { type: "string" } }, outputs: { transaction_ref: { type: "string" }, payment_date: { type: "date" } } } },

    { node_id: "ex-visa", parent: "ex-root", type: "action", code: "EXIT_VISA", name: "Exit Visa Processing", ordinal: 6, activation_mode: "dependency",
      execution_config: { executor_type: "api", executor_ref: "api://mofa/exit-visa", timeout_seconds: 300 },
      contract: { inputs: { iqama_number: { type: "string" }, passport_number: { type: "string" } }, outputs: { visa_ref: { type: "string" }, validity_date: { type: "date" } } } },

    { node_id: "ex-done", parent: "ex-root", type: "marker", code: "EXIT_COMPLETE", name: "Exit Process Complete", ordinal: 7, activation_mode: "dependency",
      exit_logic: { hooks: [{ type: "notify", channel: "email", template: "exit_complete_summary" }, { type: "notify", channel: "slack", template: "exit_complete_hr" }] } },
  ],
  instances: [
    { id: "exi-001", node: "ex-root", status: "active", started: "2026-06-15", input: { employee_id: "emp-4412", resignation_date: "2026-06-01", last_working_day: "2026-06-30", reason: "resignation" } },
    { id: "exi-002", node: "ex-accept", status: "completed", started: "2026-06-15", completed: "2026-06-16", output: { accepted: true, notice_period_days: 30, last_working_day: "2026-06-30" } },
    { id: "exi-003", node: "ex-clearance", status: "completed", started: "2026-06-16", completed: "2026-06-22" },
    { id: "exi-004", node: "ex-it-clear", status: "completed", started: "2026-06-16", completed: "2026-06-18", output: { assets_returned: true, pending_items: [], access_revoked: true } },
    { id: "exi-005", node: "ex-fin-clear", status: "completed", started: "2026-06-16", completed: "2026-06-20", output: { outstanding_amount: 0, cleared: true } },
    { id: "exi-006", node: "ex-housing", status: "completed", started: "2026-06-16", completed: "2026-06-22", output: { cleared: true, deductions: 500 } },
    { id: "exi-007", node: "ex-gov-dereg", status: "active", started: "2026-06-22" },
    { id: "exi-008", node: "ex-gosi-dereg", status: "completed", started: "2026-06-22", completed: "2026-06-22", output: { deregistered: true } },
    { id: "exi-009", node: "ex-muqeem-cancel", status: "active", started: "2026-06-22" },
    { id: "exi-010", node: "ex-settlement", status: "pending" },
    { id: "exi-011", node: "ex-approve", status: "pending" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT 2: CONTRACT RENEWAL & IQAMA EXTENSION
// ═══════════════════════════════════════════════════════════════

const BP_RENEWAL = {
  meta: {
    code: "CONTRACT_RENEWAL_SA",
    name: "Contract Renewal & Iqama Extension",
    description: "Multi-path contract renewal: evaluate worker performance and Nitaqat compliance, determine renewal eligibility, process Iqama extension, and update GOSI records. Conditional routing based on performance score and visa status.",
    category: "contract_management",
    icon: FileText,
    iconColor: "text-teal-400",
    patterns: [
      { label: "Conditional Routing", color: "violet" },
      { label: "Multi-Path Decision", color: "amber" },
      { label: "Sub-Blueprint Spawn", color: "teal" },
    ],
  },
  contract: {
    inputs: { employee_id: { type: "uuid", required: true }, contract_id: { type: "uuid", required: true }, current_iqama: { type: "string", required: true } },
    outputs: { renewed: { type: "boolean" }, new_contract_id: { type: "uuid" }, new_iqama_expiry: { type: "date" } },
  },
  nodes: [
    { node_id: "rn-root", parent: null, type: "blueprint", code: "RENEWAL_ROOT", name: "Contract Renewal", ordinal: 0, activation_mode: "auto", child_mode: "sequential", policy: { mode: "all" } },

    { node_id: "rn-assess", parent: "rn-root", type: "group", code: "ASSESSMENT", name: "Eligibility Assessment", ordinal: 0, activation_mode: "auto", child_mode: "parallel", policy: { mode: "all" } },

    { node_id: "rn-perf", parent: "rn-assess", type: "action", code: "PERF_REVIEW", name: "Performance Evaluation", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "agent", executor_ref: "insight_agent", parameters: { model: "perf_composite_v2", period_months: 12 }, timeout_seconds: 30 },
      contract: { inputs: { employee_id: { type: "uuid" } }, outputs: { score: { type: "number", range: [0, 100] }, attendance_pct: { type: "number" }, incidents: { type: "number" }, recommendation: { type: "string" } } } },

    { node_id: "rn-nitaqat", parent: "rn-assess", type: "action", code: "NITAQAT_CHECK", name: "Nitaqat Compliance Check", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://qiwa/nitaqat-impact", parameters: { simulation: true }, timeout_seconds: 60 },
      contract: { inputs: { sponsor_cr: { type: "string" }, nationality: { type: "string" } }, outputs: { current_band: { type: "string" }, post_renewal_band: { type: "string" }, compliant: { type: "boolean" } } } },

    { node_id: "rn-medical", parent: "rn-assess", type: "action", code: "MEDICAL_CHECK", name: "Medical Fitness Recheck", ordinal: 2, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { exam_type: "renewal_fitness" } },
      assignment_config: { strategy: "role", role_code: "hr_coordinator" },
      contract: { inputs: { employee_id: { type: "uuid" } }, outputs: { fit: { type: "boolean" }, conditions: { type: "array" } } } },

    { node_id: "rn-decide", parent: "rn-root", type: "decision", code: "RENEWAL_DECISION", name: "Renewal Decision Gate", ordinal: 1, activation_mode: "dependency",
      execution_config: { executor_type: "agent", executor_ref: "atlas_agent", parameters: { rule_set: "renewal_eligibility_v3" }, timeout_seconds: 15 },
      exit_logic: {
        routing: [
          { condition: { field: "result.decision", operator: "==", value: "auto_renew" }, activate_node: "rn-auto" },
          { condition: { field: "result.decision", operator: "==", value: "review_required" }, activate_node: "rn-review" },
          { condition: { field: "result.decision", operator: "==", value: "not_eligible" }, activate_node: "rn-exit-process" },
        ],
        signals: [{ name: "decision_made", emit_on: "complete" }],
      },
      contract: {
        inputs: { perf_score: { type: "number" }, nitaqat_compliant: { type: "boolean" }, medical_fit: { type: "boolean" } },
        outputs: { decision: { type: "string", enum: ["auto_renew", "review_required", "not_eligible"] }, reasons: { type: "array" } }
      } },

    { node_id: "rn-auto", parent: "rn-root", type: "group", code: "AUTO_RENEWAL", name: "Auto Renewal Processing", ordinal: 2, activation_mode: "signal", child_mode: "sequential", policy: { mode: "all" } },

    { node_id: "rn-contract-gen", parent: "rn-auto", type: "action", code: "CONTRACT_GEN", name: "Generate New Contract", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "agent", executor_ref: "atlas_agent", parameters: { template: "sa_labor_contract_v4", salary_adjustment: "cpi_linked" } },
      contract: { inputs: { employee_id: { type: "uuid" }, current_terms: { type: "object" } }, outputs: { contract_pdf: { type: "file_ref" }, new_salary: { type: "number" }, duration_months: { type: "number" } } } },

    { node_id: "rn-iqama-ext", parent: "rn-auto", type: "action", code: "IQAMA_EXTENSION", name: "Iqama Extension", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://muqeem/iqama-renew", timeout_seconds: 300 },
      contract: { inputs: { iqama_number: { type: "string" }, new_expiry: { type: "date" } }, outputs: { extended: { type: "boolean" }, new_expiry_date: { type: "date" } } } },

    { node_id: "rn-gosi-update", parent: "rn-auto", type: "action", code: "GOSI_UPDATE", name: "GOSI Salary Update", ordinal: 2, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://gosi/update-salary", timeout_seconds: 120 },
      contract: { inputs: { gosi_number: { type: "string" }, new_salary: { type: "number" } }, outputs: { updated: { type: "boolean" } } } },

    { node_id: "rn-review", parent: "rn-root", type: "action", code: "MANAGER_REVIEW", name: "Manager Review & Decision", ordinal: 3, activation_mode: "signal",
      execution_config: { executor_type: "human", parameters: { form: "renewal_review_v2", show_analytics: true }, timeout_seconds: 259200 },
      assignment_config: { strategy: "role", role_code: "department_manager" },
      sla_config: { slas: [{ sla_code: "review_turnaround", target_seconds: 172800, warning_pct: 75, breach_action: "escalate" }] },
      exit_logic: {
        routing: [
          { condition: { field: "result.decision", operator: "==", value: "renew" }, activate_node: "rn-auto" },
          { condition: { field: "result.decision", operator: "==", value: "terminate" }, activate_node: "rn-exit-process" },
        ],
      },
      contract: { inputs: { employee_profile: { type: "object" }, assessment_results: { type: "object" } }, outputs: { decision: { type: "string" }, salary_adjustment_pct: { type: "number" }, notes: { type: "string" } } } },

    { node_id: "rn-exit-process", parent: "rn-root", type: "action", code: "TRIGGER_EXIT", name: "Trigger Exit Process", ordinal: 4, activation_mode: "signal",
      execution_config: { executor_type: "script", executor_ref: "script://spawn_blueprint", parameters: { blueprint_ref: "bp://EMPLOYEE_EXIT_SA", input_map: { employee_id: "$.context.employee_id", reason: "end_of_contract" } } },
      exit_logic: { spawn: [{ blueprint_ref: "bp://EMPLOYEE_EXIT_SA", input_map: { employee_id: "$.context.employee_id", reason: "end_of_contract" } }] },
      contract: { inputs: { employee_id: { type: "uuid" } }, outputs: { spawned_instance_id: { type: "uuid" } } } },

    { node_id: "rn-done", parent: "rn-root", type: "marker", code: "RENEWAL_COMPLETE", name: "Renewal Complete", ordinal: 5, activation_mode: "dependency" },
  ],
  instances: [
    { id: "rni-001", node: "rn-root", status: "active", started: "2026-06-25", input: { employee_id: "emp-2201", contract_id: "ctr-9981", current_iqama: "IQ-2446810" } },
    { id: "rni-002", node: "rn-assess", status: "completed", started: "2026-06-25", completed: "2026-06-27" },
    { id: "rni-003", node: "rn-perf", status: "completed", started: "2026-06-25", completed: "2026-06-25", output: { score: 72, attendance_pct: 94.5, incidents: 1, recommendation: "review" } },
    { id: "rni-004", node: "rn-nitaqat", status: "completed", started: "2026-06-25", completed: "2026-06-25", output: { current_band: "green_high", post_renewal_band: "green_high", compliant: true } },
    { id: "rni-005", node: "rn-medical", status: "completed", started: "2026-06-25", completed: "2026-06-27", output: { fit: true, conditions: [] } },
    { id: "rni-006", node: "rn-decide", status: "completed", started: "2026-06-27", completed: "2026-06-27", output: { decision: "review_required", reasons: ["perf_score_below_80", "incident_count_1"] } },
    { id: "rni-007", node: "rn-review", status: "active", started: "2026-06-27", input: { assessment: { perf: 72, nitaqat: true, medical: true } } },
  ],
};

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT 3: HELPDESK TICKET RESOLUTION (CLARITYDESK)
// ═══════════════════════════════════════════════════════════════

const BP_TICKET = {
  meta: {
    code: "TICKET_RESOLUTION",
    name: "ClarityDesk Ticket Resolution",
    description: "AI-augmented helpdesk ticket lifecycle: email intake with AI triage, auto-classification, SLA-driven escalation, multi-tier resolution with knowledge base search, customer confirmation, and CSAT collection.",
    category: "helpdesk",
    icon: Headphones,
    iconColor: "text-amber-400",
    patterns: [
      { label: "Event-Driven Intake", color: "violet" },
      { label: "AI Auto-Classification", color: "sky" },
      { label: "SLA Escalation Chain", color: "rose" },
    ],
  },
  contract: {
    inputs: { ticket_id: { type: "uuid", required: true }, source: { type: "string", enum: ["email", "portal", "phone", "whatsapp"] }, subject: { type: "string" }, body: { type: "string" } },
    outputs: { resolution: { type: "string" }, resolution_time_seconds: { type: "number" }, csat_score: { type: "number" } },
  },
  nodes: [
    { node_id: "tk-root", parent: null, type: "blueprint", code: "TICKET_ROOT", name: "Ticket Lifecycle", ordinal: 0, activation_mode: "event", child_mode: "sequential", policy: { mode: "all" },
      entry_logic: { conditions: [{ field: "event.type", operator: "==", value: "ticket_created" }] } },

    { node_id: "tk-intake", parent: "tk-root", type: "action", code: "AI_INTAKE", name: "AI Intake & PII Redaction", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "agent", executor_ref: "resolver_agent", parameters: { pipeline: "email_intake_v3", steps: ["body_extraction", "thread_detection", "pii_redaction", "language_detection", "sentiment_analysis"] }, timeout_seconds: 15 },
      contract: { inputs: { raw_body: { type: "string" }, headers: { type: "object" } }, outputs: { clean_body: { type: "string" }, language: { type: "string" }, sentiment: { type: "string" }, pii_redacted: { type: "boolean" }, thread_id: { type: "string" } } } },

    { node_id: "tk-classify", parent: "tk-root", type: "decision", code: "AI_CLASSIFY", name: "AI Classification & Priority", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "agent", executor_ref: "resolver_agent", parameters: { model: "ticket_classifier_v4", categories: ["technical", "billing", "access", "complaint", "inquiry", "change_request"] }, timeout_seconds: 10 },
      exit_logic: {
        routing: [
          { condition: { field: "result.auto_resolvable", operator: "==", value: true }, activate_node: "tk-auto-resolve" },
          { condition: { field: "result.priority", operator: "in", value: ["critical", "high"] }, activate_node: "tk-tier2" },
          { condition: { field: "result.priority", operator: "in", value: ["medium", "low"] }, activate_node: "tk-tier1" },
        ],
      },
      contract: { inputs: { clean_body: { type: "string" }, sentiment: { type: "string" } }, outputs: { category: { type: "string" }, priority: { type: "string" }, confidence: { type: "number" }, auto_resolvable: { type: "boolean" }, suggested_response: { type: "string" } } } },

    { node_id: "tk-auto-resolve", parent: "tk-root", type: "action", code: "AUTO_RESOLVE", name: "Auto-Resolution (KB Match)", ordinal: 2, activation_mode: "signal",
      execution_config: { executor_type: "agent", executor_ref: "resolver_agent", parameters: { source: "knowledge_base", require_confidence: 0.85, response_style: "professional_ar_en" }, timeout_seconds: 20 },
      exit_logic: {
        routing: [
          { condition: { field: "result.confidence", operator: ">=", value: 0.85 }, activate_node: "tk-confirm" },
          { condition: { field: "result.confidence", operator: "<", value: 0.85 }, activate_node: "tk-tier1" },
        ],
      },
      contract: { inputs: { query: { type: "string" }, category: { type: "string" } }, outputs: { response: { type: "string" }, kb_article_id: { type: "string" }, confidence: { type: "number" } } } },

    { node_id: "tk-tier1", parent: "tk-root", type: "action", code: "TIER1_SUPPORT", name: "Tier 1 Support", ordinal: 3, activation_mode: "signal",
      execution_config: { executor_type: "human", parameters: { show_ai_suggestion: true, show_similar_tickets: true }, timeout_seconds: 14400 },
      assignment_config: { strategy: "queue", queue_id: "q-support-tier1", fallback_strategy: "round_robin" },
      sla_config: { slas: [
        { sla_code: "first_response", target_seconds: 3600, warning_pct: 75, breach_action: "escalate" },
        { sla_code: "resolution", target_seconds: 28800, warning_pct: 60, breach_action: "escalate" },
      ] },
      exit_logic: {
        routing: [
          { condition: { field: "result.resolved", operator: "==", value: true }, activate_node: "tk-confirm" },
          { condition: { field: "result.escalate", operator: "==", value: true }, activate_node: "tk-tier2" },
        ],
      },
      contract: { inputs: { ticket_data: { type: "object" }, ai_suggestion: { type: "string" } }, outputs: { resolved: { type: "boolean" }, escalate: { type: "boolean" }, response: { type: "string" }, notes: { type: "string" } } } },

    { node_id: "tk-tier2", parent: "tk-root", type: "action", code: "TIER2_SUPPORT", name: "Tier 2 Specialist", ordinal: 4, activation_mode: "signal",
      execution_config: { executor_type: "human", parameters: { show_full_history: true, allow_system_access: true }, timeout_seconds: 86400 },
      assignment_config: { strategy: "rule_based", role_code: "specialist", fallback_strategy: "escalate", escalation_timeout_seconds: 7200 },
      sla_config: { slas: [{ sla_code: "specialist_resolution", target_seconds: 14400, warning_pct: 70, breach_action: "notify" }] },
      contract: { inputs: { ticket_data: { type: "object" }, escalation_notes: { type: "string" } }, outputs: { resolved: { type: "boolean" }, response: { type: "string" }, root_cause: { type: "string" } } } },

    { node_id: "tk-confirm", parent: "tk-root", type: "action", code: "CUSTOMER_CONFIRM", name: "Customer Confirmation", ordinal: 5, activation_mode: "signal",
      execution_config: { executor_type: "agent", executor_ref: "resolver_agent", parameters: { channel: "reply_to_source", wait_hours: 48, auto_close: true }, timeout_seconds: 172800 },
      exit_logic: {
        routing: [
          { condition: { field: "result.confirmed", operator: "==", value: true }, activate_node: "tk-csat" },
          { condition: { field: "result.reopened", operator: "==", value: true }, activate_node: "tk-tier1" },
        ],
      },
      contract: { inputs: { resolution: { type: "string" } }, outputs: { confirmed: { type: "boolean" }, reopened: { type: "boolean" } } } },

    { node_id: "tk-csat", parent: "tk-root", type: "action", code: "CSAT_SURVEY", name: "CSAT Collection", ordinal: 6, activation_mode: "signal",
      execution_config: { executor_type: "agent", executor_ref: "resolver_agent", parameters: { survey_template: "csat_v2", channel: "email" }, timeout_seconds: 604800 },
      contract: { inputs: { ticket_id: { type: "uuid" } }, outputs: { score: { type: "number", range: [1, 5] }, feedback: { type: "string" } } } },

    { node_id: "tk-close", parent: "tk-root", type: "marker", code: "TICKET_CLOSED", name: "Ticket Closed", ordinal: 7, activation_mode: "dependency",
      exit_logic: { hooks: [{ type: "webhook", url: "https://api.alrayyan.sa/webhooks/ticket", method: "POST" }] } },
  ],
  instances: [
    { id: "tki-001", node: "tk-root", status: "active", started: "2026-06-28T09:15:00Z", input: { ticket_id: "TK-8891", source: "email", subject: "Salary not received for June", body: "[redacted]" } },
    { id: "tki-002", node: "tk-intake", status: "completed", started: "2026-06-28T09:15:01Z", completed: "2026-06-28T09:15:08Z", output: { language: "ar", sentiment: "frustrated", pii_redacted: true } },
    { id: "tki-003", node: "tk-classify", status: "completed", started: "2026-06-28T09:15:09Z", completed: "2026-06-28T09:15:14Z", output: { category: "billing", priority: "high", confidence: 0.94, auto_resolvable: false } },
    { id: "tki-004", node: "tk-tier2", status: "active", started: "2026-06-28T09:15:15Z" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT 4: MONTHLY PAYROLL & WPS
// ═══════════════════════════════════════════════════════════════

const BP_PAYROLL = {
  meta: {
    code: "MONTHLY_PAYROLL_WPS",
    name: "Monthly Payroll & WPS Compliance",
    description: "Batch payroll processing for 50-500 workers: attendance aggregation, overtime/deduction calculation, GOSI contribution computation, Mudad WPS file generation, bank submission, and Mudad compliance reporting.",
    category: "payroll",
    icon: DollarSign,
    iconColor: "text-emerald-400",
    patterns: [
      { label: "Batch Processing", color: "emerald" },
      { label: "Parallel Computation", color: "teal" },
      { label: "Regulatory Compliance", color: "rose" },
    ],
  },
  contract: {
    inputs: { payroll_period: { type: "string", required: true }, tenant_id: { type: "uuid", required: true }, run_type: { type: "string", enum: ["regular", "supplementary", "correction"] } },
    outputs: { total_net: { type: "number" }, worker_count: { type: "number" }, wps_file_ref: { type: "string" }, mudad_status: { type: "string" } },
  },
  nodes: [
    { node_id: "py-root", parent: null, type: "blueprint", code: "PAYROLL_ROOT", name: "Monthly Payroll Run", ordinal: 0, activation_mode: "event", child_mode: "sequential", policy: { mode: "all" },
      entry_logic: { conditions: [{ field: "event.type", operator: "==", value: "payroll_trigger" }] },
      sla_config: { slas: [{ sla_code: "payroll_completion", target_seconds: 259200, warning_pct: 60, business_calendar_id: "cal-sa-sun-thu", breach_action: "escalate" }] } },

    { node_id: "py-lock", parent: "py-root", type: "action", code: "PERIOD_LOCK", name: "Lock Attendance Period", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://hrms/lock-period", timeout_seconds: 30 },
      contract: { inputs: { period: { type: "string" } }, outputs: { locked: { type: "boolean" }, worker_count: { type: "number" }, cutoff_date: { type: "date" } } } },

    { node_id: "py-compute", parent: "py-root", type: "group", code: "COMPUTATION", name: "Payroll Computation", ordinal: 1, activation_mode: "auto", child_mode: "parallel", policy: { mode: "all" } },

    { node_id: "py-attend", parent: "py-compute", type: "action", code: "ATTENDANCE_AGG", name: "Attendance Aggregation", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://hrms/aggregate-attendance", parameters: { include_overtime: true, include_absence: true }, timeout_seconds: 120 },
      contract: { inputs: { period: { type: "string" } }, outputs: { records: { type: "array" }, total_workers: { type: "number" }, overtime_hours: { type: "number" } } } },

    { node_id: "py-gosi-calc", parent: "py-compute", type: "action", code: "GOSI_CALC", name: "GOSI Contribution Calculation", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "agent", executor_ref: "atlas_agent", parameters: { rates: { saudi_employee: 0.0975, saudi_employer: 0.12, non_saudi_employer: 0.02 } }, timeout_seconds: 30 },
      contract: { inputs: { salary_data: { type: "array" } }, outputs: { contributions: { type: "array" }, total_employee: { type: "number" }, total_employer: { type: "number" } } } },

    { node_id: "py-deductions", parent: "py-compute", type: "action", code: "DEDUCTIONS", name: "Deductions & Allowances", ordinal: 2, activation_mode: "auto",
      execution_config: { executor_type: "agent", executor_ref: "atlas_agent", parameters: { types: ["housing", "transport", "food", "loan_recovery", "absence", "penalties", "advances"] }, timeout_seconds: 30 },
      contract: { inputs: { employee_data: { type: "array" } }, outputs: { deduction_records: { type: "array" }, allowance_records: { type: "array" } } } },

    { node_id: "py-net", parent: "py-root", type: "action", code: "NET_CALC", name: "Net Salary Calculation", ordinal: 2, activation_mode: "dependency",
      execution_config: { executor_type: "agent", executor_ref: "atlas_agent", parameters: { validate_minimum_wage: true, sa_minimum: 4000 }, timeout_seconds: 30 },
      contract: { inputs: { gross: { type: "array" }, deductions: { type: "array" }, gosi: { type: "array" } }, outputs: { payslips: { type: "array" }, total_net: { type: "number" }, exceptions: { type: "array" } } } },

    { node_id: "py-review", parent: "py-root", type: "action", code: "PAYROLL_REVIEW", name: "Payroll Review & Approval", ordinal: 3, activation_mode: "manual",
      execution_config: { executor_type: "human", parameters: { dashboard: "payroll_summary_v3", show_variance: true, compare_previous: true }, timeout_seconds: 86400 },
      assignment_config: { strategy: "specific", assignee_party_role: "prm-cfo-khalid" },
      contract: { inputs: { summary: { type: "object" }, exceptions: { type: "array" } }, outputs: { approved: { type: "boolean" }, adjustments: { type: "array" } } } },

    { node_id: "py-wps", parent: "py-root", type: "action", code: "WPS_GENERATION", name: "WPS File Generation", ordinal: 4, activation_mode: "dependency",
      execution_config: { executor_type: "api", executor_ref: "api://mudad/generate-wps", parameters: { format: "mudad_v3", include_gosi: true }, timeout_seconds: 120 },
      contract: { inputs: { payslips: { type: "array" } }, outputs: { wps_file: { type: "file_ref" }, record_count: { type: "number" }, total_amount: { type: "number" } } } },

    { node_id: "py-bank", parent: "py-root", type: "action", code: "BANK_SUBMIT", name: "Bank Submission", ordinal: 5, activation_mode: "dependency",
      execution_config: { executor_type: "api", executor_ref: "api://bank/salary-transfer", parameters: { bank: "al_rajhi", batch_mode: true }, timeout_seconds: 300 },
      contract: { inputs: { wps_file: { type: "file_ref" } }, outputs: { batch_ref: { type: "string" }, submitted_count: { type: "number" }, failed_count: { type: "number" } } } },

    { node_id: "py-mudad", parent: "py-root", type: "action", code: "MUDAD_REPORT", name: "Mudad Compliance Report", ordinal: 6, activation_mode: "dependency",
      execution_config: { executor_type: "api", executor_ref: "api://mudad/submit-report", timeout_seconds: 180 },
      contract: { inputs: { wps_file: { type: "file_ref" }, batch_ref: { type: "string" } }, outputs: { mudad_ref: { type: "string" }, compliance_status: { type: "string" } } } },

    { node_id: "py-done", parent: "py-root", type: "marker", code: "PAYROLL_COMPLETE", name: "Payroll Complete", ordinal: 7, activation_mode: "dependency",
      exit_logic: { hooks: [{ type: "notify", channel: "email", template: "payroll_complete" }, { type: "notify", channel: "slack", template: "payroll_done" }] } },
  ],
  instances: [
    { id: "pyi-001", node: "py-root", status: "active", started: "2026-06-25", input: { payroll_period: "2026-06", run_type: "regular" } },
    { id: "pyi-002", node: "py-lock", status: "completed", started: "2026-06-25", completed: "2026-06-25", output: { locked: true, worker_count: 247, cutoff_date: "2026-06-25" } },
    { id: "pyi-003", node: "py-compute", status: "completed", started: "2026-06-25", completed: "2026-06-26" },
    { id: "pyi-004", node: "py-attend", status: "completed", output: { total_workers: 247, overtime_hours: 1842 } },
    { id: "pyi-005", node: "py-gosi-calc", status: "completed", output: { total_employee: 42150, total_employer: 68200 } },
    { id: "pyi-006", node: "py-deductions", status: "completed" },
    { id: "pyi-007", node: "py-net", status: "completed", output: { total_net: 1285400, exceptions: [{ employee: "emp-1102", reason: "below_minimum_wage" }] } },
    { id: "pyi-008", node: "py-review", status: "active", started: "2026-06-27" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT 5: VISA TRANSFER (TANAZUL)
// ═══════════════════════════════════════════════════════════════

const BP_TRANSFER = {
  meta: {
    code: "VISA_TRANSFER_TANAZUL",
    name: "Visa Transfer (Tanazul)",
    description: "Inter-sponsor visa transfer requiring consent from both current and receiving sponsors, MOL approval, Qiwa transfer request, Iqama reissuance, and GOSI transfer. Multi-party HITL coordination with strict regulatory sequencing.",
    category: "visa_management",
    icon: ArrowLeftRight,
    iconColor: "text-violet-400",
    patterns: [
      { label: "Multi-Party HITL", color: "rose" },
      { label: "Strict Regulatory Sequence", color: "amber" },
      { label: "Dual-Sponsor Coordination", color: "violet" },
    ],
  },
  contract: {
    inputs: { worker_id: { type: "uuid", required: true }, from_sponsor_cr: { type: "string", required: true }, to_sponsor_cr: { type: "string", required: true }, transfer_reason: { type: "string" } },
    outputs: { new_iqama_number: { type: "string" }, new_gosi_number: { type: "string" }, transfer_status: { type: "string" } },
  },
  nodes: [
    { node_id: "vt-root", parent: null, type: "blueprint", code: "TRANSFER_ROOT", name: "Visa Transfer Process", ordinal: 0, activation_mode: "auto", child_mode: "sequential", policy: { mode: "all" },
      sla_config: { slas: [{ sla_code: "transfer_completion", target_seconds: 2592000, warning_pct: 50, breach_action: "escalate" }] } },

    { node_id: "vt-eligibility", parent: "vt-root", type: "group", code: "ELIGIBILITY", name: "Transfer Eligibility Check", ordinal: 0, activation_mode: "auto", child_mode: "parallel", policy: { mode: "all" } },

    { node_id: "vt-worker-elig", parent: "vt-eligibility", type: "action", code: "WORKER_ELIGIBILITY", name: "Worker Eligibility Check", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://qiwa/transfer-eligibility", parameters: { check: ["contract_period", "violations", "absconding_status"] }, timeout_seconds: 60 },
      contract: { inputs: { worker_id: { type: "uuid" }, iqama_number: { type: "string" } }, outputs: { eligible: { type: "boolean" }, blockers: { type: "array" }, remaining_contract_months: { type: "number" } } } },

    { node_id: "vt-from-nitaqat", parent: "vt-eligibility", type: "action", code: "FROM_SPONSOR_NITAQAT", name: "Source Sponsor Nitaqat Impact", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://qiwa/nitaqat-impact", parameters: { direction: "removal" }, timeout_seconds: 60 },
      contract: { inputs: { sponsor_cr: { type: "string" }, nationality: { type: "string" } }, outputs: { current_band: { type: "string" }, post_transfer_band: { type: "string" }, impact_acceptable: { type: "boolean" } } } },

    { node_id: "vt-to-nitaqat", parent: "vt-eligibility", type: "action", code: "TO_SPONSOR_NITAQAT", name: "Target Sponsor Nitaqat Impact", ordinal: 2, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://qiwa/nitaqat-impact", parameters: { direction: "addition" }, timeout_seconds: 60 },
      contract: { inputs: { sponsor_cr: { type: "string" }, nationality: { type: "string" } }, outputs: { current_band: { type: "string" }, post_transfer_band: { type: "string" }, quota_available: { type: "boolean" } } } },

    { node_id: "vt-consent", parent: "vt-root", type: "group", code: "DUAL_CONSENT", name: "Dual Sponsor Consent", ordinal: 1, activation_mode: "dependency", child_mode: "parallel", policy: { mode: "all" },
      sla_config: { slas: [{ sla_code: "consent_window", target_seconds: 604800, warning_pct: 70, breach_action: "notify" }] } },

    { node_id: "vt-from-consent", parent: "vt-consent", type: "action", code: "SOURCE_CONSENT", name: "Source Sponsor Consent", ordinal: 0, activation_mode: "manual",
      execution_config: { executor_type: "human", parameters: { form: "transfer_consent_release_v2", require_signature: true, require_reason: true }, timeout_seconds: 604800 },
      assignment_config: { strategy: "specific", assignee_party_role: "prm-from-sponsor-auth" },
      contract: { inputs: { worker_profile: { type: "object" }, transfer_terms: { type: "object" } }, outputs: { consented: { type: "boolean" }, conditions: { type: "array" }, compensation_agreed: { type: "number" } } } },

    { node_id: "vt-to-consent", parent: "vt-consent", type: "action", code: "TARGET_CONSENT", name: "Target Sponsor Acceptance", ordinal: 1, activation_mode: "manual",
      execution_config: { executor_type: "human", parameters: { form: "transfer_acceptance_v2", require_signature: true, show_worker_profile: true }, timeout_seconds: 604800 },
      assignment_config: { strategy: "specific", assignee_party_role: "prm-to-sponsor-auth" },
      contract: { inputs: { worker_profile: { type: "object" }, proposed_terms: { type: "object" } }, outputs: { accepted: { type: "boolean" }, new_salary: { type: "number" }, new_contract_duration_months: { type: "number" } } } },

    { node_id: "vt-mol", parent: "vt-root", type: "action", code: "MOL_APPROVAL", name: "MOL Transfer Approval", ordinal: 2, activation_mode: "dependency",
      execution_config: { executor_type: "api", executor_ref: "api://mol/transfer-request", parameters: { include_consent_docs: true }, timeout_seconds: 300 },
      contract: { inputs: { worker_id: { type: "uuid" }, from_cr: { type: "string" }, to_cr: { type: "string" }, consent_refs: { type: "array" } }, outputs: { approved: { type: "boolean" }, mol_ref: { type: "string" }, conditions: { type: "array" } } } },

    { node_id: "vt-qiwa", parent: "vt-root", type: "action", code: "QIWA_TRANSFER", name: "Qiwa Transfer Execution", ordinal: 3, activation_mode: "dependency",
      execution_config: { executor_type: "api", executor_ref: "api://qiwa/execute-transfer", timeout_seconds: 180 },
      contract: { inputs: { mol_ref: { type: "string" }, worker_id: { type: "uuid" } }, outputs: { transfer_ref: { type: "string" }, effective_date: { type: "date" } } } },

    { node_id: "vt-gov-update", parent: "vt-root", type: "group", code: "GOV_UPDATES", name: "Government Record Updates", ordinal: 4, activation_mode: "dependency", child_mode: "sequential", policy: { mode: "all" } },

    { node_id: "vt-new-iqama", parent: "vt-gov-update", type: "action", code: "NEW_IQAMA", name: "New Iqama Issuance", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://muqeem/iqama-reissue", parameters: { reason: "sponsor_transfer" }, timeout_seconds: 300 },
      contract: { inputs: { worker_id: { type: "uuid" }, new_sponsor_cr: { type: "string" } }, outputs: { new_iqama_number: { type: "string" }, expiry_date: { type: "date" } } } },

    { node_id: "vt-gosi-transfer", parent: "vt-gov-update", type: "action", code: "GOSI_TRANSFER", name: "GOSI Record Transfer", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://gosi/transfer", timeout_seconds: 180 },
      contract: { inputs: { old_gosi: { type: "string" }, new_sponsor_cr: { type: "string" }, new_salary: { type: "number" } }, outputs: { new_gosi_number: { type: "string" }, continuity_preserved: { type: "boolean" } } } },

    { node_id: "vt-contract", parent: "vt-root", type: "action", code: "NEW_CONTRACT", name: "New Employment Contract", ordinal: 5, activation_mode: "dependency",
      execution_config: { executor_type: "agent", executor_ref: "atlas_agent", parameters: { template: "sa_labor_contract_v4" } },
      assignment_config: { strategy: "role", role_code: "hr_manager" },
      contract: { inputs: { worker_id: { type: "uuid" }, terms: { type: "object" } }, outputs: { contract_ref: { type: "string" }, signed: { type: "boolean" } } } },

    { node_id: "vt-done", parent: "vt-root", type: "marker", code: "TRANSFER_COMPLETE", name: "Transfer Complete", ordinal: 6, activation_mode: "dependency",
      exit_logic: { hooks: [
        { type: "notify", channel: "sms", template: "transfer_complete_worker" },
        { type: "notify", channel: "email", template: "transfer_complete_sponsors" },
        { type: "webhook", url: "https://api.alrayyan.sa/webhooks/transfer", method: "POST" },
      ] } },
  ],
  instances: [
    { id: "vti-001", node: "vt-root", status: "active", started: "2026-06-10", input: { worker_id: "w-3310", from_sponsor_cr: "CR-1010234567", to_sponsor_cr: "CR-2020567890", transfer_reason: "better_opportunity" } },
    { id: "vti-002", node: "vt-eligibility", status: "completed", started: "2026-06-10", completed: "2026-06-10" },
    { id: "vti-003", node: "vt-worker-elig", status: "completed", output: { eligible: true, blockers: [], remaining_contract_months: 2 } },
    { id: "vti-004", node: "vt-from-nitaqat", status: "completed", output: { current_band: "green_high", post_transfer_band: "green_mid", impact_acceptable: true } },
    { id: "vti-005", node: "vt-to-nitaqat", status: "completed", output: { current_band: "green_low", post_transfer_band: "green_mid", quota_available: true } },
    { id: "vti-006", node: "vt-consent", status: "active", started: "2026-06-11" },
    { id: "vti-007", node: "vt-from-consent", status: "completed", completed: "2026-06-15", output: { consented: true, compensation_agreed: 15000 } },
    { id: "vti-008", node: "vt-to-consent", status: "waiting", started: "2026-06-11" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// ALL BLUEPRINTS
// ═══════════════════════════════════════════════════════════════

const ALL_BLUEPRINTS = [BP_EXIT, BP_RENEWAL, BP_TICKET, BP_PAYROLL, BP_TRANSFER];

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT VIEWER COMPONENT
// ═══════════════════════════════════════════════════════════════

function BlueprintViewer({ bp }: { bp: any }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    bp.nodes.forEach((n: { type: string; node_id: string | number; }) => { if (n.type === "blueprint" || n.type === "group") init[n.node_id] = true; });
    return init;
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(bp.nodes[0]?.node_id || null);
  const [view, setView] = useState<"tree" | "instances">("tree");

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const renderNode = (node: any, depth: number) => {
    const children = bp.nodes.filter((n: { parent: any; }) => n.parent === node.node_id).sort((a: any, b: any) => a.ordinal - b.ordinal);
    const hasChildren = children.length > 0;
    const isExpanded = expanded[node.node_id];
    const isSelected = selectedNode === node.node_id;
    const typeInfo = NODE_ICONS[node.type] || NODE_ICONS.action;
    const Icon = typeInfo.icon;
    const inst = bp.instances.find((i: any) => i.node === node.node_id);

    return (
      <div key={node.node_id}>
        <button
          onClick={() => { setSelectedNode(node.node_id); if (hasChildren) toggle(node.node_id); }}
          className={`w-full flex items-center gap-2 py-1.5 px-2 rounded-lg text-left transition-all duration-100 ${isSelected ? "bg-zinc-800 ring-1 ring-zinc-600" : "hover:bg-zinc-800/40"}`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={12} className="text-zinc-500 shrink-0" /> : <ChevronRight size={12} className="text-zinc-500 shrink-0" />
          ) : <span className="w-3 shrink-0" />}
          <Icon size={14} className={`${typeInfo.color} shrink-0`} />
          <span className="text-xs text-zinc-200 truncate flex-1">{node.name}</span>
          {inst && <Badge status={inst.status} />}
          <span className={`text-[9px] font-mono ${ACTIVATION_COLORS[node.activation_mode]}`}>{node.activation_mode}</span>
        </button>
        {hasChildren && isExpanded && children.map((c: any) => renderNode(c, depth + 1))}
      </div>
    );
  };

  const sel = bp.nodes.find((n: { node_id: string | null; }) => n.node_id === selectedNode);
  const selInst = sel ? bp.instances.find((i: any) => i.node === sel.node_id) : null;

  return (
    <div>
      {/* Pattern Tags */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {bp.meta.patterns.map((p: { color: string | undefined; label: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, i: Key | null | undefined) => (
          <PatternTag key={i} color={p.color}>{p.label}</PatternTag>
        ))}
        <span className="text-[10px] text-zinc-600 font-mono ml-2">{bp.nodes.length} nodes • {bp.instances.length} instances</span>
      </div>

      {/* View Toggle */}
      <div className="flex gap-1 mb-3">
        <button onClick={() => setView("tree")} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === "tree" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
          Node Tree
        </button>
        <button onClick={() => setView("instances")} className={`px-3 py-1 rounded text-xs font-medium transition-colors ${view === "instances" ? "bg-zinc-700 text-zinc-100" : "text-zinc-500 hover:text-zinc-300"}`}>
          Live Instances
        </button>
      </div>

      {view === "tree" ? (
        <div className="flex gap-3" style={{ height: "calc(100vh - 340px)" }}>
          {/* Tree */}
          <div className="w-[380px] shrink-0 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-2">
            {bp.nodes.filter((n: { parent: any; }) => !n.parent).map((n: any) => renderNode(n, 0))}
          </div>

          {/* Detail */}
          <div className="flex-1 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-4">
            {sel ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      {(() => { const I = NODE_ICONS[sel.type].icon; return <I size={18} className={NODE_ICONS[sel.type].color} />; })()}
                      <h3 className="text-base font-semibold text-zinc-100">{sel.name}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500">
                      <span>{sel.code}</span><span>•</span><span>{sel.node_id}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${ACTIVATION_COLORS[sel.activation_mode]} bg-zinc-800`}>{sel.activation_mode}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{sel.type}</span>
                    {selInst && <Badge status={selInst.status} />}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {sel.entry_logic && <div><Label>Entry Logic</Label><Json data={sel.entry_logic} /></div>}
                  {sel.execution_config && <div><Label>Execution Config</Label><Json data={sel.execution_config} /></div>}
                  {sel.assignment_config && <div><Label>Assignment Config</Label><Json data={sel.assignment_config} /></div>}
                  {sel.sla_config && <div><Label>SLA Config</Label><Json data={sel.sla_config} /></div>}
                  {sel.exit_logic && <div><Label>Exit Logic</Label><Json data={sel.exit_logic} /></div>}
                  {sel.contract && <div><Label>Execution Contract</Label><Json data={sel.contract} /></div>}
                </div>

                {sel.child_mode && (
                  <div className="flex gap-6 pt-2 border-t border-zinc-800/40">
                    <div><Label>Child Execution</Label><span className="text-xs text-teal-400 font-medium">{sel.child_mode}</span></div>
                    <div><Label>Completion Policy</Label><span className="text-xs text-zinc-300 font-mono">{JSON.stringify(sel.policy)}</span></div>
                  </div>
                )}

                {selInst?.output && (
                  <div className="pt-2 border-t border-zinc-800/40">
                    <Label>Instance Output</Label>
                    <Json data={selInst.output} />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-zinc-600 text-sm">Select a node</div>
            )}
          </div>
        </div>
      ) : (
        <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/60 overflow-hidden" style={{ height: "calc(100vh - 340px)" }}>
          <div className="overflow-y-auto h-full">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-zinc-900">
                <tr className="text-left text-zinc-500 border-b border-zinc-800/60">
                  <th className="p-3 font-semibold tracking-wider uppercase text-[9px]">ID</th>
                  <th className="p-3 font-semibold tracking-wider uppercase text-[9px]">Node</th>
                  <th className="p-3 font-semibold tracking-wider uppercase text-[9px]">Status</th>
                  <th className="p-3 font-semibold tracking-wider uppercase text-[9px]">Started</th>
                  <th className="p-3 font-semibold tracking-wider uppercase text-[9px]">Completed</th>
                  <th className="p-3 font-semibold tracking-wider uppercase text-[9px]">Output / Input</th>
                </tr>
              </thead>
              <tbody>
                {bp.instances.map((inst: any) => {
                  const node = bp.nodes.find((n: { node_id: any; }) => n.node_id === inst.node);
                  const typeInfo = NODE_ICONS[node?.type || "action"];
                  const Icon = typeInfo.icon;
                  return (
                    <tr key={inst.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/30">
                      <td className="p-3 font-mono text-zinc-500">{inst.id}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-1.5">
                          <Icon size={12} className={typeInfo.color} />
                          <span className="text-zinc-300">{node?.name}</span>
                        </div>
                      </td>
                      <td className="p-3"><Badge status={inst.status} /></td>
                      <td className="p-3 font-mono text-zinc-500 text-[10px]">{inst.started || "—"}</td>
                      <td className="p-3 font-mono text-zinc-500 text-[10px]">{inst.completed || "—"}</td>
                      <td className="p-3 max-w-[300px]">
                        {inst.output ? (
                          <pre className="text-[10px] font-mono text-zinc-500 truncate">{JSON.stringify(inst.output)}</pre>
                        ) : inst.input ? (
                          <pre className="text-[10px] font-mono text-zinc-600 truncate">{JSON.stringify(inst.input)}</pre>
                        ) : <span className="text-zinc-700">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function BlueprintExamples() {
  const [activeBp, setActiveBp] = useState(0);
  const bp = ALL_BLUEPRINTS[activeBp];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      <style>{`
        .font-mono { font-family: 'JetBrains Mono', monospace !important; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
      `}</style>

      {/* Header */}
      <header className="border-b border-zinc-800/60 px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
            <Workflow size={15} className="text-white" />
          </div>
          <div>
            <div className="text-[9px] font-semibold tracking-[0.2em] uppercase text-zinc-500">agents4x Orchestration</div>
            <div className="text-sm font-semibold text-zinc-200 -mt-0.5">Blueprint Examples — Saudi Manpower Operations</div>
          </div>
        </div>
      </header>

      {/* Blueprint Tabs */}
      <nav className="px-5 pt-2 border-b border-zinc-800/40 flex gap-1 overflow-x-auto">
        {ALL_BLUEPRINTS.map((b, i) => {
          const Icon = b.meta.icon;
          const isActive = activeBp === i;
          return (
            <button
              key={i}
              onClick={() => setActiveBp(i)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? "bg-zinc-900/80 text-zinc-100 border border-zinc-800/60 border-b-transparent -mb-px"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              }`}
            >
              <Icon size={13} className={isActive ? b.meta.iconColor : ""} />
              {b.meta.name}
            </button>
          );
        })}
      </nav>

      {/* Blueprint Header */}
      <div className="px-5 py-3 border-b border-zinc-800/30 bg-zinc-900/20">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {(() => { const Icon = bp.meta.icon; return <Icon size={18} className={bp.meta.iconColor} />; })()}
              <h2 className="text-lg font-semibold text-zinc-100">{bp.meta.name}</h2>
              <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">{bp.meta.code}</span>
            </div>
            <p className="text-xs text-zinc-500 max-w-2xl leading-relaxed">{bp.meta.description}</p>
          </div>
          <div className="text-right shrink-0 ml-4">
            <Label>Blueprint Contract</Label>
            <div className="flex gap-3 mt-1">
              <div>
                <div className="text-[9px] text-blue-400 font-semibold mb-0.5">INPUTS</div>
                {Object.entries(bp.contract.inputs).map(([k, v]: [string, any]) => (
                  <div key={k} className="text-[10px] font-mono text-zinc-500">
                    {k}: <span className="text-zinc-400">{v.type}</span>{v.required && <span className="text-rose-500">*</span>}
                  </div>
                ))}
              </div>
              <div className="w-px bg-zinc-800" />
              <div>
                <div className="text-[9px] text-emerald-400 font-semibold mb-0.5">OUTPUTS</div>
                {Object.entries(bp.contract.outputs).map(([k, v]: [string, any]) => (
                  <div key={k} className="text-[10px] font-mono text-zinc-500">
                    {k}: <span className="text-zinc-400">{v.type}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="p-5">
        <BlueprintViewer bp={bp} />
      </main>

      {/* Footer */}
      <footer className="px-5 py-2 border-t border-zinc-800/40 text-[9px] text-zinc-600 font-mono flex justify-between">
        <span>5 blueprints • {ALL_BLUEPRINTS.reduce((a, b) => a + b.nodes.length, 0)} total nodes • Saudi manpower vertical</span>
        <span>agents4x v3.0 — Behavior-Centric Orchestration</span>
      </footer>
    </div>
  );
}
