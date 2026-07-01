"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

/* ═══════════════════════════════════════════════════════════════
   COLORS — light glassmorphic palette aligned with NexFlow
   ═══════════════════════════════════════════════════════════════ */
const C = {
  bg: "#f8fafc",
  bgSecondary: "#eff6ff",
  surface: "rgba(255,255,255,0.75)",
  surfaceSolid: "#ffffff",
  surfaceHover: "rgba(255,255,255,0.92)",
  card: "rgba(255,255,255,0.82)",
  cardHover: "rgba(255,255,255,0.95)",
  border: "rgba(0,0,0,0.08)",
  borderActive: "hsl(250,80%,56%)",
  text: "#0f172a",
  textMuted: "#475569",
  textDim: "#64748b",
  textFaint: "#94a3b8",
  primary: "hsl(250,80%,56%)",
  primaryGlow: "rgba(99,102,241,0.15)",
  primarySoft: "rgba(99,102,241,0.08)",
  green: "#047857",
  greenSoft: "rgba(4,120,87,0.08)",
  greenBorder: "rgba(4,120,87,0.2)",
  amber: "#b45309",
  amberSoft: "rgba(180,83,9,0.08)",
  amberBorder: "rgba(180,83,9,0.2)",
  red: "#b91c1c",
  redSoft: "rgba(185,28,28,0.08)",
  redBorder: "rgba(185,28,28,0.2)",
  purple: "#7c3aed",
  purpleSoft: "rgba(124,58,237,0.08)",
  purpleBorder: "rgba(124,58,237,0.2)",
  cyan: "#0e7490",
  cyanSoft: "rgba(14,116,144,0.08)",
  cyanBorder: "rgba(14,116,144,0.2)",
  blue: "#2563eb",
  blueSoft: "rgba(37,99,235,0.08)",
  blueBorder: "rgba(37,99,235,0.2)",
  shadow: "0 8px 32px 0 rgba(148,163,184,0.12)",
  shadowHover: "0 12px 40px 0 rgba(148,163,184,0.22), 0 0 20px rgba(99,102,241,0.05)",
};

const FONT = {
  heading: "var(--font-outfit, 'Outfit', -apple-system, sans-serif)",
  body: "var(--font-inter, 'Inter', -apple-system, sans-serif)",
  mono: "'JetBrains Mono', ui-monospace, monospace",
};

/* ═══════════════════════════════════════════════════════════════
   DOMAIN CONSTANTS
   ═══════════════════════════════════════════════════════════════ */
const COMPLETION_METHODS = [
  { id: "ALL", label: "All Must Approve", icon: "◉", desc: "Every participant must approve", color: C.primary },
  { id: "ANY", label: "Any One", icon: "◎", desc: "First response decides", color: C.green },
  { id: "COUNT", label: "Count (N of M)", icon: "▣", desc: "N approvals required out of M", color: C.amber },
  { id: "PERCENTAGE", label: "Percentage", icon: "◐", desc: "% of participants must approve", color: C.purple },
  { id: "WEIGHTED", label: "Weighted", icon: "⬡", desc: "Cumulative weight threshold", color: C.cyan },
];

const RESOLUTION_TYPES = [
  { id: "specific_user", label: "Specific User", icon: "👤", desc: "Hardcoded employee", category: "Direct" },
  { id: "position", label: "Position-Based", icon: "🏛", desc: "Org-chart position holder", category: "Structural" },
  { id: "reporting_to", label: "Reporting-To", icon: "↑", desc: "Walk manager chain N levels", category: "Structural" },
  { id: "role_incharge", label: "Role / In-Charge", icon: "⚡", desc: "Functional role at location", category: "Functional" },
  { id: "group_committee", label: "Group / Committee", icon: "👥", desc: "Pool of eligible approvers", category: "Functional" },
  { id: "doa_matrix", label: "DOA Matrix", icon: "📊", desc: "Position + threshold field", category: "Rule-based" },
  { id: "dynamic_rule", label: "Dynamic Rule", icon: "⚙", desc: "Attribute-based lookup", category: "Rule-based" },
];

const MOCK_POSITIONS = ["CEO", "CFO", "COO", "VP Operations", "Head of HR", "Site Supervisor", "Team Lead", "Department Head", "Finance Controller", "Procurement Manager"];
const MOCK_ROLES = ["Finance Approver", "Compliance Officer", "Site Supervisor", "GRO Manager", "IT Admin", "Procurement Lead"];
const MOCK_GROUPS = ["Procurement Committee", "Executive Board", "Finance Review Panel", "Safety Committee", "IT Change Board"];

