"use client";
import { useState, useEffect, useCallback } from "react";

// ─── SAMPLE DATA ────────────────────────────────────────────────
const BLUEPRINTS = {
  employee_onboarding: {
    id: "bp-001",
    name: "Employee Onboarding",
    type: "Case",
    code: "EMP-ONBOARD",
    version: 3,
    status: "published",
    description: "End-to-end onboarding for new hires in Saudi operations",
    nodes: [
      {
        id: "n1", record_type: "group", name: "Document Collection", code: "doc_collect", ordinal: 1, parent_id: null,
        node_config: { execution_mode: "sequential", assignment: { strategy: "role_based", role: "role:hr_coordinator" }, sla: { target_hours: 48, warning_at_percent: 75, escalation_chain: ["notify_owner", "notify_hr_manager"] } },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "standard" },
        actions: { on_enter: [{ type: "notify", channel: "whatsapp", template: "docs_needed", to: "$.case.data.employee_phone" }], on_sla_breach: [{ type: "escalate", to: "role:hr_manager" }] }
      },
      {
        id: "n1a", record_type: "action", name: "Upload National ID", code: "upload_id", ordinal: 1, parent_id: "n1",
        node_config: { action_type: "checklist", item_type: "file_upload", required: true, instructions_md: "Upload a clear copy of the employee's national ID (Iqama or Saudi ID).", validation: { file_types: ["pdf", "jpg", "png"], max_size_mb: 10 } },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "standard" },
        actions: {}
      },
      {
        id: "n1b", record_type: "action", name: "Upload Employment Contract", code: "upload_contract", ordinal: 2, parent_id: "n1",
        node_config: { action_type: "checklist", item_type: "file_upload", required: true, instructions_md: "Upload the signed employment contract.", validation: { file_types: ["pdf"], max_size_mb: 15 } },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "standard" },
        actions: {}
      },
      {
        id: "n1c", record_type: "action", name: "Upload Medical Certificate", code: "upload_medical", ordinal: 3, parent_id: "n1",
        node_config: { action_type: "checklist", item_type: "file_upload", required: false, instructions_md: "Upload medical fitness certificate if available." },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "standard" },
        actions: {}
      },
      {
        id: "n2", record_type: "group", name: "Verification & Compliance", code: "verification", ordinal: 2, parent_id: null,
        node_config: { execution_mode: "parallel", completion_policy: "all", assignment: { strategy: "inherit" }, sla: { target_hours: 72, warning_at_percent: 60, escalation_chain: ["notify_owner", "notify_compliance"] } },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "standard" },
        actions: { on_enter: [{ type: "set_field", target: "$.case.data.current_stage", value: "Verification" }] }
      },
      {
        id: "n2a", record_type: "action", name: "AI Document Verification", code: "ai_doc_verify", ordinal: 1, parent_id: "n2",
        node_config: { action_type: "ai_agent", agent_ref: "agent:document_verifier", required: true, blocking: true, timeout_seconds: 120, retry: { max_attempts: 3, backoff: "exponential" }, governance: { confidence_threshold: 0.85, require_hitl_below_threshold: true, log_reasoning_trace: true }, input_mapping: { documents: "$.case.data.uploaded_docs" }, output_mapping: { verification_result: "$.case.data.doc_verification", risk_flags: "$.case.data.risk_flags" } },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "standard" },
        actions: { on_enter: [{ type: "log_audit", message: "AI verification started" }], on_exit: [{ type: "log_audit", message: "AI verification completed" }] }
      },
      {
        id: "n2b", record_type: "action", name: "GOSI Registration Check", code: "gosi_check", ordinal: 2, parent_id: "n2",
        node_config: { action_type: "automation", webhook_url: "https://api.gosi.gov.sa/verify", required: true, blocking: true, timeout_seconds: 60, input_mapping: { national_id: "$.case.data.employee_id_number" }, output_mapping: { gosi_status: "$.case.data.gosi_registered" } },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "standard" },
        actions: {}
      },
      {
        id: "n2c", record_type: "action", name: "Qiwa Contract Registration", code: "qiwa_reg", ordinal: 3, parent_id: "n2",
        node_config: { action_type: "human", form_ref: "entity:qiwa_registration.view:contract_form", required: true, blocking: true, assignment: { strategy: "specific", role: "role:gov_relations" }, input_mapping: { employee_name: "$.case.data.employee_name", contract_ref: "$.case.data.contract_number" } },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "standard" },
        actions: {}
      },
      {
        id: "n3", record_type: "decision", name: "Risk Assessment", code: "risk_decision", ordinal: 3, parent_id: null,
        node_config: { decision_type: "condition", description: "Route based on AI verification confidence and risk flags" },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "route", rules: [{ name: "High Risk", when: { any_of: [{ ref: "$.case.data.doc_verification.confidence", op: "lt", value: 0.85 }, { ref: "$.case.data.risk_flags.length", op: "gt", value: 0 }] }, activate: ["node:manual_review"] }, { name: "Clean", when: { all_of: [{ ref: "$.case.data.doc_verification.confidence", op: "gte", value: 0.85 }, { ref: "$.case.data.risk_flags.length", op: "eq", value: 0 }] }, activate: ["node:it_setup"], skip: ["node:manual_review"] }, { name: "Default", when: "default", activate: ["node:manual_review"] }] },
        actions: { on_enter: [{ type: "log_audit", message: "Risk decision point reached" }] }
      },
      {
        id: "n4", record_type: "group", name: "Manual Review", code: "manual_review", ordinal: 4, parent_id: null,
        node_config: { execution_mode: "sequential", assignment: { strategy: "role_based", role: "role:compliance_officer" }, sla: { target_hours: 24 } },
        entry_logic: { mode: "conditional", conditions: { any_of: [{ ref: "$.case.data.doc_verification.confidence", op: "lt", value: 0.85 }] } },
        exit_logic: { mode: "standard" },
        actions: {}
      },
      {
        id: "n4a", record_type: "action", name: "Compliance Review", code: "compliance_review", ordinal: 1, parent_id: "n4",
        node_config: { action_type: "human", form_ref: "entity:compliance_review.view:review_form", required: true },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "standard" },
        actions: {}
      },
      {
        id: "n4b", record_type: "action", name: "Manager Approval", code: "mgr_approval", ordinal: 2, parent_id: "n4",
        node_config: { action_type: "approval", approvers: { strategy: "any_one", pool: "role:hr_manager" }, options: [{ key: "approve", label: "Approve" }, { key: "reject", label: "Reject" }, { key: "rework", label: "Return for Rework" }], auto_rules: [], timeout: { hours: 48, action: "escalate" } },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "outcome", outcomes: { approve: { action: "continue" }, reject: { action: "activate", target: "node:rejection_handling" }, rework: { action: "reactivate", target: "node:doc_collect", reset_children: true } } },
        actions: { on_enter: [{ type: "notify", channel: "email", to: "role:hr_manager", template: "approval_needed" }] }
      },
      {
        id: "n5", record_type: "group", name: "IT Setup & Access", code: "it_setup", ordinal: 5, parent_id: null,
        node_config: { execution_mode: "parallel", completion_policy: "all", assignment: { strategy: "role_based", role: "role:it_admin" }, sla: { target_hours: 24 } },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "standard" },
        actions: { on_enter: [{ type: "notify", channel: "email", to: "role:it_admin", template: "new_setup_request" }] }
      },
      {
        id: "n5a", record_type: "action", name: "Create Email Account", code: "create_email", ordinal: 1, parent_id: "n5",
        node_config: { action_type: "automation", webhook_url: "https://admin.googleapis.com/create-user", required: true, input_mapping: { name: "$.case.data.employee_name", department: "$.case.data.department" } },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {}
      },
      {
        id: "n5b", record_type: "action", name: "Provision Laptop", code: "provision_laptop", ordinal: 2, parent_id: "n5",
        node_config: { action_type: "human", form_ref: "entity:it_assets.view:provision_form", required: true, assignment: { strategy: "round_robin", pool: "role:it_support" } },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {}
      },
      {
        id: "n5c", record_type: "action", name: "Setup Access Cards", code: "access_cards", ordinal: 3, parent_id: "n5",
        node_config: { action_type: "human", required: true, assignment: { strategy: "specific", role: "role:facilities" } },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {}
      },
      {
        id: "n6", record_type: "marker", name: "Onboarding Complete", code: "onboard_complete", ordinal: 6, parent_id: null,
        node_config: { marker_type: "milestone", milestone_name: "Employee Fully Onboarded", notify: ["role:hr_manager", "role:department_head"] },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "spawn", spawn: [{ blueprint_ref: "blueprint:probation_review", as: "sub_process", input_mapping: { employee_id: "$.case.data.employee_id" }, wait: false }], then: "continue" },
        actions: { on_enter: [{ type: "notify", channel: "whatsapp", to: "$.case.data.employee_phone", template: "welcome_aboard" }, { type: "set_field", target: "$.case.data.onboarded_at", value: "{{now}}" }] }
      },
    ]
  },
  work_order: {
    id: "bp-002",
    name: "Facility Maintenance Work Order",
    type: "Work Order",
    code: "FACILITY-WO",
    version: 1,
    status: "published",
    description: "Standard maintenance work order for facilities management",
    nodes: [
      { id: "w1", record_type: "action", name: "Receive & Log Request", code: "receive_req", ordinal: 1, parent_id: null,
        node_config: { action_type: "human", form_ref: "entity:work_orders.view:intake", required: true, assignment: { strategy: "role_based", role: "role:helpdesk" } },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: { on_enter: [{ type: "set_field", target: "$.case.data.logged_at", value: "{{now}}" }] } },
      { id: "w2", record_type: "action", name: "Assess & Estimate", code: "assess", ordinal: 2, parent_id: null,
        node_config: { action_type: "human", form_ref: "entity:work_orders.view:assessment", required: true, assignment: { strategy: "role_based", role: "role:site_supervisor" } },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "w3", record_type: "decision", name: "Parts Required?", code: "parts_check", ordinal: 3, parent_id: null,
        node_config: { decision_type: "condition", description: "Check if work requires parts ordering" },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "route", rules: [{ name: "Parts Needed", when: { ref: "$.case.data.requires_parts", op: "eq", value: true }, activate: ["node:order_parts"] }, { name: "No Parts", when: { ref: "$.case.data.requires_parts", op: "eq", value: false }, skip: ["node:order_parts"] }] },
        actions: {} },
      { id: "w4", record_type: "action", name: "Order Parts", code: "order_parts", ordinal: 4, parent_id: null,
        node_config: { action_type: "human", form_ref: "entity:procurement.view:order", required: true, assignment: { strategy: "role_based", role: "role:procurement" } },
        entry_logic: { mode: "conditional", conditions: { all_of: [{ ref: "$.case.data.requires_parts", op: "eq", value: true }] } },
        exit_logic: { mode: "standard" }, actions: {} },
      { id: "w5", record_type: "action", name: "Schedule Technician", code: "schedule_tech", ordinal: 5, parent_id: null,
        node_config: { action_type: "human", required: true, assignment: { strategy: "round_robin", pool: "role:technician" } },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "w6", record_type: "action", name: "Execute Work", code: "execute_work", ordinal: 6, parent_id: null,
        node_config: { action_type: "checklist", item_type: "checkbox", required: true, instructions_md: "Complete all maintenance tasks per assessment." },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "w7", record_type: "action", name: "Quality Inspection", code: "quality_check", ordinal: 7, parent_id: null,
        node_config: { action_type: "approval", approvers: { strategy: "any_one", pool: "role:site_supervisor" }, options: [{ key: "pass", label: "Pass" }, { key: "fail", label: "Fail — Rework" }], timeout: { hours: 24, action: "escalate" } },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "outcome", outcomes: { pass: { action: "continue" }, fail: { action: "reactivate", target: "node:execute_work" } } },
        actions: {} },
      { id: "w8", record_type: "action", name: "Client Sign-off", code: "client_signoff", ordinal: 8, parent_id: null,
        node_config: { action_type: "approval", approvers: { strategy: "any_one", pool: "role:client_contact" }, options: [{ key: "accept", label: "Accept" }, { key: "dispute", label: "Dispute" }] },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "w9", record_type: "marker", name: "Work Order Closed", code: "wo_closed", ordinal: 9, parent_id: null,
        node_config: { marker_type: "milestone", notify: ["role:client_contact", "role:site_supervisor"] },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" },
        actions: { on_enter: [{ type: "webhook", url: "https://erp.example.com/close-wo", method: "POST" }] } },
    ]
  },
  kyc_process: {
    id: "bp-003",
    name: "KYC Verification Process",
    type: "Process",
    code: "KYC-VERIFY",
    version: 2,
    status: "published",
    description: "Know Your Customer checklist process for regulatory compliance",
    nodes: [
      { id: "k1", record_type: "group", name: "Identity Verification", code: "identity_phase", ordinal: 1, parent_id: null,
        node_config: { execution_mode: "sequential", assignment: { strategy: "role_based", role: "role:kyc_analyst" }, sla: { target_hours: 4 } },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "k1a", record_type: "action", name: "Verify National ID", code: "verify_nid", ordinal: 1, parent_id: "k1",
        node_config: { action_type: "checklist", item_type: "checkbox", required: true, instructions_md: "Confirm national ID is valid, not expired, and matches applicant photo." },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "k1b", record_type: "action", name: "Verify Address Proof", code: "verify_addr", ordinal: 2, parent_id: "k1",
        node_config: { action_type: "checklist", item_type: "checkbox", required: true, instructions_md: "Confirm address proof is recent (within 3 months) and matches declared address." },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "k1c", record_type: "action", name: "AI Face Match", code: "ai_face", ordinal: 3, parent_id: "k1",
        node_config: { action_type: "ai_agent", agent_ref: "agent:face_matcher", required: true, governance: { confidence_threshold: 0.92, require_hitl_below_threshold: true, log_reasoning_trace: true } },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "k2", record_type: "group", name: "Risk Screening", code: "risk_screen", ordinal: 2, parent_id: null,
        node_config: { execution_mode: "parallel", completion_policy: "all" },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "k2a", record_type: "action", name: "Sanctions List Check", code: "sanctions", ordinal: 1, parent_id: "k2",
        node_config: { action_type: "automation", required: true, timeout_seconds: 30 },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "k2b", record_type: "action", name: "PEP Screening", code: "pep_screen", ordinal: 2, parent_id: "k2",
        node_config: { action_type: "automation", required: true, timeout_seconds: 30 },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "k2c", record_type: "action", name: "Adverse Media Check", code: "adverse_media", ordinal: 3, parent_id: "k2",
        node_config: { action_type: "ai_agent", agent_ref: "agent:media_scanner", required: true, governance: { confidence_threshold: 0.80, require_hitl_below_threshold: true } },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "k3", record_type: "decision", name: "Risk Level", code: "risk_level", ordinal: 3, parent_id: null,
        node_config: { decision_type: "rule_set", description: "Determine risk level from screening results" },
        entry_logic: { mode: "standard" },
        exit_logic: { mode: "route", rules: [{ name: "High Risk", when: { any_of: [{ ref: "$.case.data.sanctions_hit", op: "eq", value: true }, { ref: "$.case.data.pep_hit", op: "eq", value: true }] }, activate: ["node:enhanced_dd"] }, { name: "Standard", when: "default", skip: ["node:enhanced_dd"] }] },
        actions: {} },
      { id: "k4", record_type: "group", name: "Enhanced Due Diligence", code: "enhanced_dd", ordinal: 4, parent_id: null,
        node_config: { execution_mode: "sequential", assignment: { strategy: "role_based", role: "role:senior_analyst" } },
        entry_logic: { mode: "conditional", conditions: { any_of: [{ ref: "$.case.data.risk_level", op: "eq", value: "high" }] } },
        exit_logic: { mode: "standard" }, actions: {} },
      { id: "k4a", record_type: "action", name: "Source of Wealth Verification", code: "sow_verify", ordinal: 1, parent_id: "k4",
        node_config: { action_type: "human", form_ref: "entity:kyc.view:sow_form", required: true },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" }, actions: {} },
      { id: "k4b", record_type: "action", name: "Senior Management Approval", code: "sr_approval", ordinal: 2, parent_id: "k4",
        node_config: { action_type: "approval", approvers: { strategy: "any_one", pool: "role:compliance_head" }, options: [{ key: "approve", label: "Approve" }, { key: "reject", label: "Reject" }] },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "outcome", outcomes: { approve: { action: "continue" }, reject: { action: "activate", target: "node:kyc_rejected" } } }, actions: {} },
      { id: "k5", record_type: "marker", name: "KYC Approved", code: "kyc_approved", ordinal: 5, parent_id: null,
        node_config: { marker_type: "milestone", notify: ["role:relationship_manager"] },
        entry_logic: { mode: "standard" }, exit_logic: { mode: "standard" },
        actions: { on_enter: [{ type: "set_field", target: "$.case.data.kyc_status", value: "approved" }] } },
    ]
  }
};

