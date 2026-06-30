'use client';

import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   DESIGN TOKENS
   ═══════════════════════════════════════════ */
const F = { sans: "'DM Sans',sans-serif", mono: "'JetBrains Mono',monospace" };
const C = {
    bg: "#080B12", s1: "#0D1117", s2: "#131922", s3: "#1A2130",
    bdr: "rgba(255,255,255,0.06)", tx: "#E2E8F0", txm: "#94A3B8", txd: "#64748B", txf: "#475569",
    blue: "#2563EB", bl: "#60A5FA", bbg: "rgba(37,99,235,0.08)",
    grn: "#22C55E", gbg: "rgba(34,197,94,0.08)",
    amb: "#F59E0B", abg: "rgba(245,158,11,0.08)",
    red: "#EF4444", rbg: "rgba(239,68,68,0.08)",
    pur: "#8B5CF6", pbg: "rgba(139,92,246,0.08)",
    cyn: "#06B6D4",
};

const CHANNELS = {
    whatsapp: { label: "WhatsApp", color: "#25D366", icon: "WA" },
    web: { label: "Web Widget", color: C.bl, icon: "WB" },
    email: { label: "Email", color: C.amb, icon: "EM" },
};

const SENTIMENTS = {
    positive: { label: "Positive", color: C.grn, icon: "↑" },
    neutral: { label: "Neutral", color: C.txd, icon: "—" },
    frustrated: { label: "Frustrated", color: C.amb, icon: "↓" },
    angry: { label: "Angry", color: C.red, icon: "⚠" },
};

/* ═══════════════════════════════════════════
   CONVERSATION DATA
   ═══════════════════════════════════════════ */