const DEFAULT_STAGES = [
  {
    id: "stg_1",
    name: "Manager Approval",
    resolution_type: "reporting_to",
    resolution_value: { levels_up: 1 },
    completion_method: "ALL",
    completion_threshold: null as number | null,
    sla_hours: 24,
    is_parallel: true,
    participants_preview: ["Direct Manager"],
  },
  {
    id: "stg_2",
    name: "Finance Sign-off",
    resolution_type: "doa_matrix",
    resolution_value: { field: "amount", tiers: [{ max: 10000, position: "Team Lead" }, { max: 100000, position: "Director" }, { max: null, position: "CFO" }] },
    completion_method: "ALL",
    completion_threshold: null as number | null,
    sla_hours: 48,
    is_parallel: false,
    participants_preview: ["DOA: amount-based"],
  },
  {
    id: "stg_3",
    name: "Compliance Review",
    resolution_type: "role_incharge",
    resolution_value: { role: "Compliance Officer" },
    completion_method: "ANY",
    completion_threshold: null as number | null,
    sla_hours: 72,
    is_parallel: true,
    participants_preview: ["Any Compliance Officer"],
  },
];

type Stage = typeof DEFAULT_STAGES[number];

/* ═══════════════════════════════════════════════════════════════
   DRAG-REORDER HOOK
   ═══════════════════════════════════════════════════════════════ */
function useDragReorder(items: Stage[], setItems: React.Dispatch<React.SetStateAction<Stage[]>>) {
  const dragIdx = useRef<number | null>(null);
  const overIdx = useRef<number | null>(null);

  const onDragStart = (idx: number) => (e: React.DragEvent) => {
    dragIdx.current = idx;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(idx));
  };
  const onDragOver = (idx: number) => (e: React.DragEvent) => {
    e.preventDefault();
    overIdx.current = idx;
  };
  const onDrop = () => {
    const from = dragIdx.current;
    const to = overIdx.current;
    if (from == null || to == null || from === to) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setItems(next);
    dragIdx.current = null;
    overIdx.current = null;
  };

  return { onDragStart, onDragOver, onDrop };
}

