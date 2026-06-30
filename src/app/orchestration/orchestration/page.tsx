"use client";
import { useState } from "react";
import {
  GitBranch, Layers, Activity, Database, ListChecks, Clock,
  ChevronRight, ChevronDown, Shield, AlertTriangle, CheckCircle2,
  XCircle, Pause, Play, Timer, Zap, User, Bot, Eye, Hash,
  ArrowRight, Circle, Diamond, Flag, Box, Workflow
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// SAMPLE DATA — Saudi Manpower Worker Onboarding Blueprint
// ═══════════════════════════════════════════════════════════════

const BLUEPRINT = {
  id: "bp-001",
  tenant_id: "tn-alrayyan-manpower",
  code: "WORKER_ONBOARDING_SA",
  name: "Worker Onboarding — Saudi Arabia",
  description: "End-to-end onboarding for recruited workers entering KSA. Covers Qiwa registration, medical, Iqama processing, GOSI enrollment, and site assignment.",
  category: "onboarding",
  status: "active",
  ownership_party_role: "prm-ceo-minhaj",
  created_at: "2026-05-10T08:00:00Z",
  updated_at: "2026-06-28T14:30:00Z",
};

const BLUEPRINT_VERSION = {
  id: "bpv-001",
  blueprint_id: "bp-001",
  version_no: 3,
  status: "published",
  published_at: "2026-06-25T10:00:00Z",
  published_by: "prm-lead-ahmed",
  contract: {
    inputs: {
      worker_id: { type: "uuid", required: true },
      passport_number: { type: "string", required: true },
      visa_number: { type: "string", required: true },
      sponsor_cr: { type: "string", required: true },
      nationality: { type: "string", required: true },
    },
    outputs: {
      iqama_number: { type: "string" },
      gosi_number: { type: "string" },
      site_assignment_id: { type: "uuid" },
      onboarding_status: { type: "string", enum: ["completed", "failed", "partial"] },
    },
  },
};

const NODES = [
  {
    node_id: "n-root",
    parent_node_id: null,
    node_type: "blueprint",
    code: "ONBOARDING_ROOT",
    name: "Worker Onboarding",
    ordinal: 0,
    activation_mode: "auto",
    entry_logic: null,
    execution_config: null,
    assignment_config: null,
    sla_config: null,
    exit_logic: {
      hooks: [{ type: "notify", channel: "slack", template: "onboarding_complete" }],
    },
    contract: BLUEPRINT_VERSION.contract,
    child_execution_mode: "sequential",
    completion_policy: { mode: "all" },
  },
  {
    node_id: "n-prereq",
    parent_node_id: "n-root",
    node_type: "group",
    code: "PREREQUISITES",
    name: "Prerequisites & Document Verification",
    ordinal: 0,
    activation_mode: "auto",
    entry_logic: null,
    execution_config: null,
    assignment_config: null,
    sla_config: {
      slas: [{ sla_code: "prereq_completion", target_seconds: 172800, warning_pct: 75, business_calendar_id: "cal-sa-sun-thu", breach_action: "escalate" }],
    },
    exit_logic: {
      signals: [{ name: "docs_verified", emit_on: "complete" }],
    },
    contract: null,
    child_execution_mode: "parallel",
    completion_policy: { mode: "all" },
  },
  {
    node_id: "n-passport-verify",
    parent_node_id: "n-prereq",
    node_type: "action",
    code: "PASSPORT_VERIFY",
    name: "Passport Verification",
    ordinal: 0,
    activation_mode: "auto",
    entry_logic: {
      conditions: [{ field: "input.passport_number", operator: "exists", value: true }],
      condition_mode: "all",
    },
    execution_config: {
      executor_type: "agent",
      executor_ref: "resolver_agent",
      parameters: { check_type: "passport_validity", source: "mofa_api" },
      retry_policy: { max_retries: 2, backoff: "exponential", retry_on: ["timeout"] },
      timeout_seconds: 120,
    },
    assignment_config: { strategy: "queue", queue_id: "q-doc-verification" },
    sla_config: null,
    exit_logic: {
      signals: [{ name: "passport_ok", emit_on: "complete" }],
    },
    contract: {
      inputs: { passport_number: { type: "string", required: true } },
      outputs: { valid: { type: "boolean" }, expiry_date: { type: "date" } },
    },
  },
  {
    node_id: "n-visa-verify",
    parent_node_id: "n-prereq",
    node_type: "action",
    code: "VISA_VERIFY",
    name: "Visa & Work Permit Validation",
    ordinal: 1,
    activation_mode: "auto",
    entry_logic: {
      conditions: [{ field: "input.visa_number", operator: "exists", value: true }],
      condition_mode: "all",
    },
    execution_config: {
      executor_type: "api",
      executor_ref: "api://qiwa/visa-check",
      parameters: { include_nitaqat: true },
      retry_policy: { max_retries: 3, backoff: "exponential", retry_on: ["timeout", "transient_error"] },
      timeout_seconds: 60,
    },
    assignment_config: null,
    sla_config: null,
    exit_logic: {
      signals: [{ name: "visa_ok", emit_on: "complete" }],
    },
    contract: {
      inputs: { visa_number: { type: "string", required: true }, sponsor_cr: { type: "string", required: true } },
      outputs: { valid: { type: "boolean" }, nitaqat_band: { type: "string" }, expiry_date: { type: "date" } },
    },
  },
  {
    node_id: "n-sponsor-check",
    parent_node_id: "n-prereq",
    node_type: "action",
    code: "SPONSOR_CR_CHECK",
    name: "Sponsor CR Validation",
    ordinal: 2,
    activation_mode: "auto",
    entry_logic: null,
    execution_config: {
      executor_type: "api",
      executor_ref: "api://mol/sponsor-check",
      parameters: {},
      timeout_seconds: 90,
    },
    assignment_config: null,
    sla_config: null,
    exit_logic: null,
    contract: {
      inputs: { sponsor_cr: { type: "string", required: true } },
      outputs: { active: { type: "boolean" }, entity_name: { type: "string" } },
    },
  },
  {
    node_id: "n-risk-decision",
    parent_node_id: "n-root",
    node_type: "decision",
    code: "RISK_ASSESSMENT",
    name: "Risk Assessment Decision",
    ordinal: 1,
    activation_mode: "dependency",
    entry_logic: {
      conditions: [{ field: "prereq.output.all_valid", operator: "==", value: true }],
      condition_mode: "all",
    },
    execution_config: {
      executor_type: "agent",
      executor_ref: "sentinel_agent",
      parameters: { risk_model: "worker_onboarding_v2", threshold: 0.7 },
      timeout_seconds: 30,
    },
    assignment_config: null,
    sla_config: null,
    exit_logic: {
      routing: [
        { condition: { field: "result.risk_score", operator: "<=", value: 70 }, activate_node: "n-auto-approve" },
        { condition: { field: "result.risk_score", operator: ">", value: 70 }, activate_node: "n-manual-review" },
      ],
      signals: [{ name: "risk_assessed", emit_on: "complete" }],
    },
    contract: {
      inputs: { worker_id: { type: "uuid" }, nationality: { type: "string" }, documents: { type: "object" } },
      outputs: { risk_score: { type: "number", range: [0, 100] }, risk_factors: { type: "array" }, recommended_action: { type: "string" } },
    },
  },
  {
    node_id: "n-auto-approve",
    parent_node_id: "n-root",
    node_type: "marker",
    code: "AUTO_APPROVED",
    name: "Auto-Approved (Low Risk)",
    ordinal: 2,
    activation_mode: "signal",
    entry_logic: null,
    execution_config: null,
    assignment_config: null,
    sla_config: null,
    exit_logic: {
      signals: [{ name: "approved", emit_on: "complete" }],
      hooks: [{ type: "notify", channel: "sms", template: "worker_approved" }],
    },
    contract: null,
  },
  {
    node_id: "n-manual-review",
    parent_node_id: "n-root",
    node_type: "action",
    code: "MANUAL_REVIEW",
    name: "Manual Compliance Review",
    ordinal: 3,
    activation_mode: "signal",
    entry_logic: null,
    execution_config: {
      executor_type: "human",
      executor_ref: null,
      parameters: { form: "compliance_review_form_v3", require_notes: true },
      timeout_seconds: 86400,
    },
    assignment_config: {
      strategy: "role",
      role_code: "compliance_officer",
      fallback_strategy: "escalate",
      escalation_timeout_seconds: 14400,
    },
    sla_config: {
      slas: [{ sla_code: "review_response", target_seconds: 28800, warning_pct: 75, business_calendar_id: "cal-sa-sun-thu", breach_action: "escalate" }],
    },
    exit_logic: {
      routing: [
        { condition: { field: "result.approved", operator: "==", value: true }, activate_node: "n-registration" },
        { condition: { field: "result.approved", operator: "==", value: false }, activate_node: "n-rejection" },
      ],
    },
    contract: {
      inputs: { risk_score: { type: "number" }, risk_factors: { type: "array" }, worker_profile: { type: "object" } },
      outputs: { approved: { type: "boolean" }, reviewer_notes: { type: "string" }, conditions: { type: "array" } },
    },
  },
  {
    node_id: "n-rejection",
    parent_node_id: "n-root",
    node_type: "marker",
    code: "REJECTED",
    name: "Application Rejected",
    ordinal: 4,
    activation_mode: "signal",
    entry_logic: null,
    execution_config: null,
    assignment_config: null,
    sla_config: null,
    exit_logic: {
      hooks: [
        { type: "notify", channel: "email", template: "worker_rejected" },
        { type: "webhook", url: "https://api.alrayyan.sa/webhooks/onboarding", method: "POST" },
      ],
    },
    contract: null,
  },
  {
    node_id: "n-registration",
    parent_node_id: "n-root",
    node_type: "group",
    code: "GOV_REGISTRATION",
    name: "Government Registration",
    ordinal: 5,
    activation_mode: "signal",
    entry_logic: null,
    execution_config: null,
    assignment_config: null,
    sla_config: {
      slas: [{ sla_code: "registration_completion", target_seconds: 604800, warning_pct: 60, business_calendar_id: "cal-sa-sun-thu", breach_action: "notify" }],
    },
    exit_logic: {
      signals: [{ name: "registration_complete", emit_on: "complete" }],
    },
    contract: null,
    child_execution_mode: "sequential",
    completion_policy: { mode: "all" },
  },
  {
    node_id: "n-qiwa-reg",
    parent_node_id: "n-registration",
    node_type: "action",
    code: "QIWA_REGISTRATION",
    name: "Qiwa Platform Registration",
    ordinal: 0,
    activation_mode: "auto",
    entry_logic: null,
    execution_config: {
      executor_type: "api",
      executor_ref: "api://qiwa/register-worker",
      parameters: { auto_submit: true },
      retry_policy: { max_retries: 3, backoff: "exponential", retry_on: ["timeout", "transient_error"] },
      timeout_seconds: 180,
    },
    assignment_config: null,
    sla_config: null,
    exit_logic: {
      signals: [{ name: "qiwa_registered", emit_on: "complete" }],
    },
    contract: {
      inputs: { worker_id: { type: "uuid" }, visa_number: { type: "string" }, sponsor_cr: { type: "string" } },
      outputs: { qiwa_ref: { type: "string" }, registration_date: { type: "date" } },
    },
  },
  {
    node_id: "n-medical",
    parent_node_id: "n-registration",
    node_type: "action",
    code: "MEDICAL_EXAM",
    name: "Medical Examination",
    ordinal: 1,
    activation_mode: "auto",
    entry_logic: null,
    execution_config: {
      executor_type: "human",
      executor_ref: null,
      parameters: { exam_type: "pre_employment", facility_type: "moh_approved" },
      timeout_seconds: 259200,
    },
    assignment_config: {
      strategy: "role",
      role_code: "hr_coordinator",
      fallback_strategy: "reassign",
    },
    sla_config: {
      slas: [{ sla_code: "medical_booking", target_seconds: 172800, warning_pct: 80, business_calendar_id: "cal-sa-sun-thu", breach_action: "notify" }],
    },
    exit_logic: {
      signals: [{ name: "medical_cleared", emit_on: "complete" }],
    },
    contract: {
      inputs: { worker_id: { type: "uuid" } },
      outputs: { fit_for_work: { type: "boolean" }, medical_cert_ref: { type: "string" }, restrictions: { type: "array" } },
    },
  },
  {
    node_id: "n-iqama",
    parent_node_id: "n-registration",
    node_type: "action",
    code: "IQAMA_PROCESSING",
    name: "Iqama Processing",
    ordinal: 2,
    activation_mode: "dependency",
    entry_logic: {
      conditions: [
        { field: "medical.output.fit_for_work", operator: "==", value: true },
        { field: "qiwa.output.qiwa_ref", operator: "exists", value: true },
      ],
      condition_mode: "all",
    },
    execution_config: {
      executor_type: "api",
      executor_ref: "api://muqeem/iqama-apply",
      parameters: { processing_type: "new_issuance" },
      retry_policy: { max_retries: 2, backoff: "exponential", retry_on: ["timeout"] },
      timeout_seconds: 300,
    },
    assignment_config: null,
    sla_config: null,
    exit_logic: {
      signals: [{ name: "iqama_issued", emit_on: "complete" }],
    },
    contract: {
      inputs: { worker_id: { type: "uuid" }, qiwa_ref: { type: "string" }, medical_cert_ref: { type: "string" } },
      outputs: { iqama_number: { type: "string" }, expiry_date: { type: "date" } },
    },
  },
  {
    node_id: "n-gosi",
    parent_node_id: "n-registration",
    node_type: "action",
    code: "GOSI_ENROLLMENT",
    name: "GOSI Enrollment",
    ordinal: 3,
    activation_mode: "dependency",
    entry_logic: {
      conditions: [{ field: "iqama.output.iqama_number", operator: "exists", value: true }],
      condition_mode: "all",
    },
    execution_config: {
      executor_type: "api",
      executor_ref: "api://gosi/enroll",
      parameters: { contribution_class: "standard" },
      timeout_seconds: 120,
    },
    assignment_config: null,
    sla_config: null,
    exit_logic: {
      signals: [{ name: "gosi_enrolled", emit_on: "complete" }],
    },
    contract: {
      inputs: { iqama_number: { type: "string" }, sponsor_cr: { type: "string" } },
      outputs: { gosi_number: { type: "string" }, effective_date: { type: "date" } },
    },
  },
  {
    node_id: "n-site-assign",
    parent_node_id: "n-root",
    node_type: "action",
    code: "SITE_ASSIGNMENT",
    name: "Site & Project Assignment",
    ordinal: 6,
    activation_mode: "signal",
    entry_logic: null,
    execution_config: {
      executor_type: "agent",
      executor_ref: "atlas_agent",
      parameters: { matching_model: "skill_location_v1" },
      timeout_seconds: 60,
    },
    assignment_config: {
      strategy: "role",
      role_code: "operations_manager",
    },
    sla_config: null,
    exit_logic: {
      signals: [{ name: "assigned", emit_on: "complete" }],
      hooks: [
        { type: "notify", channel: "sms", template: "worker_site_assigned" },
        { type: "webhook", url: "https://api.alrayyan.sa/webhooks/assignment", method: "POST" },
      ],
    },
    contract: {
      inputs: { worker_id: { type: "uuid" }, iqama_number: { type: "string" }, skills: { type: "array" } },
      outputs: { site_id: { type: "uuid" }, project_id: { type: "uuid" }, start_date: { type: "date" } },
    },
  },
  {
    node_id: "n-complete",
    parent_node_id: "n-root",
    node_type: "marker",
    code: "ONBOARDING_COMPLETE",
    name: "Onboarding Complete",
    ordinal: 7,
    activation_mode: "dependency",
    entry_logic: null,
    execution_config: null,
    assignment_config: null,
    sla_config: null,
    exit_logic: {
      hooks: [
        { type: "notify", channel: "email", template: "onboarding_summary" },
        { type: "webhook", url: "https://api.alrayyan.sa/webhooks/onboarding", method: "POST" },
      ],
    },
    contract: null,
  },
];

const INSTANCES = [
  {
    id: "inst-001", blueprint_version_id: "bpv-001", parent_instance_id: null,
    node_id: "n-root", node_type: "blueprint", status: "active", activation_mode: "auto",
    input_context: { worker_id: "w-7821", passport_number: "EP4428190", visa_number: "SA-2026-88412", sponsor_cr: "CR-1010234567", nationality: "BD" },
    working_context: { current_phase: "gov_registration", docs_verified: true, risk_score: 42 },
    output_context: null,
    child_execution_mode: "sequential", completion_policy: { mode: "all" }, current_child_ordinal: 5,
    assigned_party_role: null, sla_state: null,
    ordinal: 0, started_at: "2026-06-20T08:00:00Z", completed_at: null,
  },
  {
    id: "inst-002", blueprint_version_id: "bpv-001", parent_instance_id: "inst-001",
    node_id: "n-prereq", node_type: "group", status: "completed", activation_mode: "auto",
    input_context: { passport_number: "EP4428190", visa_number: "SA-2026-88412", sponsor_cr: "CR-1010234567" },
    working_context: { all_valid: true },
    output_context: { all_valid: true, passport_valid: true, visa_valid: true, sponsor_active: true },
    child_execution_mode: "parallel", completion_policy: { mode: "all" }, current_child_ordinal: null,
    assigned_party_role: null, sla_state: { elapsed: 14400, breached: false },
    ordinal: 0, started_at: "2026-06-20T08:00:00Z", completed_at: "2026-06-20T12:00:00Z",
  },
  {
    id: "inst-003", blueprint_version_id: "bpv-001", parent_instance_id: "inst-002",
    node_id: "n-passport-verify", node_type: "action", status: "completed", activation_mode: "auto",
    input_context: { passport_number: "EP4428190" },
    working_context: {},
    output_context: { valid: true, expiry_date: "2030-03-15" },
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: "prm-doc-team-01", sla_state: null,
    ordinal: 0, started_at: "2026-06-20T08:01:00Z", completed_at: "2026-06-20T08:03:12Z",
  },
  {
    id: "inst-004", blueprint_version_id: "bpv-001", parent_instance_id: "inst-002",
    node_id: "n-visa-verify", node_type: "action", status: "completed", activation_mode: "auto",
    input_context: { visa_number: "SA-2026-88412", sponsor_cr: "CR-1010234567" },
    working_context: {},
    output_context: { valid: true, nitaqat_band: "green_high", expiry_date: "2028-06-15" },
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: null, sla_state: null,
    ordinal: 1, started_at: "2026-06-20T08:01:00Z", completed_at: "2026-06-20T08:01:45Z",
  },
  {
    id: "inst-005", blueprint_version_id: "bpv-001", parent_instance_id: "inst-002",
    node_id: "n-sponsor-check", node_type: "action", status: "completed", activation_mode: "auto",
    input_context: { sponsor_cr: "CR-1010234567" },
    working_context: {},
    output_context: { active: true, entity_name: "Al Rayyan Manpower Co." },
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: null, sla_state: null,
    ordinal: 2, started_at: "2026-06-20T08:01:00Z", completed_at: "2026-06-20T08:02:30Z",
  },
  {
    id: "inst-006", blueprint_version_id: "bpv-001", parent_instance_id: "inst-001",
    node_id: "n-risk-decision", node_type: "decision", status: "completed", activation_mode: "dependency",
    input_context: { worker_id: "w-7821", nationality: "BD", documents: { passport_valid: true, visa_valid: true } },
    working_context: {},
    output_context: { risk_score: 42, risk_factors: ["first_entry"], recommended_action: "auto_approve" },
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: null, sla_state: null,
    ordinal: 1, started_at: "2026-06-20T12:01:00Z", completed_at: "2026-06-20T12:01:18Z",
  },
  {
    id: "inst-007", blueprint_version_id: "bpv-001", parent_instance_id: "inst-001",
    node_id: "n-auto-approve", node_type: "marker", status: "completed", activation_mode: "signal",
    input_context: {},
    working_context: {},
    output_context: {},
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: null, sla_state: null,
    ordinal: 2, started_at: "2026-06-20T12:01:20Z", completed_at: "2026-06-20T12:01:20Z",
  },
  {
    id: "inst-008", blueprint_version_id: "bpv-001", parent_instance_id: "inst-001",
    node_id: "n-registration", node_type: "group", status: "active", activation_mode: "signal",
    input_context: { worker_id: "w-7821", visa_number: "SA-2026-88412" },
    working_context: { qiwa_ref: "QW-2026-991234" },
    output_context: null,
    child_execution_mode: "sequential", completion_policy: { mode: "all" }, current_child_ordinal: 2,
    assigned_party_role: null, sla_state: { elapsed: 432000, breached: false },
    ordinal: 5, started_at: "2026-06-20T12:02:00Z", completed_at: null,
  },
  {
    id: "inst-009", blueprint_version_id: "bpv-001", parent_instance_id: "inst-008",
    node_id: "n-qiwa-reg", node_type: "action", status: "completed", activation_mode: "auto",
    input_context: { worker_id: "w-7821", visa_number: "SA-2026-88412", sponsor_cr: "CR-1010234567" },
    working_context: {},
    output_context: { qiwa_ref: "QW-2026-991234", registration_date: "2026-06-20" },
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: null, sla_state: null,
    ordinal: 0, started_at: "2026-06-20T12:02:05Z", completed_at: "2026-06-20T12:04:30Z",
  },
  {
    id: "inst-010", blueprint_version_id: "bpv-001", parent_instance_id: "inst-008",
    node_id: "n-medical", node_type: "action", status: "completed", activation_mode: "auto",
    input_context: { worker_id: "w-7821" },
    working_context: { facility: "King Fahd Medical City", appointment: "2026-06-22T09:00:00Z" },
    output_context: { fit_for_work: true, medical_cert_ref: "MED-2026-44521", restrictions: [] },
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: "prm-hr-fatima", sla_state: { elapsed: 86400, breached: false },
    ordinal: 1, started_at: "2026-06-20T12:05:00Z", completed_at: "2026-06-23T14:00:00Z",
  },
  {
    id: "inst-011", blueprint_version_id: "bpv-001", parent_instance_id: "inst-008",
    node_id: "n-iqama", node_type: "action", status: "active", activation_mode: "dependency",
    input_context: { worker_id: "w-7821", qiwa_ref: "QW-2026-991234", medical_cert_ref: "MED-2026-44521" },
    working_context: { muqeem_submission_id: "MQ-2026-78901", submitted_at: "2026-06-24T08:00:00Z" },
    output_context: null,
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: null, sla_state: null,
    ordinal: 2, started_at: "2026-06-24T08:00:00Z", completed_at: null,
  },
  {
    id: "inst-012", blueprint_version_id: "bpv-001", parent_instance_id: "inst-008",
    node_id: "n-gosi", node_type: "action", status: "pending", activation_mode: "dependency",
    input_context: null,
    working_context: null,
    output_context: null,
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: null, sla_state: null,
    ordinal: 3, started_at: null, completed_at: null,
  },
  {
    id: "inst-013", blueprint_version_id: "bpv-001", parent_instance_id: "inst-001",
    node_id: "n-site-assign", node_type: "action", status: "pending", activation_mode: "signal",
    input_context: null, working_context: null, output_context: null,
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: null, sla_state: null,
    ordinal: 6, started_at: null, completed_at: null,
  },
  {
    id: "inst-014", blueprint_version_id: "bpv-001", parent_instance_id: "inst-001",
    node_id: "n-complete", node_type: "marker", status: "pending", activation_mode: "dependency",
    input_context: null, working_context: null, output_context: null,
    child_execution_mode: null, completion_policy: null, current_child_ordinal: null,
    assigned_party_role: null, sla_state: null,
    ordinal: 7, started_at: null, completed_at: null,
  },
];

const SNAPSHOTS = [
  { id: "snap-001", instance_id: "inst-002", node_id: "n-prereq", snapshot_no: 1, reason: "state_change", status_before: "pending", status_after: "active", event_payload: { trigger: "auto_activation" }, hash: "a1b2c3d4e5f6...0001", prev_hash: null, created_at: "2026-06-20T08:00:00Z", created_by: "system" },
  { id: "snap-002", instance_id: "inst-003", node_id: "n-passport-verify", snapshot_no: 1, reason: "state_change", status_before: "active", status_after: "completed", event_payload: { result: { valid: true } }, hash: "b2c3d4e5f6a1...0002", prev_hash: "a1b2c3d4e5f6...0001", created_at: "2026-06-20T08:03:12Z", created_by: "resolver_agent" },
  { id: "snap-003", instance_id: "inst-004", node_id: "n-visa-verify", snapshot_no: 1, reason: "state_change", status_before: "active", status_after: "completed", event_payload: { result: { valid: true, nitaqat: "green_high" } }, hash: "c3d4e5f6a1b2...0003", prev_hash: "b2c3d4e5f6a1...0002", created_at: "2026-06-20T08:01:45Z", created_by: "system" },
  { id: "snap-004", instance_id: "inst-006", node_id: "n-risk-decision", snapshot_no: 1, reason: "hitl_decision", status_before: "active", status_after: "completed", event_payload: { risk_score: 42, action: "auto_approve", model: "worker_onboarding_v2" }, hash: "d4e5f6a1b2c3...0004", prev_hash: "c3d4e5f6a1b2...0003", created_at: "2026-06-20T12:01:18Z", created_by: "sentinel_agent" },
  { id: "snap-005", instance_id: "inst-007", node_id: "n-auto-approve", snapshot_no: 1, reason: "state_change", status_before: "pending", status_after: "completed", event_payload: { signal: "risk_assessed", route: "auto_approve" }, hash: "e5f6a1b2c3d4...0005", prev_hash: "d4e5f6a1b2c3...0004", created_at: "2026-06-20T12:01:20Z", created_by: "system" },
  { id: "snap-006", instance_id: "inst-010", node_id: "n-medical", snapshot_no: 1, reason: "state_change", status_before: "pending", status_after: "active", event_payload: { assigned_to: "prm-hr-fatima" }, hash: "f6a1b2c3d4e5...0006", prev_hash: "e5f6a1b2c3d4...0005", created_at: "2026-06-20T12:05:00Z", created_by: "system" },
  { id: "snap-007", instance_id: "inst-010", node_id: "n-medical", snapshot_no: 2, reason: "checkpoint", status_before: "active", status_after: "active", event_payload: { appointment_booked: true, facility: "King Fahd Medical City" }, hash: "a2b3c4d5e6f7...0007", prev_hash: "f6a1b2c3d4e5...0006", created_at: "2026-06-21T10:30:00Z", created_by: "prm-hr-fatima" },
  { id: "snap-008", instance_id: "inst-010", node_id: "n-medical", snapshot_no: 3, reason: "state_change", status_before: "active", status_after: "completed", event_payload: { fit_for_work: true, cert: "MED-2026-44521" }, hash: "b3c4d5e6f7a2...0008", prev_hash: "a2b3c4d5e6f7...0007", created_at: "2026-06-23T14:00:00Z", created_by: "prm-hr-fatima" },
  { id: "snap-009", instance_id: "inst-011", node_id: "n-iqama", snapshot_no: 1, reason: "state_change", status_before: "pending", status_after: "active", event_payload: { dependencies_met: ["medical_cleared", "qiwa_registered"], muqeem_submission: "MQ-2026-78901" }, hash: "c4d5e6f7a2b3...0009", prev_hash: "b3c4d5e6f7a2...0008", created_at: "2026-06-24T08:00:00Z", created_by: "system" },
];

const DEPENDENCIES = [
  { id: "dep-001", node_id: "n-risk-decision", depends_on_node_id: "n-prereq", dependency_type: "completion", signal_name: null, status: "satisfied", satisfied_at: "2026-06-20T12:00:00Z" },
  { id: "dep-002", node_id: "n-auto-approve", depends_on_node_id: "n-risk-decision", dependency_type: "signal", signal_name: "risk_assessed", status: "satisfied", satisfied_at: "2026-06-20T12:01:18Z" },
  { id: "dep-003", node_id: "n-manual-review", depends_on_node_id: "n-risk-decision", dependency_type: "signal", signal_name: "risk_assessed", status: "pending", satisfied_at: null },
  { id: "dep-004", node_id: "n-registration", depends_on_node_id: "n-auto-approve", dependency_type: "signal", signal_name: "approved", status: "satisfied", satisfied_at: "2026-06-20T12:01:20Z" },
  { id: "dep-005", node_id: "n-iqama", depends_on_node_id: "n-medical", dependency_type: "completion", signal_name: null, status: "satisfied", satisfied_at: "2026-06-23T14:00:00Z" },
  { id: "dep-006", node_id: "n-iqama", depends_on_node_id: "n-qiwa-reg", dependency_type: "completion", signal_name: null, status: "satisfied", satisfied_at: "2026-06-20T12:04:30Z" },
  { id: "dep-007", node_id: "n-gosi", depends_on_node_id: "n-iqama", dependency_type: "completion", signal_name: null, status: "pending", satisfied_at: null },
  { id: "dep-008", node_id: "n-site-assign", depends_on_node_id: "n-registration", dependency_type: "signal", signal_name: "registration_complete", status: "pending", satisfied_at: null },
  { id: "dep-009", node_id: "n-complete", depends_on_node_id: "n-site-assign", dependency_type: "completion", signal_name: null, status: "pending", satisfied_at: null },
];

const QUEUE = [
  { id: "eq-001", instance_id: "inst-011", node_id: "n-iqama", executor_type: "api", executor_ref: "api://muqeem/iqama-apply", priority: 1, status: "processing", retry_count: 0, max_retries: 2, queued_at: "2026-06-24T08:00:00Z", dispatched_at: "2026-06-24T08:00:05Z", completed_at: null },
  { id: "eq-002", instance_id: "inst-012", node_id: "n-gosi", executor_type: "api", executor_ref: "api://gosi/enroll", priority: 2, status: "queued", retry_count: 0, max_retries: 3, queued_at: null, dispatched_at: null, completed_at: null },
  { id: "eq-003", instance_id: "inst-013", node_id: "n-site-assign", executor_type: "agent", executor_ref: "atlas_agent", priority: 3, status: "queued", retry_count: 0, max_retries: 1, queued_at: null, dispatched_at: null, completed_at: null },
];

// ═══════════════════════════════════════════════════════════════
// THEME & UTILITIES
// ═══════════════════════════════════════════════════════════════

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  completed: { bg: "bg-emerald-950/60", text: "text-emerald-300", dot: "bg-emerald-400" },
  active: { bg: "bg-sky-950/60", text: "text-sky-300", dot: "bg-sky-400" },
  pending: { bg: "bg-zinc-800/60", text: "text-zinc-400", dot: "bg-zinc-500" },
  failed: { bg: "bg-red-950/60", text: "text-red-300", dot: "bg-red-400" },
  paused: { bg: "bg-amber-950/60", text: "text-amber-300", dot: "bg-amber-400" },
  skipped: { bg: "bg-zinc-800/40", text: "text-zinc-500", dot: "bg-zinc-600" },
  processing: { bg: "bg-violet-950/60", text: "text-violet-300", dot: "bg-violet-400" },
  queued: { bg: "bg-zinc-800/60", text: "text-zinc-400", dot: "bg-zinc-500" },
  satisfied: { bg: "bg-emerald-950/60", text: "text-emerald-300", dot: "bg-emerald-400" },
  published: { bg: "bg-emerald-950/60", text: "text-emerald-300", dot: "bg-emerald-400" },
  draft: { bg: "bg-zinc-800/60", text: "text-zinc-400", dot: "bg-zinc-500" },
};