const CONVERSATIONS = [
    {
        id: "c1",
        customer: { name: "Mohammed Ali", company: "Al-Rajhi Construction", avatar: "MA", tier: "Enterprise", since: "2024", tickets: 14, csat: 4.2 },
        channel: "whatsapp", priority: "P1", status: "active", handler: "human", handlerName: "Fatima",
        sentiment: "frustrated", category: "Network", queue: "IT-RUH",
        unread: 2, waitTime: null, lastActivity: "2m ago",
        linkedTicket: "TKT-4511",
        preview: "I still can't send emails to any external address. This has been going on for almost an hour now.",
        messages: [
            { id: 1, from: "customer", text: "Hi, I'm having trouble sending emails to external addresses. Getting bounce backs.", ts: "10:02 AM", read: true },
            { id: 2, from: "ai", agent: "Atlas", text: "Hello Mohammed. I'm Atlas, your support assistant. Let me look into this for you. Can you confirm — are you receiving emails from external addresses, or is it only outbound that's affected?", ts: "10:02 AM", read: true, auto: true },
            { id: 3, from: "customer", text: "Only outbound. I can receive fine. But nothing goes out to gmail, outlook, anything external.", ts: "10:04 AM", read: true },
            { id: 4, from: "ai", agent: "Atlas", text: "Thank you. I've identified this as a P1 email delivery issue affecting outbound to external domains. I'm creating a ticket and routing to our network specialist immediately.", ts: "10:04 AM", read: true, auto: true, systemNote: "Created TKT-4511 · Classified P1 Network · Routed to IT-RUH" },
            { id: 5, from: "system", text: "Conversation handed off to Fatima Hassan (Senior IT Analyst)", ts: "10:05 AM", handoff: true },
            { id: 6, from: "agent", name: "Fatima", text: "Hi Mohammed, I'm Fatima from the IT team. I can see the issue — I'm checking our MX relay and SPF records now. Can you tell me roughly when this started?", ts: "10:07 AM", read: true },
            { id: 7, from: "customer", text: "Around 9 AM I think. A few of us noticed it at the same time.", ts: "10:08 AM", read: true },
            { id: 8, from: "agent", name: "Fatima", text: "Got it. SPF and DKIM look fine on our end. The relay is throwing 4xx errors on outbound. I've escalated to our NOC team for the relay logs. I'll update you as soon as I have more.", ts: "10:22 AM", read: true },
            { id: 9, from: "customer", text: "Any update? We have contracts going out today that need to be emailed.", ts: "10:40 AM", read: false },
            { id: 10, from: "customer", text: "I still can't send emails to any external address. This has been going on for almost an hour now.", ts: "10:42 AM", read: false },
        ],
        aiSuggestions: {
            draft: "I understand the urgency, Mohammed. The NOC team has identified the relay issue — it's a configuration change from our hosting provider that affected outbound routing. They're applying the fix now. I expect email delivery to resume within the next 15-20 minutes. I'll confirm as soon as it's resolved.",
            kbArticles: [
                { id: "KB-392", title: "Email Relay Troubleshooting — 4xx Errors", match: 94 },
                { id: "KB-218", title: "SPF/DKIM Verification Steps", match: 78 },
            ],
            sentiment: "Customer frustration increasing — 2 follow-ups in 2 minutes. Recommend immediate response with ETA.",
            quickActions: ["Share ETA", "Escalate to Manager", "Offer workaround"],
        }
    },
    {
        id: "c2",
        customer: { name: "Layla Qasim", company: "Internal — Finance Dept", avatar: "LQ", tier: "Employee", since: "2025", tickets: 3, csat: 4.8 },
        channel: "whatsapp", priority: "P4", status: "resolved", handler: "ai", handlerName: "Resolver",
        sentiment: "positive", category: "Hardware", queue: "IT-RUH",
        unread: 0, waitTime: null, lastActivity: "5m ago",
        linkedTicket: "TKT-4512",
        preview: "Yes that fixed it! Thank you so much, very quick help 👍",
        messages: [
            { id: 1, from: "customer", text: "Hi, my monitor keeps flickering. It's the one on desk 4B-12.", ts: "10:35 AM", read: true },
            { id: 2, from: "ai", agent: "Atlas", text: "Hi Layla! I'm looking into this. A flickering monitor on desk 4B-12 — let me check if we have a known fix for this.", ts: "10:35 AM", read: true, auto: true, systemNote: "Classified P4 Hardware → Display · Routing to Resolver" },
            { id: 3, from: "ai", agent: "Resolver", text: "I found a solution that works for most flickering issues. Could you try these steps?\n\n1. Right-click on the desktop → Display Settings\n2. Scroll to Advanced Display → Refresh Rate\n3. Change from 60Hz to 59Hz, then back to 60Hz\n4. Click Apply\n\nThis resets the display signal and usually stops the flickering. Let me know if it helps!", ts: "10:35 AM", read: true, auto: true, systemNote: "Matched KB-218 · Confidence 94% · Auto-resolving (P4 threshold met)" },
            { id: 4, from: "customer", text: "Let me try that...", ts: "10:36 AM", read: true },
            { id: 5, from: "customer", text: "Yes that fixed it! Thank you so much, very quick help 👍", ts: "10:37 AM", read: true },
            { id: 6, from: "ai", agent: "Resolver", text: "Glad to hear it! 🎉 I've closed the ticket. If the flickering comes back or you need anything else, just message here anytime. Have a great day, Layla!", ts: "10:37 AM", read: true, auto: true, systemNote: "Ticket resolved · CSAT: Positive · Handle time: 2m 14s" },
        ],
        aiSuggestions: null,
    },
    {
        id: "c3",
        customer: { name: "Yousef Rahman", company: "Internal — Procurement", avatar: "YR", tier: "Employee", since: "2023", tickets: 8, csat: 3.9 },
        channel: "web", priority: "P2", status: "waiting_approval", handler: "ai_paused", handlerName: "Resolver",
        sentiment: "neutral", category: "Software", queue: "IT-RUH",
        unread: 0, waitTime: "12m", lastActivity: "12m ago",
        linkedTicket: "TKT-4505",
        preview: "Waiting for your team to unlock it. I have a PO that needs processing.",
        messages: [
            { id: 1, from: "customer", text: "Hi, my SAP account got locked. I reset my password yesterday and now it's completely locked out after 3 tries.", ts: "8:15 AM", read: true },
            { id: 2, from: "ai", agent: "Atlas", text: "Hi Yousef. I can see your SAP account (YR-2847) is in a locked state. Let me get this sorted for you.", ts: "8:15 AM", read: true, auto: true, systemNote: "Classified P2 Software → SAP → Account Access" },
            { id: 3, from: "ai", agent: "Resolver", text: "I've found the resolution — your account needs an admin unlock through the SAP console. However, this action requires approval from our IT team before I can proceed. I've submitted the request — it should be reviewed shortly.", ts: "8:16 AM", read: true, auto: true, systemNote: "Runbook RB-045 identified · HITL required per GOV-012 · Approval sent to Fatima Hassan", governance: true },
            { id: 4, from: "customer", text: "Okay, how long will that take?", ts: "8:18 AM", read: true },
            { id: 5, from: "ai", agent: "Resolver", text: "Typically under 30 minutes. I'll let you know the moment it's done. Is there anything else I can help with while we wait?", ts: "8:18 AM", read: true, auto: true },
            { id: 6, from: "customer", text: "No that's it. Just need to get into SAP. I have a PO that needs processing.", ts: "8:20 AM", read: true },
            { id: 7, from: "customer", text: "Waiting for your team to unlock it. I have a PO that needs processing.", ts: "8:30 AM", read: true },
        ],
        aiSuggestions: {
            draft: "Good news, Yousef — your SAP account unlock has been approved and is being processed now. You should be able to log in within the next 2-3 minutes. Please try and let me know if it works.",
            kbArticles: [
                { id: "KB-045", title: "SAP Account Unlock Procedure", match: 98 },
            ],
            sentiment: "Customer is patient but has business urgency (PO processing). Prioritize fast resolution.",
            quickActions: ["Check approval status", "Nudge approver", "Offer temp workaround"],
            hitlStatus: { action: "SAP Account Unlock via Admin Console", policy: "GOV-012", approver: "Fatima Hassan", status: "pending", waitTime: "12m" },
        }
    },
    {
        id: "c4",
        customer: { name: "Tariq Shaheen", company: "Shaheen Trading LLC", avatar: "TS", tier: "Business", since: "2024", tickets: 6, csat: 4.5 },
        channel: "email", priority: "P2", status: "active", handler: "human", handlerName: "Nadia",
        sentiment: "neutral", category: "ZATCA", queue: "FIN-COMP",
        unread: 0, waitTime: null, lastActivity: "1h ago",
        linkedTicket: "TKT-4502",
        preview: "Can you check invoice batch #2847? ZATCA rejected it again.",
        messages: [
            { id: 1, from: "customer", text: "Subject: ZATCA E-Invoice Rejection — Batch #2847\n\nHi team,\n\nOur latest invoice batch (#2847) was rejected by ZATCA during Phase 2 clearance. The error mentions XML schema validation but doesn't specify which field. Can someone look into this urgently? We need these invoices cleared before end of week.\n\nThanks,\nTariq", ts: "8:45 AM", read: true, isEmail: true },
            { id: 2, from: "ai", agent: "Atlas", text: "I've analyzed the ZATCA rejection. The error code ZAT-2201 typically relates to missing TaxCategory elements. Let me create a ticket and route to our compliance specialist.", ts: "8:45 AM", read: true, auto: true, systemNote: "Classified P2 ZATCA · Routed to FIN-COMP · Assigned Nadia Youssef" },
            { id: 3, from: "system", text: "Conversation assigned to Nadia Youssef (Finance Analyst)", ts: "8:46 AM", handoff: true },
            { id: 4, from: "agent", name: "Nadia", text: "Hi Tariq,\n\nI've pulled the rejected batch and identified the issue — zero-rated line items in 3 invoices are missing the TaxCategory code element, which is required in Phase 2 XML schema.\n\nI'm preparing a corrected batch now. Will have it resubmitted within the next 2 hours.\n\nBest,\nNadia", ts: "9:30 AM", read: true, isEmail: true },
        ],
        aiSuggestions: {
            draft: "Hi Tariq,\n\nUpdate on batch #2847 — the corrected invoices have been resubmitted to ZATCA. Clearance typically takes 15-30 minutes. I'll confirm once all invoices are cleared.\n\nBest,\nNadia",
            kbArticles: [
                { id: "KB-612", title: "ZATCA Phase 2 — Common Rejection Codes", match: 96 },
                { id: "KB-589", title: "TaxCategory XML Element Requirements", match: 91 },
            ],
            sentiment: "Business customer, professional tone. Standard ZATCA compliance issue.",
            quickActions: ["Resubmit batch", "Share ZATCA status", "Send corrected XML"],
        }
    },
    {
        id: "c5",
        customer: { name: "Amina Khalil", company: "Internal — HR", avatar: "AK", tier: "Employee", since: "2026", tickets: 1, csat: null },
        channel: "web", priority: "P3", status: "queued", handler: "ai", handlerName: "Atlas",
        sentiment: "neutral", category: "Onboarding", queue: "HR-OPS",
        unread: 1, waitTime: "1m", lastActivity: "1m ago",
        linkedTicket: null,
        preview: "Hi, I just joined last week. How do I enroll in the health insurance?",
        messages: [
            { id: 1, from: "customer", text: "Hi, I just joined last week. How do I enroll in the health insurance?", ts: "10:44 AM", read: false },
        ],
        aiSuggestions: {
            draft: "Welcome to the team, Amina! 🎉 For health insurance enrollment, here's what you need to do:\n\n1. Log into the HR portal (hr.apps4x.com)\n2. Go to My Benefits → Insurance Enrollment\n3. Choose your plan (Individual or Family)\n4. Upload your ID copy and any dependent documents\n5. Submit before the end of your first 30 days\n\nThe enrollment window closes on July 15 for you. Would you like me to walk you through any of these steps?",
            kbArticles: [
                { id: "KB-101", title: "New Joiner Benefits Enrollment Guide", match: 99 },
                { id: "KB-108", title: "Health Insurance Plan Comparison", match: 85 },
            ],
            sentiment: "New employee, first interaction. Set positive tone.",
            quickActions: ["Send enrollment link", "Transfer to HR", "Create onboarding ticket"],
            autoSendReady: true,
            autoSendConfidence: 97,
        }
    },
];

