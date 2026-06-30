"use client";
import { useState } from "react";
import {
  GitBranch, Layers, Activity, ChevronRight, ChevronDown, Shield,
  CheckCircle2, Zap, Bot, Hash, ArrowRight, Diamond, Flag,
  Workflow, FileText, Clock, RefreshCw, FolderKanban,
  ClipboardCheck, BookOpen, SquareCheck, Target, Repeat,
  CalendarClock, Milestone, CircleDot, AlertTriangle,
  Eye, Lock, Hammer, Building2, Truck, HardHat, Camera,
  Stethoscope, Scale, FileCheck, Send, Bell, BarChart3
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// THEME
// ═══════════════════════════════════════════════════════════════

const STATUS: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: "bg-emerald-950/60", text: "text-emerald-300", dot: "bg-emerald-400" },
  active: { bg: "bg-sky-950/60", text: "text-sky-300", dot: "bg-sky-400" },
  pending: { bg: "bg-zinc-800/60", text: "text-zinc-400", dot: "bg-zinc-500" },
  failed: { bg: "bg-red-950/60", text: "text-red-300", dot: "bg-red-400" },
  paused: { bg: "bg-amber-950/60", text: "text-amber-300", dot: "bg-amber-400" },
  waiting: { bg: "bg-orange-950/60", text: "text-orange-300", dot: "bg-orange-400" },
  skipped: { bg: "bg-zinc-800/40", text: "text-zinc-500", dot: "bg-zinc-600" },
  blocked: { bg: "bg-red-950/40", text: "text-red-400", dot: "bg-red-500" },
  recurring: { bg: "bg-violet-950/60", text: "text-violet-300", dot: "bg-violet-400" },
  passed: { bg: "bg-emerald-950/60", text: "text-emerald-300", dot: "bg-emerald-400" },
  "n/a": { bg: "bg-zinc-800/40", text: "text-zinc-500", dot: "bg-zinc-600" },
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
  event: "text-violet-400", manual: "text-rose-400", schedule: "text-cyan-400",
};

function Badge({ status }: { status: string }) {
  const s = STATUS[status] || STATUS.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{status}
    </span>
  );
}

