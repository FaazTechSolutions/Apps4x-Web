'use client';

import { useState, useEffect, useCallback } from "react";

const MODULES = [
    { key: "inbox", label: "Inbox", glyph: "📥", live: true, count: 5, href: "/inbox" },
    { key: "cx", label: "Helpdesk", glyph: "◈", live: true, count: 12, href: "/helpdesk" },
    { key: "crm", label: "CRM", glyph: "◇", count: 4, href: "/crm" },
    { key: "hrm", label: "HRM", glyph: "○", count: 7 },
    { key: "erp", label: "ERP", glyph: "□", count: 2 },
    { key: "gov", label: "Governance", glyph: "🛡️", live: true, href: "/governance" },
    { key: "del", label: "Delegation", glyph: "🤝", live: true, count: 2, href: "/delegation" },
    { key: "proto", label: "Prototype", glyph: "🧪", live: true, href: "/prototype" },
];

function Rail({ active }) {
    const railBg = "#0A0B0D";
    const line = "#1F242B";
    const panelHi = "#15181D";
    const lineHi = "#2B323B";
    const text = "#E7E9EC";
    const textFaint = "#5C656F";
    const textDim = "#9099A3";
    const govern = "#3B82F6";
    const intel = "#A78BFA";

    return (
        <div style={{
            width: 76, height: "100vh", background: railBg, borderRight: `1px solid ${line}`,
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "20px 0", gap: 6, flexShrink: 0, zIndex: 10
        }}>
            <div style={{
                width: 38, height: 38, borderRadius: 10, marginBottom: 18,
                background: `linear-gradient(135deg, ${govern}, ${intel})`,
                display: "grid", placeItems: "center",
                fontWeight: 700, fontSize: 16, color: "#fff", fontFamily: "'JetBrains Mono',monospace"
            }}>4x</div>
            {MODULES.map((m) => {
                const on = active === m.key;
                return (
                    <a key={m.key} href={m.href || "#"} title={m.label} style={{
                        position: "relative", width: 52, height: 52, borderRadius: 12, cursor: "pointer",
                        background: on ? panelHi : "transparent",
                        border: `1px solid ${on ? lineHi : "transparent"}`,
                        color: on ? text : textFaint, transition: "all .15s",
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
                        textDecoration: "none"
                    }}>
                        <span style={{ fontSize: 18 }}>{m.glyph}</span>
                        <span style={{ fontWeight: 500, fontSize: 9, letterSpacing: ".02em" }}>{m.label}</span>
                        {m.count && (
                            <span style={{
                                position: "absolute", top: 4, right: 6, minWidth: 16, height: 16, padding: "0 4px",
                                borderRadius: 8, background: m.live ? govern : lineHi,
                                color: m.live ? "#06121F" : textDim,
                                fontWeight: 600, fontSize: 9, fontFamily: "'JetBrains Mono',monospace", display: "grid", placeItems: "center",
                            }}>{m.count}</span>
                        )}
                    </a>
                );
            })}
        </div>
    );
}

// --- Mock Data ---
const EMPLOYEES = [
    { id: "emp-1", name: "Khalid Al-Rashidi", role: "IT Support Manager", dept: "IT", avatar: "KR", status: "on_leave" },
    { id: "emp-2", name: "Fatima Hassan", role: "Senior IT Analyst", dept: "IT", avatar: "FH", status: "available" },
    { id: "emp-3", name: "Omar Bakr", role: "HR Operations Lead", dept: "HR", avatar: "OB", status: "available" },
    { id: "emp-4", name: "Sara Al-Dosari", role: "Finance Manager", dept: "Finance", avatar: "SA", status: "available" },
    { id: "emp-5", name: "Ahmed Noor", role: "GRO Supervisor", dept: "Operations", avatar: "AN", status: "off_shift" },
];

const CATEGORIES = [
    { id: "cat-1", name: "IT Support", children: ["Hardware", "Software", "Network", "Access Management"] },
    { id: "cat-2", name: "HR Requests", children: ["Leave", "Benefits", "Onboarding", "Offboarding"] },
    { id: "cat-3", name: "Finance", children: ["Invoices", "Expense Claims", "Budget Approvals"] },
    { id: "cat-4", name: "Operations", children: ["Facilities", "Procurement", "Compliance"] },
];