const NODE_TYPE_ICONS: Record<string, { icon: any; color: string }> = {
  blueprint: { icon: Workflow, color: "text-sky-400" },
  group: { icon: Layers, color: "text-teal-400" },
  action: { icon: Zap, color: "text-amber-400" },
  decision: { icon: Diamond, color: "text-violet-400" },
  marker: { icon: Flag, color: "text-rose-400" },
};

const ACTIVATION_COLORS: Record<string, string> = {
  auto: "text-zinc-400",
  signal: "text-amber-400",
  dependency: "text-teal-400",
  event: "text-violet-400",
  manual: "text-rose-400",
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium tracking-wide ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function JsonBlock({ data, maxHeight = "max-h-48" }: { data: any; maxHeight?: string }) {
  if (!data) return <span className="text-zinc-600 text-xs font-mono">null</span>;
  return (
    <pre className={`${maxHeight} overflow-auto text-xs font-mono leading-relaxed p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/50 text-zinc-400 whitespace-pre-wrap break-all`}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold tracking-[0.2em] uppercase text-zinc-500 mb-1.5">{children}</div>;
}

function formatTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ═══════════════════════════════════════════════════════════════
// TAB COMPONENTS
// ═══════════════════════════════════════════════════════════════

function BlueprintTreeTab() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ "n-root": true, "n-prereq": true, "n-registration": true });
  const [selectedNode, setSelectedNode] = useState<string | null>("n-risk-decision");

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

  const renderNode = (node: any, depth: number) => {
    const children = NODES.filter((n) => n.parent_node_id === node.node_id).sort((a, b) => a.ordinal - b.ordinal);
    const hasChildren = children.length > 0;
    const isExpanded = expanded[node.node_id];
    const isSelected = selectedNode === node.node_id;
    const typeInfo = NODE_TYPE_ICONS[node.node_type] || NODE_TYPE_ICONS.action;
    const Icon = typeInfo.icon;

    return (
      <div key={node.node_id}>
        <button
          onClick={() => { setSelectedNode(node.node_id); if (hasChildren) toggle(node.node_id); }}
          className={`w-full flex items-center gap-2 py-2 px-3 rounded-lg text-left transition-all duration-150 group ${isSelected ? "bg-zinc-800 ring-1 ring-zinc-600" : "hover:bg-zinc-800/50"}`}
          style={{ paddingLeft: `${depth * 24 + 12}px` }}
        >
          {hasChildren ? (
            isExpanded ? <ChevronDown size={14} className="text-zinc-500 shrink-0" /> : <ChevronRight size={14} className="text-zinc-500 shrink-0" />
          ) : (
            <span className="w-3.5 shrink-0" />
          )}
          <Icon size={16} className={`${typeInfo.color} shrink-0`} />
          <span className="text-sm text-zinc-200 truncate">{node.name}</span>
          <span className={`ml-auto text-[10px] font-mono tracking-wider ${ACTIVATION_COLORS[node.activation_mode] || "text-zinc-500"}`}>
            {node.activation_mode}
          </span>
          <span className="text-[10px] font-mono text-zinc-600 w-16 text-right shrink-0">{node.node_type}</span>
        </button>
        {hasChildren && isExpanded && children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  };

  const selectedNodeData = NODES.find((n) => n.node_id === selectedNode);

  return (
    <div className="flex gap-4 h-full min-h-0" style={{ height: "calc(100vh - 260px)" }}>
      <div className="w-[420px] shrink-0 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-2">
        {NODES.filter((n) => !n.parent_node_id).map((n) => renderNode(n, 0))}
      </div>
      <div className="flex-1 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-5">
        {selectedNodeData ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {(() => { const I = NODE_TYPE_ICONS[selectedNodeData.node_type].icon; return <I size={20} className={NODE_TYPE_ICONS[selectedNodeData.node_type].color} />; })()}
                  <h3 className="text-lg font-semibold text-zinc-100">{selectedNodeData.name}</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-zinc-500">
                  <span>{selectedNodeData.code}</span>
                  <span>•</span>
                  <span>{selectedNodeData.node_id}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${ACTIVATION_COLORS[selectedNodeData.activation_mode]} bg-zinc-800`}>
                  {selectedNodeData.activation_mode}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">{selectedNodeData.node_type}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {selectedNodeData.entry_logic && (
                <div>
                  <SectionLabel>Entry Logic</SectionLabel>
                  <JsonBlock data={selectedNodeData.entry_logic} />
                </div>
              )}
              {selectedNodeData.execution_config && (
                <div>
                  <SectionLabel>Execution Config</SectionLabel>
                  <JsonBlock data={selectedNodeData.execution_config} />
                </div>
              )}
              {selectedNodeData.assignment_config && (
                <div>
                  <SectionLabel>Assignment Config</SectionLabel>
                  <JsonBlock data={selectedNodeData.assignment_config} />
                </div>
              )}
              {selectedNodeData.sla_config && (
                <div>
                  <SectionLabel>SLA Config</SectionLabel>
                  <JsonBlock data={selectedNodeData.sla_config} />
                </div>
              )}
              {selectedNodeData.exit_logic && (
                <div>
                  <SectionLabel>Exit Logic</SectionLabel>
                  <JsonBlock data={selectedNodeData.exit_logic} />
                </div>
              )}
              {selectedNodeData.contract && (
                <div>
                  <SectionLabel>Execution Contract</SectionLabel>
                  <JsonBlock data={selectedNodeData.contract} />
                </div>
              )}
            </div>

            {selectedNodeData.child_execution_mode && (
              <div className="flex gap-6 pt-2 border-t border-zinc-800/50">
                <div>
                  <SectionLabel>Child Execution</SectionLabel>
                  <span className="text-sm text-teal-400 font-medium">{selectedNodeData.child_execution_mode}</span>
                </div>
                <div>
                  <SectionLabel>Completion Policy</SectionLabel>
                  <span className="text-sm text-zinc-300 font-mono">{JSON.stringify(selectedNodeData.completion_policy)}</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">Select a node to inspect</div>
        )}
      </div>
    </div>
  );
}

function InstancesTab() {
  const [selectedInstance, setSelectedInstance] = useState<string | null>("inst-011");

  const rootInstances = INSTANCES.filter((i) => i.parent_instance_id === null || i.parent_instance_id === "inst-001" || i.parent_instance_id === "inst-002" || i.parent_instance_id === "inst-008");

  const inst = INSTANCES.find((i) => i.id === selectedInstance);
  const node = inst ? NODES.find((n) => n.node_id === inst.node_id) : null;

  return (
    <div className="flex gap-4 h-full min-h-0" style={{ height: "calc(100vh - 260px)" }}>
      <div className="w-[480px] shrink-0 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-zinc-500 border-b border-zinc-800/60">
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Instance</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Node</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Type</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {INSTANCES.map((inst) => {
              const depth = inst.parent_instance_id === null ? 0 : inst.parent_instance_id === "inst-001" ? 1 : 2;
              const node = NODES.find((n) => n.node_id === inst.node_id);
              const typeInfo = NODE_TYPE_ICONS[inst.node_type] || NODE_TYPE_ICONS.action;
              const Icon = typeInfo.icon;
              return (
                <tr
                  key={inst.id}
                  onClick={() => setSelectedInstance(inst.id)}
                  className={`cursor-pointer border-b border-zinc-800/30 transition-colors ${selectedInstance === inst.id ? "bg-zinc-800" : "hover:bg-zinc-800/40"}`}
                >
                  <td className="p-3 font-mono text-zinc-500" style={{ paddingLeft: `${depth * 16 + 12}px` }}>{inst.id.replace("inst-", "#")}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <Icon size={13} className={typeInfo.color} />
                      <span className="text-zinc-300 truncate max-w-[140px]">{node?.name || inst.node_id}</span>
                    </div>
                  </td>
                  <td className="p-3 text-zinc-500 font-mono">{inst.node_type}</td>
                  <td className="p-3"><StatusBadge status={inst.status} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-5">
        {inst && node ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-0.5">{node.name}</h3>
                <div className="text-xs font-mono text-zinc-500">{inst.id} → {inst.node_id}</div>
              </div>
              <StatusBadge status={inst.status} />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/40 p-3">
                <SectionLabel>Started</SectionLabel>
                <span className="text-sm text-zinc-300 font-mono">{formatTime(inst.started_at)}</span>
              </div>
              <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/40 p-3">
                <SectionLabel>Completed</SectionLabel>
                <span className="text-sm text-zinc-300 font-mono">{formatTime(inst.completed_at)}</span>
              </div>
              <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/40 p-3">
                <SectionLabel>Assigned To</SectionLabel>
                <span className="text-sm text-zinc-300 font-mono">{inst.assigned_party_role || "—"}</span>
              </div>
            </div>

            {inst.current_child_ordinal !== null && inst.current_child_ordinal !== undefined && (
              <div className="flex gap-6 p-3 rounded-lg bg-teal-950/20 border border-teal-800/30">
                <div>
                  <SectionLabel>Cursor</SectionLabel>
                  <span className="text-sm text-teal-300 font-mono font-bold">{inst.current_child_ordinal}</span>
                </div>
                <div>
                  <SectionLabel>Child Mode</SectionLabel>
                  <span className="text-sm text-teal-300">{inst.child_execution_mode}</span>
                </div>
                <div>
                  <SectionLabel>Policy</SectionLabel>
                  <span className="text-sm text-teal-300 font-mono">{JSON.stringify(inst.completion_policy)}</span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.15em] uppercase text-sky-400">
                <Database size={12} />
                Three-Context Split
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <SectionLabel>Input Context (Immutable)</SectionLabel>
                  </div>
                  <JsonBlock data={inst.input_context} maxHeight="max-h-36" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <SectionLabel>Working Context (Mutable)</SectionLabel>
                  </div>
                  <JsonBlock data={inst.working_context} maxHeight="max-h-36" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <SectionLabel>Output Context (On Completion)</SectionLabel>
                  </div>
                  <JsonBlock data={inst.output_context} maxHeight="max-h-36" />
                </div>
              </div>
            </div>

            {inst.sla_state && (
              <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/40">
                <SectionLabel>SLA State</SectionLabel>
                <JsonBlock data={inst.sla_state} maxHeight="max-h-20" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">Select an instance</div>
        )}
      </div>
    </div>
  );
}

function SnapshotsTab() {
  const [selectedSnap, setSelectedSnap] = useState<string | null>("snap-004");

  return (
    <div className="flex gap-4 h-full min-h-0" style={{ height: "calc(100vh - 260px)" }}>
      <div className="w-[360px] shrink-0 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-3 space-y-1">
        {SNAPSHOTS.map((snap, i) => {
          const node = NODES.find((n) => n.node_id === snap.node_id);
          const isSelected = selectedSnap === snap.id;
          return (
            <button
              key={snap.id}
              onClick={() => setSelectedSnap(snap.id)}
              className={`w-full text-left p-3 rounded-lg transition-colors ${isSelected ? "bg-zinc-800 ring-1 ring-zinc-600" : "hover:bg-zinc-800/40"}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-zinc-400">#{snap.snapshot_no}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${snap.reason === "hitl_decision" ? "bg-violet-950/60 text-violet-300" : snap.reason === "checkpoint" ? "bg-amber-950/60 text-amber-300" : "bg-zinc-800 text-zinc-400"}`}>
                  {snap.reason}
                </span>
              </div>
              <div className="text-sm text-zinc-200 truncate">{node?.name || snap.node_id}</div>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge status={snap.status_before} />
                <ArrowRight size={10} className="text-zinc-600" />
                <StatusBadge status={snap.status_after} />
              </div>
              <div className="text-[10px] font-mono text-zinc-600 mt-1.5">{formatTime(snap.created_at)}</div>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-5">
        {(() => {
          const snap = SNAPSHOTS.find((s) => s.id === selectedSnap);
          if (!snap) return <div className="flex items-center justify-center h-full text-zinc-600 text-sm">Select a snapshot</div>;
          const node = NODES.find((n) => n.node_id === snap.node_id);
          return (
            <div className="space-y-5">
              <div>
                <h3 className="text-lg font-semibold text-zinc-100">{node?.name}</h3>
                <div className="text-xs font-mono text-zinc-500">{snap.id} • {snap.instance_id} • snap #{snap.snapshot_no}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/40 p-3">
                  <SectionLabel>Transition</SectionLabel>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={snap.status_before} />
                    <ArrowRight size={14} className="text-zinc-500" />
                    <StatusBadge status={snap.status_after} />
                  </div>
                </div>
                <div className="rounded-lg bg-zinc-950/60 border border-zinc-800/40 p-3">
                  <SectionLabel>Reason & Actor</SectionLabel>
                  <div className="text-sm text-zinc-300">{snap.reason}</div>
                  <div className="text-xs font-mono text-zinc-500 mt-0.5">{snap.created_by}</div>
                </div>
              </div>

              <div>
                <SectionLabel>Event Payload</SectionLabel>
                <JsonBlock data={snap.event_payload} maxHeight="max-h-40" />
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800/40">
                <div className="flex items-center gap-2 mb-2">
                  <Hash size={14} className="text-violet-400" />
                  <SectionLabel>Hash Chain (Decision Audit Graph)</SectionLabel>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-500 w-16 shrink-0">prev</span>
                    <span className="text-zinc-500">{snap.prev_hash || "genesis"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-violet-400 w-16 shrink-0">current</span>
                    <span className="text-violet-300">{snap.hash}</span>
                  </div>
                  <div className="text-zinc-600 mt-1 text-[10px]">SHA-256( prev_hash + event_payload ) → current hash</div>
                </div>
              </div>

              <div className="text-xs font-mono text-zinc-600">{snap.created_at}</div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}

function DependenciesTab() {
  return (
    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/60 overflow-hidden" style={{ height: "calc(100vh - 260px)" }}>
      <div className="overflow-y-auto h-full">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-zinc-900">
            <tr className="text-left text-zinc-500 border-b border-zinc-800/60">
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Dependent Node</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Depends On</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Type</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Signal</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Status</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Satisfied At</th>
            </tr>
          </thead>
          <tbody>
            {DEPENDENCIES.map((dep) => {
              const depNode = NODES.find((n) => n.node_id === dep.node_id);
              const onNode = NODES.find((n) => n.node_id === dep.depends_on_node_id);
              const depType = NODE_TYPE_ICONS[depNode?.node_type || "action"];
              const onType = NODE_TYPE_ICONS[onNode?.node_type || "action"];
              const DepIcon = depType.icon;
              const OnIcon = onType.icon;
              return (
                <tr key={dep.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/30">
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <DepIcon size={13} className={depType.color} />
                      <span className="text-zinc-300">{depNode?.name}</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-600 mt-0.5">{dep.node_id}</div>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      <OnIcon size={13} className={onType.color} />
                      <span className="text-zinc-300">{onNode?.name}</span>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-600 mt-0.5">{dep.depends_on_node_id}</div>
                  </td>
                  <td className="p-3">
                    <span className={`font-mono ${dep.dependency_type === "signal" ? "text-amber-400" : dep.dependency_type === "completion" ? "text-teal-400" : "text-zinc-400"}`}>
                      {dep.dependency_type}
                    </span>
                  </td>
                  <td className="p-3 font-mono text-zinc-400">{dep.signal_name || "—"}</td>
                  <td className="p-3"><StatusBadge status={dep.status} /></td>
                  <td className="p-3 font-mono text-zinc-500">{formatTime(dep.satisfied_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function QueueTab() {
  return (
    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/60 overflow-hidden" style={{ height: "calc(100vh - 260px)" }}>
      <div className="overflow-y-auto h-full">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-zinc-900">
            <tr className="text-left text-zinc-500 border-b border-zinc-800/60">
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Queue ID</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Node</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Executor</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Priority</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Status</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Retries</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Queued</th>
              <th className="p-3 font-semibold tracking-wider uppercase text-[10px]">Dispatched</th>
            </tr>
          </thead>
          <tbody>
            {QUEUE.map((q) => {
              const node = NODES.find((n) => n.node_id === q.node_id);
              return (
                <tr key={q.id} className="border-b border-zinc-800/30 hover:bg-zinc-800/30">
                  <td className="p-3 font-mono text-zinc-500">{q.id}</td>
                  <td className="p-3 text-zinc-300">{node?.name}</td>
                  <td className="p-3">
                    <div className="flex items-center gap-1.5">
                      {q.executor_type === "agent" ? <Bot size={13} className="text-violet-400" /> : <Box size={13} className="text-teal-400" />}
                      <span className="font-mono text-zinc-400">{q.executor_ref}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`font-mono font-bold ${q.priority === 1 ? "text-rose-400" : q.priority === 2 ? "text-amber-400" : "text-zinc-400"}`}>
                      P{q.priority}
                    </span>
                  </td>
                  <td className="p-3"><StatusBadge status={q.status} /></td>
                  <td className="p-3 font-mono text-zinc-400">{q.retry_count}/{q.max_retries}</td>
                  <td className="p-3 font-mono text-zinc-500">{formatTime(q.queued_at)}</td>
                  <td className="p-3 font-mono text-zinc-500">{formatTime(q.dispatched_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ContractTab() {
  const nodesWithContracts = NODES.filter((n) => n.contract);
  const [selected, setSelected] = useState(nodesWithContracts[0]?.node_id || null);
  const node = nodesWithContracts.find((n) => n.node_id === selected);

  return (
    <div className="flex gap-4 h-full min-h-0" style={{ height: "calc(100vh - 260px)" }}>
      <div className="w-[300px] shrink-0 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-2 space-y-1">
        {nodesWithContracts.map((n) => {
          const typeInfo = NODE_TYPE_ICONS[n.node_type] || NODE_TYPE_ICONS.action;
          const Icon = typeInfo.icon;
          return (
            <button
              key={n.node_id}
              onClick={() => setSelected(n.node_id)}
              className={`w-full text-left p-3 rounded-lg flex items-center gap-2 transition-colors ${selected === n.node_id ? "bg-zinc-800 ring-1 ring-zinc-600" : "hover:bg-zinc-800/40"}`}
            >
              <Icon size={14} className={typeInfo.color} />
              <span className="text-sm text-zinc-200 truncate">{n.name}</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto rounded-xl bg-zinc-900/50 border border-zinc-800/60 p-5">
        {node ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100">{node.name}</h3>
              <div className="text-xs font-mono text-zinc-500">{node.code}</div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-blue-400">Inputs</span>
                </div>
                <div className="space-y-2">
                  {node.contract?.inputs && Object.entries(node.contract.inputs).map(([key, val]: [string, any]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/40">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-zinc-200">{key}</span>
                        <span className="text-[10px] font-mono text-blue-400 bg-blue-950/40 px-1.5 py-0.5 rounded">{val.type}</span>
                      </div>
                      {val.required && <span className="text-[10px] text-rose-400 mt-0.5 inline-block">required</span>}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold tracking-[0.15em] uppercase text-emerald-400">Outputs</span>
                </div>
                <div className="space-y-2">
                  {node.contract?.outputs && Object.entries(node.contract.outputs).map(([key, val]: [string, any]) => (
                    <div key={key} className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/40">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-mono text-zinc-200">{key}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded">{val.type}</span>
                      </div>
                      {val.range && <span className="text-[10px] text-zinc-500 mt-0.5 inline-block">range: [{val.range.join(", ")}]</span>}
                      {val.enum && <span className="text-[10px] text-zinc-500 mt-0.5 inline-block">enum: [{val.enum.join(", ")}]</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-zinc-600 text-sm">Select a node</div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

const TABS = [
  { id: "blueprint", label: "Blueprint Tree", icon: GitBranch },
  { id: "instances", label: "Instances", icon: Activity },
  { id: "snapshots", label: "Snapshots", icon: Clock },
  { id: "dependencies", label: "Dependencies", icon: Layers },
  { id: "contracts", label: "Contracts", icon: Shield },
  { id: "queue", label: "Queue", icon: ListChecks },
];

export default function OrchestrationPrototype() {
  const [activeTab, setActiveTab] = useState("blueprint");

  const completedInstances = INSTANCES.filter((i) => i.status === "completed").length;
  const activeInstances = INSTANCES.filter((i) => i.status === "active").length;
  const pendingInstances = INSTANCES.filter((i) => i.status === "pending").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@300;400;500;600&display=swap" rel="stylesheet" />
      <style>{`
        .font-mono { font-family: 'JetBrains Mono', monospace !important; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #52525b; }
      `}</style>

      {/* Header */}
      <header className="border-b border-zinc-800/60 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-teal-500 flex items-center justify-center">
                <Workflow size={18} className="text-white" />
              </div>
              <div>
                <div className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500">agents4x</div>
                <div className="text-sm font-semibold text-zinc-200 -mt-0.5">Orchestration Engine</div>
              </div>
            </div>
            <div className="h-8 w-px bg-zinc-800" />
            <div>
              <div className="text-base font-semibold text-zinc-100">{BLUEPRINT.name}</div>
              <div className="text-xs text-zinc-500 font-mono">{BLUEPRINT.code} • v{BLUEPRINT_VERSION.version_no} • {BLUEPRINT.category}</div>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-zinc-400"><span className="text-emerald-300 font-semibold">{completedInstances}</span> completed</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span className="text-zinc-400"><span className="text-sky-300 font-semibold">{activeInstances}</span> active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-zinc-500" />
                <span className="text-zinc-400"><span className="text-zinc-300 font-semibold">{pendingInstances}</span> pending</span>
              </div>
            </div>
            <StatusBadge status={BLUEPRINT_VERSION.status} />
          </div>
        </div>
      </header>

      {/* Description bar */}
      <div className="px-6 py-3 border-b border-zinc-800/40 bg-zinc-900/30">
        <p className="text-xs text-zinc-500 leading-relaxed max-w-3xl">{BLUEPRINT.description}</p>
      </div>

      {/* Tabs */}
      <nav className="px-6 pt-3 border-b border-zinc-800/40 flex gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium rounded-t-lg transition-colors ${
                isActive
                  ? "bg-zinc-900/80 text-zinc-100 border border-zinc-800/60 border-b-transparent -mb-px"
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
              }`}
            >
              <Icon size={14} />
              {tab.label}
              {tab.id === "queue" && (
                <span className="ml-1 text-[10px] font-mono bg-violet-950/60 text-violet-300 px-1.5 py-0.5 rounded-full">{QUEUE.length}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <main className="p-6">
        {activeTab === "blueprint" && <BlueprintTreeTab />}
        {activeTab === "instances" && <InstancesTab />}
        {activeTab === "snapshots" && <SnapshotsTab />}
        {activeTab === "dependencies" && <DependenciesTab />}
        {activeTab === "contracts" && <ContractTab />}
        {activeTab === "queue" && <QueueTab />}
      </main>

      {/* Footer */}
      <footer className="px-6 py-3 border-t border-zinc-800/40 flex items-center justify-between text-[10px] text-zinc-600 font-mono">
        <div className="flex items-center gap-4">
          <span>Tenant: {BLUEPRINT.tenant_id}</span>
          <span>•</span>
          <span>6 entities • {NODES.length} nodes • {INSTANCES.length} instances • {SNAPSHOTS.length} snapshots</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Published {formatTime(BLUEPRINT_VERSION.published_at)} by {BLUEPRINT_VERSION.published_by}</span>
        </div>
      </footer>
    </div>
  );
}
