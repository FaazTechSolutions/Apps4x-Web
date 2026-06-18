'use client';

import React, { useState, useEffect, useRef } from "react";

// ============================================================
// Apps4x — Governed AI Execution Platform
// Reference UI: agentic-native business app shell
// Surfaced module: Helpdesk / CX (ClarityDesk)
// Aesthetic: refined control-room. Governance leads, sophistication carries.
// ============================================================

const FONT_STACK = {
  display: "'Newsreader', Georgia, serif",
  body: "'Söhne', 'Inter', -apple-system, sans-serif",
  mono: "'Söhne Mono', 'JetBrains Mono', ui-monospace, monospace",
};

// --- Design tokens ------------------------------------------------
// Two registers of the same concept:
//   dark  = "control room"  (live ops, monitoring)
//   light = "governed ledger" (warm paper, system-of-record trust)
const THEMES = {
  dark: {
    name: "dark",
    bg: "#0A0B0D",
    panel: "#101216",
    panelHi: "#15181D",
    line: "#1F242B",
    lineHi: "#2B323B",
    text: "#E7E9EC",
    textDim: "#9099A3",
    textFaint: "#5C656F",
    govern: "#3B82F6",   // governance — blue
    automate: "#22C7A9", // automation — teal
    intel: "#A78BFA",    // intelligence — violet
    execute: "#F5A524",  // execution — amber
    danger: "#F26D6D",
    ok: "#4ADE80",
    railBg: "#0A0B0D",
    badgeFill: "#06121F",       // text color on filled accent buttons
    toastShadow: "0 12px 40px -8px rgba(0,0,0,.6)",
    approveGlow: "0 0 0 1px rgba(59,130,246,0.12), 0 8px 30px -12px rgba(59,130,246,0.35)",
    approveBorder: "rgba(59,130,246,0.45)",
    scrollThumb: "#2B323B",
  },
  light: {
    name: "light",
    bg: "#F6F4EF",            // warm paper
    panel: "#FFFFFF",
    panelHi: "#FBFAF6",
    line: "#E6E2D8",
    lineHi: "#D5CFC1",
    text: "#1A1C20",          // ink
    textDim: "#5E6066",
    textFaint: "#9A968C",
    govern: "#2563EB",
    automate: "#0E9B86",
    intel: "#7C5CD6",
    execute: "#C9821A",
    danger: "#D6453F",
    ok: "#2E9E5B",
    railBg: "#EFEBE2",
    badgeFill: "#FFFFFF",
    toastShadow: "0 16px 44px -12px rgba(40,36,28,.28)",
    approveGlow: "0 0 0 1px rgba(37,99,235,0.10), 0 10px 28px -14px rgba(37,99,235,0.30)",
    approveBorder: "rgba(37,99,235,0.40)",
    scrollThumb: "#D5CFC1",
  },
};

const ThemeCtx = React.createContext(THEMES.dark);
const useT = () => React.useContext(ThemeCtx);