// Runtime instances with live state
const RUNTIME_INSTANCES = {
  "inst-001": {
    id: "inst-001",
    blueprint_id: "bp-001",
    blueprint_key: "employee_onboarding",
    name: "Onboarding — Ahmed Al-Rashid",
    status: "processing",
    priority: "high",
    owner: "Fatima H.",
    created_at: "2026-06-15T08:00:00Z",
    sla_target: "2026-06-20T08:00:00Z",
    progress: 58,
    data: { employee_name: "Ahmed Al-Rashid", department: "Engineering", employee_phone: "+966 55 123 4567", contract_number: "CT-2026-0891" },
    node_states: {
      "n1": { status: "completed", started: "Jun 15 08:05", completed: "Jun 15 14:30", assigned: "Fatima H." },
      "n1a": { status: "completed", started: "Jun 15 08:05", completed: "Jun 15 09:12", assigned: "Ahmed (self-service)" },
      "n1b": { status: "completed", started: "Jun 15 09:12", completed: "Jun 15 11:45", assigned: "Ahmed (self-service)" },
      "n1c": { status: "completed", started: "Jun 15 11:45", completed: "Jun 15 14:30", assigned: "Ahmed (self-service)" },
      "n2": { status: "active", started: "Jun 15 14:35", assigned: "System" },
      "n2a": { status: "completed", started: "Jun 15 14:35", completed: "Jun 15 14:37", assigned: "AI Agent", result: { confidence: 0.91, flags: [] } },
      "n2b": { status: "completed", started: "Jun 15 14:35", completed: "Jun 15 14:36", assigned: "Automation", result: { gosi_status: "registered" } },
      "n2c": { status: "in_progress", started: "Jun 16 09:00", assigned: "Khalid M.", result: null },
      "n3": { status: "not_started" },
      "n4": { status: "not_started" },
      "n4a": { status: "not_started" },
      "n4b": { status: "not_started" },
      "n5": { status: "not_started" },
      "n5a": { status: "not_started" },
      "n5b": { status: "not_started" },
      "n5c": { status: "not_started" },
      "n6": { status: "not_started" },
    }
  }
};