/* ═══════════════════════════════════════════════════════════════
   SUB-COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

function Pill({
  children, color = C.primary, bg, onClick, active, style,
}: {
  children: React.ReactNode; color?: string; bg?: string; onClick?: () => void; active?: boolean; style?: React.CSSProperties;
}) {
  return (
    <span
      onClick={onClick}
      style={{
        display: "inline-flex", alignItems: "center", gap: 4,
        padding: "5px 12px", borderRadius: 8,
        fontSize: 12, fontFamily: FONT.body, fontWeight: 600,
        background: active ? color : (bg || `${color}10`),
        color: active ? "#fff" : color,
        border: `1px solid ${active ? color : `${color}25`}`,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.2s cubic-bezier(0.25,0.8,0.25,1)",
        letterSpacing: "0.01em",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 11, fontFamily: FONT.heading, fontWeight: 700,
      color: C.textDim, textTransform: "uppercase", letterSpacing: "0.08em",
      marginBottom: 12,
      paddingBottom: 8,
      borderBottom: `1px solid ${C.border}`,
    }}>
      {children}
    </div>
  );
}

function ModeCard({ active, onClick, icon, title, desc, color }: {
  active: boolean; onClick: () => void; icon: string; title: string; desc: string; color: string;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        flex: 1, padding: "14px 18px", borderRadius: 14,
        background: active ? `${color}10` : C.surfaceSolid,
        border: `1.5px solid ${active ? color : C.border}`,
        cursor: "pointer", transition: "all 0.2s cubic-bezier(0.25,0.8,0.25,1)",
        boxShadow: active ? `0 4px 16px ${color}15` : "none",
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = `${color}50`; }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = C.border; }}
    >
      <div style={{ fontSize: 22, marginBottom: 6, color: active ? color : C.textDim }}>{icon}</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: active ? C.text : C.textMuted, fontFamily: FONT.heading }}>{title}</div>
      <div style={{ fontSize: 11, color: C.textDim, marginTop: 3, fontFamily: FONT.body }}>{desc}</div>
    </div>
  );
}

function CompletionMethodPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {COMPLETION_METHODS.map((m) => (
        <Pill key={m.id} color={m.color} active={value === m.id} onClick={() => onChange(m.id)}>
          <span style={{ fontSize: 14 }}>{m.icon}</span> {m.label}
        </Pill>
      ))}
    </div>
  );
}

function ThresholdInput({ method, threshold, onChange }: { method: string; threshold: number | null; onChange: (v: number) => void }) {
  const inputStyle: React.CSSProperties = {
    width: 60, padding: "6px 10px", borderRadius: 10,
    background: C.surfaceSolid, border: `1.5px solid ${C.border}`,
    color: C.text, fontFamily: FONT.body, fontSize: 14, fontWeight: 600,
    outline: "none", textAlign: "center",
    transition: "border-color 0.2s",
  };

  if (method === "COUNT") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <span style={{ color: C.textMuted, fontSize: 13, fontFamily: FONT.body }}>Required approvals:</span>
        <input type="number" min={1} max={50} value={threshold || 2} onChange={(e) => onChange(parseInt(e.target.value) || 1)} style={inputStyle} />
        <span style={{ color: C.textDim, fontSize: 12, fontFamily: FONT.body }}>of M participants</span>
      </div>
    );
  }
  if (method === "PERCENTAGE") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <span style={{ color: C.textMuted, fontSize: 13, fontFamily: FONT.body }}>Approval threshold:</span>
        <input type="number" min={1} max={100} value={threshold || 60} onChange={(e) => onChange(parseInt(e.target.value) || 1)} style={inputStyle} />
        <span style={{ color: C.textDim, fontSize: 13, fontWeight: 600 }}>%</span>
      </div>
    );
  }
  if (method === "WEIGHTED") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <span style={{ color: C.textMuted, fontSize: 13, fontFamily: FONT.body }}>Weight threshold:</span>
        <input type="number" min={1} max={100} value={threshold || 5} onChange={(e) => onChange(parseInt(e.target.value) || 1)} style={inputStyle} />
        <span style={{ color: C.textDim, fontSize: 12, fontFamily: FONT.body }}>cumulative weight needed</span>
      </div>
    );
  }
  return null;
}

function ResolutionTypePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const grouped: Record<string, typeof RESOLUTION_TYPES> = {};
  RESOLUTION_TYPES.forEach((r) => {
    if (!grouped[r.category]) grouped[r.category] = [];
    grouped[r.category].push(r);
  });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <div style={{
            fontSize: 10, fontFamily: FONT.heading, fontWeight: 700,
            color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.1em",
            marginBottom: 8,
          }}>{cat}</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {items.map((r) => (
              <div
                key={r.id}
                onClick={() => onChange(r.id)}
                style={{
                  padding: "10px 14px", borderRadius: 12,
                  background: value === r.id ? C.primarySoft : C.surfaceSolid,
                  border: `1.5px solid ${value === r.id ? C.primary : C.border}`,
                  cursor: "pointer", transition: "all 0.2s cubic-bezier(0.25,0.8,0.25,1)",
                  minWidth: 130,
                  boxShadow: value === r.id ? `0 2px 12px ${C.primaryGlow}` : "none",
                }}
                onMouseEnter={(e) => { if (value !== r.id) e.currentTarget.style.borderColor = `${C.primary}40`; }}
                onMouseLeave={(e) => { if (value !== r.id) e.currentTarget.style.borderColor = C.border; }}
              >
                <div style={{ fontSize: 15, marginBottom: 3 }}>
                  {r.icon}{" "}
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text, fontFamily: FONT.heading }}>{r.label}</span>
                </div>
                <div style={{ fontSize: 11, color: C.textDim, fontFamily: FONT.body }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ResolutionConfig({ type, value, onChange }: { type: string; value: any; onChange: (v: any) => void }) {
  if (type === "reporting_to") {
    const levels = value?.levels_up || 1;
    return (
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: C.textMuted, fontSize: 13 }}>Levels up from requester:</span>
        {[1, 2, 3, 4].map((n) => (
          <Pill key={n} color={C.primary} active={levels === n} onClick={() => onChange({ levels_up: n })}>
            {n === 1 ? "Direct Mgr" : n === 2 ? "Mgr's Mgr" : `L${n}`}
          </Pill>
        ))}
      </div>
    );
  }
  if (type === "position") {
    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>Select position:</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MOCK_POSITIONS.map((p) => (
            <Pill key={p} color={C.primary} active={value?.position === p} onClick={() => onChange({ position: p })}>{p}</Pill>
          ))}
        </div>
      </div>
    );
  }
  if (type === "role_incharge") {
    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>Select functional role:</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MOCK_ROLES.map((r) => (
            <Pill key={r} color={C.green} active={value?.role === r} onClick={() => onChange({ role: r })}>⚡ {r}</Pill>
          ))}
        </div>
      </div>
    );
  }
  if (type === "group_committee") {
    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 8 }}>Select group:</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {MOCK_GROUPS.map((g) => (
            <Pill key={g} color={C.purple} active={value?.group === g} onClick={() => onChange({ group: g })}>👥 {g}</Pill>
          ))}
        </div>
      </div>
    );
  }
  if (type === "doa_matrix") {
    const tiers = value?.tiers || [{ max: 10000, position: "Team Lead" }, { max: 100000, position: "Director" }, { max: null, position: "CFO" }];
    return (
      <div style={{ marginTop: 12 }}>
        <div style={{ color: C.textMuted, fontSize: 13, marginBottom: 10 }}>Delegation of Authority tiers:</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {tiers.map((t: { max: number | null; position: string }, i: number) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "8px 14px", borderRadius: 10,
              background: C.surfaceSolid, border: `1px solid ${C.border}`,
            }}>
              <span style={{ fontFamily: FONT.mono, fontSize: 12, color: C.amber, minWidth: 110, fontWeight: 600 }}>
                {i === 0 ? `≤ ${t.max?.toLocaleString()}` : t.max ? `≤ ${t.max.toLocaleString()}` : "Above"}
              </span>
              <span style={{ color: C.textFaint, fontSize: 12 }}>→</span>
              <Pill color={C.amber}>{t.position}</Pill>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: C.textDim, fontFamily: FONT.mono, marginTop: 8 }}>
          Field: {value?.field || "amount"} · {tiers.length} tiers configured
        </div>
      </div>
    );
  }
  if (type === "dynamic_rule") {
    return (
      <div style={{
        marginTop: 12, padding: 14, borderRadius: 10,
        background: C.cyanSoft, border: `1px solid ${C.cyanBorder}`,
      }}>
        <div style={{ fontFamily: FONT.mono, fontSize: 12, color: C.cyan, lineHeight: 1.8 }}>
          <div style={{ color: C.textDim, marginBottom: 4 }}>// Rule expression</div>
          <div>WHEN category = &apos;procurement&apos;</div>
          <div style={{ paddingLeft: 16 }}>AND location.region = &apos;Western&apos;</div>
          <div style={{ paddingLeft: 8 }}>THEN resolve → position(&apos;Regional Procurement Mgr&apos;)</div>
        </div>
      </div>
    );
  }
  if (type === "specific_user") {
    return (
      <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ color: C.textMuted, fontSize: 13 }}>Employee:</span>
        <div style={{
          padding: "8px 14px", borderRadius: 10, background: C.surfaceSolid,
          border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 14,
            background: "linear-gradient(135deg, hsl(250,80%,56%), hsl(190,85%,35%))",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "#fff", fontWeight: 700,
          }}>SA</div>
          <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>Sara Al-Otaibi</span>
          <span style={{ fontSize: 11, color: C.textDim, fontFamily: FONT.mono }}>EMP-2847</span>
        </div>
      </div>
    );
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════
   STAGE CARD
   ═══════════════════════════════════════════════════════════════ */
