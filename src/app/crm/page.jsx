'use client';

import React, { useState, useRef } from "react";

// ============================================================
// Apps4x — Governed AI Execution Platform
// Reference UI #2: CRM module + reasoning-trace drill-down
// Same shell, same theme system as Helpdesk — proves the pattern generalizes.
// The drill-down is the deepest governance surface: the agent's actual chain
// of observation → tool calls → policy gates → decision, each step inspectable.
// ============================================================

const FONT_STACK = {
  display: "'Newsreader', Georgia, serif",
  body: "'Inter', -apple-system, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

const THEMES = {
  dark: {
    name: "dark", bg: "#0A0B0D", panel: "#101216", panelHi: "#15181D",
    line: "#1F242B", lineHi: "#2B323B", text: "#E7E9EC", textDim: "#9099A3", textFaint: "#5C656F",
    govern: "#3B82F6", automate: "#22C7A9", intel: "#A78BFA", execute: "#F5A524",
    danger: "#F26D6D", ok: "#4ADE80", railBg: "#0A0B0D", badgeFill: "#06121F",
    toastShadow: "0 12px 40px -8px rgba(0,0,0,.6)",
    approveGlow: "0 0 0 1px rgba(59,130,246,0.12), 0 8px 30px -12px rgba(59,130,246,0.35)",
    approveBorder: "rgba(59,130,246,0.45)", scrollThumb: "#2B323B",
    traceLine: "#2B323B", traceNode: "#15181D",
  },
  light: {
    name: "light", bg: "#F6F4EF", panel: "#FFFFFF", panelHi: "#FBFAF6",
    line: "#E6E2D8", lineHi: "#D5CFC1", text: "#1A1C20", textDim: "#5E6066", textFaint: "#9A968C",
    govern: "#2563EB", automate: "#0E9B86", intel: "#7C5CD6", execute: "#C9821A",
    danger: "#D6453F", ok: "#2E9E5B", railBg: "#EFEBE2", badgeFill: "#FFFFFF",
    toastShadow: "0 16px 44px -12px rgba(40,36,28,.28)",
    approveGlow: "0 0 0 1px rgba(37,99,235,0.10), 0 10px 28px -14px rgba(37,99,235,0.30)",
    approveBorder: "rgba(37,99,235,0.40)", scrollThumb: "#D5CFC1",
    traceLine: "#E6E2D8", traceNode: "#FBFAF6",
  },
};
const ThemeCtx = React.createContext(THEMES.dark);
const useT = () => React.useContext(ThemeCtx);

// --- CRM work items -----------------------------------------------
// The unit of work is a deal/account moving through pipeline, not a ticket.
const seedActivity = [
  {
    id: "DEAL-2207", kind: "approval", agent: "Outreach",
    title: "Send renewal proposal to NESMA Group — SAR 480k expansion",
    account: "NESMA Group", stage: "Negotiation", value: "SAR 480,000",
    confidence: 0.58, policy: "CRM-OUTBOUND-HITL",
    govNote: "Outbound email to named contact + pricing disclosure → HITL required",
    summary: "Agent assembled a renewal-and-expansion proposal after detecting the contract renews in 21 days and usage is up 40%. Wants to email the CFO directly. Pricing disclosure + cold-ish contact pushes it below the auto-send line.",
    state: "needs_you", ts: "3m ago",
    trace: [
      { t: "observe", label: "Detected renewal trigger", color: "automate",
        body: "Contract A4X-NESMA-01 renews in 21 days. Crossed the 30-day proactive-outreach window.", conf: 0.99 },
      { t: "tool", label: "Queried usage via Product connector", color: "intel",
        body: "Monthly active seats up 40% QoQ (220 → 308). Two new departments onboarded. Strong expansion signal.", conf: 0.95,
        meta: "connector: product-analytics · read-only · 1 record" },
      { t: "tool", label: "Pulled account history from CRM", color: "intel",
        body: "Last renewal closed at list price, no discount. NPS 9. Champion: CFO (Fahad). No open support escalations.", conf: 0.93,
        meta: "connector: crm-core · read-only · 1 account" },
      { t: "reason", label: "Sized the expansion offer", color: "execute",
        body: "Recommends 308 seats + 15% headroom = 354 seats. At current rate that's SAR 480k. No discount warranted given NPS + usage.", conf: 0.81 },
      { t: "gate", label: "Policy gate: CRM-OUTBOUND-HITL", color: "govern",
        body: "Action involves (a) outbound email to a named external contact and (b) disclosure of pricing. Both flagged. Auto-send blocked → routed to human approval.", conf: 1.0,
        gate: true },
      { t: "decision", label: "Awaiting your approval to send", color: "govern",
        body: "Draft proposal ready. On approval, agent sends via the connected mailbox on your behalf and logs the activity to the deal timeline.", conf: 0.58 },
    ],
  },
  {
    id: "DEAL-2204", kind: "enriching", agent: "Enrich",
    title: "Enriching 14 inbound leads from yesterday's webinar",
    account: "Multiple", stage: "Lead", value: "—",
    confidence: 0.9, policy: "CRM-ENRICH-AUTO",
    govNote: "Public-data enrichment only — no PII purchased",
    summary: "Matching webinar signups to existing accounts, scoring fit against your ICP (Saudi manpower / workforce sector), and routing hot leads to owners.",
    state: "running", ts: "now",
    trace: [
      { t: "observe", label: "Ingested 14 webinar signups", color: "automate", body: "From marketing connector. 3 already exist as accounts.", conf: 0.99 },
      { t: "tool", label: "Enriched via public firmographics", color: "intel", body: "Company size, sector, HQ region. No PII purchased — PDPL-clean sources only.", conf: 0.88, meta: "connector: firmographics · public · 11 records" },
      { t: "reason", label: "Scored against ICP", color: "execute", body: "6 strong-fit (manpower/workforce, 200+ staff, GCC). 5 weak. Routing the 6 to owners.", conf: 0.86 },
    ],
  },
  {
    id: "DEAL-2199", kind: "risk", agent: "Forecast",
    title: "Flagged Al-Faisaliah deal as at-risk — slipped 2 quarters",
    account: "Al-Faisaliah Holding", stage: "Proposal", value: "SAR 1.2M",
    confidence: 0.72, policy: "CRM-FORECAST-ADVISORY",
    govNote: "Advisory only — no forecast field changed without you",
    summary: "Champion went quiet 18 days ago, last two meetings rescheduled. Agent recommends moving from 'Commit' to 'Best Case' but will not change the forecast field on its own.",
    state: "needs_you", ts: "26m ago",
    trace: [
      { t: "observe", label: "Detected engagement drop", color: "automate", body: "No reply to last 2 emails. Two meetings rescheduled. Champion last active 18 days ago.", conf: 0.94 },
      { t: "tool", label: "Checked email + calendar signals", color: "intel", body: "Confirmed via connected mailbox: opens stopped, no calendar holds for next 30 days.", conf: 0.83, meta: "connector: mailbox · read-only · metadata only" },
      { t: "reason", label: "Reassessed close probability", color: "execute", body: "Probability dropped 65% → 35%. Deal still open but stalling pattern matches historical slips.", conf: 0.72 },
      { t: "gate", label: "Policy gate: CRM-FORECAST-ADVISORY", color: "govern", body: "Forecast-category changes are advisory-only. Agent may recommend but cannot edit the field. Surfacing to deal owner.", conf: 1.0, gate: true },
      { t: "decision", label: "Recommends: Commit → Best Case", color: "govern", body: "Awaiting owner decision. No field changed.", conf: 0.72 },
    ],
  },
  {
    id: "DEAL-2188", kind: "logged", agent: "Scribe",
    title: "Logged call summary + 3 next-steps to Tamimi Markets deal",
    account: "Tamimi Markets", stage: "Discovery", value: "SAR 320,000",
    confidence: 0.95, policy: "CRM-NOTE-AUTO",
    govNote: "Internal note only — clean",
    summary: "Transcribed and summarized today's discovery call, extracted action items, attached to the deal timeline. No external action taken.",
    state: "done", ts: "1h ago",
    trace: [
      { t: "observe", label: "Received call transcript", color: "automate", body: "42-min discovery call via the meeting connector.", conf: 0.99 },
      { t: "reason", label: "Extracted summary + next steps", color: "execute", body: "3 action items, 1 risk (budget timing), 2 stakeholders identified.", conf: 0.95 },
      { t: "decision", label: "Wrote to deal timeline", color: "govern", body: "Internal note only — no external party contacted. Auto-logged within policy.", conf: 0.95 },
    ],
  },
];

const FILTERS = ["All work", "Needs you", "Running", "Done"];

const pillarColor = (T, kind) => ({
  approval: T.govern, risk: T.govern, enriching: T.automate,
  logged: T.intel, resolved: T.execute,
}[kind] || T.automate);

const traceColor = (T, c) => ({ automate: T.automate, intel: T.intel, execute: T.execute, govern: T.govern }[c] || T.textDim);

const stateMeta = (T, s) => ({
  running: { label: "Running", color: T.automate },
  needs_you: { label: "Needs you", color: T.govern },
  done: { label: "Done", color: T.textFaint },
}[s]);

const traceGlyph = { observe: "◉", tool: "⛁", reason: "✦", gate: "⊘", decision: "▸" };

// --- primitives ---------------------------------------------------
function Confidence({ value }) {
  const T = useT();
  const pct = Math.round(value * 100);
  const c = value >= 0.8 ? T.ok : value >= 0.5 ? T.execute : T.danger;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{ width: 46, height: 4, borderRadius: 4, background: T.lineHi, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: c }} />
      </div>
      <span style={{ font: `500 11px ${FONT_STACK.mono}`, color: c }}>{pct}%</span>
    </div>
  );
}