// ─── CONSTANTS ──────────────────────────────────────────────────
const NODE_COLORS = {
  group: { bg: "#1e293b", border: "#3b82f6", text: "#93c5fd", badge: "#2563eb", label: "Group" },
  action: { bg: "#1a2332", border: "#10b981", text: "#6ee7b7", badge: "#059669", label: "Action" },
  decision: { bg: "#2a1f1a", border: "#f59e0b", text: "#fcd34d", badge: "#d97706", label: "Decision" },
  marker: { bg: "#1f1a2e", border: "#a855f7", text: "#c4b5fd", badge: "#7c3aed", label: "Marker" },
};

const STATUS_STYLES = {
  completed: { color: "#34d399", bg: "#064e3b", icon: "✓" },
  active: { color: "#60a5fa", bg: "#1e3a5f", icon: "●" },
  in_progress: { color: "#fbbf24", bg: "#422006", icon: "◐" },
  not_started: { color: "#64748b", bg: "#1e293b", icon: "○" },
  skipped: { color: "#94a3b8", bg: "#1e293b", icon: "⊘" },
  failed: { color: "#f87171", bg: "#450a0a", icon: "✗" },
};

const ACTION_TYPE_ICONS = {
  human: "👤", ai_agent: "🤖", automation: "⚡", approval: "🛡", checklist: "☑", default: "◆"
};