function StageCard({ stage, index, total, isSelected, onSelect, onDragStart, onDragOver, onDrop }: {
  stage: Stage; index: number; total: number; isSelected: boolean;
  onSelect: () => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
}) {
  const resType = RESOLUTION_TYPES.find((r) => r.id === stage.resolution_type);
  const compMethod = COMPLETION_METHODS.find((m) => m.id === stage.completion_method);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onSelect}
      style={{ position: "relative", display: "flex", alignItems: "stretch", cursor: "grab" }}
    >
      {/* Timeline connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40, flexShrink: 0, paddingTop: 2 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 15,
          background: isSelected ? "linear-gradient(135deg, hsl(250,80%,56%), hsl(190,85%,35%))" : C.surfaceSolid,
          border: `2px solid ${isSelected ? C.primary : C.border}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700,
          color: isSelected ? "#fff" : C.textMuted,
          fontFamily: FONT.mono,
          transition: "all 0.25s cubic-bezier(0.25,0.8,0.25,1)",
          boxShadow: isSelected ? `0 0 16px rgba(99,102,241,0.25)` : "none",
        }}>
          {index + 1}
        </div>
        {index < total - 1 && (
          <div style={{
            flex: 1, width: 2, minHeight: 16,
            background: `linear-gradient(to bottom, ${isSelected ? C.primary : C.border}, ${C.border})`,
          }} />
        )}
      </div>

      {/* Card body */}
      <div style={{
        flex: 1,
        padding: "14px 18px",
        background: isSelected ? C.cardHover : C.card,
        border: `1.5px solid ${isSelected ? C.borderActive : C.border}`,
        borderRadius: 14,
        marginBottom: index < total - 1 ? 10 : 0,
        transition: "all 0.25s cubic-bezier(0.25,0.8,0.25,1)",
        marginLeft: 10,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        boxShadow: isSelected ? C.shadowHover : C.shadow,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, fontFamily: FONT.heading }}>{stage.name}</div>
            <div style={{ fontSize: 11, color: C.textFaint, fontFamily: FONT.mono, marginTop: 2 }}>{stage.id}</div>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <Pill color={stage.is_parallel ? C.green : C.amber} style={{ fontSize: 11 }}>
              {stage.is_parallel ? "∥ Parallel" : "→ Sequential"}
            </Pill>
            <span style={{ fontSize: 11, color: C.textFaint, cursor: "grab", padding: "2px 4px" }}>⠿</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {resType && <Pill color={C.blue} bg={C.blueSoft}>{resType.icon} {resType.label}</Pill>}
          {compMethod && <Pill color={compMethod.color} bg={`${compMethod.color}10`}>{compMethod.icon} {compMethod.label}</Pill>}
          <Pill color={C.textDim} bg={`${C.textDim}08`}>SLA {stage.sla_hours}h</Pill>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════════ */