const MOCK_DELEGATIONS = [
    {
        id: "del-1", delegator: EMPLOYEES[0], delegate: EMPLOYEES[1],
        scope_type: "category", scope_filter: { categories: ["IT Support"], max_priority: "P2" },
        reason: "leave", start_date: "2026-06-15", end_date: "2026-06-29",
        status: "active", requires_acceptance: true, accepted: true,
        stats: { total: 12, completed: 8, pending: 4, approvals_granted: 3, approvals_rejected: 1 },
        activities: [
            { type: "created", actor: "Khalid Al-Rashidi", time: "Jun 14, 10:30 AM", detail: "Created delegation for Hajj leave" },
            { type: "accepted", actor: "Fatima Hassan", time: "Jun 14, 11:15 AM", detail: "Accepted delegation" },
            { type: "activated", actor: "System", time: "Jun 15, 12:00 AM", detail: "Delegation activated — leave period started" },
            { type: "action", actor: "Fatima Hassan", time: "Jun 16, 2:45 PM", detail: "Approved TKT-4421 on behalf of Khalid" },
            { type: "action", actor: "Fatima Hassan", time: "Jun 17, 9:10 AM", detail: "Resolved TKT-4438 on behalf of Khalid" },
        ]
    },
    {
        id: "del-2", delegator: EMPLOYEES[3], delegate: EMPLOYEES[2],
        scope_type: "approval_level", scope_filter: { approval_levels: ["manager"], exclude: ["budget_above_50k"] },
        reason: "travel", start_date: "2026-06-20", end_date: "2026-06-25",
        status: "pending_acceptance", requires_acceptance: true, accepted: false,
        stats: { total: 0, completed: 0, pending: 0, approvals_granted: 0, approvals_rejected: 0 },
        activities: [
            { type: "created", actor: "Sara Al-Dosari", time: "Jun 17, 8:00 AM", detail: "Created delegation for business travel to Riyadh" },
        ]
    },
    {
        id: "del-3", delegator: EMPLOYEES[2], delegate: EMPLOYEES[4],
        scope_type: "department", scope_filter: { departments: ["HR"] },
        reason: "workload", start_date: "2026-06-10", end_date: "2026-06-17",
        status: "expired", requires_acceptance: false, accepted: true,
        stats: { total: 6, completed: 6, pending: 0, approvals_granted: 2, approvals_rejected: 0 },
        activities: [
            { type: "created", actor: "Omar Bakr", time: "Jun 10, 7:00 AM", detail: "Created delegation for workload balancing" },
            { type: "activated", actor: "System", time: "Jun 10, 7:00 AM", detail: "Delegation activated immediately (no acceptance required)" },
            { type: "expired", actor: "System", time: "Jun 17, 12:00 AM", detail: "Delegation expired — end date reached" },
        ]
    },
];

// --- Utilities ---
const STATUS_CONFIG = {
    active: { label: "Active", color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.25)" },
    pending_acceptance: { label: "Pending Acceptance", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.25)" },
    expired: { label: "Expired", color: "#6B7280", bg: "rgba(107,114,128,0.1)", border: "rgba(107,114,128,0.25)" },
    revoked: { label: "Revoked", color: "#EF4444", bg: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.25)" },
};

const REASON_LABELS = { leave: "Leave", travel: "Business Travel", workload: "Workload Balancing", temporary_reassignment: "Temporary Reassignment" };
const SCOPE_LABELS = { all: "All Work", department: "Department", category: "Category", approval_level: "Approval Level", specific_tickets: "Specific Tickets" };

const ACTIVITY_ICONS = {
    created: "○", accepted: "◉", activated: "▶", action: "◆", expired: "□", revoked: "✕",
};

// --- Components ---

function Avatar({ initials, size = 36, status }) {
    const statusColors = { available: "#22C55E", on_leave: "#F59E0B", off_shift: "#6B7280", terminated: "#EF4444" };
    return (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <div style={{
                width: size, height: size, borderRadius: "50%",
                background: "linear-gradient(135deg, #2563EB 0%, #1E40AF 100%)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'DM Sans', sans-serif", fontSize: size * 0.33,
                fontWeight: 600, color: "#fff", letterSpacing: "0.02em"
            }}>{initials}</div>
            {status && (
                <div style={{
                    position: "absolute", bottom: -1, right: -1,
                    width: size * 0.3, height: size * 0.3, borderRadius: "50%",
                    background: statusColors[status] || "#6B7280",
                    border: "2px solid #0F1219"
                }} />
            )}
        </div>
    );
}

function Badge({ label, color, bg, border }) {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 6,
            background: bg, border: `1px solid ${border}`,
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            fontWeight: 500, color, letterSpacing: "0.03em"
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
            {label}
        </span>
    );
}

function GovernanceBadge() {
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            padding: "2px 8px", borderRadius: 4,
            background: "rgba(37,99,235,0.1)", border: "1px solid rgba(37,99,235,0.25)",
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            fontWeight: 600, color: "#3B82F6", letterSpacing: "0.05em", textTransform: "uppercase"
        }}>
            <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" stroke="#3B82F6" strokeWidth="1.5" fill="rgba(37,99,235,0.15)" />
                <path d="M5.5 8L7 9.5L10.5 6" stroke="#3B82F6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Governed
        </span>
    );
}