// ─── COMPONENTS ─────────────────────────────────────────────────

function JsonBlock({ data, label }) {
  const [open, setOpen] = useState(false);
  if (!data || Object.keys(data).length === 0) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <button onClick={() => setOpen(!open)} style={{
        background: "none", border: "1px solid #334155", color: "#94a3b8", padding: "4px 10px",
        borderRadius: 4, cursor: "pointer", fontSize: 11, fontFamily: "'DM Mono', monospace", width: "100%", textAlign: "left",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <span>{label}</span>
        <span style={{ fontSize: 10, opacity: 0.6 }}>{open ? "▼" : "▶"}</span>
      </button>
      {open && (
        <pre style={{
          background: "#0a0f1a", border: "1px solid #1e293b", borderTop: "none", borderRadius: "0 0 4px 4px",
          padding: 10, margin: 0, fontSize: 10, lineHeight: 1.5, color: "#cbd5e1", overflow: "auto",
          maxHeight: 260, fontFamily: "'DM Mono', monospace"
        }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.not_started;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 8px", borderRadius: 10,
      fontSize: 10, fontWeight: 600, color: s.color, background: s.bg, border: `1px solid ${s.color}22`,
      fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.05em"
    }}>
      <span style={{ fontSize: 8 }}>{s.icon}</span> {status.replace("_", " ")}
    </span>
  );
}

function NodeTypeBadge({ type }) {
  const c = NODE_COLORS[type] || NODE_COLORS.action;
  return (
    <span style={{
      display: "inline-block", padding: "1px 6px", borderRadius: 3, fontSize: 9, fontWeight: 700,
      color: "#fff", background: c.badge, textTransform: "uppercase", letterSpacing: "0.08em",
      fontFamily: "'DM Mono', monospace"
    }}>
      {c.label}
    </span>
  );
}

function ActionTypeBadge({ config }) {
  const t = config?.action_type || config?.decision_type || config?.marker_type || "—";
  const icon = ACTION_TYPE_ICONS[config?.action_type] || ACTION_TYPE_ICONS.default;
  return (
    <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>
      {icon} {t}
    </span>
  );
}

function GovernanceBadge({ config }) {
  if (!config?.governance) return null;
  const gov = config.governance;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 3,
      fontSize: 9, fontWeight: 600, color: "#60a5fa", background: "#1e3a5f", border: "1px solid #2563eb33",
      fontFamily: "'DM Mono', monospace"
    }}>
      🔒 HITL @ {(gov.confidence_threshold * 100).toFixed(0)}%
    </span>
  );
}