/* ═══════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════ */
const Av = ({ ini, size = 32, status, ai, channel }) => {
    const bg = ai ? "linear-gradient(135deg,#7C3AED,#2563EB)" : channel ? CHANNELS[channel]?.color || C.blue : "linear-gradient(135deg,#1E40AF,#2563EB)";
    return (
        <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
            <div style={{ width: size, height: size, borderRadius: ai ? "8px" : "50%", background: bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: ai ? F.mono : F.sans, fontSize: size * 0.34, fontWeight: 600, color: "#fff" }}>{ini}</div>
            {status && <div style={{ position: "absolute", bottom: -1, right: -1, width: size * 0.28, height: size * 0.28, borderRadius: "50%", background: status === "online" ? C.grn : status === "resolved" ? C.txd : C.amb, border: `2px solid ${C.bg}` }} />}
        </div>
    );
};

const ChannelBadge = ({ channel, small }) => {
    const ch = CHANNELS[channel];
    return <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: small ? "1px 5px" : "2px 7px", borderRadius: 4, background: `${ch.color}15`, border: `1px solid ${ch.color}30`, fontFamily: F.mono, fontSize: small ? 8 : 9, fontWeight: 600, color: ch.color }}>{ch.icon}</span>;
};

const SentimentDot = ({ sentiment, showLabel }) => {
    const s = SENTIMENTS[sentiment];
    return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 3 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color }} />
            {showLabel && <span style={{ fontFamily: F.mono, fontSize: 9, color: s.color }}>{s.label}</span>}
        </span>
    );
};