function StatCard({ label, value, accent }) {
    return (
        <div style={{
            flex: 1, minWidth: 80, padding: "12px 14px", borderRadius: 8,
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)"
        }}>
            <div style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 700,
                color: accent || "#E2E8F0", lineHeight: 1
            }}>{value}</div>
            <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B",
                marginTop: 4, letterSpacing: "0.02em"
            }}>{label}</div>
        </div>
    );
}

function ScopeDisplay({ scope_type, scope_filter }) {
    let details = [];
    if (scope_type === "all") details = ["All tickets, tasks, and approvals"];
    else if (scope_type === "category") {
        details = [...(scope_filter.categories || [])];
        if (scope_filter.max_priority) details.push(`Up to ${scope_filter.max_priority}`);
    } else if (scope_type === "department") {
        details = [...(scope_filter.departments || [])];
    } else if (scope_type === "approval_level") {
        details = (scope_filter.approval_levels || []).map(l => `${l} level`);
        if (scope_filter.exclude) details.push(...scope_filter.exclude.map(e => `Excludes: ${e.replace(/_/g, " ")}`));
    }
    return (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            <span style={{
                padding: "3px 8px", borderRadius: 4, fontSize: 11,
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)",
                color: "#A78BFA", letterSpacing: "0.03em"
            }}>{SCOPE_LABELS[scope_type]}</span>
            {details.map((d, i) => (
                <span key={i} style={{
                    padding: "3px 8px", borderRadius: 4, fontSize: 11,
                    fontFamily: "'DM Sans', sans-serif",
                    background: d.startsWith("Excludes") ? "rgba(239,68,68,0.08)" : "rgba(255,255,255,0.04)",
                    border: d.startsWith("Excludes") ? "1px solid rgba(239,68,68,0.2)" : "1px solid rgba(255,255,255,0.08)",
                    color: d.startsWith("Excludes") ? "#F87171" : "#94A3B8"
                }}>{d}</span>
            ))}
        </div>
    );
}

function ActivityTimeline({ activities }) {
    return (
        <div style={{ position: "relative", paddingLeft: 24 }}>
            <div style={{
                position: "absolute", left: 7, top: 4, bottom: 4, width: 1,
                background: "rgba(255,255,255,0.06)"
            }} />
            {activities.map((a, i) => (
                <div key={i} style={{
                    position: "relative", paddingBottom: i < activities.length - 1 ? 16 : 0
                }}>
                    <span style={{
                        position: "absolute", left: -20, top: 2,
                        fontFamily: "monospace", fontSize: 11,
                        color: a.type === "action" ? "#3B82F6" : a.type === "accepted" ? "#22C55E" :
                            a.type === "revoked" || a.type === "expired" ? "#6B7280" : "#94A3B8"
                    }}>{ACTIVITY_ICONS[a.type]}</span>
                    <div style={{
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#CBD5E1", lineHeight: 1.5
                    }}>{a.detail}</div>
                    <div style={{
                        fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#475569", marginTop: 2
                    }}>{a.actor} · {a.time}</div>
                </div>
            ))}
        </div>
    );
}