function SLABadge({ sla }) {
  if (!sla) return null;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 6px", borderRadius: 3,
      fontSize: 9, fontWeight: 600, color: "#f59e0b", background: "#422006", border: "1px solid #d9770633",
      fontFamily: "'DM Mono', monospace"
    }}>
      ⏱ {sla.target_hours}h SLA
    </span>
  );
}

function TreeNode({ node, allNodes, depth, selectedId, onSelect, runtimeStates }) {
  const children = allNodes.filter(n => n.parent_id === node.id).sort((a, b) => a.ordinal - b.ordinal);
  const c = NODE_COLORS[node.record_type] || NODE_COLORS.action;
  const isSelected = selectedId === node.id;
  const rs = runtimeStates?.[node.id];

  return (
    <div style={{ marginLeft: depth > 0 ? 20 : 0 }}>
      {depth > 0 && (
        <div style={{ position: "relative", height: 0 }}>
          <div style={{
            position: "absolute", left: -16, top: -14, width: 12, height: 20,
            borderLeft: `1px solid ${c.border}33`, borderBottom: `1px solid ${c.border}33`,
            borderRadius: "0 0 0 4px"
          }} />
        </div>
      )}
      <button
        onClick={() => onSelect(node.id)}
        style={{
          display: "block", width: "100%", textAlign: "left", cursor: "pointer",
          background: isSelected ? `${c.border}15` : "transparent",
          border: isSelected ? `1px solid ${c.border}55` : "1px solid transparent",
          borderRadius: 6, padding: "8px 10px", marginBottom: 2, transition: "all 0.15s",
          position: "relative"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <NodeTypeBadge type={node.record_type} />
          <span style={{ fontSize: 13, fontWeight: 600, color: c.text, fontFamily: "'Instrument Sans', sans-serif" }}>
            {node.name}
          </span>
          {rs && <StatusBadge status={rs.status} />}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 10, color: "#475569", fontFamily: "'DM Mono', monospace" }}>{node.code}</span>
          <ActionTypeBadge config={node.node_config} />
          <GovernanceBadge config={node.node_config} />
          <SLABadge sla={node.node_config?.sla} />
          {node.node_config?.execution_mode && (
            <span style={{ fontSize: 9, color: "#64748b", fontFamily: "'DM Mono', monospace", background: "#1e293b", padding: "1px 5px", borderRadius: 3 }}>
              {node.node_config.execution_mode}
            </span>
          )}
        </div>
        {rs?.assigned && rs.status !== "not_started" && (
          <div style={{ fontSize: 10, color: "#64748b", marginTop: 3, fontFamily: "'DM Mono', monospace" }}>
            → {rs.assigned} {rs.completed ? `• done ${rs.completed}` : rs.started ? `• since ${rs.started}` : ""}
          </div>
        )}
      </button>
      {children.length > 0 && (
        <div style={{ borderLeft: `1px dashed ${c.border}22`, marginLeft: 8, paddingLeft: 0 }}>
          {children.map(child => (
            <TreeNode key={child.id} node={child} allNodes={allNodes} depth={depth + 1}
              selectedId={selectedId} onSelect={onSelect} runtimeStates={runtimeStates} />
          ))}
        </div>
      )}
    </div>
  );
}