const seedActivity = [
  {
    id: "ACT-4821", kind: "resolving", agent: "Resolver",
    title: "Resolving ticket #4821 — visa renewal status",
    account: "Almarai Workforce", channel: "WhatsApp",
    confidence: 0.94, policy: "CX-AUTO-REPLY-T2", pdpl: "No PII shared externally",
    detail: "Customer asked for iqama renewal status. Pulled record from Muqeem connector, drafted bilingual reply, sent. Awaiting customer confirmation.",
    state: "running", ts: "now",
  },
  {
    id: "ACT-4820", kind: "approval", agent: "Resolver",
    title: "Refund of SAR 1,400 — requires your approval",
    account: "Al-Rajhi Manpower", channel: "Web widget",
    confidence: 0.61, policy: "FIN-REFUND-HITL", pdpl: "Financial action — HITL required",
    detail: "Customer disputes a duplicate service charge. Agent verified two identical ZATCA invoices 11 min apart. Recommends refund. Exceeds SAR 1,000 auto-threshold → needs human approval.",
    state: "needs_you", ts: "2m ago",
  },
  {
    id: "ACT-4819", kind: "drafting", agent: "Composer",
    title: "Drafting reply to 3 tickets in 'GOSI contributions' cluster",
    account: "Multiple", channel: "Email",
    confidence: 0.88, policy: "CX-AUTO-REPLY-T2", pdpl: "Clean",
    detail: "Detected 3 near-identical questions about GOSI contribution timing. Preparing a single grounded answer to apply across all three.",
    state: "running", ts: "4m ago",
  },
  {
    id: "ACT-4818", kind: "escalated", agent: "Triage",
    title: "Escalated ticket #4810 to human queue — low confidence",
    account: "Saudi German Hospital", channel: "Phone (PSTN)",
    confidence: 0.34, policy: "ESCALATE-ON-AMBIGUITY", pdpl: "Clean",
    detail: "Caller's request was ambiguous (mixed Arabic/English, overlapping issues). Confidence below 0.40 floor. Routed to human agent Layla with full transcript + summary.",
    state: "done", ts: "8m ago",
  },
  {
    id: "ACT-4817", kind: "resolved", agent: "Resolver",
    title: "Resolved ticket #4805 — password reset",
    account: "NESMA Workforce", channel: "WhatsApp",
    confidence: 0.97, policy: "CX-AUTO-REPLY-T1", pdpl: "Clean",
    detail: "Standard credential reset. Verified identity via OTP, issued reset link, confirmed success. Closed automatically.",
    state: "done", ts: "12m ago",
  },
];

const FILTERS = ["All work", "Needs you", "Running", "Done"];

// --- tiny helpers -------------------------------------------------
const pillarColor = (T, kind) => {
  if (kind === "approval" || kind === "escalated") return T.govern;
  if (kind === "resolving" || kind === "resolved") return T.execute;
  if (kind === "drafting") return T.intel;
  return T.automate;
};
const stateMeta = (T, s) => ({
  running:   { label: "Running",   color: T.automate },
  needs_you: { label: "Needs you", color: T.govern },
  done:      { label: "Done",      color: T.textFaint },
}[s]);

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

function GovBadge({ icon, label, color, title }) {
  const T = useT();
  const c = color || T.textDim;
  return (
    <span title={title} style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 8px", borderRadius: 6,
      background: T.panelHi, border: `1px solid ${T.line}`,
      font: `500 11px ${FONT_STACK.mono}`, color: c, whiteSpace: "nowrap",
    }}>
      <span style={{ width: 6, height: 6, borderRadius: 6, background: c, display: "inline-block" }} />
      {icon}{label}
    </span>
  );
}