function Json({ data, max = "max-h-40" }: { data: any; max?: string }) {
  if (!data) return <span className="text-zinc-700 text-[10px] font-mono">null</span>;
  return (
    <pre className={`${max} overflow-auto text-[10px] font-mono leading-relaxed p-2 rounded-lg bg-zinc-950/80 border border-zinc-800/50 text-zinc-400 whitespace-pre-wrap break-all`}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return <div className="text-[9px] font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-1">{children}</div>;
}

function Tag({ children, color = "sky" }: { children: React.ReactNode; color?: string }) {
  const c: Record<string, string> = {
    sky: "bg-sky-950/40 text-sky-300 border-sky-800/40",
    teal: "bg-teal-950/40 text-teal-300 border-teal-800/40",
    violet: "bg-violet-950/40 text-violet-300 border-violet-800/40",
    amber: "bg-amber-950/40 text-amber-300 border-amber-800/40",
    rose: "bg-rose-950/40 text-rose-300 border-rose-800/40",
    emerald: "bg-emerald-950/40 text-emerald-300 border-emerald-800/40",
    cyan: "bg-cyan-950/40 text-cyan-300 border-cyan-800/40",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${c[color]}`}>{children}</span>;
}

// ═══════════════════════════════════════════════════════════════
// TYPE DEFINITIONS — WHAT MAKES EACH CATEGORY DIFFERENT
// ═══════════════════════════════════════════════════════════════

const TYPE_DEFINITIONS = {
  workflow: {
    label: "Workflow",
    icon: Workflow,
    color: "text-sky-400",
    definition: "A directed sequence of tasks with routing logic, branching, and parallel execution. Has a defined start, end, and path between them.",
    characteristics: [
      "Has conditional routing (decision nodes drive path selection)",
      "Supports parallel branches and merge/join via completion policies",
      "Instance is one-shot — starts, executes, completes",
      "Focus: moving work through stages toward a specific outcome",
    ],
    configSignature: "child_execution_mode + exit_logic.routing + completion_policy",
    example: "Worker Onboarding, Visa Transfer, Contract Renewal",
  },
  process: {
    label: "Process",
    icon: RefreshCw,
    color: "text-violet-400",
    definition: "A recurring, cyclical business operation that repeats on a schedule. Each cycle is an instance. The blueprint persists across cycles and may evolve between runs.",
    characteristics: [
      "Triggered by schedule (event activation_mode with cron/calendar trigger)",
      "Each run is a new instance of the same blueprint version",
      "Often has reconciliation steps comparing current run to previous",
      "Marker nodes serve as period boundaries, not completion points",
      "Focus: operational cadence, consistency across runs, variance detection",
    ],
    configSignature: "activation_mode: event (schedule) + entry_logic with period binding + cross-instance reference",
    example: "Monthly GOSI Reconciliation, Quarterly Compliance Audit, Weekly Attendance Review",
  },
  project: {
    label: "Project",
    icon: FolderKanban,
    color: "text-teal-400",
    definition: "A multi-phase, milestone-driven initiative with workstreams, deliverables, and resource tracking. Longer-lived than workflows, with phases that may overlap.",
    characteristics: [
      "Markers serve as milestones with go/no-go gates",
      "Groups represent phases/workstreams that may run in parallel",
      "Duration is weeks-to-months, not minutes-to-days",
      "Has resource/budget tracking in working_context",
      "Decisions are stage-gate reviews with HITL manual activation",
      "Focus: deliverable completion, timeline management, stakeholder visibility",
    ],
    configSignature: "marker (milestone) + manual activation gates + long SLA targets + working_context as project ledger",
    example: "New Branch Office Setup, ERP Implementation, Camp Construction",
  },
  checklist: {
    label: "Checklist",
    icon: ClipboardCheck,
    color: "text-emerald-400",
    definition: "A linear sequence of verification items, each pass/fail. All items must pass for the checklist to complete. No routing — every item is evaluated.",
    characteristics: [
      "Strictly sequential — no parallel, no conditional routing",
      "Each action node is a verification step with boolean output (pass/fail)",
      "Any failure halts the checklist or marks it failed",
      "No decision nodes — every item is mandatory",
      "Markers serve as section separators, not logic gates",
      "Focus: completeness verification, compliance evidence, sign-off",
    ],
    configSignature: "child_execution_mode: sequential + all actions have contract.outputs.passed: boolean + no exit_logic.routing",
    example: "Safety Inspection, Pre-Deployment Checklist, New Hire Day-1 Checklist",
  },
  sop: {
    label: "SOP",
    icon: BookOpen,
    color: "text-amber-400",
    definition: "A strict compliance procedure where each step requires evidence, attestation, and often regulatory time-bounds. Deviation from sequence is a compliance violation.",
    characteristics: [
      "Every action requires evidence attachment in output_context",
      "Steps have regulatory time-bounds (not just SLA — legal deadlines)",
      "Strict sequential — skipping or reordering is a violation",
      "Snapshots are mandatory at every step (not just state changes)",
      "Manual activation with role-based attestation at key steps",
      "Decision nodes represent regulatory branch points, not optimization",
      "Focus: regulatory compliance, evidence chain, audit trail",
    ],
    configSignature: "snapshot_policy: every_step + evidence fields in contract.outputs + manual activation with attestation + regulatory SLA",
    example: "Workplace Incident Response, Data Breach Protocol, PDPL Subject Access Request",
  },
  task: {
    label: "Task",
    icon: SquareCheck,
    color: "text-cyan-400",
    definition: "A single action or small group of related actions. Minimal orchestration — the simplest blueprint category. Often spawned by other blueprints.",
    characteristics: [
      "1-5 nodes maximum (typically 1 action + 1 marker)",
      "No groups, no decision nodes",
      "Often spawned as a sub-blueprint from a workflow or process",
      "Short-lived — minutes to hours",
      "May be assigned directly to a person or agent",
      "Focus: getting one thing done with tracking and audit",
    ],
    configSignature: "Flat structure, no groups, direct assignment, minimal config",
    example: "Send Reminder, Generate Report, Upload Document, Approve Request",
  },
};

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT: PROCESS — Monthly GOSI Reconciliation
// ═══════════════════════════════════════════════════════════════

const BP_PROCESS = {
  meta: {
    code: "GOSI_MONTHLY_RECON",
    name: "Monthly GOSI Reconciliation",
    type: "process",
    description: "Recurring monthly process: extract GOSI records, compare against internal payroll, identify discrepancies in contribution amounts or employee counts, resolve mismatches, submit corrections, and archive reconciliation report. Triggered on the 5th of each month.",
    icon: RefreshCw,
    iconColor: "text-violet-400",
    patterns: [
      { label: "Scheduled Trigger", color: "cyan" },
      { label: "Recurring Cycle", color: "violet" },
      { label: "Variance Detection", color: "amber" },
    ],
  },
  nodes: [
    { id: "gp-root", parent: null, type: "blueprint", code: "GOSI_RECON_ROOT", name: "GOSI Monthly Reconciliation", ordinal: 0, activation_mode: "event",
      entry_logic: { conditions: [{ field: "event.type", operator: "==", value: "schedule_trigger" }, { field: "event.schedule", operator: "==", value: "0 8 5 * *" }], condition_mode: "all" },
      child_mode: "sequential", policy: { mode: "all" },
      sla_config: { slas: [{ sla_code: "recon_deadline", target_seconds: 432000, warning_pct: 60, business_calendar_id: "cal-sa-sun-thu", breach_action: "escalate" }] },
      exit_logic: { hooks: [{ type: "notify", channel: "slack", template: "gosi_recon_complete" }] },
      config_note: "Triggered by cron schedule — 8am on 5th of each month. Each trigger creates a new instance." },

    { id: "gp-period-marker", parent: "gp-root", type: "marker", code: "PERIOD_START", name: "Period: {{period_month}}", ordinal: 0, activation_mode: "auto",
      exit_logic: { signals: [{ name: "period_opened", emit_on: "complete" }] },
      config_note: "Period boundary marker — records which month this cycle covers. Not a completion point." },

    { id: "gp-extract", parent: "gp-root", type: "group", code: "DATA_EXTRACTION", name: "Data Extraction", ordinal: 1, activation_mode: "auto", child_mode: "parallel", policy: { mode: "all" },
      config_note: "Pull data from both systems simultaneously for comparison." },

    { id: "gp-gosi-pull", parent: "gp-extract", type: "action", code: "GOSI_API_EXTRACT", name: "Extract GOSI Records", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://gosi/monthly-statement", parameters: { include_contributions: true, include_headcount: true }, timeout_seconds: 300 },
      contract: { inputs: { sponsor_cr: { type: "string" }, period: { type: "string" } }, outputs: { gosi_records: { type: "array" }, total_contribution: { type: "number" }, headcount: { type: "number" } } } },

    { id: "gp-payroll-pull", parent: "gp-extract", type: "action", code: "PAYROLL_EXTRACT", name: "Extract Payroll Records", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://hrms/payroll-summary", parameters: { include_gosi_breakdown: true }, timeout_seconds: 120 },
      contract: { inputs: { period: { type: "string" } }, outputs: { payroll_records: { type: "array" }, total_gosi_calculated: { type: "number" }, active_employees: { type: "number" } } } },

    { id: "gp-compare", parent: "gp-root", type: "action", code: "VARIANCE_ANALYSIS", name: "Variance Analysis", ordinal: 2, activation_mode: "dependency",
      execution_config: { executor_type: "agent", executor_ref: "insight_agent", parameters: { tolerance_sar: 10, tolerance_pct: 0.5, compare_previous_3_months: true, flag_new_discrepancies: true }, timeout_seconds: 30 },
      contract: {
        inputs: { gosi_records: { type: "array" }, payroll_records: { type: "array" }, previous_recon: { type: "object" } },
        outputs: { match_count: { type: "number" }, mismatch_count: { type: "number" }, missing_in_gosi: { type: "array" }, missing_in_payroll: { type: "array" }, amount_variances: { type: "array" }, trend_vs_previous: { type: "string" }, severity: { type: "string", enum: ["clean", "minor", "major", "critical"] } }
      },
      config_note: "Compares current run against previous 3 months to detect trends. Uses cross-instance reference via input_context binding." },

    { id: "gp-route", parent: "gp-root", type: "decision", code: "SEVERITY_ROUTE", name: "Severity Routing", ordinal: 3, activation_mode: "auto",
      execution_config: { executor_type: "agent", executor_ref: "atlas_agent", parameters: { rule_set: "gosi_recon_severity_v2" }, timeout_seconds: 10 },
      exit_logic: {
        routing: [
          { condition: { field: "result.severity", operator: "==", value: "clean" }, activate_node: "gp-archive" },
          { condition: { field: "result.severity", operator: "in", value: ["minor", "major"] }, activate_node: "gp-resolve" },
          { condition: { field: "result.severity", operator: "==", value: "critical" }, activate_node: "gp-escalate" },
        ],
      },
      config_note: "Routes based on variance severity. Clean → straight to archive. Minor/Major → resolution. Critical → immediate escalation." },

    { id: "gp-resolve", parent: "gp-root", type: "action", code: "DISCREPANCY_RESOLUTION", name: "Resolve Discrepancies", ordinal: 4, activation_mode: "signal",
      execution_config: { executor_type: "human", parameters: { dashboard: "gosi_recon_workspace_v2", show_previous_resolutions: true, allow_bulk_actions: true }, timeout_seconds: 172800 },
      assignment_config: { strategy: "role", role_code: "payroll_specialist", fallback_strategy: "escalate" },
      sla_config: { slas: [{ sla_code: "resolution_window", target_seconds: 86400, warning_pct: 75, breach_action: "escalate" }] },
      contract: { inputs: { mismatches: { type: "array" } }, outputs: { resolved: { type: "array" }, corrections_needed: { type: "array" }, unresolvable: { type: "array" } } } },

    { id: "gp-escalate", parent: "gp-root", type: "action", code: "CRITICAL_ESCALATION", name: "Critical Escalation to CFO", ordinal: 5, activation_mode: "signal",
      execution_config: { executor_type: "human", parameters: { urgency: "critical", require_action_plan: true }, timeout_seconds: 86400 },
      assignment_config: { strategy: "specific", assignee_party_role: "prm-cfo-khalid" },
      contract: { inputs: { critical_variances: { type: "array" }, total_discrepancy_sar: { type: "number" } }, outputs: { action_plan: { type: "string" }, approved_corrections: { type: "array" } } } },

    { id: "gp-submit", parent: "gp-root", type: "action", code: "SUBMIT_CORRECTIONS", name: "Submit GOSI Corrections", ordinal: 6, activation_mode: "dependency",
      execution_config: { executor_type: "api", executor_ref: "api://gosi/submit-corrections", timeout_seconds: 300 },
      contract: { inputs: { corrections: { type: "array" } }, outputs: { submission_ref: { type: "string" }, accepted_count: { type: "number" }, rejected_count: { type: "number" } } } },

    { id: "gp-archive", parent: "gp-root", type: "action", code: "ARCHIVE_REPORT", name: "Archive Reconciliation Report", ordinal: 7, activation_mode: "dependency",
      execution_config: { executor_type: "agent", executor_ref: "insight_agent", parameters: { format: "pdf", include_trend_charts: true, store_for_audit: true }, timeout_seconds: 60 },
      contract: { inputs: { recon_summary: { type: "object" } }, outputs: { report_ref: { type: "string" }, stored_at: { type: "string" } } },
      config_note: "Archives report for audit trail. Each cycle's report is stored with period reference for cross-cycle trending." },

    { id: "gp-period-close", parent: "gp-root", type: "marker", code: "PERIOD_CLOSE", name: "Period Closed", ordinal: 8, activation_mode: "dependency",
      config_note: "Marks end of this cycle. Next month's scheduled trigger creates a fresh instance." },
  ],
  instances: [
    { id: "gpi-001", node: "gp-root", status: "active", context: "June 2026 cycle — triggered Jun 5" },
    { id: "gpi-002", node: "gp-period-marker", status: "completed", context: "Period: 2026-06" },
    { id: "gpi-003", node: "gp-extract", status: "completed" },
    { id: "gpi-004", node: "gp-gosi-pull", status: "completed", output: { headcount: 247, total_contribution: 110350 } },
    { id: "gpi-005", node: "gp-payroll-pull", status: "completed", output: { active_employees: 249, total_gosi_calculated: 111200 } },
    { id: "gpi-006", node: "gp-compare", status: "completed", output: { match_count: 243, mismatch_count: 4, missing_in_gosi: ["emp-1102", "emp-3301"], amount_variances: [{ emp: "emp-2205", delta: 450 }, { emp: "emp-4410", delta: -120 }], severity: "minor" } },
    { id: "gpi-007", node: "gp-route", status: "completed", output: { routed_to: "resolve" } },
    { id: "gpi-008", node: "gp-resolve", status: "active", context: "Payroll specialist reviewing 4 mismatches" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT: PROJECT — New Worker Camp Construction
// ═══════════════════════════════════════════════════════════════

const BP_PROJECT = {
  meta: {
    code: "CAMP_CONSTRUCTION",
    name: "Worker Camp Construction Project",
    type: "project",
    description: "Multi-phase project to build a 500-bed worker accommodation camp in Riyadh. Covers land acquisition, Baladi permits, construction phases, MEP installation, municipality inspection, and occupancy certification. 6-month timeline with stage-gate reviews.",
    icon: FolderKanban,
    iconColor: "text-teal-400",
    patterns: [
      { label: "Phase / Milestone Gates", color: "teal" },
      { label: "Parallel Workstreams", color: "sky" },
      { label: "Long-Duration Tracking", color: "amber" },
    ],
  },
  nodes: [
    { id: "cp-root", parent: null, type: "blueprint", code: "CAMP_ROOT", name: "Camp Construction Project", ordinal: 0, activation_mode: "manual", child_mode: "sequential", policy: { mode: "all" },
      sla_config: { slas: [{ sla_code: "project_deadline", target_seconds: 15552000, warning_pct: 50, breach_action: "escalate" }] },
      config_note: "6-month project timeline. Manual activation — project starts when funding is approved." },

    { id: "cp-phase1", parent: "cp-root", type: "group", code: "PHASE1_PLANNING", name: "Phase 1: Planning & Permits", ordinal: 0, activation_mode: "auto", child_mode: "sequential", policy: { mode: "all" },
      sla_config: { slas: [{ sla_code: "phase1_target", target_seconds: 2592000, warning_pct: 70 }] } },

    { id: "cp-land", parent: "cp-phase1", type: "action", code: "LAND_ACQUISITION", name: "Land Acquisition & Survey", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { deliverables: ["title_deed", "survey_report", "soil_test"] }, timeout_seconds: 1296000 },
      assignment_config: { strategy: "role", role_code: "project_manager" },
      contract: { inputs: { location_spec: { type: "object" }, budget_sar: { type: "number" } }, outputs: { deed_ref: { type: "string" }, area_sqm: { type: "number" }, soil_report_ref: { type: "string" } } } },

    { id: "cp-baladi", parent: "cp-phase1", type: "action", code: "BALADI_PERMIT", name: "Baladi Building Permit", ordinal: 1, activation_mode: "dependency",
      execution_config: { executor_type: "api", executor_ref: "api://baladi/building-permit", parameters: { type: "commercial_accommodation", classification: "worker_housing" }, timeout_seconds: 600 },
      contract: { inputs: { deed_ref: { type: "string" }, blueprints: { type: "array" } }, outputs: { permit_number: { type: "string" }, conditions: { type: "array" }, valid_until: { type: "date" } } } },

    { id: "cp-design", parent: "cp-phase1", type: "action", code: "ARCHITECTURAL_DESIGN", name: "Architectural Design & Approval", ordinal: 2, activation_mode: "dependency",
      execution_config: { executor_type: "human", parameters: { deliverables: ["floor_plans", "structural_calc", "mep_layout", "safety_plan"], standards: ["sbc_2018", "civil_defense"] }, timeout_seconds: 1728000 },
      assignment_config: { strategy: "role", role_code: "design_engineer" },
      contract: { inputs: { permit: { type: "string" }, capacity: { type: "number" } }, outputs: { design_package_ref: { type: "string" }, approved: { type: "boolean" } } } },

    { id: "cp-m1", parent: "cp-root", type: "marker", code: "MILESTONE_DESIGN_COMPLETE", name: "🏁 Milestone: Design Complete", ordinal: 1, activation_mode: "manual",
      config_note: "Stage gate — CEO reviews design package and budget before authorizing construction. Manual activation = go/no-go decision.",
      exit_logic: { signals: [{ name: "design_approved", emit_on: "complete" }] } },

    { id: "cp-phase2", parent: "cp-root", type: "group", code: "PHASE2_CONSTRUCTION", name: "Phase 2: Construction", ordinal: 2, activation_mode: "signal", child_mode: "sequential", policy: { mode: "all" },
      sla_config: { slas: [{ sla_code: "phase2_target", target_seconds: 7776000 }] } },

    { id: "cp-foundation", parent: "cp-phase2", type: "action", code: "FOUNDATION", name: "Foundation & Structure", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { deliverables: ["foundation_pour", "structural_frame", "inspection_report"], progress_tracking: "weekly_photo" }, timeout_seconds: 3888000 },
      assignment_config: { strategy: "role", role_code: "site_supervisor" },
      contract: { inputs: { design_package: { type: "string" } }, outputs: { structural_complete: { type: "boolean" }, inspection_ref: { type: "string" }, progress_pct: { type: "number" } } } },

    { id: "cp-mep", parent: "cp-phase2", type: "group", code: "MEP_INSTALLATION", name: "MEP Installation", ordinal: 1, activation_mode: "dependency", child_mode: "parallel", policy: { mode: "all" },
      config_note: "Electrical, plumbing, and HVAC run in parallel once structure is complete." },

    { id: "cp-electrical", parent: "cp-mep", type: "action", code: "ELECTRICAL", name: "Electrical Systems", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { scope: ["main_distribution", "room_wiring", "emergency_lighting", "fire_alarm"] } },
      assignment_config: { strategy: "role", role_code: "electrical_contractor" },
      contract: { inputs: { design_ref: { type: "string" } }, outputs: { completed: { type: "boolean" }, sec_approval: { type: "string" } } } },

    { id: "cp-plumbing", parent: "cp-mep", type: "action", code: "PLUMBING", name: "Plumbing & Sanitation", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { scope: ["water_supply", "drainage", "water_heaters", "sewage_connection"] } },
      assignment_config: { strategy: "role", role_code: "plumbing_contractor" },
      contract: { inputs: { design_ref: { type: "string" } }, outputs: { completed: { type: "boolean" }, nwa_approval: { type: "string" } } } },

    { id: "cp-hvac", parent: "cp-mep", type: "action", code: "HVAC", name: "HVAC Systems", ordinal: 2, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { scope: ["central_ac", "ventilation", "kitchen_exhaust"] } },
      assignment_config: { strategy: "role", role_code: "hvac_contractor" },
      contract: { inputs: { design_ref: { type: "string" } }, outputs: { completed: { type: "boolean" }, tonnage: { type: "number" } } } },

    { id: "cp-finishing", parent: "cp-phase2", type: "action", code: "FINISHING", name: "Interior Finishing", ordinal: 2, activation_mode: "dependency",
      execution_config: { executor_type: "human", parameters: { scope: ["flooring", "painting", "furniture", "kitchen_equipment", "laundry_facility"] } },
      contract: { inputs: { capacity: { type: "number" } }, outputs: { rooms_ready: { type: "number" }, common_areas_ready: { type: "boolean" } } } },

    { id: "cp-m2", parent: "cp-root", type: "marker", code: "MILESTONE_CONSTRUCTION_COMPLETE", name: "🏁 Milestone: Construction Complete", ordinal: 3, activation_mode: "manual",
      config_note: "Stage gate — site inspection before municipality submission." },

    { id: "cp-phase3", parent: "cp-root", type: "group", code: "PHASE3_CERTIFICATION", name: "Phase 3: Inspection & Certification", ordinal: 4, activation_mode: "signal", child_mode: "sequential", policy: { mode: "all" } },

    { id: "cp-civil-defense", parent: "cp-phase3", type: "action", code: "CIVIL_DEFENSE_INSPECT", name: "Civil Defense Inspection", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { requirements: ["fire_exits", "sprinkler_system", "alarm_system", "evacuation_plan", "fire_extinguishers"] } },
      contract: { inputs: { building_ref: { type: "string" } }, outputs: { passed: { type: "boolean" }, certificate_ref: { type: "string" }, deficiencies: { type: "array" } } } },

    { id: "cp-municipality", parent: "cp-phase3", type: "action", code: "MUNICIPALITY_INSPECT", name: "Municipality Occupancy Inspection", ordinal: 1, activation_mode: "dependency",
      execution_config: { executor_type: "human", parameters: { inspector: "amana_riyadh" } },
      contract: { inputs: { permit_number: { type: "string" }, civil_defense_cert: { type: "string" } }, outputs: { occupancy_certificate: { type: "string" }, max_occupancy: { type: "number" } } } },

    { id: "cp-done", parent: "cp-root", type: "marker", code: "PROJECT_COMPLETE", name: "🏁 Project Complete — Ready for Occupancy", ordinal: 5, activation_mode: "dependency",
      exit_logic: { hooks: [{ type: "notify", channel: "email", template: "camp_ready" }] } },
  ],
  instances: [
    { id: "cpi-001", node: "cp-root", status: "active", context: "Started Mar 2026 — 6 month timeline" },
    { id: "cpi-002", node: "cp-phase1", status: "completed" },
    { id: "cpi-003", node: "cp-land", status: "completed", output: { area_sqm: 12000 } },
    { id: "cpi-004", node: "cp-baladi", status: "completed", output: { permit_number: "BLD-2026-44521" } },
    { id: "cpi-005", node: "cp-design", status: "completed", output: { approved: true } },
    { id: "cpi-006", node: "cp-m1", status: "completed", context: "CEO approved — budget SAR 8.2M" },
    { id: "cpi-007", node: "cp-phase2", status: "active" },
    { id: "cpi-008", node: "cp-foundation", status: "completed", output: { progress_pct: 100 } },
    { id: "cpi-009", node: "cp-mep", status: "active" },
    { id: "cpi-010", node: "cp-electrical", status: "completed", output: { sec_approval: "SEC-2026-991" } },
    { id: "cpi-011", node: "cp-plumbing", status: "active" },
    { id: "cpi-012", node: "cp-hvac", status: "completed" },
    { id: "cpi-013", node: "cp-finishing", status: "pending" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT: CHECKLIST — Site Safety Inspection
// ═══════════════════════════════════════════════════════════════

const BP_CHECKLIST = {
  meta: {
    code: "SAFETY_INSPECTION",
    name: "Worker Camp Safety Inspection",
    type: "checklist",
    description: "Monthly safety inspection checklist for worker accommodation camps. Every item must be verified — no skipping, no routing. Failed items trigger immediate corrective action. Required by Saudi Civil Defense regulations.",
    icon: ClipboardCheck,
    iconColor: "text-emerald-400",
    patterns: [
      { label: "Linear — No Routing", color: "emerald" },
      { label: "Pass/Fail Per Item", color: "rose" },
      { label: "Mandatory Evidence", color: "amber" },
    ],
  },
  nodes: [
    { id: "si-root", parent: null, type: "blueprint", code: "SAFETY_INSPECT_ROOT", name: "Safety Inspection Checklist", ordinal: 0, activation_mode: "event", child_mode: "sequential", policy: { mode: "all" },
      entry_logic: { conditions: [{ field: "event.schedule", operator: "==", value: "0 7 1 * *" }] },
      config_note: "Strictly sequential. Every item evaluated. No decision nodes. No routing. Pure checklist." },

    { id: "si-s1", parent: "si-root", type: "marker", code: "SECTION_FIRE", name: "── Fire Safety ──", ordinal: 0, activation_mode: "auto",
      config_note: "Section separator marker — no logic, just visual grouping in UI." },

    { id: "si-fire-ext", parent: "si-root", type: "action", code: "FIRE_EXTINGUISHERS", name: "Fire Extinguishers — Valid & Accessible", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "Check all fire extinguishers: valid expiry, correct pressure gauge, unobstructed access, proper signage", require_photo: true, require_count: true } },
      assignment_config: { strategy: "role", role_code: "safety_officer" },
      contract: { inputs: { location: { type: "string" } }, outputs: { passed: { type: "boolean" }, count_checked: { type: "number" }, count_failed: { type: "number" }, photo_refs: { type: "array" }, notes: { type: "string" } } } },

    { id: "si-fire-alarm", parent: "si-root", type: "action", code: "FIRE_ALARM_SYSTEM", name: "Fire Alarm System — Functional Test", ordinal: 2, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "Test fire alarm: activate test mode, verify all zones respond, check battery backup, test manual pull stations", require_photo: true } },
      contract: { inputs: {}, outputs: { passed: { type: "boolean" }, zones_tested: { type: "number" }, zones_failed: { type: "number" }, battery_pct: { type: "number" }, photo_refs: { type: "array" } } } },

    { id: "si-exit-routes", parent: "si-root", type: "action", code: "EXIT_ROUTES", name: "Emergency Exit Routes — Clear & Lit", ordinal: 3, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "Walk all emergency exit routes: clear of obstruction, illuminated exit signs, doors open outward, assembly point marked", require_photo: true } },
      contract: { inputs: {}, outputs: { passed: { type: "boolean" }, exits_checked: { type: "number" }, obstructions_found: { type: "number" }, photo_refs: { type: "array" } } } },

    { id: "si-sprinkler", parent: "si-root", type: "action", code: "SPRINKLER_SYSTEM", name: "Sprinkler System — Pressure & Coverage", ordinal: 4, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "Check sprinkler system: main valve open, pressure gauge reading, no painted/obstructed heads, test inspector valve", require_reading: true } },
      contract: { inputs: {}, outputs: { passed: { type: "boolean" }, pressure_psi: { type: "number" }, heads_checked: { type: "number" }, heads_obstructed: { type: "number" } } } },

    { id: "si-s2", parent: "si-root", type: "marker", code: "SECTION_ELECTRICAL", name: "── Electrical Safety ──", ordinal: 5, activation_mode: "auto" },

    { id: "si-panel", parent: "si-root", type: "action", code: "ELECTRICAL_PANELS", name: "Electrical Panels — Secured & Labeled", ordinal: 6, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "All panels: locked, labeled, 1m clearance, no exposed wiring, grounding intact", require_photo: true } },
      contract: { inputs: {}, outputs: { passed: { type: "boolean" }, panels_checked: { type: "number" }, violations: { type: "array" } } } },

    { id: "si-wiring", parent: "si-root", type: "action", code: "ROOM_WIRING", name: "Room Wiring — No Overloads", ordinal: 7, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "Spot-check 10% of rooms: no extension cord chains, no overloaded outlets, no exposed wires, GFCI in wet areas", sample_pct: 10 } },
      contract: { inputs: { total_rooms: { type: "number" } }, outputs: { passed: { type: "boolean" }, rooms_sampled: { type: "number" }, violations_found: { type: "number" } } } },

    { id: "si-s3", parent: "si-root", type: "marker", code: "SECTION_SANITATION", name: "── Sanitation & Hygiene ──", ordinal: 8, activation_mode: "auto" },

    { id: "si-water", parent: "si-root", type: "action", code: "WATER_QUALITY", name: "Water Quality — Potable Standards", ordinal: 9, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "Test water samples from tanks and taps: chlorine level, TDS, temperature, tank cleanliness", require_reading: true } },
      contract: { inputs: {}, outputs: { passed: { type: "boolean" }, chlorine_ppm: { type: "number" }, tds_reading: { type: "number" }, tank_clean: { type: "boolean" } } } },

    { id: "si-kitchen", parent: "si-root", type: "action", code: "KITCHEN_HYGIENE", name: "Kitchen & Food Storage", ordinal: 10, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "Kitchen: food storage temps, pest control valid, staff health cards valid, waste disposal, surface cleanliness", require_photo: true } },
      contract: { inputs: {}, outputs: { passed: { type: "boolean" }, fridge_temp_c: { type: "number" }, pest_control_valid: { type: "boolean" }, health_cards_valid: { type: "boolean" } } } },

    { id: "si-waste", parent: "si-root", type: "action", code: "WASTE_MANAGEMENT", name: "Waste Management & Disposal", ordinal: 11, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "Waste bins: labeled, lidded, regularly emptied. Hazardous waste separated. Collection schedule current." } },
      contract: { inputs: {}, outputs: { passed: { type: "boolean" }, bins_adequate: { type: "boolean" }, schedule_current: { type: "boolean" } } } },

    { id: "si-sign-off", parent: "si-root", type: "action", code: "INSPECTOR_SIGNOFF", name: "Inspector Sign-Off & Report", ordinal: 12, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { form: "safety_inspection_report_v3", require_signature: true, generate_pdf: true }, timeout_seconds: 3600 },
      assignment_config: { strategy: "role", role_code: "safety_officer" },
      contract: { inputs: { all_results: { type: "object" } }, outputs: { overall_passed: { type: "boolean" }, failed_items: { type: "array" }, corrective_actions: { type: "array" }, report_ref: { type: "string" }, signed_by: { type: "string" } } },
      config_note: "Final sign-off compiles all results. If any item failed, overall_passed = false and corrective actions are required." },

    { id: "si-done", parent: "si-root", type: "marker", code: "INSPECTION_COMPLETE", name: "Inspection Complete", ordinal: 13, activation_mode: "auto",
      exit_logic: { hooks: [{ type: "notify", channel: "email", template: "safety_report" }] } },
  ],
  instances: [
    { id: "sii-001", node: "si-root", status: "active", context: "July 2026 monthly inspection" },
    { id: "sii-002", node: "si-s1", status: "completed" },
    { id: "sii-003", node: "si-fire-ext", status: "completed", output: { passed: true, count_checked: 48, count_failed: 0 } },
    { id: "sii-004", node: "si-fire-alarm", status: "completed", output: { passed: true, zones_tested: 12, zones_failed: 0, battery_pct: 92 } },
    { id: "sii-005", node: "si-exit-routes", status: "completed", output: { passed: false, exits_checked: 8, obstructions_found: 2 } },
    { id: "sii-006", node: "si-sprinkler", status: "completed", output: { passed: true, pressure_psi: 125, heads_obstructed: 0 } },
    { id: "sii-007", node: "si-s2", status: "completed" },
    { id: "sii-008", node: "si-panel", status: "completed", output: { passed: true, panels_checked: 6, violations: [] } },
    { id: "sii-009", node: "si-wiring", status: "active", context: "Sampling rooms — 12 of 50 checked" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT: SOP — Workplace Incident Response
// ═══════════════════════════════════════════════════════════════

const BP_SOP = {
  meta: {
    code: "INCIDENT_RESPONSE_SOP",
    name: "Workplace Incident Response SOP",
    type: "sop",
    description: "Regulatory Standard Operating Procedure for workplace injuries per Saudi GOSI Occupational Hazards regulations. Every step requires evidence, attestation, and has legal time-bounds. Deviation from sequence is a compliance violation. Snapshot at every step.",
    icon: BookOpen,
    iconColor: "text-amber-400",
    patterns: [
      { label: "Evidence at Every Step", color: "amber" },
      { label: "Legal Deadlines", color: "rose" },
      { label: "Mandatory Snapshots", color: "violet" },
    ],
  },
  nodes: [
    { id: "ir-root", parent: null, type: "blueprint", code: "INCIDENT_ROOT", name: "Workplace Incident Response", ordinal: 0, activation_mode: "event", child_mode: "sequential", policy: { mode: "all" },
      entry_logic: { conditions: [{ field: "event.type", operator: "==", value: "incident_reported" }] },
      config_note: "SOP: strictly sequential, no reordering, snapshot_policy = every_step, evidence required at each action." },

    { id: "ir-immediate", parent: "ir-root", type: "action", code: "IMMEDIATE_RESPONSE", name: "Step 1: Immediate Medical Response", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "1. Ensure scene safety. 2. Administer first aid. 3. Call emergency services if needed. 4. Do NOT move injured unless danger present.", require_evidence: ["first_aid_log", "scene_photos", "emergency_call_log"], snapshot_policy: "mandatory" }, timeout_seconds: 900 },
      assignment_config: { strategy: "role", role_code: "site_safety_officer" },
      sla_config: { slas: [{ sla_code: "immediate_response", target_seconds: 900, warning_pct: 50, breach_action: "escalate" }] },
      contract: {
        inputs: { incident_id: { type: "uuid" }, location: { type: "string" }, severity_estimate: { type: "string" } },
        outputs: { first_aid_administered: { type: "boolean" }, ambulance_called: { type: "boolean" }, scene_secured: { type: "boolean" }, injured_count: { type: "number" }, evidence: { type: "object" }, attestation: { type: "string" } }
      },
      config_note: "15-minute regulatory deadline. Evidence: first aid log, scene photos, emergency call log." },

    { id: "ir-secure", parent: "ir-root", type: "action", code: "SCENE_PRESERVATION", name: "Step 2: Scene Preservation", ordinal: 1, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { instruction: "Cordon off area. Preserve equipment positions. Photograph from 4 angles. Collect witness names. Do NOT clean or move equipment.", require_evidence: ["scene_photos_4angle", "cordon_confirmation", "witness_list"], snapshot_policy: "mandatory" }, timeout_seconds: 1800 },
      assignment_config: { strategy: "role", role_code: "site_safety_officer" },
      contract: {
        inputs: { incident_id: { type: "uuid" } },
        outputs: { area_cordoned: { type: "boolean" }, photos_taken: { type: "number" }, witness_count: { type: "number" }, witness_names: { type: "array" }, equipment_preserved: { type: "boolean" }, evidence: { type: "object" }, attestation: { type: "string" } }
      } },

    { id: "ir-notify-gosi", parent: "ir-root", type: "action", code: "GOSI_NOTIFICATION", name: "Step 3: GOSI Incident Notification", ordinal: 2, activation_mode: "auto",
      execution_config: { executor_type: "api", executor_ref: "api://gosi/report-incident", parameters: { classification: "occupational_hazard" }, timeout_seconds: 300 },
      sla_config: { slas: [{ sla_code: "gosi_notification_deadline", target_seconds: 259200, warning_pct: 50, breach_action: "escalate" }] },
      contract: {
        inputs: { incident_id: { type: "uuid" }, injured_employees: { type: "array" }, incident_date: { type: "date" }, description: { type: "string" } },
        outputs: { gosi_ref: { type: "string" }, notification_date: { type: "date" }, evidence: { type: "object" } }
      },
      config_note: "LEGAL DEADLINE: 72 hours from incident. GOSI Occupational Hazards regulation Article 12." },

    { id: "ir-investigate", parent: "ir-root", type: "action", code: "INVESTIGATION", name: "Step 4: Formal Investigation", ordinal: 3, activation_mode: "auto",
      execution_config: { executor_type: "human", parameters: { form: "incident_investigation_v3", method: "root_cause_analysis", require_evidence: ["witness_statements", "equipment_inspection", "cctv_footage", "training_records"], snapshot_policy: "mandatory" }, timeout_seconds: 604800 },
      assignment_config: { strategy: "role", role_code: "hse_manager" },
      sla_config: { slas: [{ sla_code: "investigation_deadline", target_seconds: 604800, warning_pct: 60, breach_action: "notify" }] },
      contract: {
        inputs: { incident_id: { type: "uuid" }, witness_list: { type: "array" }, scene_evidence: { type: "object" } },
        outputs: { root_cause: { type: "string" }, contributing_factors: { type: "array" }, preventable: { type: "boolean" }, corrective_actions: { type: "array" }, evidence_package: { type: "object" }, investigator_attestation: { type: "string" } }
      },
      config_note: "7-day deadline. Must produce root cause analysis with evidence package." },

    { id: "ir-severity", parent: "ir-root", type: "decision", code: "SEVERITY_CLASSIFICATION", name: "Step 5: Severity Classification", ordinal: 4, activation_mode: "auto",
      execution_config: { executor_type: "agent", executor_ref: "sentinel_agent", parameters: { classification_standard: "gosi_occ_hazard_v2", severity_levels: ["minor", "moderate", "serious", "fatal"] }, timeout_seconds: 15 },
      exit_logic: {
        routing: [
          { condition: { field: "result.severity", operator: "in", value: ["serious", "fatal"] }, activate_node: "ir-mol-report" },
          { condition: { field: "result.severity", operator: "in", value: ["minor", "moderate"] }, activate_node: "ir-corrective" },
        ],
      },
      contract: {
        inputs: { investigation_results: { type: "object" }, injured_count: { type: "number" }, days_lost: { type: "number" } },
        outputs: { severity: { type: "string" }, classification_code: { type: "string" }, mol_reportable: { type: "boolean" } }
      },
      config_note: "SOP decision point — this is a regulatory branch, not an optimization choice. Both paths require evidence." },

    { id: "ir-mol-report", parent: "ir-root", type: "action", code: "MOL_REPORT", name: "Step 5a: MOL Serious Incident Report", ordinal: 5, activation_mode: "signal",
      execution_config: { executor_type: "api", executor_ref: "api://mol/serious-incident", parameters: { include_investigation: true }, timeout_seconds: 300 },
      sla_config: { slas: [{ sla_code: "mol_report_deadline", target_seconds: 86400, warning_pct: 50, breach_action: "escalate" }] },
      contract: { inputs: { gosi_ref: { type: "string" }, investigation: { type: "object" } }, outputs: { mol_ref: { type: "string" }, evidence: { type: "object" } } },
      config_note: "LEGAL DEADLINE: 24 hours for serious/fatal. MOL Labor Law Article 123." },

    { id: "ir-corrective", parent: "ir-root", type: "action", code: "CORRECTIVE_ACTIONS", name: "Step 6: Implement Corrective Actions", ordinal: 6, activation_mode: "dependency",
      execution_config: { executor_type: "human", parameters: { require_evidence: ["action_photos", "training_records", "equipment_replacement_receipts"], require_completion_attestation: true, snapshot_policy: "mandatory" }, timeout_seconds: 2592000 },
      assignment_config: { strategy: "role", role_code: "hse_manager" },
      sla_config: { slas: [{ sla_code: "corrective_deadline", target_seconds: 2592000, warning_pct: 50, breach_action: "escalate" }] },
      contract: {
        inputs: { corrective_actions: { type: "array" } },
        outputs: { actions_completed: { type: "array" }, actions_pending: { type: "array" }, evidence_package: { type: "object" }, manager_attestation: { type: "string" } }
      } },

    { id: "ir-close", parent: "ir-root", type: "action", code: "CASE_CLOSURE", name: "Step 7: Case Closure & Sign-Off", ordinal: 7, activation_mode: "manual",
      execution_config: { executor_type: "human", parameters: { form: "incident_closure_v2", require_all_evidence: true, require_ceo_signature: true, generate_compliance_report: true, snapshot_policy: "mandatory" }, timeout_seconds: 604800 },
      assignment_config: { strategy: "specific", assignee_party_role: "prm-ceo-minhaj" },
      contract: {
        inputs: { full_case_file: { type: "object" } },
        outputs: { closed: { type: "boolean" }, compliance_report_ref: { type: "string" }, lessons_learned: { type: "string" }, ceo_attestation: { type: "string" } }
      },
      config_note: "CEO must sign off. Full evidence chain verified. Compliance report generated for audit." },

    { id: "ir-done", parent: "ir-root", type: "marker", code: "CASE_CLOSED", name: "Case Closed — Evidence Sealed", ordinal: 8, activation_mode: "auto",
      exit_logic: { hooks: [{ type: "notify", channel: "email", template: "incident_closed_audit" }] },
      config_note: "Evidence chain sealed. Snapshot hash chain becomes immutable audit record." },
  ],
  instances: [
    { id: "iri-001", node: "ir-root", status: "active", context: "Incident #INC-2026-0041 — worker fall from scaffolding" },
    { id: "iri-002", node: "ir-immediate", status: "completed", output: { first_aid_administered: true, ambulance_called: true, injured_count: 1, scene_secured: true } },
    { id: "iri-003", node: "ir-secure", status: "completed", output: { photos_taken: 12, witness_count: 4, equipment_preserved: true } },
    { id: "iri-004", node: "ir-notify-gosi", status: "completed", output: { gosi_ref: "GOSI-OCC-2026-1128" } },
    { id: "iri-005", node: "ir-investigate", status: "active", context: "HSE Manager conducting root cause analysis — day 3 of 7" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// BLUEPRINT: TASK — Send Worker Reminder
// ═══════════════════════════════════════════════════════════════

const BP_TASK = {
  meta: {
    code: "SEND_WORKER_REMINDER",
    name: "Send Worker Document Reminder",
    type: "task",
    description: "Simple task: send a reminder to a worker about expiring documents (Iqama, medical certificate, passport). Typically spawned by a process or workflow. Minimal orchestration — one action, one marker.",
    icon: SquareCheck,
    iconColor: "text-cyan-400",
    patterns: [
      { label: "Minimal — 3 Nodes", color: "cyan" },
      { label: "Spawned by Parent", color: "violet" },
      { label: "Direct Assignment", color: "sky" },
    ],
  },
  nodes: [
    { id: "tr-root", parent: null, type: "blueprint", code: "REMINDER_ROOT", name: "Document Reminder Task", ordinal: 0, activation_mode: "auto", child_mode: "sequential", policy: { mode: "all" },
      config_note: "Simplest possible blueprint. 3 nodes. No groups. No decisions. Often spawned as sub-blueprint from a process." },

    { id: "tr-send", parent: "tr-root", type: "action", code: "SEND_REMINDER", name: "Send Reminder", ordinal: 0, activation_mode: "auto",
      execution_config: { executor_type: "agent", executor_ref: "resolver_agent", parameters: { channels: ["sms", "whatsapp"], template: "document_expiry_reminder", language_preference: "worker_profile.language", include_instructions: true }, timeout_seconds: 60 },
      assignment_config: { strategy: "specific", assignee_party_role: "prm-hr-coordinator" },
      contract: {
        inputs: { worker_id: { type: "uuid", required: true }, worker_name: { type: "string", required: true }, worker_phone: { type: "string", required: true }, document_type: { type: "string", required: true, enum: ["iqama", "medical_cert", "passport", "work_permit"] }, expiry_date: { type: "date", required: true }, days_until_expiry: { type: "number", required: true } },
        outputs: { sent: { type: "boolean" }, channel_used: { type: "string" }, sent_at: { type: "datetime" }, delivery_status: { type: "string" } }
      } },

    { id: "tr-done", parent: "tr-root", type: "marker", code: "REMINDER_SENT", name: "Reminder Sent", ordinal: 1, activation_mode: "auto",
      exit_logic: { hooks: [{ type: "webhook", url: "https://api.alrayyan.sa/webhooks/reminder", method: "POST" }] } },
  ],
  instances: [
    { id: "tri-001", node: "tr-root", status: "completed", context: "Spawned by GOSI Recon process" },
    { id: "tri-002", node: "tr-send", status: "completed", output: { sent: true, channel_used: "whatsapp", delivery_status: "delivered" } },
    { id: "tri-003", node: "tr-done", status: "completed" },
  ],
};

// ═══════════════════════════════════════════════════════════════
// ALL BLUEPRINTS
// ═══════════════════════════════════════════════════════════════

const ALL = [BP_PROCESS, BP_PROJECT, BP_CHECKLIST, BP_SOP, BP_TASK];

// ═══════════════════════════════════════════════════════════════
// VIEWER COMPONENT
// ═══════════════════════════════════════════════════════════════

function Viewer({ bp }: { bp: any }) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    bp.nodes.forEach((n: { type: string; id: string | number; }) => { if (n.type === "blueprint" || n.type === "group") init[n.id] = true; });
    return init;
  });
  const [sel, setSel] = useState<string | null>(bp.nodes[0]?.id || null);

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const renderNode = (node: any, depth: number) => {
    const children = bp.nodes.filter((n: { parent: any; }) => n.parent === node.id).sort((a: any, b: any) => a.ordinal - b.ordinal);
    const hasChildren = children.length > 0;
    const isExp = expanded[node.id];
    const isSel = sel === node.id;
    const ti = NODE_ICONS[node.type] || NODE_ICONS.action;
    const Icon = ti.icon;
    const inst = bp.instances.find((i: any) => i.node === node.id);

    return (
      <div key={node.id}>
        <button
          onClick={() => { setSel(node.id); if (hasChildren) toggle(node.id); }}
          className={`w-full flex items-center gap-1.5 py-1.5 px-2 rounded-lg text-left transition-all duration-100 ${isSel ? "bg-zinc-800 ring-1 ring-zinc-600" : "hover:bg-zinc-800/40"}`}
          style={{ paddingLeft: `${depth * 18 + 8}px` }}
        >
          {hasChildren ? (isExp ? <ChevronDown size={11} className="text-zinc-500 shrink-0" /> : <ChevronRight size={11} className="text-zinc-500 shrink-0" />) : <span className="w-3 shrink-0" />}
          <Icon size={13} className={`${ti.color} shrink-0`} />
          <span className="text-[11px] text-zinc-200 truncate flex-1">{node.name}</span>
          {inst && <Badge status={inst.status} />}
          <span className={`text-[9px] font-mono ${ACTIVATION_COLORS[node.activation_mode] || "text-zinc-500"}`}>{node.activation_mode}</span>
        </button>
        {hasChildren && isExp && children.map((c: any) => renderNode(c, depth + 1))}
      </div>
    );
  };

  const selNode = bp.nodes.find((n: { id: string | null; }) => n.id === sel);
  const selInst = selNode ? bp.instances.find((i: any) => i.node === selNode.id) : null;

  return (
    <div className="flex gap-3" style={{ height: "calc(100vh - 380px)", minHeight: 400 }}>
      <div className="w-[360px] shrink-0 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-2">
        {bp.nodes.filter((n: { parent: any; }) => !n.parent).map((n: any) => renderNode(n, 0))}
      </div>
      <div className="flex-1 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-4">
        {selNode ? (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  {(() => { const I = NODE_ICONS[selNode.type].icon; return <I size={16} className={NODE_ICONS[selNode.type].color} />; })()}
                  <h3 className="text-sm font-semibold text-zinc-100">{selNode.name}</h3>
                </div>
                <div className="text-[10px] font-mono text-zinc-500">{selNode.code} • {selNode.id}</div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${ACTIVATION_COLORS[selNode.activation_mode] || ""} bg-zinc-800`}>{selNode.activation_mode}</span>
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">{selNode.type}</span>
                {selInst && <Badge status={selInst.status} />}
              </div>
            </div>

            {(selNode as any).config_note && (
              <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200/80 leading-relaxed">
                {(selNode as any).config_note}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {(selNode as any).entry_logic && <div><Lbl>Entry Logic</Lbl><Json data={(selNode as any).entry_logic} /></div>}
              {(selNode as any).execution_config && <div><Lbl>Execution Config</Lbl><Json data={(selNode as any).execution_config} /></div>}
              {(selNode as any).assignment_config && <div><Lbl>Assignment Config</Lbl><Json data={(selNode as any).assignment_config} /></div>}
              {(selNode as any).sla_config && <div><Lbl>SLA Config</Lbl><Json data={(selNode as any).sla_config} /></div>}
              {(selNode as any).exit_logic && <div><Lbl>Exit Logic</Lbl><Json data={(selNode as any).exit_logic} /></div>}
              {(selNode as any).contract && <div><Lbl>Execution Contract</Lbl><Json data={(selNode as any).contract} /></div>}
            </div>

            {(selNode as any).child_mode && (
              <div className="flex gap-6 pt-2 border-t border-zinc-800/40">
                <div><Lbl>Child Mode</Lbl><span className="text-xs text-teal-400">{(selNode as any).child_mode}</span></div>
                <div><Lbl>Policy</Lbl><span className="text-xs text-zinc-300 font-mono">{JSON.stringify((selNode as any).policy)}</span></div>
              </div>
            )}

            {selInst && (selInst.output || selInst.context) && (
              <div className="pt-2 border-t border-zinc-800/40">
                {selInst.output && <><Lbl>Instance Output</Lbl><Json data={selInst.output} /></>}
                {selInst.context && <div className="mt-2 text-[10px] text-zinc-500">{selInst.context}</div>}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-xs">Select a node</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function BlueprintTypes() {
  const [activeBp, setActiveBp] = useState(0);
  const [showTypes, setShowTypes] = useState(true);
  const bp = ALL[activeBp];
  const typeDef = TYPE_DEFINITIONS[bp.meta.type as keyof typeof TYPE_DEFINITIONS];

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
              <Workflow size={15} className="text-white" />
            </div>
            <div>
              <div className="text-[9px] font-semibold tracking-[0.2em] uppercase text-zinc-500">agents4x Orchestration</div>
              <div className="text-sm font-semibold text-zinc-200 -mt-0.5">Blueprint Categories — Beyond Workflows</div>
            </div>
          </div>
          <button onClick={() => setShowTypes(!showTypes)} className="text-xs text-zinc-500 hover:text-zinc-300 px-3 py-1 rounded bg-zinc-800/50 transition-colors">
            {showTypes ? "Hide" : "Show"} Type Definitions
          </button>
        </div>
      </header>

      {/* Type Definitions Panel */}
      {showTypes && (
        <div className="px-5 py-4 border-b border-zinc-800/40 bg-zinc-900/30">
          <div className="text-[9px] font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-3">How Each Category Configures the Same 5 Node Types Differently</div>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(TYPE_DEFINITIONS).map(([key, def]) => {
              const Icon = def.icon;
              const isActive = bp.meta.type === key;
              return (
                <div key={key} className={`p-2.5 rounded-lg border transition-all ${isActive ? "bg-zinc-800/80 border-zinc-600" : "bg-zinc-900/40 border-zinc-800/40"}`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Icon size={13} className={def.color} />
                    <span className={`text-xs font-semibold ${isActive ? "text-zinc-100" : "text-zinc-400"}`}>{def.label}</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed line-clamp-3">{def.definition}</p>
                  <div className="mt-1.5 text-[9px] font-mono text-zinc-600 truncate">{def.example}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Blueprint Tabs */}
      <nav className="px-5 pt-2 border-b border-zinc-800/40 flex gap-1">
        {ALL.map((b, i) => {
          const Icon = b.meta.icon;
          const isActive = activeBp === i;
          const td = TYPE_DEFINITIONS[b.meta.type as keyof typeof TYPE_DEFINITIONS];
          return (
            <button
              key={i}
              onClick={() => setActiveBp(i)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap shrink-0 ${
                isActive ? "bg-zinc-900/80 text-zinc-100 border border-zinc-800/60 border-b-transparent -mb-px" : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              }`}
            >
              <Icon size={13} className={isActive ? b.meta.iconColor : ""} />
              <span className="max-w-[120px] truncate">{b.meta.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${isActive ? `${td.color} bg-zinc-800` : "text-zinc-600"}`}>{b.meta.type}</span>
            </button>
          );
        })}
      </nav>

      {/* Blueprint Header */}
      <div className="px-5 py-3 border-b border-zinc-800/30 bg-zinc-900/20">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              {(() => { const Icon = bp.meta.icon; return <Icon size={18} className={bp.meta.iconColor} />; })()}
              <h2 className="text-base font-semibold text-zinc-100">{bp.meta.name}</h2>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${typeDef.color} bg-zinc-800`}>{bp.meta.type}</span>
              <span className="text-[10px] font-mono text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">{bp.meta.code}</span>
            </div>
            <p className="text-xs text-zinc-500 leading-relaxed">{bp.meta.description}</p>
            <div className="flex items-center gap-2 mt-2">
              {bp.meta.patterns.map((p, i) => <Tag key={i} color={p.color}>{p.label}</Tag>)}
              <span className="text-[10px] text-zinc-600 font-mono ml-2">{bp.nodes.length} nodes • {bp.instances.length} instances</span>
            </div>
          </div>

          {/* Type Characteristics */}
          <div className="w-[280px] shrink-0 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/40">
            <div className="flex items-center gap-1.5 mb-2">
              {(() => { const Icon = typeDef.icon; return <Icon size={13} className={typeDef.color} />; })()}
              <span className="text-[10px] font-semibold tracking-[0.15em] uppercase text-zinc-400">Category: {typeDef.label}</span>
            </div>
            <ul className="space-y-1">
              {typeDef.characteristics.slice(0, 4).map((c, i) => (
                <li key={i} className="text-[10px] text-zinc-500 leading-relaxed flex gap-1.5">
                  <span className={`mt-1 w-1 h-1 rounded-full shrink-0 ${typeDef.color.replace("text-", "bg-")}`} />
                  {c}
                </li>
              ))}
            </ul>
            <div className="mt-2 pt-2 border-t border-zinc-800/40">
              <Lbl>Config Signature</Lbl>
              <div className="text-[9px] font-mono text-zinc-500">{typeDef.configSignature}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="p-5">
        <Viewer bp={bp} />
      </main>

      {/* Footer */}
      <footer className="px-5 py-2 border-t border-zinc-800/40 text-[9px] text-zinc-600 font-mono flex justify-between">
        <span>6 categories (workflow + process + project + checklist + sop + task) • same 5 node types • behavior in config</span>
        <span>agents4x v3.0 — Behavior-Centric Orchestration</span>
      </footer>
    </div>
  );
}
