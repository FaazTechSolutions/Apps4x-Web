'use client';

import { useState } from "react";
import { Shield, Brain, Eye, Lock, AlertTriangle, CheckCircle, ArrowRight, ChevronDown, ChevronRight, Zap, Users, FileText, Activity, Layers, GitBranch, Database, Server, BarChart3, ShieldCheck, Scale, Fingerprint, Globe, Clock, MessageSquare } from "lucide-react";

const COLORS = {
  bg: "#0B0E14",
  surface: "#131720",
  surfaceAlt: "#1A1F2B",
  border: "#252B3B",
  borderActive: "#3B4463",
  text: "#E2E4EA",
  textMuted: "#7A8194",
  textDim: "#4E5567",
  governance: { primary: "#4A7CFF", bg: "#4A7CFF12", border: "#4A7CFF30", text: "#8BB0FF" },
  ai: { primary: "#E5A830", bg: "#E5A83012", border: "#E5A83030", text: "#F0CA6E" },
  compliance: { primary: "#34D399", bg: "#34D39912", border: "#34D39930", text: "#6EE7B4" },
  execution: { primary: "#F87171", bg: "#F8717112", border: "#F8717130", text: "#FCA5A5" },
  risk: { low: "#34D399", medium: "#E5A830", high: "#F87171", critical: "#DC2626" },
};

const Badge = ({ color, children }) => (
  <span style={{
    display: "inline-flex", alignItems: "center", gap: 4,
    padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
    letterSpacing: "0.04em", textTransform: "uppercase",
    background: COLORS[color]?.bg || color, color: COLORS[color]?.text || "#fff",
    border: `1px solid ${COLORS[color]?.border || "transparent"}`,
  }}>{children}</span>
);

const SectionCard = ({ icon: Icon, title, color, children, compact }) => (
  <div style={{
    background: COLORS.surface, border: `1px solid ${COLORS.border}`,
    borderRadius: 12, padding: compact ? 16 : 24, borderTop: `2px solid ${COLORS[color]?.primary || COLORS.border}`,
  }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: compact ? 12 : 18 }}>
      {Icon && <Icon size={18} color={COLORS[color]?.primary || COLORS.textMuted} />}
      <h3 style={{ margin: 0, fontSize: compact ? 14 : 16, fontWeight: 700, color: COLORS.text, fontFamily: "'DM Sans', sans-serif" }}>{title}</h3>
    </div>
    {children}
  </div>
);

const FlowStep = ({ number, title, subtitle, color, active }) => (
  <div style={{
    display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px",
    background: active ? COLORS[color]?.bg : "transparent",
    borderRadius: 8, border: `1px solid ${active ? COLORS[color]?.border : "transparent"}`,
    transition: "all 0.2s",
  }}>
    <div style={{
      width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
      background: COLORS[color]?.primary || COLORS.textDim, color: COLORS.bg, fontSize: 12, fontWeight: 800, flexShrink: 0,
    }}>{number}</div>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>{title}</div>
      <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2, lineHeight: 1.5 }}>{subtitle}</div>
    </div>
  </div>
);

const P = ({ children }) => (
  <p style={{ fontSize: 13.5, lineHeight: 1.75, color: COLORS.textMuted, margin: "0 0 12px 0", fontFamily: "'DM Sans', sans-serif" }}>{children}</p>
);

const Connector = ({ color }) => (
  <div style={{ display: "flex", justifyContent: "center", padding: "2px 0" }}>
    <div style={{ width: 1, height: 16, background: COLORS[color]?.border || COLORS.border }} />
  </div>
);

const PolicyRow = ({ name, type, enforcement, scope }) => (
  <div style={{
    display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 8, padding: "10px 14px",
    background: COLORS.surfaceAlt, borderRadius: 8, fontSize: 12, alignItems: "center",
    border: `1px solid ${COLORS.border}`,
  }}>
    <span style={{ color: COLORS.text, fontWeight: 600 }}>{name}</span>
    <Badge color="governance">{type}</Badge>
    <span style={{ color: enforcement === "Hard Block" ? COLORS.risk.high : enforcement === "Soft Gate" ? COLORS.risk.medium : COLORS.risk.low, fontWeight: 600, fontSize: 11 }}>{enforcement}</span>
    <span style={{ color: COLORS.textMuted }}>{scope}</span>
  </div>
);

// ─── TABS ─────────────────────────────────────────────

const TABS = [
  { id: "overview", label: "Architecture", icon: Layers },
  { id: "ai", label: "AI Operations", icon: Brain },
  { id: "governance", label: "Governance", icon: Shield },
  { id: "compliance", label: "Compliance", icon: Scale },
  { id: "trust", label: "Trust Chain", icon: GitBranch },
];

// ─── OVERVIEW ─────────────────────────────────────────

function OverviewTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
      {/* Philosophy */}
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: "0 0 8px 0", fontFamily: "'DM Sans', sans-serif" }}>
          Design Philosophy
        </h2>
        <P>
          Most platforms bolt AI on top and bolt compliance on the side. Apps4x inverts this — governance is the <em style={{ color: COLORS.governance.text }}>execution substrate</em>. Every AI action flows through the governance mesh before it touches production state. Every state mutation is compliance-aware by default. This isn't a feature layer; it's the kernel.
        </P>
        <P>
          The result: enterprises get AI-powered automation they can <em style={{ color: COLORS.ai.text }}>actually deploy</em> — because every decision carries a provenance chain, every action is policy-bounded, and every outcome is auditable to the field level.
        </P>
      </div>

      {/* Three Pillars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        {[
          { icon: Brain, color: "ai", title: "AI Operations", sub: "Intelligent automation with reasoning transparency", items: ["Smart Routing & Assignment", "Auto-Classification & Triage", "Predictive Analytics", "NL Work Item Creation", "Suggested Resolutions"] },
          { icon: Shield, color: "governance", title: "Governance Framework", sub: "Policy-enforced execution with human oversight", items: ["Reasoning Trace Engine", "HITL Gate System", "Policy Engine (OPA)", "Decision Audit Graph", "Confidence Scoring"] },
          { icon: Scale, color: "compliance", title: "Compliance Engine", sub: "Regulatory adherence built into the data layer", items: ["PDPL / NCA Controls", "Data Residency Enforcement", "Retention Policy Engine", "PII Detection & Masking", "Compliance Reporting"] },
        ].map(p => (
          <SectionCard key={p.title} icon={p.icon} title={p.title} color={p.color}>
            <P>{p.sub}</P>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {p.items.map(item => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: COLORS.textMuted }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: COLORS[p.color].primary, flexShrink: 0 }} />
                  {item}
                </div>
              ))}
            </div>
          </SectionCard>
        ))}
      </div>

      {/* Architecture Diagram */}
      <SectionCard icon={Server} title="Runtime Architecture — AI Action Lifecycle" color="governance">
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
          {[
            { n: 1, t: "AI Agent proposes action", s: "Agent runtime (agents4x) generates a proposed mutation — e.g., reassign ticket, escalate case, auto-respond", c: "ai" },
            { n: 2, t: "Governance Mesh intercepts", s: "Proposal enters the governance pipeline: policy evaluation (OPA), confidence scoring, risk classification", c: "governance" },
            { n: 3, t: "Policy Engine evaluates", s: "OPA rules check: Does this action comply with org policies? Does it violate PDPL? Is the confidence above threshold?", c: "governance" },
            { n: 4, t: "HITL gate decision", s: "Based on risk level + confidence score + policy outcome → auto-approve, require human approval, or hard-block", c: "execution" },
            { n: 5, t: "Execution with audit trail", s: "Approved action executes. Full provenance chain recorded: who/what triggered, reasoning trace, policy results, approver", c: "compliance" },
            { n: 6, t: "Compliance checkpoint", s: "Post-execution: data residency verified, PII scan, retention tags applied, compliance event emitted to audit log", c: "compliance" },
          ].map((step, i) => (
            <div key={i}>
              <FlowStep number={step.n} title={step.t} subtitle={step.s} color={step.c} active />
              {i < 5 && <Connector color={step.c} />}
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── AI OPERATIONS ────────────────────────────────────

function AITab() {
  const [expandedCapability, setExpandedCapability] = useState(0);
  const capabilities = [
    {
      icon: Zap, title: "Smart Routing & Assignment",
      desc: "AI-driven work item routing that considers agent skills, workload, historical performance, language proficiency, and SLA pressure simultaneously.",
      details: [
        { label: "Input Signals", value: "Work item fields, agent skill matrix, current queue depth, SLA clock, customer tier, language, past resolution patterns" },
        { label: "Model", value: "Scoring model (not black-box). Weighted multi-factor ranking with explainable weights per factor." },
        { label: "Output", value: "Ranked list of candidate assignees with per-candidate reasoning: 'Agent X scored highest because: Arabic proficiency (0.9), workload headroom (0.7), SLA urgency match (0.85)'" },
        { label: "Governance Hook", value: "Assignment proposals with confidence < 0.7 route to team lead for approval. Assignments crossing department boundaries always require HITL." },
      ]
    },
    {
      icon: Activity, title: "Auto-Classification & Triage",
      desc: "Incoming work items (tickets, cases, requests) are automatically classified by category, priority, sentiment, and urgency — with reasoning.",
      details: [
        { label: "Classification Axes", value: "Category taxonomy (configurable per blueprint), priority (P0–P4), sentiment (negative/neutral/positive), urgency score, language detection" },
        { label: "Method", value: "LLM-based classification with structured output. Each axis includes a confidence score and a one-sentence reasoning justification." },
        { label: "Confidence Tiers", value: "≥0.85 → auto-apply silently · 0.65–0.85 → apply but flag for review · <0.65 → queue for manual triage" },
        { label: "Feedback Loop", value: "When humans override AI classification, the override is logged as a training signal. Monthly model drift reports show classification accuracy trends." },
      ]
    },
    {
      icon: BarChart3, title: "Predictive Analytics",
      desc: "Forecasting SLA breaches, workload spikes, resolution times, and escalation probability — before they happen.",
      details: [
        { label: "SLA Breach Prediction", value: "Time-series model analyzing current progress, historical resolution times for similar items, and current queue load. Alerts at 60% / 80% / 95% predicted breach probability." },
        { label: "Workload Forecasting", value: "Predict inbound volume by hour/day/week using historical patterns + calendar awareness (holidays, Ramadan, end-of-quarter). Recommend staffing adjustments." },
        { label: "Escalation Probability", value: "Score each open item: based on sentiment trajectory, response delays, customer tier, and issue complexity → flag items likely to escalate within 24h." },
        { label: "Resolution Time Estimation", value: "At creation, estimate resolution time with confidence interval. Update estimate as item progresses through states. Show ETA to customers." },
      ]
    },
    {
      icon: MessageSquare, title: "Natural Language Work Item Creation",
      desc: "Create fully-structured work items from natural language — voice, chat, or email — with all fields auto-populated and validated.",
      details: [
        { label: "Input Channels", value: "WhatsApp message, voice transcription (Arabic/English), email body, chat message, or free-text form input" },
        { label: "Extraction", value: "LLM extracts: title, description, category, priority, affected system/service, location, contact details, requested action, deadline mentions" },
        { label: "Blueprint Matching", value: "AI determines which blueprint (Ticket, Case, WorkOrder, etc.) best fits the request. If ambiguous, asks one clarifying question." },
        { label: "Governance", value: "Extracted fields shown to submitter for confirmation before creation. AI-populated fields are marked with a 'AI-filled' indicator. Confidence shown per field." },
      ]
    },
    {
      icon: FileText, title: "Suggested Resolutions & Responses",
      desc: "Context-aware resolution suggestions drawn from knowledge base, past similar cases, and organizational SOPs.",
      details: [
        { label: "Knowledge Sources", value: "Internal knowledge base, past resolved items (anonymized), SOPs per category, vendor documentation, org-specific runbooks" },
        { label: "Suggestion Types", value: "Response drafts (for customer-facing replies), resolution steps (internal action plans), similar past cases (with outcomes), and escalation recommendations" },
        { label: "Personalization", value: "Suggestions account for customer tier, language preference, communication channel, and agent experience level" },
        { label: "Governance", value: "Every suggestion includes source attribution ('Based on KB article #412 and 3 similar resolved tickets'). Agent must explicitly accept/modify before sending." },
      ]
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: "0 0 8px 0", fontFamily: "'DM Sans', sans-serif" }}>
          AI Operations Layer
        </h2>
        <P>
          AI in Apps4x is not a copilot sitting beside the work — it's woven into the execution fabric. Every capability below operates under the governance mesh: proposals are policy-checked, confidence-scored, and audit-logged before execution. The AI never acts silently; it always shows its work.
        </P>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {capabilities.map((cap, i) => {
          const expanded = expandedCapability === i;
          const Icon = cap.icon;
          return (
            <div key={i} style={{
              background: COLORS.surface, border: `1px solid ${expanded ? COLORS.ai.border : COLORS.border}`,
              borderRadius: 12, overflow: "hidden", transition: "border-color 0.2s",
            }}>
              <div onClick={() => setExpandedCapability(expanded ? -1 : i)} style={{
                display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", cursor: "pointer",
              }}>
                <Icon size={18} color={COLORS.ai.primary} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{cap.title}</div>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>{cap.desc}</div>
                </div>
                {expanded ? <ChevronDown size={16} color={COLORS.textMuted} /> : <ChevronRight size={16} color={COLORS.textMuted} />}
              </div>
              {expanded && (
                <div style={{ padding: "0 20px 20px 20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, borderTop: `1px solid ${COLORS.border}`, paddingTop: 16 }}>
                    {cap.details.map((d, j) => (
                      <div key={j} style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: 12, fontSize: 12 }}>
                        <span style={{ color: COLORS.ai.text, fontWeight: 700, letterSpacing: "0.02em" }}>{d.label}</span>
                        <span style={{ color: COLORS.textMuted, lineHeight: 1.6 }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Confidence Model */}
      <SectionCard icon={BarChart3} title="Confidence Scoring Model" color="ai">
        <P>Every AI output carries a composite confidence score (0.0–1.0) computed from multiple signals. The score determines the governance path:</P>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 }}>
          {[
            { range: "0.85 – 1.0", label: "Auto-Execute", color: COLORS.risk.low, desc: "Action proceeds automatically. Logged with full trace. Human can review post-hoc." },
            { range: "0.60 – 0.84", label: "Soft Gate", color: COLORS.risk.medium, desc: "Action queued for human approval. AI recommendation shown with reasoning. Timeout policy applies." },
            { range: "0.00 – 0.59", label: "Hard Block", color: COLORS.risk.high, desc: "Action blocked. Routed to manual queue. AI suggestion shown as advisory only. No auto-execution path." },
          ].map(tier => (
            <div key={tier.range} style={{
              background: COLORS.surfaceAlt, border: `1px solid ${COLORS.border}`,
              borderRadius: 10, padding: 16, borderLeft: `3px solid ${tier.color}`,
            }}>
              <div style={{ fontSize: 18, fontWeight: 800, color: tier.color, fontFamily: "'JetBrains Mono', monospace" }}>{tier.range}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, marginTop: 6 }}>{tier.label}</div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6, lineHeight: 1.6 }}>{tier.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: 14, background: COLORS.ai.bg, borderRadius: 8, border: `1px solid ${COLORS.ai.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.ai.text, marginBottom: 6 }}>Confidence Signal Components</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 12, color: COLORS.textMuted }}>
            {[
              "Model output probability (raw LLM logprobs)",
              "Training data coverage for this scenario",
              "Input quality score (complete vs. sparse fields)",
              "Historical accuracy for this action type",
              "Policy alignment score (OPA pre-check)",
              "Semantic similarity to known-good patterns",
            ].map(s => (
              <div key={s} style={{ display: "flex", alignItems: "flex-start", gap: 6 }}>
                <div style={{ width: 4, height: 4, borderRadius: "50%", background: COLORS.ai.primary, marginTop: 5, flexShrink: 0 }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── GOVERNANCE ───────────────────────────────────────

function GovernanceTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: "0 0 8px 0", fontFamily: "'DM Sans', sans-serif" }}>
          Governance Framework
        </h2>
        <P>
          Governance in Apps4x is not a compliance checkbox — it's the execution kernel. The core principle: <em style={{ color: COLORS.governance.text }}>no AI action mutates production state without passing through the governance mesh</em>. This mesh consists of four interconnected systems: the Reasoning Trace Engine, the HITL Gate System, the Policy Engine, and the Decision Audit Graph.
        </P>
      </div>

      {/* Reasoning Trace Engine */}
      <SectionCard icon={Eye} title="1. Reasoning Trace Engine" color="governance">
        <P>Every AI decision produces a structured reasoning trace — a machine-readable, human-reviewable record of <em>why</em> the AI made this recommendation. This is the foundation of trust.</P>
        <div style={{ background: COLORS.bg, borderRadius: 10, padding: 18, fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, lineHeight: 1.8, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, overflowX: "auto" }}>
          <div style={{ color: COLORS.textDim }}>{"// ReasoningTrace schema for a ticket reassignment"}</div>
          <div>{"{"}</div>
          <div style={{ paddingLeft: 16 }}>
            <div><span style={{ color: COLORS.governance.text }}>"trace_id"</span>: <span style={{ color: COLORS.ai.text }}>"trc_8f2a91c4"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"action_type"</span>: <span style={{ color: COLORS.ai.text }}>"ticket.reassign"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"confidence"</span>: <span style={{ color: COLORS.compliance.text }}>0.82</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"gate_result"</span>: <span style={{ color: COLORS.ai.text }}>"soft_gate → pending_approval"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"reasoning"</span>: {"{"}</div>
            <div style={{ paddingLeft: 16 }}>
              <div><span style={{ color: COLORS.governance.text }}>"trigger"</span>: <span style={{ color: COLORS.ai.text }}>"SLA at 78%, current agent overloaded (12 items)"</span>,</div>
              <div><span style={{ color: COLORS.governance.text }}>"candidate_selection"</span>: <span style={{ color: COLORS.ai.text }}>"Agent Khalid: Arabic (0.95), queue:4, avg resolution:2.1h"</span>,</div>
              <div><span style={{ color: COLORS.governance.text }}>"alternatives_considered"</span>: <span style={{ color: COLORS.ai.text }}>["Agent Sara (0.71)", "Agent Fahad (0.68)"]</span>,</div>
              <div><span style={{ color: COLORS.governance.text }}>"policy_check"</span>: <span style={{ color: COLORS.ai.text }}>"PASS — within department boundary"</span>,</div>
            </div>
            <div>{"},"}</div>
            <div><span style={{ color: COLORS.governance.text }}>"input_snapshot"</span>: <span style={{ color: COLORS.textDim }}>{"{ /* frozen copy of fields at decision time */ }"}</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"model_version"</span>: <span style={{ color: COLORS.ai.text }}>"router-v2.3.1"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"timestamp"</span>: <span style={{ color: COLORS.ai.text }}>"2026-06-17T14:32:01Z"</span></div>
          </div>
          <div>{"}"}</div>
        </div>
        <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { title: "Immutable", desc: "Traces are append-only. Once written, they cannot be modified or deleted. Stored separately from work item data." },
            { title: "Queryable", desc: "Traces are indexed by action type, confidence range, outcome, and time. Enables pattern analysis: 'Show me all low-confidence reassignments this month.'" },
            { title: "Linkable", desc: "Each trace links to: the work item, the policy evaluation result, the HITL decision (if any), and the final execution outcome." },
            { title: "Replayable", desc: "Input snapshots allow 'what-if' replay: re-run the same decision with different policies or model versions to evaluate changes." },
          ].map(item => (
            <div key={item.title} style={{ padding: 14, background: COLORS.surfaceAlt, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.governance.text }}>{item.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* HITL Gate System */}
      <SectionCard icon={Users} title="2. Human-in-the-Loop Gate System" color="execution">
        <P>HITL gates are configurable checkpoints where human judgment is required. Gates are not binary — they're a spectrum of intervention levels tuned by risk, confidence, and organizational policy.</P>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 8 }}>
          {[
            { level: "L0 — Silent Execution", desc: "AI acts autonomously. Human is informed post-hoc via activity stream. Full trace logged.", color: COLORS.risk.low, when: "High confidence (≥0.85) + low-risk action + matching policy" },
            { level: "L1 — Notify & Proceed", desc: "AI acts immediately but sends an explicit notification to the designated reviewer. Reviewer can reverse within a configurable window.", color: "#4ADE80", when: "High confidence + medium-risk action (e.g., priority change)" },
            { level: "L2 — Approval Gate", desc: "AI proposes action and queues it. Human must explicitly approve or reject. Timeout policy: auto-escalate if no decision in N hours.", color: COLORS.risk.medium, when: "Medium confidence (0.60–0.84) OR high-risk action type" },
            { level: "L3 — Review & Modify", desc: "AI provides analysis and recommendation but the human must construct the final action. AI output is advisory only.", color: "#F59E0B", when: "Low confidence (<0.60) OR policy-flagged action" },
            { level: "L4 — Hard Block", desc: "AI is prohibited from proposing this action. Must be performed manually. Used for irreversible or compliance-sensitive operations.", color: COLORS.risk.high, when: "Blacklisted action type OR cross-tenant data access OR PII exposure risk" },
          ].map(gate => (
            <div key={gate.level} style={{
              display: "grid", gridTemplateColumns: "200px 1fr", gap: 16, padding: 16,
              background: COLORS.surfaceAlt, borderRadius: 10, border: `1px solid ${COLORS.border}`,
              borderLeft: `3px solid ${gate.color}`,
            }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: gate.color }}>{gate.level}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginTop: 6, lineHeight: 1.5 }}>{gate.desc}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6, padding: "8px 12px", background: COLORS.bg, borderRadius: 6, border: `1px solid ${COLORS.border}` }}>
                  <span style={{ color: COLORS.textDim, fontWeight: 600, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>Triggers when: </span>{gate.when}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 16, padding: 14, background: COLORS.governance.bg, borderRadius: 8, border: `1px solid ${COLORS.governance.border}` }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: COLORS.governance.text, marginBottom: 6 }}>Gate Configuration is Per-Blueprint, Per-Action</div>
          <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>
            Organizations configure gate levels per blueprint type and per action type. Example: "Ticket reassignment within department = L0, but ticket reassignment across departments = L2. Case closure = L2 always. WorkOrder cost approval above 10,000 SAR = L3." This is managed through the Policy Engine.
          </div>
        </div>
      </SectionCard>

      {/* Policy Engine */}
      <SectionCard icon={ShieldCheck} title="3. Policy Engine (OPA-Based)" color="governance">
        <P>Open Policy Agent evaluates every AI-proposed action against organizational rules expressed as declarative policies. Policies are versioned, testable, and environment-aware.</P>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{
            display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr", gap: 8, padding: "8px 14px",
            fontSize: 10, fontWeight: 700, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: "0.06em",
          }}>
            <span>Policy Name</span><span>Type</span><span>Enforcement</span><span>Scope</span>
          </div>
          {[
            { name: "Max auto-approve value", type: "Financial", enforcement: "Hard Block", scope: "> 10,000 SAR" },
            { name: "Cross-dept reassignment", type: "Org Boundary", enforcement: "Soft Gate", scope: "All blueprints" },
            { name: "PII in AI response", type: "Data Privacy", enforcement: "Hard Block", scope: "All outputs" },
            { name: "After-hours execution", type: "Operational", enforcement: "Soft Gate", scope: "WorkOrders" },
            { name: "Customer-facing auto-reply", type: "Communication", enforcement: "Soft Gate", scope: "Tickets, Cases" },
            { name: "Data export outside GCC", type: "Compliance", enforcement: "Hard Block", scope: "All data ops" },
            { name: "Model version mismatch", type: "Technical", enforcement: "Hard Block", scope: "All AI actions" },
          ].map(p => <PolicyRow key={p.name} {...p} />)}
        </div>

        <div style={{ marginTop: 16, background: COLORS.bg, borderRadius: 10, padding: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.8, color: COLORS.textMuted, border: `1px solid ${COLORS.border}` }}>
          <div style={{ color: COLORS.textDim }}>{"# Example Rego policy — financial approval gate"}</div>
          <div style={{ color: COLORS.governance.text }}>package</div>{" apps4x.governance.financial"}
          <br /><br />
          <div><span style={{ color: COLORS.governance.text }}>default</span> gate_level = <span style={{ color: COLORS.ai.text }}>"L0"</span></div>
          <br />
          <div>gate_level = <span style={{ color: COLORS.ai.text }}>"L2"</span> {"{"}</div>
          <div style={{ paddingLeft: 16 }}>input.action.estimated_cost {">"} 5000</div>
          <div style={{ paddingLeft: 16 }}>input.action.estimated_cost {"<="} 10000</div>
          <div>{"}"}</div>
          <br />
          <div>gate_level = <span style={{ color: COLORS.ai.text }}>"L4"</span> {"{"}</div>
          <div style={{ paddingLeft: 16 }}>input.action.estimated_cost {">"} 10000</div>
          <div>{"}"}</div>
        </div>
      </SectionCard>

      {/* Decision Audit Graph */}
      <SectionCard icon={Database} title="4. Decision Audit Graph" color="compliance">
        <P>Every decision forms a node in a directed acyclic graph (DAG) stored in Apache AGE. Edges represent causal relationships: "this escalation was triggered by this SLA prediction which was based on this classification." This enables full provenance traversal.</P>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 }}>
          {[
            { title: "Forward Tracing", desc: "From any trigger event, trace forward to see all downstream actions it caused. 'This email created a ticket, which was classified P1, which triggered an escalation, which reassigned to Team Lead.'" },
            { title: "Backward Tracing", desc: "From any outcome, trace backward to the root cause. 'Why was this WorkOrder auto-approved? → Because the cost was under threshold → Per policy v2.1 → Set by Admin on March 3.'" },
            { title: "Drift Detection", desc: "Compare decision patterns over time. Detect model drift: 'Classification accuracy dropped from 91% to 78% for category X over the last 30 days.' Trigger automated alerts." },
          ].map(item => (
            <div key={item.title} style={{ padding: 16, background: COLORS.surfaceAlt, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.compliance.text, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── COMPLIANCE ───────────────────────────────────────

function ComplianceTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: "0 0 8px 0", fontFamily: "'DM Sans', sans-serif" }}>
          Compliance Engine
        </h2>
        <P>
          Compliance in Apps4x is <em style={{ color: COLORS.compliance.text }}>structural, not procedural</em>. It's enforced at the infrastructure layer — data residency by Cloudflare geo-routing, PII protection by inline scanning, retention by automated lifecycle management. Teams don't need to "remember" to comply; the platform makes non-compliance architecturally difficult.
        </P>
      </div>

      {/* PDPL */}
      <SectionCard icon={Lock} title="PDPL — Personal Data Protection Law (Saudi Arabia)" color="compliance">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { req: "Consent Management", impl: "Consent records linked to data subjects. Granular purpose tracking (marketing, service, analytics). Withdrawal propagates to all processing pipelines within 24h." },
            { req: "Right to Access (DSAR)", impl: "Automated data subject access request flow: receive request → verify identity → scan all datastores → compile report → deliver within 30-day window. Work item created as a Case blueprint." },
            { req: "Right to Deletion", impl: "Soft-delete with retention hold check. Cross-references active legal holds, open cases, and regulatory retention requirements before permanent deletion. Cascade deletion across related work items." },
            { req: "Data Minimization", impl: "Blueprint-level field classification: required vs. optional vs. sensitive. Retention policies auto-archive sensitive fields after purpose completion. AI models never trained on PII." },
            { req: "Breach Notification", impl: "Automated breach detection (anomalous data access patterns). Pre-built notification workflow: internal escalation → impact assessment → regulator notification (72h) → affected individual notification." },
            { req: "Cross-Border Transfer", impl: "Geo-fencing enforced at Cloudflare edge. Data tagged with residency zone at creation. API requests from outside permitted zones are rejected at the edge, before reaching application layer." },
          ].map(item => (
            <div key={item.req} style={{ padding: 14, background: COLORS.surfaceAlt, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.compliance.text, marginBottom: 6 }}>{item.req}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>{item.impl}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* NCA */}
      <SectionCard icon={Shield} title="NCA — National Cybersecurity Authority Controls" color="governance">
        <P>NCA Essential Cybersecurity Controls (ECC) mapped to platform capabilities:</P>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
          {[
            { control: "AC — Access Control", impl: "RBAC + ABAC, MFA enforcement, session management, privileged access monitoring, just-in-time access for admin operations" },
            { control: "AM — Asset Management", impl: "All work items, blueprints, integrations, and AI models registered as managed assets with classification levels and ownership" },
            { control: "BC — Business Continuity", impl: "Multi-region Cloudflare deployment, automated failover, data replication, RTO/RPO targets tracked per tenant SLA" },
            { control: "CM — Change Management", impl: "Blueprint changes versioned and require approval workflow. Policy changes go through staged rollout: dev → staging → canary → production" },
            { control: "CS — Cryptography", impl: "AES-256 at rest, TLS 1.3 in transit, tenant-specific encryption keys (BYOK support), key rotation automation" },
            { control: "IA — Industrial Automation", impl: "API integrations with industrial systems (SCADA, BMS) through sandboxed connector layer (gVisor isolation)" },
          ].map(item => (
            <div key={item.control} style={{
              display: "grid", gridTemplateColumns: "220px 1fr", gap: 16, padding: "12px 16px",
              background: COLORS.surfaceAlt, borderRadius: 8, border: `1px solid ${COLORS.border}`, fontSize: 12,
            }}>
              <span style={{ color: COLORS.governance.text, fontWeight: 700 }}>{item.control}</span>
              <span style={{ color: COLORS.textMuted, lineHeight: 1.6 }}>{item.impl}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* PII & Data */}
      <SectionCard icon={Fingerprint} title="PII Detection & Data Protection" color="ai">
        <P>Inline PII scanner runs on every text field at write time and every AI output before delivery.</P>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 4 }}>
          {[
            { title: "Detection", desc: "NER-based scanner identifies: Saudi National ID (Iqama), phone numbers, emails, addresses, bank accounts, passport numbers, medical IDs. Custom entity types configurable per tenant." },
            { title: "Action Modes", desc: "Per-field policy: Mask (show last 4 digits), Redact (replace with [REDACTED]), Tokenize (replace with reversible token for authorized users), Alert (log but don't modify)." },
            { title: "AI Guardrails", desc: "AI outputs pass through PII scanner before reaching the UI. If PII detected in a suggested response or resolution, it's auto-masked and the reasoning trace flags the detection." },
          ].map(item => (
            <div key={item.title} style={{ padding: 14, background: COLORS.surfaceAlt, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.ai.text, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Retention */}
      <SectionCard icon={Clock} title="Data Retention & Lifecycle" color="compliance">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { title: "Policy-Driven Retention", desc: "Per-blueprint, per-field retention rules. Example: 'Closed tickets: archive after 90 days, delete PII after 365 days, keep audit logs for 7 years.' Policies evaluated nightly by a Temporal workflow." },
            { title: "Legal Hold Override", desc: "Legal holds freeze retention timers for specified work items, cases, or entire projects. Holds are themselves audited — who placed them, when, and for what matter." },
            { title: "Tiered Storage", desc: "Active data in PostgreSQL → Archived data in cold storage (R2) → Compliance snapshots in immutable storage. Retrieval SLA per tier: hot (instant), warm (minutes), cold (hours)." },
            { title: "Deletion Verification", desc: "After deletion, a verification scan confirms data removal across all replicas, caches, search indices, and AI training pipelines. Deletion certificate generated for compliance records." },
          ].map(item => (
            <div key={item.title} style={{ padding: 14, background: COLORS.surfaceAlt, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.compliance.text, marginBottom: 6 }}>{item.title}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── TRUST CHAIN ──────────────────────────────────────

function TrustChainTab() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: "0 0 8px 0", fontFamily: "'DM Sans', sans-serif" }}>
          The Trust Chain — Tying It All Together
        </h2>
        <P>
          The Trust Chain is the unifying abstraction that connects AI, governance, and compliance into a single provenance model. Every action in Apps4x — whether human-initiated or AI-driven — produces a Trust Chain entry that answers five questions: <em style={{ color: COLORS.governance.text }}>What happened? Why? Who authorized it? What policies governed it? Is it compliant?</em>
        </P>
      </div>

      {/* Trust Chain Record */}
      <SectionCard icon={GitBranch} title="Trust Chain Record Schema" color="governance">
        <div style={{ background: COLORS.bg, borderRadius: 10, padding: 18, fontFamily: "'JetBrains Mono', monospace", fontSize: 11, lineHeight: 1.9, color: COLORS.textMuted, border: `1px solid ${COLORS.border}`, overflowX: "auto" }}>
          <div style={{ color: COLORS.textDim }}>{"// Every state mutation in the platform generates this record"}</div>
          <div>{"{"}</div>
          <div style={{ paddingLeft: 16 }}>
            <div style={{ color: COLORS.textDim }}>{"// ── WHAT ──"}</div>
            <div><span style={{ color: COLORS.governance.text }}>"chain_id"</span>:      <span style={{ color: COLORS.ai.text }}>"tc_9a3f..."</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"entity"</span>:        <span style={{ color: COLORS.ai.text }}>"ticket:TK-4821"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"action"</span>:        <span style={{ color: COLORS.ai.text }}>"status.transition: open → escalated"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"mutation"</span>:      <span style={{ color: COLORS.textDim }}>{"{ field_diffs: [...] }"}</span>,</div>
            <br />
            <div style={{ color: COLORS.textDim }}>{"// ── WHY ──"}</div>
            <div><span style={{ color: COLORS.governance.text }}>"origin"</span>:        <span style={{ color: COLORS.ai.text }}>"ai:sla_prediction"</span>,    <span style={{ color: COLORS.textDim }}>// or "human:manual"</span></div>
            <div><span style={{ color: COLORS.governance.text }}>"reasoning_trace"</span>: <span style={{ color: COLORS.ai.text }}>"trc_8f2a..."</span>,     <span style={{ color: COLORS.textDim }}>// link to full trace</span></div>
            <div><span style={{ color: COLORS.governance.text }}>"confidence"</span>:    <span style={{ color: COLORS.compliance.text }}>0.82</span>,</div>
            <br />
            <div style={{ color: COLORS.textDim }}>{"// ── WHO AUTHORIZED ──"}</div>
            <div><span style={{ color: COLORS.governance.text }}>"gate_level"</span>:    <span style={{ color: COLORS.ai.text }}>"L2"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"approver"</span>:      <span style={{ color: COLORS.ai.text }}>"user:khalid@acme.sa"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"approval_time"</span>: <span style={{ color: COLORS.ai.text }}>"2026-06-17T14:35:22Z"</span>,</div>
            <br />
            <div style={{ color: COLORS.textDim }}>{"// ── POLICY CONTEXT ──"}</div>
            <div><span style={{ color: COLORS.governance.text }}>"policies_evaluated"</span>: [<span style={{ color: COLORS.ai.text }}>"escalation_rules:v3.1"</span>, <span style={{ color: COLORS.ai.text }}>"sla_thresholds:v2.0"</span>],</div>
            <div><span style={{ color: COLORS.governance.text }}>"policy_results"</span>:    <span style={{ color: COLORS.textDim }}>{"{ all: \"PASS\" }"}</span>,</div>
            <br />
            <div style={{ color: COLORS.textDim }}>{"// ── COMPLIANCE ──"}</div>
            <div><span style={{ color: COLORS.governance.text }}>"data_residency"</span>:  <span style={{ color: COLORS.ai.text }}>"gcc:riyadh"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"pii_scan"</span>:        <span style={{ color: COLORS.ai.text }}>"clean"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"retention_tag"</span>:   <span style={{ color: COLORS.ai.text }}>"7y:audit"</span>,</div>
            <div><span style={{ color: COLORS.governance.text }}>"pdpl_basis"</span>:      <span style={{ color: COLORS.ai.text }}>"legitimate_interest:service_delivery"</span>,</div>
          </div>
          <div>{"}"}</div>
        </div>
      </SectionCard>

      {/* Use Cases */}
      <SectionCard icon={Eye} title="Trust Chain Use Cases" color="ai">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { title: "Regulator Audit", desc: "Regulator asks: 'Show me every automated decision that affected customer data in Q1 2026.' → Query the trust chain by origin=ai, time range, entity type. Export as compliance report with full provenance.", icon: Scale },
            { title: "Incident Investigation", desc: "'Why did this WorkOrder get auto-approved for 50K SAR?' → Trace backward: which policy version allowed it, when was the policy changed, who approved the policy change. Full causal chain.", icon: AlertTriangle },
            { title: "AI Performance Review", desc: "'How accurate are our AI classifications this quarter?' → Aggregate trust chain records where origin=ai, compare initial classification vs. human overrides. Generate drift report.", icon: BarChart3 },
            { title: "Customer Transparency", desc: "Customer asks: 'Why was my case handled this way?' → Generate a customer-safe subset of the trust chain showing key decisions, without exposing internal policy details or agent identities.", icon: Users },
            { title: "Policy Impact Analysis", desc: "'If we change the auto-approval threshold from 10K to 20K SAR, what would have been different last quarter?' → Replay trust chain records against new policy. Show delta.", icon: GitBranch },
            { title: "Compliance Certification", desc: "Annual compliance review: generate trust chain summary showing 100% policy coverage, zero unaudited AI actions, PDPL adherence rate, and data residency compliance score.", icon: ShieldCheck },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} style={{ padding: 16, background: COLORS.surfaceAlt, borderRadius: 10, border: `1px solid ${COLORS.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Icon size={15} color={COLORS.ai.primary} />
                  <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{item.title}</div>
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, lineHeight: 1.6 }}>{item.desc}</div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Competitive Moat */}
      <SectionCard icon={Shield} title="Why This Is the Moat" color="governance">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[
            { point: "Bolt-on governance doesn't work", detail: "Competitors add audit logs after the fact. Apps4x generates provenance at mutation time. You can't retroactively reconstruct reasoning traces or policy evaluation contexts." },
            { point: "Compliance is architectural, not procedural", detail: "Data residency enforced at the edge (Cloudflare), not by training employees. PII scanning at write time, not in a nightly batch. Retention by automated lifecycle, not by remembering to archive." },
            { point: "AI trust requires the full chain", detail: "Showing an AI confidence score is table stakes. The trust chain shows: what data the AI saw, what alternatives it considered, what policies constrained it, who approved it, and what happened after. That's enterprise-grade trust." },
            { point: "GCC-native means more than Arabic UI", detail: "PDPL consent models, NCA control mappings, ZATCA integration paths, Saudi labor law compliance workflows, Hijri calendar awareness, Saudi national ID validation — all first-class primitives." },
          ].map(item => (
            <div key={item.point} style={{ padding: 16, background: COLORS.surfaceAlt, borderRadius: 10, border: `1px solid ${COLORS.border}`, borderLeft: `3px solid ${COLORS.governance.primary}` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.governance.text }}>{item.point}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6, lineHeight: 1.6 }}>{item.detail}</div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────

export default function GovernanceAIDesign() {
  const [activeTab, setActiveTab] = useState("overview");

  const tabContent = {
    overview: <OverviewTab />,
    ai: <AITab />,
    governance: <GovernanceTab />,
    compliance: <ComplianceTab />,
    trust: <TrustChainTab />,
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: COLORS.bg, color: COLORS.text, fontFamily: "'DM Sans', -apple-system, sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&family=Newsreader:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <Rail active="gov" />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowY: "auto" }}>
        {/* Header */}
        <div style={{
          padding: "32px 40px 0", borderBottom: `1px solid ${COLORS.border}`,
          background: `linear-gradient(180deg, ${COLORS.surfaceAlt} 0%, ${COLORS.bg} 100%)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
            <Shield size={22} color={COLORS.governance.primary} />
            <span style={{ fontSize: 11, fontWeight: 700, color: COLORS.governance.text, letterSpacing: "0.1em", textTransform: "uppercase" }}>Apps4x Design Document</span>
          </div>
          <h1 style={{ margin: "0 0 6px 0", fontSize: 28, fontWeight: 800, color: COLORS.text, letterSpacing: "-0.02em" }}>
            Governance, Compliance & AI
          </h1>
          <div style={{ fontSize: 14, color: COLORS.textMuted, marginBottom: 24 }}>
            The execution kernel — where AI autonomy meets enterprise trust
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 0 }}>
            {TABS.map(tab => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "10px 18px", border: "none", cursor: "pointer",
                  background: active ? COLORS.surface : "transparent",
                  color: active ? COLORS.text : COLORS.textMuted,
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  borderRadius: "8px 8px 0 0",
                  borderBottom: active ? `2px solid ${COLORS.governance.primary}` : "2px solid transparent",
                  transition: "all 0.15s",
                  fontFamily: "'DM Sans', sans-serif",
                }}>
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "32px 40px 60px", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}

// --- Rail Sidebar ---
const RAIL_FONT_STACK = {
  display: "'Newsreader', Georgia, serif",
  body: "'Inter', -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

const RAIL_T = {
  bg: "#0A0B0D", panelHi: "#15181D", line: "#1F242B", lineHi: "#2B323B",
  text: "#E7E9EC", textDim: "#9099A3", textFaint: "#5C656F",
  govern: "#3B82F6", intel: "#A78BFA", railBg: "#0A0B0D", badgeFill: "#06121F",
};

const MODULES = [
  { key: "cx", label: "Helpdesk", glyph: "◈", count: 12, href: "/helpdesk" },
  { key: "crm", label: "CRM", glyph: "◇", count: 8, href: "/crm" },
  { key: "hrm", label: "HRM", glyph: "○", count: 7 },
  { key: "erp", label: "ERP", glyph: "□", count: 2 },
  { key: "gov", label: "Governance", glyph: "🛡️", live: true, href: "/governance" },
  { key: "inbox", label: "Inbox", glyph: "📥", live: true, count: 5, href: "/inbox" }
];

function Rail({ active }) {
  const T = RAIL_T;
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