// --- the activity row (the heart of the agentic surface) ----------
function WorkItem({ item, expanded, onToggle, onApprove, onReject }) {
  const T = useT();
  const accent = pillarColor(T, item.kind);
  const st = stateMeta(T, item.state);
  const isApproval = item.state === "needs_you";
  return (
    <div
      onClick={onToggle}
      style={{
        position: "relative", cursor: "pointer",
        background: expanded ? T.panelHi : T.panel,
        border: `1px solid ${isApproval ? T.approveBorder : T.line}`,
        borderRadius: 12, padding: "16px 18px 16px 20px", marginBottom: 10,
        transition: "background .18s, border-color .18s, transform .18s",
        boxShadow: isApproval ? T.approveGlow : "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {/* left accent rail */}
      <div style={{
        position: "absolute", left: 0, top: 14, bottom: 14, width: 3,
        borderRadius: 3, background: accent,
        boxShadow: item.state === "running" ? `0 0 12px ${accent}` : "none",
      }} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 7 }}>
            <span style={{ font: `600 11px ${FONT_STACK.mono}`, color: accent, letterSpacing: ".04em" }}>
              {item.agent.toUpperCase()}
            </span>
            {item.state === "running" && <PulseDot color={accent} />}
            <span style={{ font: `400 12px ${FONT_STACK.body}`, color: T.textFaint }}>
              {item.account} · {item.channel} · {item.ts}
            </span>
          </div>
          <div style={{ font: `500 15px ${FONT_STACK.body}`, color: T.text, lineHeight: 1.4 }}>
            {item.title}
          </div>

          {expanded && (
            <div style={{ marginTop: 14 }}>
              <p style={{ font: `400 13.5px ${FONT_STACK.body}`, color: T.textDim, lineHeight: 1.6, margin: "0 0 14px" }}>
                {item.detail}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: isApproval ? 16 : 0 }}>
                <GovBadge label={item.policy} color={T.govern} title="Policy that authorized this action" />
                <GovBadge label={item.pdpl} color={item.pdpl === "Clean" || item.pdpl.startsWith("No") ? T.ok : T.execute} title="Data governance / PDPL check" />
                <GovBadge label={`conf ${Math.round(item.confidence*100)}%`} color={T.textDim} title="Agent confidence" />
              </div>
              {isApproval && (
                <div style={{ display: "flex", gap: 10 }} onClick={(e) => e.stopPropagation()}>
                  <button onClick={onApprove} style={btn(T, T.govern, true)}>Approve &amp; execute</button>
                  <button onClick={onReject} style={btn(T, T.line, false)}>Reject</button>
                  <button style={btn(T, T.line, false)}>Edit reasoning</button>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
          <span style={{
            font: `500 11px ${FONT_STACK.mono}`, color: st.color,
            padding: "3px 9px", borderRadius: 20,
            border: `1px solid ${st.color}33`, background: `${st.color}11`,
          }}>{st.label}</span>
          <Confidence value={item.confidence} />
        </div>
      </div>
    </div>
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
  font: `500 13px ${FONT_STACK.body}`, padding: "8px 14px", borderRadius: 8,
  cursor: "pointer", border: `1px solid ${filled ? color : T.lineHi}`,
  background: filled ? color : "transparent",
  color: filled ? T.badgeFill : T.textDim, transition: "all .15s",
});

// --- command bar --------------------------------------------------
function CommandBar({ onRun }) {
  const T = useT();
  const [v, setV] = useState("");
  const suggestions = [
    "show me all high-risk tickets this week",
    "why did the agent escalate #4810?",
    "draft replies for the GOSI cluster",
  ];
  return (
    <div style={{ position: "relative" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        background: T.panel, border: `1px solid ${T.lineHi}`,
        borderRadius: 12, padding: "13px 16px",
      }}>
        <span style={{ color: T.intel, font: `600 14px ${FONT_STACK.mono}` }}>⌘</span>
        <input
          value={v} onChange={(e) => setV(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) { onRun(v); setV(""); } }}
          placeholder="Tell Apps4x what to do…  e.g. “escalate every refund over SAR 5,000 to me”"
          style={{
            flex: 1, background: "transparent", border: "none", outline: "none",
            color: T.text, font: `400 14px ${FONT_STACK.body}`,
          }}
        />
        <span style={{ font: `500 11px ${FONT_STACK.mono}`, color: T.textFaint, border: `1px solid ${T.line}`, padding: "2px 7px", borderRadius: 5 }}>↵ run</span>
      </div>
      {!v && (
        <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
          {suggestions.map((s) => (
            <button key={s} onClick={() => onRun(s)} style={{
              font: `400 12px ${FONT_STACK.body}`, color: T.textDim,
              background: T.panel, border: `1px solid ${T.line}`,
              borderRadius: 20, padding: "5px 12px", cursor: "pointer", transition: "all .15s",
            }}
              onMouseEnter={(e)=>{e.currentTarget.style.color=T.text;e.currentTarget.style.borderColor=T.lineHi;}}
              onMouseLeave={(e)=>{e.currentTarget.style.color=T.textDim;e.currentTarget.style.borderColor=T.line;}}
            >{s}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- left rail (cross-module shell) -------------------------------
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
];

function Rail({ active, setActive }) {
  const T = useT();
  return (
    <div style={{
      width: 76, background: T.railBg, borderRight: `1px solid ${T.line}`,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "20px 0", gap: 6, flexShrink: 0,
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, marginBottom: 18,
        background: `linear-gradient(135deg, ${T.govern}, ${T.intel})`,
        display: "grid", placeItems: "center",
        font: `700 16px ${FONT_STACK.display}`, color: "#fff",
      }}>4x</div>
      {MODULES.map((m) => {
        const on = active === m.key;
        return (
          <a key={m.key} href={m.href || "#"} title={m.label} style={{
            position: "relative", width: 52, height: 52, borderRadius: 12, cursor: "pointer",
            background: on ? T.panelHi : "transparent",
            border: `1px solid ${on ? T.lineHi : "transparent"}`,
            color: on ? T.text : T.textFaint, transition: "all .15s",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
            textDecoration: "none"
          }}>
            <span style={{ font: `400 18px ${FONT_STACK.body}` }}>{m.glyph}</span>
            <span style={{ font: `500 9px ${FONT_STACK.body}`, letterSpacing: ".02em" }}>{m.label}</span>
            {m.count && (
              <span style={{
                position: "absolute", top: 4, right: 6, minWidth: 16, height: 16, padding: "0 4px",
                borderRadius: 8, background: m.live ? T.govern : T.lineHi,
                color: m.live ? "#06121F" : T.textDim,
                font: `600 9px ${FONT_STACK.mono}`, display: "grid", placeItems: "center",
              }}>{m.count}</span>
            )}
          </a>
        );
      })}
    </div>
  );
}

// --- right inspector: governance state of the system --------------
function Inspector({ items }) {
  const T = useT();
  const needsYou = items.filter((i) => i.state === "needs_you").length;
  const running = items.filter((i) => i.state === "running").length;
  const autoRate = 87;
  return (
    <div style={{ width: 296, borderLeft: `1px solid ${T.line}`, padding: "22px 20px", flexShrink: 0, overflow: "auto" }}>
      <SectionTitle>Governance</SectionTitle>
      <div style={{ display: "grid", gap: 10, marginBottom: 26 }}>
        <Stat label="Autonomous resolution" value={`${autoRate}%`} bar={autoRate} color={T.execute} />
        <Stat label="Within policy" value="100%" bar={100} color={T.ok} />
        <Stat label="PDPL exceptions" value="0" bar={0} color={T.ok} />
      </div>

      <SectionTitle>Live posture</SectionTitle>
      <div style={{ display: "grid", gap: 8, marginBottom: 26 }}>
        <PostureRow color={T.govern} label="Awaiting your approval" v={needsYou} />
        <PostureRow color={T.automate} label="Agents working now" v={running} />
        <PostureRow color={T.textFaint} label="Resolved today" v={148} />
      </div>

      <SectionTitle>Active guardrails</SectionTitle>
      <div style={{ display: "grid", gap: 7 }}>
        {[
          ["FIN-REFUND-HITL", "Refunds > SAR 1,000 need approval", T.govern],
          ["ESCALATE-ON-AMBIGUITY", "Confidence floor 0.40", T.intel],
          ["PDPL-NO-EXTERNAL-PII", "Block PII to external tools", T.ok],
          ["ZATCA-INVOICE-VERIFY", "Cross-check before refund", T.execute],
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

// --- main ---------------------------------------------------------
export default function App() {
  const [mode, setMode] = useState("dark");
  const theme = THEMES[mode];
  return (
    <ThemeCtx.Provider value={theme}>
      <Shell mode={mode} setMode={setMode} />
    </ThemeCtx.Provider>
  );
}

function Shell({ mode, setMode }) {
  const T = useT();
  const [items, setItems] = useState(seedActivity);
  const [expanded, setExpanded] = useState("ACT-4820");
  const [filter, setFilter] = useState("All work");
  const [active, setActive] = useState("cx");
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const flash = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

  const resolveItem = (id, label) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, state: "done", title: label + i.title.replace(/^.*?—/, " —"), kind: "resolved" } : i));
  };
  const onApprove = (id) => { resolveItem(id, "Approved · "); flash("Approved — agent executing within policy FIN-REFUND-HITL"); setExpanded(null); };
  const onReject = (id) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, state: "done", kind: "escalated", title: "Rejected — routed to human agent" } : i));
    flash("Rejected — action blocked, routed to human queue"); setExpanded(null);
  };
  const onRun = (cmd) => flash(`Interpreting: “${cmd}”`);

  const filtered = items.filter((i) => {
    if (filter === "All work") return true;
    if (filter === "Needs you") return i.state === "needs_you";
    if (filter === "Running") return i.state === "running";
    return i.state === "done";
  });
  const needsYou = items.filter((i) => i.state === "needs_you").length;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%", background: T.bg, color: T.text, font: `400 14px ${FONT_STACK.body}`, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&family=Inter:wght@400;500;600&display=swap');
        @keyframes a4x-ping { 75%,100% { transform: scale(2.4); opacity: 0; } }
        @keyframes a4x-rise { from { opacity:0; transform: translateY(8px);} to {opacity:1; transform:none;} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-thumb { background:${T.scrollThumb}; border-radius:8px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::placeholder { color:${T.textFaint}; }
      `}</style>

      <Rail active={active} setActive={setActive} />

      {/* main column */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* header */}
        <div style={{ padding: "20px 28px 0", borderBottom: `1px solid ${T.line}` }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <h1 style={{ font: `600 26px ${FONT_STACK.display}`, color: T.text, margin: 0, letterSpacing: "-.01em" }}>
                Helpdesk — ClarityDesk
              </h1>
              <p style={{ font: `400 13.5px ${FONT_STACK.body}`, color: T.textDim, margin: "4px 0 0" }}>
                What's being done, and what needs you. {needsYou > 0 && <span style={{ color: T.govern }}>· {needsYou} awaiting approval</span>}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <GovBadge label="All systems within policy" color={T.ok} />
              <button
                onClick={() => setMode(mode === "dark" ? "light" : "dark")}
                title={mode === "dark" ? "Switch to light (governed ledger)" : "Switch to dark (control room)"}
                style={{
                  display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                  background: T.panelHi, border: `1px solid ${T.lineHi}`, borderRadius: 8,
                  padding: "6px 11px", color: T.textDim, font: `500 12px ${FONT_STACK.body}`,
                  transition: "all .15s",
                }}>
                  <span style={{ font: `400 13px ${FONT_STACK.body}` }}>{mode === "dark" ? "☾" : "☀"}</span>
                  {mode === "dark" ? "Control room" : "Ledger"}
              </button>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: T.panelHi, border: `1px solid ${T.lineHi}`, display: "grid", placeItems: "center", font: `600 12px ${FONT_STACK.body}`, color: T.textDim }}>MA</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, marginTop: 16 }}>
            {FILTERS.map((f) => {
              const on = filter === f;
              const badge = f === "Needs you" ? needsYou : null;
              return (
                <button key={f} onClick={() => setFilter(f)} style={{
                  position: "relative", font: `500 13px ${FONT_STACK.body}`,
                  color: on ? T.text : T.textFaint, background: "transparent",
                  border: "none", borderBottom: `2px solid ${on ? T.govern : "transparent"}`,
                  padding: "8px 14px 12px", cursor: "pointer", transition: "color .15s",
                }}>
                  {f}{badge ? <span style={{ marginLeft: 6, font: `600 11px ${FONT_STACK.mono}`, color: T.govern }}>{badge}</span> : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* command bar */}
        <div style={{ padding: "20px 28px 16px" }}>
          <CommandBar onRun={onRun} />
        </div>

        {/* the work stream */}
        <div style={{ flex: 1, overflow: "auto", padding: "0 28px 28px" }}>
          {filtered.map((i) => (
            <WorkItem
              key={i.id} item={i}
              expanded={expanded === i.id}
              onToggle={() => setExpanded(expanded === i.id ? null : i.id)}
              onApprove={() => onApprove(i.id)}
              onReject={() => onReject(i.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: T.textFaint, font: `400 14px ${FONT_STACK.body}` }}>
              Nothing here — the agents have it handled.
            </div>
          )}
        </div>
      </div>

      <Inspector items={items} />

      {toast && (
        <div style={{
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
          background: T.panelHi, border: `1px solid ${T.lineHi}`, borderRadius: 10,
          padding: "12px 18px", font: `500 13px ${FONT_STACK.body}`, color: T.text,
          boxShadow: T.toastShadow, animation: "a4x-rise .25s ease",
          display: "flex", alignItems: "center", gap: 10, maxWidth: 480,
        }}>
          <span style={{ width: 7, height: 7, borderRadius: 7, background: T.govern }} />
          {toast}
        </div>
      )}
    </div>
  );
}