// --- Create Delegation Modal ---
function CreateDelegationModal({ onClose, onSubmit }) {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({
        delegate_id: "", scope_type: "all", reason: "leave",
        start_date: "2026-06-20", end_date: "2026-06-27",
        requires_acceptance: true, categories: [], departments: [],
        approval_levels: [], max_priority: "", exclude_budget: false, notes: ""
    });

    const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
    const toggleIn = (arr, val) => {
        const list = form[arr];
        update(arr, list.includes(val) ? list.filter(x => x !== val) : [...list, val]);
    };

    const selectedDelegate = EMPLOYEES.find(e => e.id === form.delegate_id);

    const canProceed = () => {
        if (step === 1) return !!form.delegate_id;
        if (step === 2) {
            if (form.scope_type === "category") return form.categories.length > 0;
            if (form.scope_type === "department") return form.departments.length > 0;
            if (form.scope_type === "approval_level") return form.approval_levels.length > 0;
            return true;
        }
        if (step === 3) return form.start_date && form.end_date;
        return true;
    };

    const chipStyle = (selected) => ({
        padding: "6px 14px", borderRadius: 6, fontSize: 13, cursor: "pointer",
        fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all 0.15s",
        background: selected ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${selected ? "rgba(37,99,235,0.4)" : "rgba(255,255,255,0.08)"}`,
        color: selected ? "#60A5FA" : "#94A3B8"
    });

    const inputStyle = {
        width: "100%", padding: "10px 12px", borderRadius: 6,
        background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)",
        color: "#E2E8F0", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
        outline: "none", boxSizing: "border-box"
    };

    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16
        }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
                background: "#111827", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14, padding: 0
            }}>
                {/* Header */}
                <div style={{
                    padding: "20px 24px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start"
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                            <h2 style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: 18, fontWeight: 700,
                                color: "#F1F5F9", margin: 0
                            }}>New Delegation</h2>
                            <GovernanceBadge />
                        </div>
                        <div style={{
                            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569"
                        }}>Step {step} of 4</div>
                    </div>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", color: "#64748B",
                        cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 4
                    }}>✕</button>
                </div>

                {/* Progress */}
                <div style={{
                    display: "flex", gap: 3, padding: "0 24px", marginTop: 12
                }}>
          {[1,2,3,4].map(s => (
                        <div key={s} style={{
                            flex: 1, height: 3, borderRadius: 2,
                            background: s <= step ? "#2563EB" : "rgba(255,255,255,0.06)",
                            transition: "background 0.3s"
                        }} />
                    ))}
                </div>

                {/* Content */}
                <div style={{ padding: "20px 24px" }}>
                    {step === 1 && (
                        <div>
                            <label style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                                color: "#94A3B8", display: "block", marginBottom: 12
                            }}>Select Delegate</label>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                {EMPLOYEES.filter(e => e.id !== "emp-1").map(emp => (
                                    <div key={emp.id} onClick={() => update("delegate_id", emp.id)} style={{
                                        display: "flex", alignItems: "center", gap: 12,
                                        padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                                        background: form.delegate_id === emp.id ? "rgba(37,99,235,0.1)" : "rgba(255,255,255,0.02)",
                                        border: `1px solid ${form.delegate_id === emp.id ? "rgba(37,99,235,0.3)" : "rgba(255,255,255,0.06)"}`,
                                        transition: "all 0.15s"
                                    }}>
                                        <Avatar initials={emp.avatar} size={34} status={emp.status} />
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#E2E8F0"
                                            }}>{emp.name}</div>
                                            <div style={{
                                                fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#64748B"
                                            }}>{emp.role} · {emp.dept}</div>
                                        </div>
                                        {emp.status !== "available" && (
                                            <Badge label={emp.status.replace("_", " ")}
                                                color={STATUS_CONFIG[emp.status === "on_leave" ? "pending_acceptance" : "expired"]?.color || "#6B7280"}
                                                bg={STATUS_CONFIG[emp.status === "on_leave" ? "pending_acceptance" : "expired"]?.bg || "rgba(107,114,128,0.1)"}
                                                border={STATUS_CONFIG[emp.status === "on_leave" ? "pending_acceptance" : "expired"]?.border || "rgba(107,114,128,0.25)"}
                                            />
                                        )}
                                        {form.delegate_id === emp.id && (
                                            <div style={{ color: "#3B82F6", fontSize: 16 }}>✓</div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <label style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                                color: "#94A3B8", display: "block", marginBottom: 12
                            }}>Delegation Scope</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                                {Object.entries(SCOPE_LABELS).map(([k, v]) => (
                                    <button key={k} onClick={() => update("scope_type", k)}
                                        style={chipStyle(form.scope_type === k)}>{v}</button>
                                ))}
                            </div>

                            {form.scope_type === "category" && (
                                <div>
                                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#64748B", display: "block", marginBottom: 8 }}>
                                        Select categories to delegate
                                    </label>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {CATEGORIES.map(cat => (
                                            <div key={cat.id} onClick={() => toggleIn("categories", cat.name)}
                                                style={{
                                                    padding: "10px 14px", borderRadius: 6, cursor: "pointer",
                                                    background: form.categories.includes(cat.name) ? "rgba(37,99,235,0.08)" : "rgba(255,255,255,0.02)",
                                                    border: `1px solid ${form.categories.includes(cat.name) ? "rgba(37,99,235,0.25)" : "rgba(255,255,255,0.06)"}`,
                                                }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}>{cat.name}</span>
                                                    {form.categories.includes(cat.name) && <span style={{ color: "#3B82F6" }}>✓</span>}
                                                </div>
                                                <div style={{
                                                    fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", marginTop: 4
                                                }}>{cat.children.join(" · ")}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ marginTop: 14 }}>
                                        <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#64748B", display: "block", marginBottom: 6 }}>
                                            Max priority (optional)
                                        </label>
                                        <div style={{ display: "flex", gap: 6 }}>
                                            {["", "P1", "P2", "P3"].map(p => (
                                                <button key={p} onClick={() => update("max_priority", p)}
                                                    style={chipStyle(form.max_priority === p)}>
                                                    {p || "No limit"}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {form.scope_type === "department" && (
                                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                    {["IT", "HR", "Finance", "Operations"].map(d => (
                                        <button key={d} onClick={() => toggleIn("departments", d)}
                                            style={chipStyle(form.departments.includes(d))}>{d}</button>
                                    ))}
                                </div>
                            )}

                            {form.scope_type === "approval_level" && (
                                <div>
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
                                        {["Manager", "Director", "VP"].map(l => (
                                            <button key={l} onClick={() => toggleIn("approval_levels", l.toLowerCase())}
                                                style={chipStyle(form.approval_levels.includes(l.toLowerCase()))}>{l}</button>
                                        ))}
                                    </div>
                                    <label style={{
                                        display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#F87171"
                                    }}>
                                        <input type="checkbox" checked={form.exclude_budget}
                                            onChange={e => update("exclude_budget", e.target.checked)}
                                            style={{ accentColor: "#EF4444" }} />
                                        Exclude budget approvals above SAR 50,000
                                    </label>
                                </div>
                            )}

                            {form.scope_type === "all" && (
                                <div style={{
                                    padding: "14px 16px", borderRadius: 8,
                                    background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)"
                                }}>
                                    <div style={{
                                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#FBBF24", fontWeight: 600
                                    }}>⚠ Full delegation</div>
                                    <div style={{
                                        fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#94A3B8", marginTop: 4
                                    }}>
                                        The delegate will receive all your tickets, tasks, and approvals.
                                        Compliance-blocked categories will still be excluded.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div>
                            <label style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                                color: "#94A3B8", display: "block", marginBottom: 12
                            }}>Duration & Reason</label>
                            <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>Start</label>
                                    <input type="date" value={form.start_date}
                                        onChange={e => update("start_date", e.target.value)}
                                        style={{ ...inputStyle, colorScheme: "dark" }} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>End</label>
                                    <input type="date" value={form.end_date}
                                        onChange={e => update("end_date", e.target.value)}
                                        style={{ ...inputStyle, colorScheme: "dark" }} />
                                </div>
                            </div>
                            <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", display: "block", marginBottom: 6 }}>Reason</label>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
                                {Object.entries(REASON_LABELS).map(([k, v]) => (
                                    <button key={k} onClick={() => update("reason", k)}
                                        style={chipStyle(form.reason === k)}>{v}</button>
                                ))}
                            </div>
                            <label style={{
                                display: "flex", alignItems: "center", gap: 8, cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#CBD5E1"
                            }}>
                                <input type="checkbox" checked={form.requires_acceptance}
                                    onChange={e => update("requires_acceptance", e.target.checked)}
                                    style={{ accentColor: "#2563EB" }} />
                                Require delegate acceptance before activation
                            </label>
                            <div style={{ marginTop: 14 }}>
                                <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#64748B", display: "block", marginBottom: 4 }}>Notes (optional)</label>
                                <textarea value={form.notes} onChange={e => update("notes", e.target.value)}
                                    placeholder="Context for the delegate..."
                                    rows={3} style={{ ...inputStyle, resize: "vertical" }} />
                            </div>
                        </div>
                    )}

                    {step === 4 && (
                        <div>
                            <label style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                                color: "#94A3B8", display: "block", marginBottom: 16
                            }}>Review Delegation</label>

                            <div style={{
                                padding: 16, borderRadius: 10,
                                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)"
                            }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                                    <Avatar initials="KR" size={30} />
                                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#64748B" }}>→</span>
                                    <Avatar initials={selectedDelegate?.avatar || "?"} size={30} />
                                    <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>
                                        {selectedDelegate?.name}
                                    </span>
                                </div>

                                {[
                                    ["Scope", SCOPE_LABELS[form.scope_type]],
                                    ["Period", `${form.start_date} → ${form.end_date}`],
                                    ["Reason", REASON_LABELS[form.reason]],
                                    ["Acceptance", form.requires_acceptance ? "Required" : "Auto-activate"],
                                ].map(([k, v]) => (
                                    <div key={k} style={{
                                        display: "flex", justifyContent: "space-between", padding: "8px 0",
                                        borderBottom: "1px solid rgba(255,255,255,0.04)"
                                    }}>
                                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#64748B" }}>{k}</span>
                                        <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#CBD5E1", fontWeight: 500 }}>{v}</span>
                                    </div>
                                ))}

                                {form.scope_type === "category" && form.categories.length > 0 && (
                                    <div style={{ marginTop: 10 }}>
                                        <ScopeDisplay scope_type={form.scope_type} scope_filter={{ categories: form.categories, max_priority: form.max_priority || undefined }} />
                                    </div>
                                )}
                                {form.scope_type === "approval_level" && form.exclude_budget && (
                                    <div style={{ marginTop: 10 }}>
                                        <ScopeDisplay scope_type={form.scope_type} scope_filter={{ approval_levels: form.approval_levels, exclude: ["budget_above_50k"] }} />
                                    </div>
                                )}
                            </div>

                            <div style={{
                                marginTop: 14, padding: "12px 14px", borderRadius: 8,
                                background: "rgba(37,99,235,0.06)", border: "1px solid rgba(37,99,235,0.15)"
                            }}>
                                <div style={{
                                    fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#60A5FA"
                                }}>
                                    This delegation will be recorded in the governance audit trail. All actions taken by the delegate will be attributed as "on behalf of" the delegator.
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: "16px 24px 20px",
                    borderTop: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "space-between", gap: 10
                }}>
                    <button onClick={() => step > 1 ? setStep(s => s - 1) : onClose()} style={{
                        padding: "10px 18px", borderRadius: 8, cursor: "pointer",
                        background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
                        color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500
                    }}>{step > 1 ? "Back" : "Cancel"}</button>
                    <button onClick={() => {
                        if (step < 4) setStep(s => s + 1);
                        else onSubmit(form);
                    }} disabled={!canProceed()} style={{
                        padding: "10px 22px", borderRadius: 8, cursor: canProceed() ? "pointer" : "not-allowed",
                        background: canProceed() ? "#2563EB" : "rgba(37,99,235,0.3)",
                        border: "none", color: "#fff",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                        opacity: canProceed() ? 1 : 0.5, transition: "all 0.15s"
                    }}>{step < 4 ? "Continue" : "Create Delegation"}</button>
                </div>
            </div>
        </div>
    );
}

// --- Detail Panel ---
function DelegationDetail({ delegation, onClose, onRevoke }) {
    const d = delegation;
    const cfg = STATUS_CONFIG[d.status];
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16
        }} onClick={onClose}>
            <div onClick={e => e.stopPropagation()} style={{
                width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto",
                background: "#111827", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 14
            }}>
                <div style={{
                    padding: "20px 24px 16px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    display: "flex", justifyContent: "space-between", alignItems: "flex-start"
                }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                            <h2 style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: 17, fontWeight: 700,
                                color: "#F1F5F9", margin: 0
                            }}>Delegation {d.id.toUpperCase()}</h2>
                            <Badge {...cfg} />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <GovernanceBadge />
                            <span style={{
                                fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: "#475569"
                            }}>{REASON_LABELS[d.reason]} · {d.start_date} → {d.end_date}</span>
                        </div>
                    </div>
                    <button onClick={onClose} style={{
                        background: "none", border: "none", color: "#64748B",
                        cursor: "pointer", fontSize: 20, padding: 4
                    }}>✕</button>
                </div>

                <div style={{ padding: "20px 24px" }}>
                    {/* Participants */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 14,
                        padding: 16, borderRadius: 10,
                        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                        marginBottom: 20
                    }}>
                        <div style={{ textAlign: "center" }}>
                            <Avatar initials={d.delegator.avatar} size={40} status={d.delegator.status} />
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#E2E8F0", marginTop: 6 }}>{d.delegator.name.split(" ")[0]}</div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#475569" }}>DELEGATOR</div>
                        </div>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="60" height="20" viewBox="0 0 60 20">
                                <line x1="0" y1="10" x2="48" y2="10" stroke="#334155" strokeWidth="1.5" strokeDasharray="4 3" />
                                <polygon points="48,5 58,10 48,15" fill="#334155" />
                            </svg>
                        </div>
                        <div style={{ textAlign: "center" }}>
                            <Avatar initials={d.delegate.avatar} size={40} status={d.delegate.status} />
                            <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: "#E2E8F0", marginTop: 6 }}>{d.delegate.name.split(" ")[0]}</div>
                            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: "#475569" }}>DELEGATE</div>
                        </div>
                    </div>

                    {/* Scope */}
                    <div style={{ marginBottom: 20 }}>
                        <div style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
                            color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8
                        }}>Scope</div>
                        <ScopeDisplay scope_type={d.scope_type} scope_filter={d.scope_filter} />
                    </div>

                    {/* Stats */}
                    {d.stats.total > 0 && (
                        <div style={{ marginBottom: 20 }}>
                            <div style={{
                                fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
                                color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8
                            }}>Activity Summary</div>
                            <div style={{ display: "flex", gap: 8 }}>
                                <StatCard label="Total" value={d.stats.total} />
                                <StatCard label="Completed" value={d.stats.completed} accent="#22C55E" />
                                <StatCard label="Pending" value={d.stats.pending} accent="#F59E0B" />
                                <StatCard label="Approvals" value={d.stats.approvals_granted} accent="#3B82F6" />
                            </div>
                        </div>
                    )}

                    {/* Timeline */}
                    <div>
                        <div style={{
                            fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
                            color: "#64748B", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12
                        }}>Timeline</div>
                        <ActivityTimeline activities={d.activities} />
                    </div>
                </div>

                {/* Actions */}
                {d.status === "active" && (
                    <div style={{
                        padding: "16px 24px 20px", borderTop: "1px solid rgba(255,255,255,0.06)",
                        display: "flex", justifyContent: "flex-end", gap: 10
                    }}>
                        <button onClick={() => onRevoke(d.id)} style={{
                            padding: "10px 18px", borderRadius: 8, cursor: "pointer",
                            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                            color: "#F87171", fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600
                        }}>Revoke Delegation</button>
                    </div>
                )}

                {d.status === "pending_acceptance" && (
                    <div style={{
                        padding: "16px 24px 20px", borderTop: "1px solid rgba(255,255,255,0.06)"
                    }}>
                        <div style={{
                            padding: "14px 16px", borderRadius: 8,
                            background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)",
                            fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#FBBF24",
                            display: "flex", alignItems: "center", gap: 8
                        }}>
                            <span style={{ fontSize: 16 }}>⏳</span>
                            Waiting for {d.delegate.name} to accept this delegation
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Main Dashboard ---
export default function DelegationDashboard() {
    const [delegations, setDelegations] = useState(MOCK_DELEGATIONS);
    const [showCreate, setShowCreate] = useState(false);
    const [selectedDel, setSelectedDel] = useState(null);
    const [filter, setFilter] = useState("all");
    const [toast, setToast] = useState(null);

    const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const filtered = filter === "all" ? delegations : delegations.filter(d => d.status === filter);
    const counts = {
        all: delegations.length,
        active: delegations.filter(d => d.status === "active").length,
        pending_acceptance: delegations.filter(d => d.status === "pending_acceptance").length,
        expired: delegations.filter(d => d.status === "expired").length,
    };

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      `}</style>

            <div style={{ display: "flex", height: "100vh", width: "100%", background: "#0F1219", overflow: "hidden" }}>
                <Rail active="del" />

                <div style={{
                    flex: 1, overflowY: "auto",
                    fontFamily: "'DM Sans', sans-serif", color: "#E2E8F0"
                }}>
                    {/* Top Bar */}
                    <div style={{
                        padding: "16px 24px",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        background: "rgba(17,24,39,0.8)", backdropFilter: "blur(12px)",
                        position: "sticky", top: 0, zIndex: 100
                    }}>
                        <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                                <span style={{
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600,
                                    color: "#3B82F6", letterSpacing: "0.1em", textTransform: "uppercase"
                                }}>ClarityDesk</span>
                                <span style={{ color: "#334155", fontSize: 10 }}>›</span>
                                <span style={{
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                                    color: "#64748B", letterSpacing: "0.05em"
                                }}>Delegations</span>
                            </div>
                            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#F1F5F9", lineHeight: 1.2 }}>
                                Delegation Management
                            </h1>
                        </div>
                        <button onClick={() => setShowCreate(true)} style={{
                            display: "flex", alignItems: "center", gap: 7,
                            padding: "10px 18px", borderRadius: 8, cursor: "pointer",
                            background: "#2563EB", border: "none",
                            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, color: "#fff"
                        }}>
                            <span style={{ fontSize: 16 }}>+</span> New Delegation
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div style={{
                        padding: "14px 24px 0",
                        display: "flex", gap: 4, borderBottom: "1px solid rgba(255,255,255,0.06)"
                    }}>
                        {[
                            ["all", "All"],
                            ["active", "Active"],
                            ["pending_acceptance", "Pending"],
                            ["expired", "Expired"]
                        ].map(([key, label]) => (
                            <button key={key} onClick={() => setFilter(key)} style={{
                                padding: "8px 14px 12px", borderRadius: "6px 6px 0 0", cursor: "pointer",
                                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                                background: filter === key ? "rgba(255,255,255,0.04)" : "transparent",
                                border: "none", borderBottom: filter === key ? "2px solid #2563EB" : "2px solid transparent",
                                color: filter === key ? "#E2E8F0" : "#64748B",
                                transition: "all 0.15s"
                            }}>
                                {label}
                                <span style={{
                                    marginLeft: 6, padding: "1px 7px", borderRadius: 10,
                                    fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                                    background: filter === key ? "rgba(37,99,235,0.15)" : "rgba(255,255,255,0.04)",
                                    color: filter === key ? "#60A5FA" : "#475569"
                                }}>{counts[key]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Delegation Cards */}
                    <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                        {filtered.map(d => {
                            const cfg = STATUS_CONFIG[d.status];
                            return (
                                <div key={d.id} onClick={() => setSelectedDel(d)} style={{
                                    padding: "18px 20px", borderRadius: 12, cursor: "pointer",
                                    background: "rgba(255,255,255,0.02)",
                                    border: "1px solid rgba(255,255,255,0.06)",
                                    transition: "all 0.2s"
                                }}>
                                    <div style={{
                                        display: "flex", justifyContent: "space-between", alignItems: "flex-start",
                                        marginBottom: 14
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                                <Avatar initials={d.delegator.avatar} size={32} />
                                                <svg width="20" height="12" viewBox="0 0 20 12" style={{ opacity: 0.4 }}>
                                                    <line x1="0" y1="6" x2="14" y2="6" stroke="#64748B" strokeWidth="1" />
                                                    <polygon points="14,3 19,6 14,9" fill="#64748B" />
                                                </svg>
                                                <Avatar initials={d.delegate.avatar} size={32} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: "#E2E8F0" }}>
                                                    {d.delegator.name.split(" ")[0]} → {d.delegate.name.split(" ")[0]}
                                                </div>
                                                <div style={{
                                                    fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#475569", marginTop: 2
                                                }}>
                                                    {d.start_date} → {d.end_date} · {REASON_LABELS[d.reason]}
                                                </div>
                                            </div>
                                        </div>
                                        <Badge {...cfg} />
                                    </div>

                                    <ScopeDisplay scope_type={d.scope_type} scope_filter={d.scope_filter} />

                                    {d.stats.total > 0 && (
                                        <div style={{
                                            display: "flex", gap: 16, marginTop: 12, paddingTop: 12,
                                            borderTop: "1px solid rgba(255,255,255,0.04)"
                                        }}>
                                            {[
                                                ["Handled", d.stats.completed, "#22C55E"],
                                                ["Pending", d.stats.pending, "#F59E0B"],
                                                ["Approvals", d.stats.approvals_granted, "#3B82F6"]
                                            ].map(([label, val, color]) => (
                                                <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                                    <span style={{
                                                        fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, color
                                                    }}>{val}</span>
                                                    <span style={{
                                                        fontFamily: "'DM Sans', sans-serif", fontSize: 11, color: "#475569"
                                                    }}>{label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        {filtered.length === 0 && (
                            <div style={{
                                textAlign: "center", padding: "60px 20px",
                                color: "#475569", fontFamily: "'DM Sans', sans-serif", fontSize: 14
                            }}>
                                <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>◇</div>
                                No delegations found
                            </div>
                        )}
                    </div>

                    {/* Modals */}
                    {showCreate && (
                        <CreateDelegationModal
                            onClose={() => setShowCreate(false)}
                            onSubmit={(form) => {
                                setShowCreate(false);
                                const emp = EMPLOYEES.find(e => e.id === form.delegate_id);
                                setDelegations(prev => [{
                                    id: `del-${Date.now()}`, delegator: EMPLOYEES[0], delegate: emp,
                                    scope_type: form.scope_type,
                                    scope_filter: form.scope_type === "category"
                                        ? { categories: form.categories, max_priority: form.max_priority || undefined }
                                        : form.scope_type === "department" ? { departments: form.departments }
                                            : form.scope_type === "approval_level"
                                                ? { approval_levels: form.approval_levels, exclude: form.exclude_budget ? ["budget_above_50k"] : undefined }
                                                : {},
                                    reason: form.reason, start_date: form.start_date, end_date: form.end_date,
                                    status: form.requires_acceptance ? "pending_acceptance" : "active",
                                    requires_acceptance: form.requires_acceptance, accepted: !form.requires_acceptance,
                                    stats: { total: 0, completed: 0, pending: 0, approvals_granted: 0, approvals_rejected: 0 },
                                    activities: [
                                        { type: "created", actor: "Khalid Al-Rashidi", time: "Just now", detail: `Created delegation for ${REASON_LABELS[form.reason].toLowerCase()}` }
                                    ]
                                }, ...prev]);
                                showToast("Delegation created successfully");
                            }}
                        />
                    )}

                    {selectedDel && (
                        <DelegationDetail
                            delegation={selectedDel}
                            onClose={() => setSelectedDel(null)}
                            onRevoke={(id) => {
                                setDelegations(prev => prev.map(d => d.id === id ? { ...d, status: "revoked" } : d));
                                setSelectedDel(null);
                                showToast("Delegation revoked");
                            }}
                        />
                    )}

                    {/* Toast */}
                    {toast && (
                        <div style={{
                            position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)",
                            padding: "12px 24px", borderRadius: 10, zIndex: 2000,
                            background: "#1E293B", border: "1px solid rgba(34,197,94,0.3)",
                            fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 500,
                            color: "#22C55E", boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                            animation: "slideUp 0.3s ease-out"
                        }}>
                            ✓ {toast}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