function NodeDetailPanel({ node, runtimeState }) {
  if (!node) return (
    <div style={{ padding: 40, textAlign: "center", color: "#475569" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>◇</div>
      <div style={{ fontSize: 13, fontFamily: "'Instrument Sans', sans-serif" }}>Select a node to inspect</div>
    </div>
  );

  const c = NODE_COLORS[node.record_type] || NODE_COLORS.action;

  return (
    <div style={{ padding: 16, overflowY: "auto", height: "100%" }}>
      {/* Header */}
      <div style={{ marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${c.border}33` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
          <NodeTypeBadge type={node.record_type} />
          {runtimeState && <StatusBadge status={runtimeState.status} />}
          <GovernanceBadge config={node.node_config} />
        </div>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: c.text, fontFamily: "'Instrument Sans', sans-serif" }}>{node.name}</h3>
        <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace", marginTop: 4 }}>
          code: {node.code} &nbsp;•&nbsp; ordinal: {node.ordinal} &nbsp;•&nbsp; id: {node.id}
        </div>
      </div>

      {/* Runtime State */}
      {runtimeState && runtimeState.status !== "not_started" && (
        <div style={{
          background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 6, padding: 12, marginBottom: 12
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
            ▶ Runtime State
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>
            <div>Assigned: <span style={{ color: "#e2e8f0" }}>{runtimeState.assigned || "—"}</span></div>
            <div>Started: <span style={{ color: "#e2e8f0" }}>{runtimeState.started || "—"}</span></div>
            <div>Completed: <span style={{ color: "#e2e8f0" }}>{runtimeState.completed || "—"}</span></div>
            <div>Status: <span style={{ color: "#e2e8f0" }}>{runtimeState.status}</span></div>
          </div>
          {runtimeState.result && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 10, color: "#64748b", marginBottom: 4 }}>Result:</div>
              <pre style={{ fontSize: 10, color: "#34d399", margin: 0, fontFamily: "'DM Mono', monospace" }}>
                {JSON.stringify(runtimeState.result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* 4 Config Blocks */}
      <div style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontFamily: "'DM Mono', monospace" }}>
        ◆ Node Configuration
      </div>
      <JsonBlock data={node.node_config} label="node_config — What this node IS" />
      <JsonBlock data={node.entry_logic} label="entry_logic — When does it activate" />
      <JsonBlock data={node.exit_logic} label="exit_logic — What happens when done" />
      <JsonBlock data={node.actions} label="actions — Hook actions (on_enter, on_exit, ...)" />

      {/* Visual Logic */}
      {node.exit_logic?.mode === "route" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
            ◆ Decision Routes
          </div>
          {node.exit_logic.rules.map((rule, i) => (
            <div key={i} style={{
              background: "#1a1500", border: "1px solid #f59e0b33", borderRadius: 6, padding: 10, marginBottom: 6
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fcd34d", marginBottom: 4, fontFamily: "'Instrument Sans', sans-serif" }}>
                {rule.name}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>
                when: {typeof rule.when === "string" ? rule.when : JSON.stringify(rule.when)}
              </div>
              {rule.activate && (
                <div style={{ fontSize: 10, color: "#34d399", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                  → activate: {rule.activate.join(", ")}
                </div>
              )}
              {rule.skip && (
                <div style={{ fontSize: 10, color: "#f87171", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
                  ⊘ skip: {rule.skip.join(", ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {node.exit_logic?.mode === "outcome" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
            ◆ Outcome Routes
          </div>
          {Object.entries(node.exit_logic.outcomes).map(([key, val]) => (
            <div key={key} style={{
              background: "#150a20", border: "1px solid #a855f733", borderRadius: 6, padding: 10, marginBottom: 6
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 700,
                  background: key === "approve" || key === "pass" || key === "accept" ? "#064e3b" : key === "reject" || key === "fail" ? "#450a0a" : "#422006",
                  color: key === "approve" || key === "pass" || key === "accept" ? "#34d399" : key === "reject" || key === "fail" ? "#f87171" : "#fbbf24",
                  fontFamily: "'DM Mono', monospace"
                }}>
                  {key}
                </span>
                <span style={{ fontSize: 10, color: "#94a3b8", fontFamily: "'DM Mono', monospace" }}>
                  → {val.action}{val.target ? `: ${val.target}` : ""}{val.reset_children ? " (reset)" : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {node.exit_logic?.mode === "spawn" && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "'DM Mono', monospace" }}>
            ◆ Spawns Sub-Instance
          </div>
          {node.exit_logic.spawn.map((sp, i) => (
            <div key={i} style={{ background: "#150a20", border: "1px solid #a855f733", borderRadius: 6, padding: 10, marginBottom: 6, fontSize: 11, color: "#c4b5fd", fontFamily: "'DM Mono', monospace" }}>
              <div>blueprint: {sp.blueprint_ref}</div>
              <div>as: {sp.as} • wait: {sp.wait ? "yes" : "no"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div style={{ width: "100%", height: 4, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
      <div style={{
        width: `${value}%`, height: "100%", borderRadius: 2,
        background: value >= 100 ? "#34d399" : value > 60 ? "#3b82f6" : value > 30 ? "#f59e0b" : "#64748b",
        transition: "width 0.5s ease"
      }} />
    </div>
  );
}

function BlueprintSelector({ blueprints, selected, onSelect }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {Object.entries(blueprints).map(([key, bp]) => (
        <button key={key} onClick={() => onSelect(key)} style={{
          padding: "6px 12px", borderRadius: 6, border: selected === key ? "1px solid #3b82f6" : "1px solid #1e293b",
          background: selected === key ? "#1e3a5f" : "#0f172a", color: selected === key ? "#93c5fd" : "#64748b",
          cursor: "pointer", fontSize: 11, fontFamily: "'Instrument Sans', sans-serif", fontWeight: 600,
          transition: "all 0.15s"
        }}>
          <span style={{ fontSize: 9, opacity: 0.7, display: "block", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2, fontFamily: "'DM Mono', monospace" }}>{bp.type}</span>
          {bp.name}
        </button>
      ))}
    </div>
  );
}

function ViewToggle({ view, onToggle }) {
  return (
    <div style={{ display: "flex", background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b", overflow: "hidden" }}>
      {["blueprint", "runtime"].map(v => (
        <button key={v} onClick={() => onToggle(v)} style={{
          padding: "6px 14px", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
          fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em",
          background: view === v ? "#2563eb" : "transparent", color: view === v ? "#fff" : "#64748b",
          transition: "all 0.15s"
        }}>
          {v === "blueprint" ? "◇ Blueprint" : "▶ Runtime"}
        </button>
      ))}
    </div>
  );
}

function RuntimeHeader({ instance }) {
  if (!instance) return null;
  return (
    <div style={{
      background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 8, padding: 14, marginBottom: 12
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Instrument Sans', sans-serif" }}>
            {instance.name}
          </h3>
          <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace", marginTop: 3 }}>
            {instance.id} • owner: {instance.owner} • priority: <span style={{ color: instance.priority === "high" ? "#f59e0b" : "#64748b" }}>{instance.priority}</span>
          </div>
        </div>
        <StatusBadge status={instance.status} />
      </div>
      <ProgressBar value={instance.progress} />
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>
        <span>{instance.progress}% complete</span>
        <span>SLA: {new Date(instance.sla_target).toLocaleDateString()}</span>
      </div>
      <div style={{ display: "flex", gap: 12, marginTop: 10, flexWrap: "wrap" }}>
        {Object.entries(instance.data).map(([k, v]) => (
          <div key={k} style={{ fontSize: 10, fontFamily: "'DM Mono', monospace" }}>
            <span style={{ color: "#475569" }}>{k}:</span> <span style={{ color: "#94a3b8" }}>{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", padding: "8px 0" }}>
      {Object.entries(NODE_COLORS).map(([type, c]) => (
        <div key={type} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <div style={{ width: 8, height: 8, borderRadius: 2, background: c.badge }} />
          <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Mono', monospace", textTransform: "capitalize" }}>{type}</span>
        </div>
      ))}
      <span style={{ fontSize: 10, color: "#334155", fontFamily: "'DM Mono', monospace" }}>│</span>
      {Object.entries(STATUS_STYLES).slice(0, 4).map(([status, s]) => (
        <div key={status} style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ fontSize: 8, color: s.color }}>{s.icon}</span>
          <span style={{ fontSize: 10, color: "#64748b", fontFamily: "'DM Mono', monospace" }}>{status.replace("_", " ")}</span>
        </div>
      ))}
    </div>
  );
}

function StatsBar({ bp, runtimeStates }) {
  const nodes = bp.nodes;
  const groups = nodes.filter(n => n.record_type === "group").length;
  const actions = nodes.filter(n => n.record_type === "action").length;
  const decisions = nodes.filter(n => n.record_type === "decision").length;
  const markers = nodes.filter(n => n.record_type === "marker").length;
  const aiNodes = nodes.filter(n => n.node_config?.action_type === "ai_agent").length;
  const approvals = nodes.filter(n => n.node_config?.action_type === "approval").length;
  const governed = nodes.filter(n => n.node_config?.governance).length;

  const stats = [
    { label: "Nodes", value: nodes.length, color: "#e2e8f0" },
    { label: "Groups", value: groups, color: "#3b82f6" },
    { label: "Actions", value: actions, color: "#10b981" },
    { label: "Decisions", value: decisions, color: "#f59e0b" },
    { label: "Milestones", value: markers, color: "#a855f7" },
    { label: "AI Agents", value: aiNodes, color: "#06b6d4" },
    { label: "Approvals", value: approvals, color: "#f97316" },
    { label: "HITL Gov.", value: governed, color: "#60a5fa" },
  ];

  return (
    <div style={{
      display: "flex", gap: 2, flexWrap: "wrap", background: "#0a0f1a", borderRadius: 6,
      border: "1px solid #1e293b", padding: "8px 4px"
    }}>
      {stats.map(s => (
        <div key={s.label} style={{ flex: "1 1 auto", textAlign: "center", padding: "2px 8px", minWidth: 60 }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: s.color, fontFamily: "'DM Mono', monospace" }}>{s.value}</div>
          <div style={{ fontSize: 9, color: "#475569", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function ArchDiagram() {
  return (
    <div style={{ background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 8, padding: 16, marginBottom: 12 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
        System Architecture
      </div>
      <pre style={{
        fontSize: 10, lineHeight: 1.45, color: "#94a3b8", fontFamily: "'DM Mono', monospace", margin: 0,
        overflow: "auto", whiteSpace: "pre"
      }}>{`
  ┌─────────────────────────────────────────────────┐
  │              orch_blueprint (Entity)             │
  │  Record Types: blueprint│group│action│decision│  │
  │                marker                            │
  │  Hierarchy: unlimited nesting via parent_id      │
  │  4 Config Blocks per node:                       │
  │    node_config · entry_logic · exit_logic ·      │
  │    actions                                       │
  └───────────────────┬─────────────────────────────┘
                      │ hydrate
  ┌───────────────────▼─────────────────────────────┐
  │              orch_instance (Entity)              │
  │  Record Types: instance│group_inst│action_inst│  │
  │                decision_inst│marker_inst          │
  │  Each node → runtime state + data + assignment   │
  └───────────────────┬─────────────────────────────┘
                      │ events
  ┌───────────────────▼─────────────────────────────┐
  │           Entity Engine (Before/After Rules)     │
  │                                                  │
  │  on task complete → evaluate exit_logic          │
  │  signal parent → check execution_mode            │
  │  activate next → evaluate entry_logic            │
  │  SLA timers → Temporal scheduled workflows       │
  │  AI tasks → agents4x runtime dispatch            │
  │  Governance → OPA policy + HITL enforcement      │
  └──────────────────────────────────────────────────┘`}
      </pre>
    </div>
  );
}

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
  { key: "orch", label: "Orchestration", glyph: "⚙️", live: true, href: "/orchestration" },
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

// ─── MAIN APP ───────────────────────────────────────────────────
export default function OrchBlueprintDemo() {
  const [selectedBp, setSelectedBp] = useState("employee_onboarding");
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [view, setView] = useState("blueprint");
  const [showArch, setShowArch] = useState(false);

  const bp = BLUEPRINTS[selectedBp];
  const runtimeInst = view === "runtime" ? RUNTIME_INSTANCES["inst-001"] : null;
  const runtimeStates = runtimeInst?.node_states || null;

  const rootNodes = bp.nodes.filter(n => n.parent_id === null).sort((a, b) => a.ordinal - b.ordinal);
  const selectedNode = bp.nodes.find(n => n.id === selectedNodeId);

  useEffect(() => { setSelectedNodeId(null); }, [selectedBp]);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: "#080c14", overflow: "hidden" }}>
      <Rail active="blueprint" />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: "'Instrument Sans', -apple-system, sans-serif", color: "#e2e8f0", overflowY: "auto" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Instrument+Sans:wght@400;600;700&display=swap" rel="stylesheet" />

      {/* Top Bar */}
      <div style={{
        padding: "12px 16px", borderBottom: "1px solid #1e293b",
        background: "linear-gradient(180deg, #0f172a 0%, #080c14 100%)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
          <div>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", letterSpacing: "0.15em", fontFamily: "'DM Mono', monospace" }}>APPS4X</span>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2 }}>
              Orchestration Blueprint
            </h1>
            <span style={{ fontSize: 11, color: "#475569", fontFamily: "'DM Mono', monospace" }}>
              Entity-native workflow engine — 2 entities, 5 record types, infinite patterns
            </span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <button onClick={() => setShowArch(!showArch)} style={{
              padding: "6px 12px", borderRadius: 6, border: "1px solid #1e293b", background: showArch ? "#1e3a5f" : "#0f172a",
              color: showArch ? "#93c5fd" : "#64748b", cursor: "pointer", fontSize: 10, fontFamily: "'DM Mono', monospace"
            }}>
              {showArch ? "✕ Architecture" : "◈ Architecture"}
            </button>
            <ViewToggle view={view} onToggle={setView} />
          </div>
        </div>
        <BlueprintSelector blueprints={BLUEPRINTS} selected={selectedBp} onSelect={setSelectedBp} />
      </div>

      {/* Architecture Panel */}
      {showArch && (
        <div style={{ padding: "12px 16px 0" }}>
          <ArchDiagram />
        </div>
      )}

      {/* Blueprint Info Bar */}
      <div style={{ padding: "12px 16px 0" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 8
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{bp.name}</span>
              <span style={{
                padding: "2px 6px", borderRadius: 3, fontSize: 9, fontWeight: 700,
                color: "#34d399", background: "#064e3b", fontFamily: "'DM Mono', monospace"
              }}>v{bp.version} • {bp.status}</span>
            </div>
            <div style={{ fontSize: 11, color: "#64748b", fontFamily: "'DM Mono', monospace", marginTop: 2 }}>
              {bp.code} • {bp.description}
            </div>
          </div>
        </div>
        <StatsBar bp={bp} />
        <Legend />
      </div>

      {/* Runtime Header */}
      {view === "runtime" && runtimeInst && (
        <div style={{ padding: "0 16px" }}>
          <RuntimeHeader instance={runtimeInst} />
        </div>
      )}

      {/* Main Panel */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: 0,
        padding: "0 16px 16px",
      }}>
        {/* Tree */}
        <div style={{
          background: "#0c1220", border: "1px solid #1e293b", borderRadius: 8,
          padding: "12px 8px", marginBottom: 0, overflow: "auto"
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8, fontFamily: "'DM Mono', monospace", paddingLeft: 4 }}>
            {view === "blueprint" ? "◇ Blueprint Tree" : "▶ Runtime Tree"} — tap any node
          </div>
          {rootNodes.map(node => (
            <TreeNode key={node.id} node={node} allNodes={bp.nodes} depth={0}
              selectedId={selectedNodeId} onSelect={setSelectedNodeId}
              runtimeStates={runtimeStates} />
          ))}
        </div>

        {/* Detail Panel */}
        {selectedNode && (
          <div style={{
            background: "#0c1220", border: "1px solid #1e293b", borderRadius: 8,
            marginTop: 8, overflow: "auto"
          }}>
            <NodeDetailPanel node={selectedNode}
              runtimeState={runtimeStates?.[selectedNodeId]} />
          </div>
        )}
      </div>

      {/* Educational Footer */}
      <div style={{ padding: "0 16px 24px" }}>
        <div style={{
          background: "#0a0f1a", border: "1px solid #1e293b", borderRadius: 8, padding: 16
        }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10, fontFamily: "'DM Mono', monospace" }}>
            How It Works
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 10 }}>
            {[
              { title: "Entity-Native", desc: "Everything is an entity record. 5 record types (blueprint, group, action, decision, marker) model any pattern — cases, processes, project plans, work orders." },
              { title: "Node-Atomic", desc: "Each node carries 4 config blocks: node_config (what it is), entry_logic (when it activates), exit_logic (what happens next), actions (hooks). No separate transition table." },
              { title: "Decision Logic", desc: "exit_logic mode:route replaces flowchart edges. Each decision node evaluates rules and activates/skips sibling nodes. Outcomes from approvals route via mode:outcome." },
              { title: "Hydration", desc: "Blueprint tree is hydrated into runtime instances. Each blueprint node becomes a runtime record with live status, assignment, SLA tracking, and accumulated context." },
              { title: "Governed AI", desc: "AI agent tasks carry governance config with confidence thresholds and HITL enforcement. Below threshold → human review required. Reasoning traces logged for audit." },
              { title: "Composable", desc: "Nodes can spawn sub-instances (exit_logic mode:spawn). A case can spawn a process, a process can spawn tasks. Correlation IDs tie the lineage together." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <span style={{ fontSize: 11, color: "#3b82f6", fontFamily: "'DM Mono', monospace", flexShrink: 0, width: 16, textAlign: "right" }}>{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#e2e8f0", fontFamily: "'Instrument Sans', sans-serif" }}>{item.title}</span>
                  <span style={{ fontSize: 11, color: "#94a3b8", fontFamily: "'Instrument Sans', sans-serif", marginLeft: 6 }}>{item.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