export default function ApprovalRoutingPage() {
  const [policyName, setPolicyName] = useState("Purchase Order Approval");
  const [appliesTo, setAppliesTo] = useState("workflow_step");
  const [stages, setStages] = useState<Stage[]>(DEFAULT_STAGES);
  const [selectedStageId, setSelectedStageId] = useState("stg_1");
  const [savedFlash, setSavedFlash] = useState(false);

  const { onDragStart, onDragOver, onDrop } = useDragReorder(stages, setStages);
  const selectedStage = stages.find((s) => s.id === selectedStageId);

  const updateStage = useCallback((field: string, value: unknown) => {
    setStages((prev) =>
      prev.map((s) => (s.id === selectedStageId ? { ...s, [field]: value } : s))
    );
  }, [selectedStageId]);

  const addStage = () => {
    const newId = `stg_${Date.now().toString(36)}`;
    const newStage: Stage = {
      id: newId, name: "New Stage",
      resolution_type: "reporting_to", resolution_value: { levels_up: 1 },
      completion_method: "ALL", completion_threshold: null,
      sla_hours: 24, is_parallel: true, participants_preview: [],
    };
    setStages((prev) => [...prev, newStage]);
    setSelectedStageId(newId);
  };

  const removeStage = (id: string) => {
    setStages((prev) => prev.filter((s) => s.id !== id));
    if (selectedStageId === id) setSelectedStageId(stages[0]?.id);
  };

  const handleSave = () => {
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 2000);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-gradient, radial-gradient(circle at 50% 0%, #dbeafe 0%, #f8fafc 75%))",
      backgroundAttachment: "fixed",
      color: C.text,
      fontFamily: FONT.body,
    }}>
      {/* ═══ PAGE HEADER ═══ */}
      <div style={{
        maxWidth: 1400, margin: "0 auto",
        padding: "24px 32px 0",
      }}>
        {/* Breadcrumb & title row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Link href="/" style={{
              display: "flex", alignItems: "center", gap: 8,
              textDecoration: "none", color: C.textDim, fontSize: 13,
              fontFamily: FONT.body, fontWeight: 500,
              padding: "6px 14px", borderRadius: 10,
              background: C.card, border: `1px solid ${C.border}`,
              backdropFilter: "blur(12px)",
              transition: "all 0.2s",
            }}>
              ← Back
            </Link>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "3px 10px", borderRadius: 20,
                background: C.primarySoft, border: `1px solid ${C.primary}20`,
                color: C.primary, fontSize: 10, fontWeight: 700,
                fontFamily: FONT.heading, textTransform: "uppercase",
                letterSpacing: "0.08em", marginBottom: 6,
              }}>
                🔀 Approval Routing
              </div>
              <h1 style={{
                fontSize: 26, fontWeight: 700, color: C.text,
                fontFamily: FONT.heading, margin: 0, letterSpacing: "-0.02em",
              }}>
                Approval Policy Configuration
              </h1>
              <p style={{
                fontSize: 14, color: C.textMuted, margin: "4px 0 0",
                fontFamily: FONT.body, fontWeight: 400,
              }}>
                Define multi-stage approval chains with flexible resolution, completion, and escalation rules.
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            style={{
              padding: "10px 24px", borderRadius: 12,
              background: savedFlash
                ? "linear-gradient(135deg, #047857, #10b981)"
                : "linear-gradient(135deg, hsl(250,80%,56%), hsl(250,85%,48%))",
              border: "none", color: "#fff", fontSize: 14, fontWeight: 600,
              cursor: "pointer", transition: "all 0.25s",
              fontFamily: FONT.heading,
              boxShadow: savedFlash
                ? "0 4px 15px rgba(4,120,87,0.35)"
                : "0 4px 15px rgba(99,102,241,0.35)",
              letterSpacing: "0.01em",
            }}
          >
            {savedFlash ? "✓ Saved" : "Save Policy"}
          </button>
        </div>
      </div>

      {/* ═══ MAIN BODY ═══ */}
      <div style={{
        maxWidth: 1400, margin: "0 auto", padding: "0 32px 48px",
        display: "flex", gap: 24, alignItems: "flex-start",
      }}>

        {/* ═══ LEFT: Stage Pipeline ═══ */}
        <div style={{
          width: 400, flexShrink: 0,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: C.shadow,
          display: "flex", flexDirection: "column",
          maxHeight: "calc(100vh - 160px)",
          position: "sticky", top: 20,
        }}>
          {/* Policy metadata */}
          <div style={{ padding: 20, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ marginBottom: 12 }}>
              <label style={{
                fontSize: 11, color: C.textDim, fontFamily: FONT.heading,
                fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                display: "block", marginBottom: 6,
              }}>Policy Name</label>
              <input
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", borderRadius: 12,
                  background: C.surfaceSolid, border: `1.5px solid ${C.border}`,
                  color: C.text, fontSize: 15, fontWeight: 600,
                  fontFamily: FONT.heading, outline: "none",
                  transition: "border-color 0.2s",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {(["workflow_step", "ticket_category", "task_type"] as const).map((t) => (
                <Pill key={t} color={C.primary} active={appliesTo === t} onClick={() => setAppliesTo(t)}>
                  {t === "workflow_step" ? "Workflow" : t === "ticket_category" ? "Ticket" : "Task"}
                </Pill>
              ))}
            </div>
          </div>

          {/* Stage list header */}
          <div style={{ padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{
              fontSize: 12, fontFamily: FONT.heading,
              color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em",
            }}>
              Stages · {stages.length}
            </div>
            <button
              onClick={addStage}
              style={{
                padding: "6px 14px", borderRadius: 10,
                background: C.primarySoft, border: `1px solid ${C.primary}25`,
                color: C.primary, fontSize: 12, fontWeight: 700, cursor: "pointer",
                fontFamily: FONT.heading, transition: "all 0.2s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = `${C.primary}18`; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = C.primarySoft; }}
            >+ Add Stage</button>
          </div>

          {/* Stage cards */}
          <div style={{ flex: 1, overflowY: "auto", padding: "0 20px 20px" }}>
            {stages.map((stage, idx) => (
              <StageCard
                key={stage.id}
                stage={stage} index={idx} total={stages.length}
                isSelected={selectedStageId === stage.id}
                onSelect={() => setSelectedStageId(stage.id)}
                onDragStart={onDragStart(idx)}
                onDragOver={onDragOver(idx)}
                onDrop={onDrop}
              />
            ))}
          </div>

          {/* Flow preview */}
          <div style={{
            padding: "14px 20px",
            borderTop: `1px solid ${C.border}`,
            background: C.bgSecondary,
            borderRadius: "0 0 20px 20px",
          }}>
            <div style={{
              fontSize: 10, fontFamily: FONT.heading, fontWeight: 700,
              color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.1em",
              marginBottom: 10,
            }}>Execution Flow</div>
            <div style={{ display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}>
              <Pill color={C.green} style={{ fontSize: 10 }}>▶ START</Pill>
              {stages.map((s, i) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ color: C.textFaint, fontSize: 13 }}>→</span>
                  <Pill
                    color={selectedStageId === s.id ? C.primary : C.textDim}
                    active={selectedStageId === s.id}
                    onClick={() => setSelectedStageId(s.id)}
                    style={{ fontSize: 10 }}
                  >
                    {i + 1}. {s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name}
                  </Pill>
                </div>
              ))}
              <span style={{ color: C.textFaint, fontSize: 13 }}>→</span>
              <Pill color={C.primary} style={{ fontSize: 10 }}>✓ DONE</Pill>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Stage Detail Editor ═══ */}
        <div style={{
          flex: 1, minWidth: 0,
          background: C.card,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: C.shadow,
        }}>
          {selectedStage ? (
            <div style={{ padding: 28, maxWidth: 760 }}>
              {/* Stage header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: 10, fontFamily: FONT.mono, fontWeight: 600,
                    color: C.textFaint, textTransform: "uppercase", letterSpacing: "0.1em",
                    marginBottom: 8,
                  }}>
                    Stage {stages.findIndex((s) => s.id === selectedStageId) + 1} of {stages.length} · {selectedStage.id}
                  </div>
                  <input
                    value={selectedStage.name}
                    onChange={(e) => updateStage("name", e.target.value)}
                    style={{
                      fontSize: 24, fontWeight: 700, color: C.text,
                      background: "transparent", border: "none", outline: "none",
                      fontFamily: FONT.heading, width: "100%",
                      borderBottom: "2px solid transparent",
                      transition: "border-color 0.2s",
                      letterSpacing: "-0.02em",
                    }}
                    onFocus={(e) => { e.target.style.borderBottomColor = C.primary; }}
                    onBlur={(e) => { e.target.style.borderBottomColor = "transparent"; }}
                  />
                </div>
                {stages.length > 1 && (
                  <button
                    onClick={() => removeStage(selectedStage.id)}
                    style={{
                      padding: "7px 14px", borderRadius: 10,
                      background: C.redSoft, border: `1px solid ${C.redBorder}`,
                      color: C.red, fontSize: 12, cursor: "pointer",
                      fontFamily: FONT.heading, fontWeight: 600,
                      transition: "all 0.2s",
                    }}
                  >Remove</button>
                )}
              </div>

              {/* Section: Execution Mode */}
              <div style={{ marginBottom: 32 }}>
                <SectionLabel>Execution Mode</SectionLabel>
                <div style={{ display: "flex", gap: 12 }}>
                  <ModeCard
                    active={selectedStage.is_parallel}
                    onClick={() => updateStage("is_parallel", true)}
                    icon="∥" title="Parallel"
                    desc="All participants notified at once"
                    color={C.green}
                  />
                  <ModeCard
                    active={!selectedStage.is_parallel}
                    onClick={() => updateStage("is_parallel", false)}
                    icon="→" title="Sequential"
                    desc="One after another, in order"
                    color={C.amber}
                  />
                </div>
              </div>

              {/* Section: Approver Resolution */}
              <div style={{ marginBottom: 32 }}>
                <SectionLabel>Approver Resolution</SectionLabel>
                <ResolutionTypePicker
                  value={selectedStage.resolution_type}
                  onChange={(v) => updateStage("resolution_type", v)}
                />
                <ResolutionConfig
                  type={selectedStage.resolution_type}
                  value={selectedStage.resolution_value}
                  onChange={(v) => updateStage("resolution_value", v)}
                />
              </div>

              {/* Section: Completion Method */}
              <div style={{ marginBottom: 32 }}>
                <SectionLabel>Completion Method</SectionLabel>
                <CompletionMethodPicker
                  value={selectedStage.completion_method}
                  onChange={(v) => updateStage("completion_method", v)}
                />
                <ThresholdInput
                  method={selectedStage.completion_method}
                  threshold={selectedStage.completion_threshold}
                  onChange={(v) => updateStage("completion_threshold", v)}
                />
                <div style={{
                  marginTop: 12, padding: 14, borderRadius: 12,
                  background: C.bgSecondary, border: `1px solid ${C.border}`,
                }}>
                  <div style={{ fontSize: 11, color: C.textFaint, fontFamily: FONT.mono, marginBottom: 6 }}>
                    // How this stage resolves
                  </div>
                  <div style={{ fontSize: 13, color: C.textMuted, fontFamily: FONT.body, lineHeight: 1.7 }}>
                    {selectedStage.completion_method === "ALL" && "Stage completes when every resolved participant approves. A single rejection fails the stage immediately."}
                    {selectedStage.completion_method === "ANY" && "Stage completes on the first approval or rejection from any resolved participant."}
                    {selectedStage.completion_method === "COUNT" && `Stage completes when ${selectedStage.completion_threshold || 2} participants approve, regardless of order.`}
                    {selectedStage.completion_method === "PERCENTAGE" && `Stage completes when ${selectedStage.completion_threshold || 60}% of resolved participants approve.`}
                    {selectedStage.completion_method === "WEIGHTED" && `Stage completes when cumulative approval weight reaches ${selectedStage.completion_threshold || 5}. Each participant carries a configured weight.`}
                  </div>
                </div>
              </div>

              {/* Section: SLA & Escalation */}
              <div style={{ marginBottom: 32 }}>
                <SectionLabel>SLA & Escalation</SectionLabel>
                <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap" }}>
                  <div>
                    <label style={{ fontSize: 11, color: C.textDim, fontFamily: FONT.heading, fontWeight: 700, textTransform: "uppercase" }}>Response SLA</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                      <input
                        type="number" min={1} max={720}
                        value={selectedStage.sla_hours}
                        onChange={(e) => updateStage("sla_hours", parseInt(e.target.value) || 1)}
                        style={{
                          width: 68, padding: "10px 12px", borderRadius: 12,
                          background: C.surfaceSolid, border: `1.5px solid ${C.border}`,
                          color: C.text, fontFamily: FONT.mono, fontSize: 15, fontWeight: 600,
                          textAlign: "center", outline: "none",
                          transition: "border-color 0.2s",
                        }}
                      />
                      <span style={{ color: C.textMuted, fontSize: 13 }}>hours</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <Pill color={C.amber}>On breach → Escalate to next stage</Pill>
                    <Pill color={C.red}>On timeout → Auto-reject</Pill>
                  </div>
                </div>
              </div>

              {/* Section: Stage Summary */}
              <div style={{
                padding: 20, borderRadius: 16,
                background: "linear-gradient(135deg, rgba(99,102,241,0.06), rgba(14,116,144,0.06))",
                border: `1px solid rgba(99,102,241,0.12)`,
              }}>
                <div style={{
                  fontSize: 10, fontFamily: FONT.heading, fontWeight: 700,
                  color: C.primary, textTransform: "uppercase", letterSpacing: "0.1em",
                  marginBottom: 10,
                }}>Stage Configuration Summary</div>
                <div style={{ fontSize: 14, color: C.text, lineHeight: 1.9, fontFamily: FONT.body }}>
                  <strong>{selectedStage.name}</strong> will resolve approvers via{" "}
                  <span style={{ color: C.primary, fontFamily: FONT.mono, fontSize: 12, fontWeight: 600 }}>
                    {RESOLUTION_TYPES.find((r) => r.id === selectedStage.resolution_type)?.label}
                  </span>
                  , executing in{" "}
                  <span style={{
                    color: selectedStage.is_parallel ? C.green : C.amber,
                    fontFamily: FONT.mono, fontSize: 12, fontWeight: 600,
                  }}>
                    {selectedStage.is_parallel ? "parallel" : "sequential"}
                  </span>
                  {" "}mode. Completion requires{" "}
                  <span style={{
                    color: COMPLETION_METHODS.find((m) => m.id === selectedStage.completion_method)?.color,
                    fontFamily: FONT.mono, fontSize: 12, fontWeight: 600,
                  }}>
                    {selectedStage.completion_method === "ALL" && "unanimous approval"}
                    {selectedStage.completion_method === "ANY" && "any single response"}
                    {selectedStage.completion_method === "COUNT" && `${selectedStage.completion_threshold || 2} approvals`}
                    {selectedStage.completion_method === "PERCENTAGE" && `${selectedStage.completion_threshold || 60}% approval`}
                    {selectedStage.completion_method === "WEIGHTED" && `weight ≥ ${selectedStage.completion_threshold || 5}`}
                  </span>
                  {" "}within{" "}
                  <span style={{ fontFamily: FONT.mono, fontSize: 12, fontWeight: 600, color: C.amber }}>
                    {selectedStage.sla_hours}h SLA
                  </span>.
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              height: 400, display: "flex", alignItems: "center", justifyContent: "center",
              color: C.textDim, fontFamily: FONT.body, fontSize: 15,
            }}>
              Select a stage to configure
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