function GovBadge({ label, color, title }) {
  const T = useT();
  const c = color || T.textDim;
  return (
    <span title={title} style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 8px",
      borderRadius: 6, background: T.panelHi, border: `1px solid ${T.line}`,
      font: `500 11px ${FONT_STACK.mono}`, color: c, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 6, background: c }} />{label}
    </span>
  );
}

function PulseDot({ color }) {
  return (
    <span style={{ position: "relative", width: 7, height: 7, display: "inline-block" }}>
      <span style={{ position: "absolute", inset: 0, borderRadius: 7, background: color, opacity: 0.4, animation: "a4x-ping 1.6s cubic-bezier(0,0,.2,1) infinite" }} />
      <span style={{ position: "absolute", inset: 0, borderRadius: 7, background: color }} />
    </span>
  );
}

const btn = (T, color, filled) => ({
  font: `500 13px ${FONT_STACK.body}`, padding: "8px 14px", borderRadius: 8, cursor: "pointer",
  border: `1px solid ${filled ? color : T.lineHi}`, background: filled ? color : "transparent",
  color: filled ? T.badgeFill : T.textDim, transition: "all .15s",
});

// --- THE REASONING TRACE (the centerpiece) ------------------------
function ReasoningTrace({ steps }) {
  const T = useT();
  const [open, setOpen] = useState(null);
  return (
    <div style={{ marginTop: 6, marginBottom: 16 }}>
      <div style={{ font: `600 11px ${FONT_STACK.mono}`, color: T.textFaint, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 14 }}>
        Reasoning trace · {steps.length} steps
      </div>
      <div style={{ position: "relative", paddingLeft: 4 }}>
        {/* vertical spine */}
        <div style={{ position: "absolute", left: 13, top: 8, bottom: 8, width: 2, background: T.traceLine }} />
        {steps.map((s, i) => {
          const c = traceColor(T, s.color);
          const isOpen = open === i;
          const isGate = s.gate;
          return (
            <div key={i} style={{ position: "relative", paddingLeft: 38, marginBottom: i === steps.length - 1 ? 0 : 14 }}>
              {/* node */}
              <div style={{
                position: "absolute", left: 2, top: 0, width: 24, height: 24, borderRadius: isGate ? 6 : 12,
                background: T.traceNode, border: `2px solid ${c}`, display: "grid", placeItems: "center",
                font: `600 11px ${FONT_STACK.mono}`, color: c,
                boxShadow: isGate ? `0 0 0 4px ${c}22` : "none",
              }}>{traceGlyph[s.t]}</div>

              <div
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  cursor: "pointer", background: isOpen ? T.panelHi : "transparent",
                  border: `1px solid ${isOpen ? T.lineHi : "transparent"}`, borderRadius: 9,
                  padding: isOpen ? "10px 12px" : "2px 0", transition: "all .15s",
                }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
                    <span style={{ font: `600 10px ${FONT_STACK.mono}`, color: c, letterSpacing: ".06em", textTransform: "uppercase", flexShrink: 0 }}>{s.t}</span>
                    <span style={{ font: `500 13.5px ${FONT_STACK.body}`, color: isGate ? c : T.text, lineHeight: 1.4 }}>{s.label}</span>
                  </div>
                  <span style={{ font: `500 10px ${FONT_STACK.mono}`, color: s.conf >= 0.8 ? T.ok : s.conf >= 0.5 ? T.execute : T.danger, flexShrink: 0 }}>
                    {Math.round(s.conf * 100)}%
                  </span>
                </div>
                {isOpen && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ font: `400 13px ${FONT_STACK.body}`, color: T.textDim, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
                    {s.meta && (
                      <div style={{ marginTop: 8, font: `400 11px ${FONT_STACK.mono}`, color: T.textFaint, padding: "5px 8px", background: T.bg, borderRadius: 6, border: `1px solid ${T.line}` }}>
                        {s.meta}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- work item ----------------------------------------------------
function WorkItem({ item, expanded, onToggle, onApprove, onReject }) {
  const T = useT();
  const accent = pillarColor(T, item.kind);
  const st = stateMeta(T, item.state);
  const isApproval = item.state === "needs_you";
  return (
    <div onClick={onToggle} style={{
      position: "relative", cursor: "pointer", background: expanded ? T.panelHi : T.panel,
      border: `1px solid ${isApproval ? T.approveBorder : T.line}`, borderRadius: 12,
      padding: "16px 18px 16px 20px", marginBottom: 10,
      transition: "background .18s, border-color .18s, transform .18s",
      boxShadow: isApproval ? T.approveGlow : "none",
    }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
      <div style={{ position: "absolute", left: 0, top: 14, bottom: 14, width: 3, borderRadius: 3, background: accent, boxShadow: item.state === "running" ? `0 0 12px ${accent}` : "none" }} />
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
            <span style={{ font: `600 11px ${FONT_STACK.mono}`, color: accent, letterSpacing: ".04em" }}>{item.agent.toUpperCase()}</span>
            {item.state === "running" && <PulseDot color={accent} />}
            <span style={{ font: `400 12px ${FONT_STACK.body}`, color: T.textFaint }}>{item.account} · {item.stage} · {item.value} · {item.ts}</span>
          </div>
          <div style={{ font: `500 15px ${FONT_STACK.body}`, color: T.text, lineHeight: 1.4 }}>{item.title}</div>

          {expanded && (
            <div style={{ marginTop: 14 }}>
              <p style={{ font: `400 13.5px ${FONT_STACK.body}`, color: T.textDim, lineHeight: 1.6, margin: "0 0 16px" }}>{item.summary}</p>
              <ReasoningTrace steps={item.trace} />
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: isApproval ? 16 : 0 }}>
                <GovBadge label={item.policy} color={T.govern} title="Authorizing policy" />
                <GovBadge label={item.govNote} color={item.govNote.includes("clean") || item.govNote.includes("Internal") || item.govNote.includes("Advisory") || item.govNote.includes("public") ? T.ok : T.execute} title="Data governance note" />
              </div>
              {isApproval && (
                <div style={{ display: "flex", gap: 10 }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={onApprove} style={btn(T, T.govern, true)}>Approve &amp; execute</button>
                  <button onClick={onReject} style={btn(T, T.line, false)}>Reject</button>
                  <button style={btn(T, T.line, false)}>Edit before sending</button>
                </div>
              )}
            </div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
          <span style={{ font: `500 11px ${FONT_STACK.mono}`, color: st.color, padding: "3px 9px", borderRadius: 20, border: `1px solid ${st.color}33`, background: `${st.color}11` }}>{st.label}</span>
          <Confidence value={item.confidence} />
        </div>
      </div>
    </div>
  );
}

// --- command bar --------------------------------------------------
function CommandBar({ onRun }) {
  const T = useT();
  const [v, setV] = useState("");
  const suggestions = ["show deals slipping this quarter", "draft follow-ups for all stalled deals", "why is Al-Faisaliah flagged at-risk?"];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: T.panel, border: `1px solid ${T.lineHi}`, borderRadius: 12, padding: "13px 16px" }}>
        <span style={{ color: T.intel, font: `600 14px ${FONT_STACK.mono}` }}>⌘</span>
        <input value={v} onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) { onRun(v); setV(""); } }}
          placeholder="Tell Apps4x what to do…  e.g. “never let an agent email a customer without my approval”"
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: T.text, font: `400 14px ${FONT_STACK.body}` }} />
        <span style={{ font: `500 11px ${FONT_STACK.mono}`, color: T.textFaint, border: `1px solid ${T.line}`, padding: "2px 7px", borderRadius: 5 }}>↵ run</span>
      </div>
      {!v && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => onRun(s)} style={{ font: `400 12px ${FONT_STACK.body}`, color: T.textDim, background: T.panel, border: `1px solid ${T.line}`, borderRadius: 20, padding: "5px 12px", cursor: "pointer", transition: "all .15s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = T.text; e.currentTarget.style.borderColor = T.lineHi; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = T.textDim; e.currentTarget.style.borderColor = T.line; }}>{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- rail ---------------------------------------------------------
const MODULES = [
  { key: "cx", label: "Helpdesk", glyph: "◈", count: 12, href: "/helpdesk" },
  { key: "crm", label: "CRM", glyph: "◇", live: true, count: 8, href: "/crm" },
  { key: "hrm", label: "HRM", glyph: "○", count: 7 },
  { key: "erp", label: "ERP", glyph: "□", count: 2 },
  { key: "gov", label: "Governance", glyph: "🛡️", live: true, href: "/governance" },
];
function Rail({ active, setActive }) {
  const T = useT();
  return (
    <div style={{ width: 76, background: T.railBg, borderRight: `1px solid ${T.line}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px 0", gap: 6, flexShrink: 0 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, marginBottom: 18, background: `linear-gradient(135deg, ${T.govern}, ${T.intel})`, display: "grid", placeItems: "center", font: `700 16px ${FONT_STACK.display}`, color: "#fff" }}>4x</div>
      {MODULES.map((m) => {
        const on = active === m.key;
        return (
          <a key={m.key} href={m.href || "#"} title={m.label} style={{ position: "relative", width: 52, height: 52, borderRadius: 12, cursor: "pointer", background: on ? T.panelHi : "transparent", border: `1px solid ${on ? T.lineHi : "transparent"}`, color: on ? T.text : T.textFaint, transition: "all .15s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, textDecoration: "none" }}>
            <span style={{ font: `400 18px ${FONT_STACK.body}` }}>{m.glyph}</span>
            <span style={{ font: `500 9px ${FONT_STACK.body}` }}>{m.label}</span>
            {m.count && <span style={{ position: "absolute", top: 4, right: 6, minWidth: 16, height: 16, padding: "0 4px", borderRadius: 8, background: m.live ? T.govern : T.lineHi, color: m.live ? T.badgeFill : T.textDim, font: `600 9px ${FONT_STACK.mono}`, display: "grid", placeItems: "center" }}>{m.count}</span>}
          </a>
        );
      })}
    </div>
  );
}

// --- inspector ----------------------------------------------------
const SectionTitle = ({ children }) => {
  const T = useT();
  return <div style={{ font: `600 11px ${FONT_STACK.mono}`, color: T.textFaint, letterSpacing: ".12em", textTransform: "uppercase", marginBottom: 12 }}>{children}</div>;
};
function Stat({ label, value, bar, color }) {
  const T = useT();
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
        <span style={{ font: `400 12px ${FONT_STACK.body}`, color: T.textDim }}>{label}</span>
        <span style={{ font: `600 12px ${FONT_STACK.mono}`, color }}>{value}</span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: T.lineHi, overflow: "hidden" }}>
        <div style={{ width: `${bar}%`, height: "100%", background: color }} />
      </div>
    </div>
  );
}
const PostureRow = ({ color, label, v }) => {
  const T = useT();
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ width: 8, height: 8, borderRadius: 8, background: color }} />
      <span style={{ flex: 1, font: `400 12.5px ${FONT_STACK.body}`, color: T.textDim }}>{label}</span>
      <span style={{ font: `600 13px ${FONT_STACK.mono}`, color: T.text }}>{v}</span>
    </div>
  );
};
function Inspector({ items }) {
  const T = useT();
  const needsYou = items.filter((i) => i.state === "needs_you").length;
  const running = items.filter((i) => i.state === "running").length;
  return (
    <div style={{ width: 296, borderLeft: `1px solid ${T.line}`, padding: "22px 20px", flexShrink: 0, overflow: "auto" }}>
      <SectionTitle>Pipeline (agent-assisted)</SectionTitle>
      <div style={{ display: "grid", gap: 10, marginBottom: 26 }}>
        <Stat label="Open pipeline" value="SAR 8.4M" bar={84} color={T.execute} />
        <Stat label="Agent-sourced" value="31%" bar={31} color={T.automate} />
        <Stat label="Forecast accuracy" value="92%" bar={92} color={T.ok} />
      </div>
      <SectionTitle>Live posture</SectionTitle>
      <div style={{ display: "grid", gap: 8, marginBottom: 26 }}>
        <PostureRow color={T.govern} label="Awaiting your approval" v={needsYou} />
        <PostureRow color={T.automate} label="Agents working now" v={running} />
        <PostureRow color={T.textFaint} label="Activities logged today" v={63} />
      </div>
      <SectionTitle>Active guardrails</SectionTitle>
      <div style={{ display: "grid", gap: 7 }}>
        {[
          ["CRM-OUTBOUND-HITL", "Emails to customers need approval", T.govern],
          ["CRM-FORECAST-ADVISORY", "Agents advise, never edit forecast", T.intel],
          ["CRM-ENRICH-AUTO", "Public-data enrichment only, no PII", T.ok],
          ["PDPL-CONTACT-CONSENT", "Honor contact consent status", T.execute],
        ].map(([code, desc, c]) => (
          <div key={code} style={{ background: T.panel, border: `1px solid ${T.line}`, borderRadius: 9, padding: "10px 12px" }}>
            <div style={{ font: `600 11px ${FONT_STACK.mono}`, color: c, marginBottom: 3 }}>{code}</div>
            <div style={{ font: `400 11.5px ${FONT_STACK.body}`, color: T.textDim, lineHeight: 1.4 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- main ---------------------------------------------------------
export default function App() {
  const [mode, setMode] = useState("dark");
  return (
    <ThemeCtx.Provider value={THEMES[mode]}>
      <Shell mode={mode} setMode={setMode} />
    </ThemeCtx.Provider>
  );
}

function Shell({ mode, setMode }) {
  const T = useT();
  const [items, setItems] = useState(seedActivity);
  const [expanded, setExpanded] = useState("DEAL-2207");
  const [filter, setFilter] = useState("All work");
  const [active, setActive] = useState("crm");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const flash = (msg) => { setToast(msg); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(null), 2800); };
  const onApprove = (id) => {
    setItems((p) => p.map((i) => i.id === id ? { ...i, state: "done", kind: "logged", title: "Sent · " + i.title } : i));
    flash("Approved — proposal sent on your behalf, logged to deal timeline (CRM-OUTBOUND-HITL)"); setExpanded(null);
  };
  const onReject = (id) => {
    setItems((p) => p.map((i) => i.id === id ? { ...i, state: "done", kind: "risk", title: "Held — agent action blocked" } : i));
    flash("Rejected — nothing sent, deal left unchanged"); setExpanded(null);
  };
  const onRun = (cmd) => flash(`Interpreting: “${cmd}”`);

  const filtered = items.filter((i) => filter === "All work" ? true : filter === "Needs you" ? i.state === "needs_you" : filter === "Running" ? i.state === "running" : i.state === "done");
  const needsYou = items.filter((i) => i.state === "needs_you").length;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: T.bg, color: T.text, font: `400 14px ${FONT_STACK.body}`, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap');
        @keyframes a4x-ping { 75%,100% { transform: scale(2.4); opacity: 0; } }
        @keyframes a4x-rise { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform:none;} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-thumb { background:${T.scrollThumb}; border-radius:8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::placeholder { color:${T.textFaint}; }
      `}</style>

      <Rail active={active} setActive={setActive} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <div style={{ padding: "20px 28px 0", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <h1 style={{ font: `600 26px ${FONT_STACK.display}`, color: T.text, margin: 0, letterSpacing: "-.01em" }}>CRM — Revenue workspace</h1>
              <p style={{ font: `400 13.5px ${FONT_STACK.body}`, color: T.textDim, margin: "4px 0 0" }}>
                What the agents are doing across your pipeline, and what needs you.
                {needsYou > 0 && <span style={{ color: T.govern }}> · {needsYou} awaiting approval</span>}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <GovBadge label="All actions within policy" color={T.ok} />
              <button onClick={() => setMode(mode === "dark" ? "light" : "dark")} title={mode === "dark" ? "Switch to light (governed ledger)" : "Switch to dark (control room)"}
                style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", background: T.panelHi, border: `1px solid ${T.lineHi}`, borderRadius: 8, padding: "6px 11px", color: T.textDim, font: `500 12px ${FONT_STACK.body}`, transition: "all .15s" }}>
                <span style={{ font: `400 13px ${FONT_STACK.body}` }}>{mode === "dark" ? "☾" : "☀"}</span>
                {mode === "dark" ? "Control room" : "Ledger"}
              </button>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: T.panelHi, border: `1px solid ${T.lineHi}`, display: "grid", placeItems: "center", font: `600 12px ${FONT_STACK.body}`, color: T.textDim }}>MA</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
            {FILTERS.map((f) => {
              const on = filter === f; const badge = f === "Needs you" ? needsYou : null;
              return (
                <button key={f} onClick={() => setFilter(f)} style={{ position: "relative", font: `500 13px ${FONT_STACK.body}`, color: on ? T.text : T.textFaint, background: "transparent", border: "none", borderBottom: `2px solid ${on ? T.govern : "transparent"}`, padding: "8px 14px 12px", cursor: "pointer", transition: "color .15s" }}>
                  {f}{badge ? <span style={{ marginLeft: 6, font: `600 11px ${FONT_STACK.mono}`, color: T.govern }}>{badge}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: "20px 28px 16px" }}><CommandBar onRun={onRun} /></div>

        <div style={{ flex: 1, overflow: "auto", padding: "0 28px 28px" }}>
          {filtered.map((i) => (
            <WorkItem key={i.id} item={i} expanded={expanded === i.id}
              onToggle={() => setExpanded(expanded === i.id ? null : i.id)}
              onApprove={() => onApprove(i.id)} onReject={() => onReject(i.id)} />
          ))}
          {filtered.length === 0 && <div style={{ textAlign: "center", padding: "60px 0", color: T.textFaint, font: `400 14px ${FONT_STACK.body}` }}>Nothing here — the agents have it handled.</div>}
        </div>
      </div>

      <Inspector items={items} />

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: T.panelHi, border: `1px solid ${T.lineHi}`, borderRadius: 10, padding: "12px 18px", font: `500 13px ${FONT_STACK.body}`, color: T.text, boxShadow: T.toastShadow, animation: "a4x-rise .25s ease", display: "flex", alignItems: "center", gap: 10, maxWidth: 520 }}>
          <span style={{ width: 7, height: 7, borderRadius: 7, background: T.govern }} />{toast}
        </div>
      )}
    </div>
  );
}