const GovBadge = ({ small }) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: small ? "1px 4px" : "2px 6px", borderRadius: 3, background: C.bbg, border: `1px solid ${C.blue}25`, fontFamily: F.mono, fontSize: small ? 7 : 9, fontWeight: 600, color: C.bl }}>
        <svg width={small ? 7 : 9} height={small ? 7 : 9} viewBox="0 0 16 16" fill="none"><path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" stroke={C.bl} strokeWidth="1.5" fill={`${C.blue}20`} /><path d="M5.5 8L7 9.5L10.5 6" stroke={C.bl} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        GOV
    </span>
);

/* ═══════════════════════════════════════════
   INBOX LIST
   ═══════════════════════════════════════════ */
function InboxList({ conversations, selected, onSelect, filter, onFilter }) {
    const counts = {
        all: conversations.length,
        active: conversations.filter(c => c.status === "active" || c.status === "waiting_approval").length,
        queued: conversations.filter(c => c.status === "queued").length,
        resolved: conversations.filter(c => c.status === "resolved").length,
    };

    const filtered = filter === "all" ? conversations
        : filter === "mine" ? conversations.filter(c => c.handler === "human")
            : filter === "ai" ? conversations.filter(c => c.handler === "ai" || c.handler === "ai_paused")
                : filter === "waiting" ? conversations.filter(c => c.status === "queued" || c.status === "waiting_approval")
                    : conversations;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            {/* Header */}
            <div style={{ padding: "14px 16px 10px", borderBottom: `1px solid ${C.bdr}`, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <h2 style={{ fontFamily: F.sans, fontSize: 17, fontWeight: 700, color: C.tx, margin: 0 }}>Inbox</h2>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontFamily: F.mono, fontSize: 11, fontWeight: 600, color: C.bl }}>{counts.active}</span>
                        <span style={{ fontFamily: F.sans, fontSize: 10, color: C.txd }}>active</span>
                        {counts.queued > 0 && <>
                            <span style={{ color: C.txf, fontSize: 8 }}>·</span>
                            <span style={{ fontFamily: F.mono, fontSize: 11, fontWeight: 600, color: C.amb }}>{counts.queued}</span>
                            <span style={{ fontFamily: F.sans, fontSize: 10, color: C.txd }}>waiting</span>
                        </>}
                    </div>
                </div>
                <div style={{ display: "flex", gap: 3, overflowX: "auto" }}>
                    {[["all", "All"], ["mine", "My Chats"], ["ai", "AI Handling"], ["waiting", "Waiting"]].map(([k, l]) => (
                        <button key={k} onClick={() => onFilter(k)} style={{ padding: "5px 11px", borderRadius: 6, border: "none", cursor: "pointer", fontFamily: F.sans, fontSize: 11, fontWeight: filter === k ? 600 : 400, background: filter === k ? C.bbg : C.s1, color: filter === k ? C.bl : C.txd, flexShrink: 0, transition: "all 0.15s" }}>{l}</button>
                    ))}
                </div>
            </div>

            {/* Conversation List */}
            <div style={{ flex: 1, overflowY: "auto" }}>
                {filtered.sort((a, b) => {
                    const po = { P1: 0, P2: 1, P3: 2, P4: 3 };
                    if (a.unread && !b.unread) return -1;
                    if (!a.unread && b.unread) return 1;
                    return (po[a.priority] || 9) - (po[b.priority] || 9);
                }).map(conv => {
                    const ch = CHANNELS[conv.channel];
                    const isActive = selected === conv.id;
                    const priC = conv.priority === "P1" ? C.red : conv.priority === "P2" ? C.amb : C.txd;
                    return (
                        <div key={conv.id} onClick={() => onSelect(conv.id)} style={{
                            display: "flex", gap: 12, padding: "14px 16px",
                            borderBottom: `1px solid ${C.bdr}`, cursor: "pointer",
                            background: isActive ? C.bbg : "transparent",
                            borderLeft: isActive ? `3px solid ${C.blue}` : "3px solid transparent",
                            transition: "all 0.15s"
                        }}>
                            <div style={{ position: "relative" }}>
                                <Av ini={conv.customer.avatar} size={40} status={conv.status === "resolved" ? "resolved" : conv.status === "queued" ? null : "online"} />
                                <div style={{ position: "absolute", top: -2, left: -2 }}><ChannelBadge channel={conv.channel} small /></div>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                                        <span style={{ fontFamily: F.sans, fontSize: 13, fontWeight: conv.unread ? 700 : 500, color: C.tx, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{conv.customer.name}</span>
                                        {conv.handler === "ai" || conv.handler === "ai_paused" ? <span style={{ fontFamily: F.mono, fontSize: 8, color: C.pur, padding: "1px 4px", borderRadius: 3, background: C.pbg, border: `1px solid ${C.pur}20` }}>AI</span> : null}
                                    </div>
                                    <span style={{ fontFamily: F.mono, fontSize: 9, color: conv.unread ? C.bl : C.txf, flexShrink: 0 }}>{conv.lastActivity}</span>
                                </div>
                                <div style={{ fontFamily: F.sans, fontSize: 12, color: conv.unread ? C.txm : C.txd, lineHeight: 1.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4 }}>{conv.preview}</div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                    <span style={{ fontFamily: F.mono, fontSize: 9, fontWeight: 600, color: priC }}>{conv.priority}</span>
                                    <span style={{ fontFamily: F.sans, fontSize: 9, color: C.txf }}>{conv.category}</span>
                                    <SentimentDot sentiment={conv.sentiment} />
                                    {conv.status === "waiting_approval" && <GovBadge small />}
                                    {conv.linkedTicket && <span style={{ fontFamily: F.mono, fontSize: 8, color: C.txf }}>{conv.linkedTicket}</span>}
                                </div>
                            </div>
                            {conv.unread > 0 && (
                                <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                                    <span style={{ width: 20, height: 20, borderRadius: "50%", background: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.mono, fontSize: 10, fontWeight: 700, color: "#fff" }}>{conv.unread}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   CHAT VIEW
   ═══════════════════════════════════════════ */
function ChatView({ conv, onBack }) {
    const [showContext, setShowContext] = useState(false);
    const [showAI, setShowAI] = useState(true);
    const [msg, setMsg] = useState("");
    const [usedDraft, setUsedDraft] = useState(false);
    const messagesEnd = useRef(null);

    useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [conv.id]);

    const ch = CHANNELS[conv.channel];
    const snt = SENTIMENTS[conv.sentiment];
    const sug = conv.aiSuggestions;

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", background: C.bg }}>
            {/* Chat Header */}
            <div style={{ padding: "10px 14px", borderBottom: `1px solid ${C.bdr}`, background: C.s1, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <button onClick={onBack} style={{ background: "none", border: "none", color: C.txm, cursor: "pointer", padding: 0, fontSize: 16 }}>←</button>
                    <Av ini={conv.customer.avatar} size={34} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 600, color: C.tx }}>{conv.customer.name}</span>
                            <ChannelBadge channel={conv.channel} small />
                            <SentimentDot sentiment={conv.sentiment} />
                        </div>
                        <div style={{ fontFamily: F.sans, fontSize: 10, color: C.txd }}>
                            {conv.customer.company}
                            {conv.linkedTicket && <span style={{ color: C.txf }}> · {conv.linkedTicket}</span>}
                        </div>
                    </div>
                    <button onClick={() => setShowContext(!showContext)} style={{ padding: "5px 9px", borderRadius: 6, background: showContext ? C.bbg : C.s2, border: `1px solid ${showContext ? C.blue + "30" : C.bdr}`, cursor: "pointer", fontFamily: F.mono, fontSize: 9, color: showContext ? C.bl : C.txd }}>
                        {showContext ? "✕" : "ℹ"}
                    </button>
                </div>

                {/* HITL Banner */}
                {conv.status === "waiting_approval" && sug?.hitlStatus && (
                    <div style={{ marginTop: 8, padding: "8px 10px", borderRadius: 6, background: C.abg, border: `1px solid ${C.amb}25`, display: "flex", alignItems: "center", gap: 6 }}>
                        <GovBadge small />
                        <span style={{ fontFamily: F.sans, fontSize: 10, color: C.amb, flex: 1 }}>
                            Waiting: <strong>{sug.hitlStatus.action}</strong> — {sug.hitlStatus.approver} ({sug.hitlStatus.waitTime})
                        </span>
                    </div>
                )}
            </div>

            {/* Customer Context Panel */}
            {showContext && (
                <div style={{ padding: "12px 14px", background: C.s2, borderBottom: `1px solid ${C.bdr}`, flexShrink: 0 }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                        {[[conv.customer.tier, "Tier"], [conv.customer.since, "Since"], [`${conv.customer.tickets}`, "Tickets"], [conv.customer.csat ? `${conv.customer.csat}/5` : "—", "CSAT"]].map(([v, l], i) => (
                            <div key={i} style={{ flex: 1, minWidth: 60, padding: "6px 8px", borderRadius: 6, background: C.s3, textAlign: "center" }}>
                                <div style={{ fontFamily: F.mono, fontSize: 12, fontWeight: 600, color: C.tx }}>{v}</div>
                                <div style={{ fontFamily: F.sans, fontSize: 8, color: C.txd }}>{l}</div>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <SentimentDot sentiment={conv.sentiment} showLabel />
                        <span style={{ fontFamily: F.sans, fontSize: 10, color: C.txd }}>· Queue: {conv.queue} · Handler: {conv.handlerName}</span>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
                {conv.messages.map(m => {
                    const isCustomer = m.from === "customer";
                    const isAI = m.from === "ai";
                    const isAgent = m.from === "agent";
                    const isSystem = m.from === "system";

                    if (isSystem || m.handoff) {
                        return (
                            <div key={m.id} style={{ display: "flex", justifyContent: "center", margin: "14px 0" }}>
                                <div style={{ padding: "5px 12px", borderRadius: 20, background: m.handoff ? C.bbg : C.s2, border: `1px solid ${m.handoff ? C.blue + "25" : C.bdr}`, fontFamily: F.sans, fontSize: 10, color: m.handoff ? C.bl : C.txd, textAlign: "center" }}>
                                    {m.handoff && <span style={{ marginRight: 4 }}>→</span>}
                                    {m.text}
                                </div>
                            </div>
                        );
                    }

                    return (
                        <div key={m.id} style={{ display: "flex", justifyContent: isCustomer ? "flex-start" : "flex-end", marginBottom: isAI || isAgent ? 4 : 10 }}>
                            <div style={{ maxWidth: "82%" }}>
                                {/* AI/Agent label */}
                                {(isAI || isAgent) && (
                                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 3, justifyContent: "flex-end" }}>
                                        {isAI && <span style={{ fontFamily: F.mono, fontSize: 8, color: C.pur, padding: "1px 5px", borderRadius: 3, background: C.pbg }}>AI · {m.agent}</span>}
                                        {isAgent && <span style={{ fontFamily: F.sans, fontSize: 9, color: C.grn }}>{m.name}</span>}
                                        {m.governance && <GovBadge small />}
                                    </div>
                                )}
                                {/* Bubble */}
                                <div style={{
                                    padding: "10px 14px", borderRadius: isCustomer ? "14px 14px 14px 4px" : "14px 14px 4px 14px",
                                    background: isCustomer ? C.s2 : isAI ? `${C.pur}12` : C.blue + "18",
                                    border: `1px solid ${isCustomer ? C.bdr : isAI ? C.pur + "20" : C.blue + "25"}`,
                                    fontFamily: F.sans, fontSize: 13, color: C.tx, lineHeight: 1.55,
                                    whiteSpace: "pre-wrap"
                                }}>
                                    {m.isEmail && <div style={{ fontFamily: F.mono, fontSize: 9, color: C.txf, marginBottom: 6, padding: "4px 8px", borderRadius: 4, background: C.s3 }}>📧 Email</div>}
                                    {m.text}
                                </div>
                                {/* System note */}
                                {m.systemNote && (
                                    <div style={{ marginTop: 3, padding: "3px 8px", borderRadius: 4, background: C.s1, border: `1px solid ${C.bdr}`, fontFamily: F.mono, fontSize: 9, color: C.txf, textAlign: "right" }}>
                                        {m.systemNote}
                                    </div>
                                )}
                                {/* Time */}
                                <div style={{ fontFamily: F.mono, fontSize: 9, color: C.txf, marginTop: 3, textAlign: isCustomer ? "left" : "right" }}>{m.ts}{!m.read && isCustomer && <span style={{ color: C.bl, marginLeft: 4 }}>●</span>}</div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEnd} />
            </div>

            {/* AI Co-pilot Panel */}
            {sug && showAI && !usedDraft && (
                <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.pur}20`, background: `${C.pur}06`, flexShrink: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <Av ini="AI" size={18} ai />
                            <span style={{ fontFamily: F.mono, fontSize: 10, fontWeight: 600, color: C.pur }}>CO-PILOT</span>
                            {sug.autoSendReady && <span style={{ fontFamily: F.mono, fontSize: 8, color: C.grn, padding: "1px 5px", borderRadius: 3, background: C.gbg, border: `1px solid ${C.grn}20` }}>{sug.autoSendConfidence}% confident</span>}
                        </div>
                        <button onClick={() => setShowAI(false)} style={{ background: "none", border: "none", color: C.txf, cursor: "pointer", fontSize: 12, padding: 0 }}>✕</button>
                    </div>

                    {/* Sentiment note */}
                    {sug.sentiment && (
                        <div style={{ fontFamily: F.sans, fontSize: 10, color: C.amb, marginBottom: 8, padding: "4px 8px", borderRadius: 4, background: C.abg, border: `1px solid ${C.amb}15` }}>
                            {sug.sentiment}
                        </div>
                    )}

                    {/* Draft suggestion */}
                    {sug.draft && (
                        <div style={{ marginBottom: 8 }}>
                            <div style={{ fontFamily: F.sans, fontSize: 9, color: C.txd, marginBottom: 3 }}>Suggested response</div>
                            <div style={{ padding: "8px 10px", borderRadius: 8, background: C.s1, border: `1px solid ${C.pur}15`, fontFamily: F.sans, fontSize: 11, color: C.txm, lineHeight: 1.5, maxHeight: 80, overflowY: "auto", whiteSpace: "pre-wrap" }}>{sug.draft}</div>
                            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                                <button onClick={() => { setMsg(sug.draft); setUsedDraft(true); setShowAI(false); }} style={{ flex: 1, padding: "7px", borderRadius: 6, border: "none", cursor: "pointer", background: C.pur, fontFamily: F.sans, fontSize: 11, fontWeight: 600, color: "#fff" }}>Use Draft</button>
                                <button onClick={() => { setMsg(sug.draft); setUsedDraft(true); setShowAI(false); }} style={{ flex: 1, padding: "7px", borderRadius: 6, border: `1px solid ${C.pur}30`, cursor: "pointer", background: C.pbg, fontFamily: F.sans, fontSize: 11, fontWeight: 500, color: C.pur }}>Edit First</button>
                            </div>
                        </div>
                    )}

                    {/* KB Articles */}
                    {sug.kbArticles && sug.kbArticles.length > 0 && (
                        <div style={{ marginBottom: 6 }}>
                            <div style={{ fontFamily: F.sans, fontSize: 9, color: C.txd, marginBottom: 3 }}>Related KB</div>
                            <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                                {sug.kbArticles.map(kb => (
                                    <span key={kb.id} style={{ padding: "3px 8px", borderRadius: 4, fontFamily: F.mono, fontSize: 9, background: C.s1, border: `1px solid ${C.bdr}`, color: C.txm, cursor: "pointer" }}>{kb.id} <span style={{ color: C.grn }}>{kb.match}%</span></span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick actions */}
                    {sug.quickActions && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                            {sug.quickActions.map(a => (
                                <button key={a} style={{ padding: "4px 10px", borderRadius: 5, border: `1px solid ${C.bdr}`, background: C.s1, cursor: "pointer", fontFamily: F.sans, fontSize: 10, color: C.txm }}>{a}</button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Composer */}
            <div style={{ padding: "10px 14px", borderTop: `1px solid ${C.bdr}`, background: C.s1, flexShrink: 0 }}>
                {!showAI && sug && !usedDraft && (
                    <button onClick={() => setShowAI(true)} style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8, padding: "4px 8px", borderRadius: 4, border: "none", cursor: "pointer", background: C.pbg, fontFamily: F.mono, fontSize: 9, color: C.pur }}>
                        <Av ini="AI" size={14} ai /> Show Co-pilot suggestions
                    </button>
                )}
                <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        <textarea
                            value={msg} onChange={e => setMsg(e.target.value)}
                            placeholder={conv.status === "resolved" ? "Conversation resolved" : "Type a message..."}
                            disabled={conv.status === "resolved"}
                            rows={msg.split("\n").length > 3 ? 3 : Math.max(1, msg.split("\n").length)}
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 10, background: C.s2, border: `1px solid ${C.bdr}`, color: C.tx, fontFamily: F.sans, fontSize: 13, resize: "none", outline: "none", lineHeight: 1.4, boxSizing: "border-box" }}
                        />
                    </div>
                    <button disabled={!msg.trim() || conv.status === "resolved"} style={{ width: 40, height: 40, borderRadius: 10, border: "none", cursor: msg.trim() ? "pointer" : "not-allowed", background: msg.trim() ? C.blue : `${C.blue}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, opacity: msg.trim() ? 1 : 0.4 }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                    </button>
                </div>
                {/* Channel indicator */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <ChannelBadge channel={conv.channel} small />
                        <span style={{ fontFamily: F.sans, fontSize: 9, color: C.txf }}>Replying via {ch.label}</span>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                        <button style={{ padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.bdr}`, background: C.s2, cursor: "pointer", fontFamily: F.sans, fontSize: 9, color: C.txd }}>📎</button>
                        <button style={{ padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.bdr}`, background: C.s2, cursor: "pointer", fontFamily: F.sans, fontSize: 9, color: C.txd }}>⚡ Quick</button>
                        <button style={{ padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.bdr}`, background: C.s2, cursor: "pointer", fontFamily: F.sans, fontSize: 9, color: C.txd }}>📝 Note</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════
   LEFT RAIL (CROSS-MODULE SHELL)
   ═══════════════════════════════════════════ */
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
    // Dark theme tokens from helpdesk
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
            width: 76, background: railBg, borderRight: `1px solid ${line}`,
            display: "flex", flexDirection: "column", alignItems: "center",
            padding: "20px 0", gap: 6, flexShrink: 0,
            fontFamily: F.sans, zIndex: 10
        }}>
            <div style={{
                width: 38, height: 38, borderRadius: 10, marginBottom: 18,
                background: `linear-gradient(135deg, ${govern}, ${intel})`,
                display: "grid", placeItems: "center",
                fontWeight: 700, fontSize: 16, color: "#fff",
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

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function SupportChatInbox() {
    const [selected, setSelected] = useState(null);
    const [filter, setFilter] = useState("all");

    const conv = selected ? CONVERSATIONS.find(c => c.id === selected) : null;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.06); border-radius:2px; }
        textarea:focus { border-color:${C.blue}50 !important; }
      `}</style>

            <div style={{ display: "flex", height: "100vh", width: "100%", background: C.bg, overflow: "hidden" }}>
                <Rail active="inbox" />

                <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: F.sans, overflow: "hidden" }}>
                    {/* Top bar */}
                    {!conv && (
                        <div style={{ padding: "10px 16px", borderBottom: `1px solid ${C.bdr}`, background: C.s1, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                            <div style={{ width: 26, height: 26, borderRadius: 6, background: "linear-gradient(135deg,#2563EB,#7C3AED)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" stroke="#fff" strokeWidth="1.5" fill="rgba(255,255,255,0.15)" /></svg>
                            </div>
                            <div>
                                <span style={{ fontFamily: F.sans, fontSize: 14, fontWeight: 700, color: C.tx }}>ClarityDesk</span>
                                <span style={{ fontFamily: F.mono, fontSize: 9, color: C.txf, marginLeft: 6, letterSpacing: "0.05em" }}>SUPPORT INBOX</span>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    <div style={{ flex: 1, overflow: "hidden" }}>
                        {!conv ? (
                            <InboxList conversations={CONVERSATIONS} selected={selected} onSelect={setSelected} filter={filter} onFilter={setFilter} />
                        ) : (
                            <ChatView conv={conv} onBack={() => setSelected(null)} />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
