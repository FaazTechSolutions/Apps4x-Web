"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════
   MOCK DATA
   ═══════════════════════════════════════════ */

const AGENTS = [
  { id:"a1", name:"Fatima Hassan", initials:"FH", role:"Senior IT Analyst", dept:"IT", status:"online", shift:"08:00–17:00", shiftEnd:"17:00", open:5, capacity:8, resolved_today:7, avg_response:"12m", avg_resolution:"2.4h", sla_compliance:96, skills:["SAP FICO","Network","API Integration"], queues:["q1","q3"] },
  { id:"a2", name:"Omar Bakr", initials:"OB", role:"IT Support Specialist", dept:"IT", status:"online", shift:"08:00–17:00", shiftEnd:"17:00", open:7, capacity:8, resolved_today:4, avg_response:"18m", avg_resolution:"3.1h", sla_compliance:88, skills:["Hardware","Desktop","Windows"], queues:["q1"] },
  { id:"a3", name:"Ahmed Noor", initials:"AN", role:"GRO Supervisor", dept:"Operations", status:"on_break", shift:"08:00–17:00", shiftEnd:"17:00", open:3, capacity:6, resolved_today:5, avg_response:"8m", avg_resolution:"1.8h", sla_compliance:100, skills:["GOSI","Qiwa","Iqama","Muqeem"], queues:["q2","q4"] },
  { id:"a4", name:"Sara Al-Dosari", initials:"SA", role:"HR Coordinator", dept:"HR", status:"online", shift:"08:00–17:00", shiftEnd:"17:00", open:4, capacity:7, resolved_today:6, avg_response:"15m", avg_resolution:"2.0h", sla_compliance:92, skills:["Onboarding","Benefits","Leave Mgmt"], queues:["q2"] },
  { id:"a5", name:"Khalid Al-Rashidi", initials:"KR", role:"IT Support Manager", dept:"IT", status:"on_leave", shift:"—", shiftEnd:"—", open:0, capacity:6, resolved_today:0, avg_response:"—", avg_resolution:"—", sla_compliance:0, skills:["SAP","Network","Security"], queues:["q1","q3"] },
  { id:"a6", name:"Nadia Youssef", initials:"NY", role:"Finance Analyst", dept:"Finance", status:"online", shift:"09:00–18:00", shiftEnd:"18:00", open:2, capacity:5, resolved_today:3, avg_response:"10m", avg_resolution:"1.5h", sla_compliance:100, skills:["ZATCA","Invoicing","Budget"], queues:["q3"] },
  { id:"a7", name:"Tariq Mahmoud", initials:"TM", role:"Facilities Coordinator", dept:"Operations", status:"offline", shift:"14:00–23:00", shiftEnd:"23:00", open:0, capacity:6, resolved_today:0, avg_response:"—", avg_resolution:"—", sla_compliance:0, skills:["Facilities","Procurement","HVAC"], queues:["q4"] },
];

const QUEUES = [
  { id:"q1", name:"IT Support — Riyadh", code:"IT-RUH", dept:"IT", location:"Riyadh", strategy:"skill_match", owner:"a1",
    health:{ unassigned:3, avg_wait:"6m", sla_response:94, sla_resolution:89, utilization:78 },
    members:["a1","a2","a5"], calendar:"Saudi Business (Sun–Thu)",
    config:{ max_per_agent:8, ack_timeout:15, overflow:"backup_queue", overflow_target:"IT Support — All Regions", priority_order:"sla_deadline" },
    tickets:[
      { id:"TKT-4501", subject:"VPN not connecting from branch office", priority:"P1", status:"in_progress", assignee:"a1", category:"Network", sla_status:"healthy", sla_remaining:"3h 12m", created:"32m ago" },
      { id:"TKT-4498", subject:"New laptop setup for onboarding", priority:"P3", status:"assigned", assignee:"a2", category:"Hardware", sla_status:"healthy", sla_remaining:"6h 45m", created:"1h ago" },
      { id:"TKT-4505", subject:"SAP login locked after password reset", priority:"P2", status:"in_progress", assignee:"a1", category:"Software", sla_status:"warning", sla_remaining:"48m", created:"2h ago" },
      { id:"TKT-4510", subject:"Printer on 3rd floor not responding", priority:"P3", status:"queued", assignee:null, category:"Hardware", sla_status:"healthy", sla_remaining:"7h 30m", created:"15m ago" },
      { id:"TKT-4511", subject:"Email delivery failing to external domains", priority:"P1", status:"queued", assignee:null, category:"Network", sla_status:"warning", sla_remaining:"22m", created:"38m ago" },
      { id:"TKT-4512", subject:"Monitor flickering intermittently", priority:"P4", status:"queued", assignee:null, category:"Hardware", sla_status:"healthy", sla_remaining:"23h", created:"5m ago" },
    ]
  },
  { id:"q2", name:"HR Operations", code:"HR-OPS", dept:"HR", location:"All Regions", strategy:"round_robin", owner:"a4",
    health:{ unassigned:1, avg_wait:"4m", sla_response:97, sla_resolution:93, utilization:52 },
    members:["a3","a4"], calendar:"Saudi Business (Sun–Thu)",
    config:{ max_per_agent:7, ack_timeout:20, overflow:"escalate_owner", overflow_target:null, priority_order:"priority_first" },
    tickets:[
      { id:"TKT-4490", subject:"Annual leave balance discrepancy", priority:"P2", status:"in_progress", assignee:"a4", category:"Leave", sla_status:"healthy", sla_remaining:"4h", created:"3h ago" },
      { id:"TKT-4507", subject:"Iqama renewal for 12 workers — Jeddah site", priority:"P1", status:"in_progress", assignee:"a3", category:"Compliance", sla_status:"healthy", sla_remaining:"5h 20m", created:"1h ago" },
      { id:"TKT-4513", subject:"Benefits enrollment for new joiner", priority:"P3", status:"queued", assignee:null, category:"Benefits", sla_status:"healthy", sla_remaining:"11h", created:"10m ago" },
    ]
  },
  { id:"q3", name:"Finance & Compliance", code:"FIN-COMP", dept:"Finance", location:"Riyadh", strategy:"least_load", owner:"a6",
    health:{ unassigned:0, avg_wait:"3m", sla_response:100, sla_resolution:97, utilization:40 },
    members:["a1","a6"], calendar:"Saudi Business (Sun–Thu)",
    config:{ max_per_agent:5, ack_timeout:30, overflow:"hold_alert", overflow_target:null, priority_order:"sla_deadline" },
    tickets:[
      { id:"TKT-4502", subject:"ZATCA e-invoice rejection — Phase 2 format", priority:"P2", status:"in_progress", assignee:"a6", category:"ZATCA", sla_status:"healthy", sla_remaining:"5h", created:"2h ago" },
      { id:"TKT-4509", subject:"Budget approval for Q3 hardware refresh", priority:"P2", status:"pending_approval", assignee:"a1", category:"Budget", sla_status:"healthy", sla_remaining:"22h", created:"45m ago" },
    ]
  },
  { id:"q4", name:"Facilities — Emergency", code:"FAC-EMR", dept:"Operations", location:"All Regions", strategy:"ai_routed", owner:"a3",
    health:{ unassigned:0, avg_wait:"2m", sla_response:100, sla_resolution:95, utilization:25 },
    members:["a3","a7"], calendar:"24/7 Operations",
    config:{ max_per_agent:6, ack_timeout:5, overflow:"auto_expand", overflow_target:"All Operations Staff", priority_order:"sla_deadline" },
    tickets:[
      { id:"TKT-4514", subject:"AC unit failure — server room B2", priority:"P1", status:"in_progress", assignee:"a3", category:"Facilities", sla_status:"warning", sla_remaining:"35m", created:"25m ago" },
    ]
  },
];

const STRATEGY_META = {
  round_robin: { label:"Round Robin", icon:"↻", color:"#38BDF8", desc:"Sequential rotation through members" },
  weighted_round_robin: { label:"Weighted RR", icon:"⚖", color:"#A78BFA", desc:"Weighted sequential rotation" },
  least_load: { label:"Least Load", icon:"◎", color:"#34D399", desc:"Assign to member with fewest open tickets" },
  skill_match: { label:"Skill Match", icon:"◈", color:"#FB923C", desc:"Match ticket skills to agent expertise" },
  manual_pick: { label:"Manual Pick", icon:"✋", color:"#F472B6", desc:"Agents self-select from queue" },
  ai_routed: { label:"AI Routed", icon:"◆", color:"#818CF8", desc:"AI selects optimal agent with reasoning trace" },
};

const AGENT_STATUS = {
  online: { label:"Online", color:"#22C55E", bg:"rgba(34,197,94,0.1)" },
  on_break: { label:"On Break", color:"#F59E0B", bg:"rgba(245,158,11,0.1)" },
  on_leave: { label:"On Leave", color:"#EF4444", bg:"rgba(239,68,68,0.1)" },
  offline: { label:"Offline", color:"#475569", bg:"rgba(71,85,105,0.1)" },
};

const SLA_COLORS = { healthy:"#22C55E", warning:"#F59E0B", breaching:"#EF4444", breached:"#DC2626" };
const PRIORITY_COLORS = { P1:"#EF4444", P2:"#F59E0B", P3:"#3B82F6", P4:"#64748B" };

/* ═══════════════════════════════════════════
   REUSABLE COMPONENTS
   ═══════════════════════════════════════════ */

const font = { sans:"'DM Sans',sans-serif", mono:"'JetBrains Mono',monospace" };

function Avatar({ initials, size=32, status }) {
  const sc = AGENT_STATUS[status];
  return (
    <div style={{ position:"relative", width:size, height:size, flexShrink:0 }}>
      <div style={{ width:size, height:size, borderRadius:"50%", background:"linear-gradient(135deg,#1E40AF,#2563EB)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:font.sans, fontSize:size*0.33, fontWeight:600, color:"#fff", letterSpacing:"0.02em" }}>{initials}</div>
      {status && <div style={{ position:"absolute", bottom:-1, right:-1, width:size*0.3, height:size*0.3, borderRadius:"50%", background:sc?.color||"#475569", border:"2px solid #0B0F17" }} />}
    </div>
  );
}

function Badge({ label, color, bg, border, mono }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"3px 9px", borderRadius:5, background:bg||`${color}15`, border:`1px solid ${border||color+"40"}`, fontFamily:mono?font.mono:font.sans, fontSize:11, fontWeight:500, color, letterSpacing:"0.02em", whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

function GovBadge() {
  return <Badge label="⛉ Governed" color="#3B82F6" bg="rgba(37,99,235,0.08)" border="rgba(37,99,235,0.2)" mono />;
}

function CapacityBar({ current, max, color, height=6, showLabel }) {
  const pct = max > 0 ? Math.min((current/max)*100,100) : 0;
  const barColor = pct > 90 ? "#EF4444" : pct > 70 ? "#F59E0B" : color || "#22C55E";
  return (
    <div style={{ flex:1 }}>
      <div style={{ width:"100%", height, borderRadius:height/2, background:"rgba(255,255,255,0.06)", overflow:"hidden" }}>
        <div style={{ width:`${pct}%`, height:"100%", borderRadius:height/2, background:barColor, transition:"width 0.6s cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
      {showLabel && <div style={{ fontFamily:font.mono, fontSize:10, color:"#64748B", marginTop:3 }}>{current}/{max} ({Math.round(pct)}%)</div>}
    </div>
  );
}

function SLAPulse({ status }) {
  const c = SLA_COLORS[status] || SLA_COLORS.healthy;
  return (
    <span style={{ display:"inline-block", position:"relative", width:8, height:8 }}>
      <span style={{ position:"absolute", inset:0, borderRadius:"50%", background:c }} />
      {(status === "warning" || status === "breaching") && (
        <span className="sla-pulse" style={{ position:"absolute", inset:-3, borderRadius:"50%", border:`2px solid ${c}`, opacity:0 }} />
      )}
    </span>
  );
}

function MetricTile({ label, value, sub, accent }) {
  return (
    <div style={{ flex:1, minWidth:0, padding:"10px 12px", borderRadius:8, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ fontFamily:font.mono, fontSize:20, fontWeight:700, color:accent||"#E2E8F0", lineHeight:1, letterSpacing:"-0.02em" }}>{value}</div>
      <div style={{ fontFamily:font.sans, fontSize:10, color:"#64748B", marginTop:4, letterSpacing:"0.02em" }}>{label}</div>
      {sub && <div style={{ fontFamily:font.mono, fontSize:9, color:"#475569", marginTop:2 }}>{sub}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   VIEWS
   ═══════════════════════════════════════════ */

function QueueCard({ queue, selected, onClick }) {
  const h = queue.health;
  const sm = STRATEGY_META[queue.strategy];
  const slaColor = h.sla_response >= 95 ? "#22C55E" : h.sla_response >= 85 ? "#F59E0B" : "#EF4444";
  return (
    <div onClick={onClick} style={{
      padding:"16px 18px", borderRadius:12, cursor:"pointer",
      background: selected ? "rgba(37,99,235,0.06)" : "rgba(255,255,255,0.015)",
      border: `1px solid ${selected ? "rgba(37,99,235,0.25)" : "rgba(255,255,255,0.05)"}`,
      transition:"all 0.2s"
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
        <div style={{ minWidth:0 }}>
          <div style={{ fontFamily:font.sans, fontSize:14, fontWeight:700, color:"#F1F5F9", lineHeight:1.3 }}>{queue.name}</div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4, flexWrap:"wrap" }}>
            <span style={{ fontFamily:font.mono, fontSize:10, color:"#475569" }}>{queue.code}</span>
            <span style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"2px 7px", borderRadius:4, background:`${sm.color}12`, border:`1px solid ${sm.color}30`, fontFamily:font.mono, fontSize:10, color:sm.color }}>{sm.icon} {sm.label}</span>
          </div>
        </div>
        {h.unassigned > 0 && (
          <div style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:6, background:h.unassigned>5?"rgba(239,68,68,0.1)":"rgba(245,158,11,0.1)", border:`1px solid ${h.unassigned>5?"rgba(239,68,68,0.25)":"rgba(245,158,11,0.25)"}` }}>
            <span style={{ fontFamily:font.mono, fontSize:14, fontWeight:700, color:h.unassigned>5?"#EF4444":"#F59E0B" }}>{h.unassigned}</span>
            <span style={{ fontFamily:font.sans, fontSize:10, color:"#94A3B8" }}>queued</span>
          </div>
        )}
      </div>

      <div style={{ display:"flex", gap:12, alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:4 }}>
          <SLAPulse status={h.sla_response>=95?"healthy":h.sla_response>=85?"warning":"breaching"} />
          <span style={{ fontFamily:font.mono, fontSize:12, fontWeight:600, color:slaColor }}>{h.sla_response}%</span>
          <span style={{ fontFamily:font.sans, fontSize:10, color:"#475569" }}>SLA</span>
        </div>
        <div style={{ flex:1 }}>
          <CapacityBar current={h.utilization} max={100} color="#3B82F6" height={4} />
        </div>
        <span style={{ fontFamily:font.mono, fontSize:10, color:"#64748B" }}>{h.utilization}%</span>
      </div>
    </div>
  );
}

function QueueDetail({ queue }) {
  const [tab, setTab] = useState("overview");
  const sm = STRATEGY_META[queue.strategy];
  const members = queue.members.map(id => AGENTS.find(a=>a.id===id)).filter(Boolean);
  const h = queue.health;
  const owner = AGENTS.find(a=>a.id===queue.owner);

  const tabStyle = (t) => ({
    padding:"8px 14px", borderRadius:"6px 6px 0 0", cursor:"pointer",
    fontFamily:font.sans, fontSize:12, fontWeight:500, border:"none",
    background: tab===t ? "rgba(255,255,255,0.04)" : "transparent",
    borderBottom: tab===t ? "2px solid #2563EB" : "2px solid transparent",
    color: tab===t ? "#E2E8F0" : "#64748B", transition:"all 0.15s"
  });

  return (
    <div>
      {/* Header */}
      <div style={{ padding:"18px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6, flexWrap:"wrap" }}>
          <h2 style={{ fontFamily:font.sans, fontSize:18, fontWeight:700, color:"#F1F5F9", margin:0 }}>{queue.name}</h2>
          {queue.strategy==="ai_routed" && <GovBadge />}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontFamily:font.mono, fontSize:10, color:"#475569" }}>{queue.code}</span>
          <span style={{ color:"#1E293B" }}>·</span>
          <span style={{ display:"inline-flex", alignItems:"center", gap:4, fontFamily:font.mono, fontSize:10, color:sm.color }}>{sm.icon} {sm.label}</span>
          <span style={{ color:"#1E293B" }}>·</span>
          <span style={{ fontFamily:font.sans, fontSize:10, color:"#64748B" }}>{queue.location}</span>
          <span style={{ color:"#1E293B" }}>·</span>
          <span style={{ fontFamily:font.sans, fontSize:10, color:"#64748B" }}>{queue.calendar}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:"flex", gap:2, padding:"0 20px", borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
        {[["overview","Overview"],["tickets","Tickets"],["members","Members"],["config","Config"]].map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={tabStyle(k)}>{l}
            {k==="tickets" && <span style={{ marginLeft:5, fontFamily:font.mono, fontSize:10, padding:"1px 6px", borderRadius:8, background:tab===k?"rgba(37,99,235,0.15)":"rgba(255,255,255,0.04)", color:tab===k?"#60A5FA":"#475569" }}>{queue.tickets.length}</span>}
          </button>
        ))}
      </div>

      <div style={{ padding:"16px 20px" }}>
        {/* ── OVERVIEW ── */}
        {tab==="overview" && (
          <div>
            <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
              <MetricTile label="Unassigned" value={h.unassigned} accent={h.unassigned>3?"#F59E0B":"#E2E8F0"} />
              <MetricTile label="Avg Wait" value={h.avg_wait} accent="#38BDF8" />
              <MetricTile label="Response SLA" value={`${h.sla_response}%`} accent={h.sla_response>=95?"#22C55E":h.sla_response>=85?"#F59E0B":"#EF4444"} />
              <MetricTile label="Resolution SLA" value={`${h.sla_resolution}%`} accent={h.sla_resolution>=90?"#22C55E":"#F59E0B"} />
            </div>

            {/* Agent utilization in this queue */}
            <div style={{ fontFamily:font.sans, fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>Agent Load</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:20 }}>
              {members.map(m => {
                const st = AGENT_STATUS[m.status];
                return (
                  <div key={m.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:8, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                    <Avatar initials={m.initials} size={28} status={m.status} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
                        <span style={{ fontFamily:font.sans, fontSize:12, fontWeight:600, color:"#E2E8F0" }}>{m.name.split(" ")[0]}</span>
                        <span style={{ fontFamily:font.mono, fontSize:10, color:st.color }}>{st.label}</span>
                      </div>
                      <CapacityBar current={m.open} max={m.capacity} height={5} showLabel />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Strategy info */}
            <div style={{ padding:"14px 16px", borderRadius:10, background:`${sm.color}08`, border:`1px solid ${sm.color}20` }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
                <span style={{ fontFamily:font.mono, fontSize:16, color:sm.color }}>{sm.icon}</span>
                <span style={{ fontFamily:font.sans, fontSize:13, fontWeight:600, color:sm.color }}>{sm.label} Strategy</span>
              </div>
              <div style={{ fontFamily:font.sans, fontSize:12, color:"#94A3B8", lineHeight:1.5 }}>{sm.desc}</div>
              {queue.strategy==="ai_routed" && (
                <div style={{ marginTop:8, padding:"8px 10px", borderRadius:6, background:"rgba(37,99,235,0.06)", border:"1px solid rgba(37,99,235,0.15)", fontFamily:font.sans, fontSize:11, color:"#60A5FA" }}>
                  AI reasoning traces are logged for every assignment in this queue
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TICKETS ── */}
        {tab==="tickets" && (
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {queue.tickets.sort((a,b)=>{
              const po = {P1:0,P2:1,P3:2,P4:3};
              return (po[a.priority]||9)-(po[b.priority]||9);
            }).map(t => {
              const agent = t.assignee ? AGENTS.find(a=>a.id===t.assignee) : null;
              const slc = SLA_COLORS[t.sla_status];
              const pc = PRIORITY_COLORS[t.priority];
              return (
                <div key={t.id} style={{ padding:"12px 14px", borderRadius:8, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:8, marginBottom:8 }}>
                    <div style={{ minWidth:0 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                        <span style={{ fontFamily:font.mono, fontSize:10, color:"#475569" }}>{t.id}</span>
                        <span style={{ fontFamily:font.mono, fontSize:10, fontWeight:600, color:pc, padding:"1px 6px", borderRadius:3, background:`${pc}15`, border:`1px solid ${pc}30` }}>{t.priority}</span>
                        <span style={{ fontFamily:font.sans, fontSize:10, color:"#64748B" }}>{t.category}</span>
                      </div>
                      <div style={{ fontFamily:font.sans, fontSize:13, fontWeight:500, color:"#E2E8F0", lineHeight:1.4 }}>{t.subject}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                      <SLAPulse status={t.sla_status} />
                      <span style={{ fontFamily:font.mono, fontSize:11, fontWeight:600, color:slc }}>{t.sla_remaining}</span>
                    </div>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      {agent ? (
                        <>
                          <Avatar initials={agent.initials} size={20} status={agent.status} />
                          <span style={{ fontFamily:font.sans, fontSize:11, color:"#94A3B8" }}>{agent.name.split(" ")[0]}</span>
                        </>
                      ) : (
                        <span style={{ fontFamily:font.mono, fontSize:11, color:"#F59E0B", fontWeight:500 }}>⏳ Unassigned</span>
                      )}
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontFamily:font.sans, fontSize:10, color:"#475569" }}>{t.created}</span>
                      {!agent && (
                        <button style={{ padding:"4px 10px", borderRadius:5, background:"rgba(37,99,235,0.12)", border:"1px solid rgba(37,99,235,0.3)", color:"#60A5FA", fontFamily:font.sans, fontSize:10, fontWeight:600, cursor:"pointer" }}>Assign</button>
                      )}
                      {agent && (
                        <button style={{ padding:"4px 10px", borderRadius:5, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", color:"#94A3B8", fontFamily:font.sans, fontSize:10, fontWeight:500, cursor:"pointer" }}>Transfer</button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── MEMBERS ── */}
        {tab==="members" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
              <span style={{ fontFamily:font.sans, fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:"0.06em", textTransform:"uppercase" }}>{members.length} Members</span>
              <button style={{ padding:"6px 12px", borderRadius:6, background:"rgba(37,99,235,0.1)", border:"1px solid rgba(37,99,235,0.25)", color:"#60A5FA", fontFamily:font.sans, fontSize:11, fontWeight:600, cursor:"pointer" }}>+ Add Member</button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {members.map(m => {
                const st = AGENT_STATUS[m.status];
                const isOwner = m.id === queue.owner;
                return (
                  <div key={m.id} style={{ padding:"14px 16px", borderRadius:10, background:"rgba(255,255,255,0.02)", border:`1px solid ${isOwner?"rgba(37,99,235,0.2)":"rgba(255,255,255,0.05)"}` }}>
                    <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                      <Avatar initials={m.initials} size={36} status={m.status} />
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                          <span style={{ fontFamily:font.sans, fontSize:13, fontWeight:600, color:"#E2E8F0" }}>{m.name}</span>
                          {isOwner && <Badge label="Queue Owner" color="#3B82F6" mono />}
                        </div>
                        <div style={{ fontFamily:font.sans, fontSize:11, color:"#64748B" }}>{m.role}</div>
                      </div>
                      <Badge label={st.label} color={st.color} bg={st.bg} />
                    </div>
                    <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                      {m.skills.map(s=>(
                        <span key={s} style={{ padding:"2px 8px", borderRadius:4, fontFamily:font.mono, fontSize:10, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.07)", color:"#94A3B8" }}>{s}</span>
                      ))}
                    </div>
                    <div style={{ display:"flex", gap:16, alignItems:"center" }}>
                      <div style={{ flex:1 }}><CapacityBar current={m.open} max={m.capacity} height={5} showLabel /></div>
                      <div style={{ fontFamily:font.mono, fontSize:11 }}>
                        <span style={{ color:"#22C55E", fontWeight:600 }}>{m.resolved_today}</span>
                        <span style={{ color:"#475569" }}> resolved today</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CONFIG ── */}
        {tab==="config" && (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              ["Assignment Strategy", <span style={{ display:"flex", alignItems:"center", gap:5 }}><span style={{color:sm.color}}>{sm.icon}</span> {sm.label}</span>],
              ["Max Tickets/Agent", queue.config.max_per_agent],
              ["Ack Timeout", `${queue.config.ack_timeout} min`],
              ["Overflow Policy", queue.config.overflow.replace(/_/g," ")],
              ["Overflow Target", queue.config.overflow_target || "—"],
              ["Priority Ordering", queue.config.priority_order.replace(/_/g," ")],
              ["Business Calendar", queue.calendar],
              ["Queue Owner", owner?.name || "—"],
            ].map(([k,v], i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:8, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ fontFamily:font.sans, fontSize:12, color:"#64748B" }}>{k}</span>
                <span style={{ fontFamily:font.sans, fontSize:12, fontWeight:500, color:"#E2E8F0" }}>{v}</span>
              </div>
            ))}

            <div style={{ marginTop:8, padding:"14px 16px", borderRadius:10, background:"rgba(245,158,11,0.05)", border:"1px solid rgba(245,158,11,0.15)" }}>
              <div style={{ fontFamily:font.sans, fontSize:12, fontWeight:600, color:"#FBBF24", marginBottom:4 }}>Overflow Behavior</div>
              <div style={{ fontFamily:font.sans, fontSize:12, color:"#94A3B8", lineHeight:1.5 }}>
                {queue.config.overflow==="backup_queue" && `When all agents are at capacity or offline, tickets route to "${queue.config.overflow_target}". SLA clock continues.`}
                {queue.config.overflow==="escalate_owner" && `When the queue can't assign, the queue owner (${owner?.name}) is alerted to manually intervene.`}
                {queue.config.overflow==="hold_alert" && "Tickets hold in queue. Department head and ops dashboard receive an alert if unassigned count exceeds threshold."}
                {queue.config.overflow==="auto_expand" && `Agents from "${queue.config.overflow_target}" are temporarily added to this queue to absorb overflow.`}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AgentWorkloadView() {
  const sorted = [...AGENTS].sort((a,b) => {
    const so = {online:0,on_break:1,offline:2,on_leave:3};
    return (so[a.status]||9)-(so[b.status]||9);
  });

  return (
    <div style={{ padding:"16px 20px" }}>
      <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
        <MetricTile label="Online" value={AGENTS.filter(a=>a.status==="online").length} accent="#22C55E" />
        <MetricTile label="On Break" value={AGENTS.filter(a=>a.status==="on_break").length} accent="#F59E0B" />
        <MetricTile label="Total Open" value={AGENTS.reduce((s,a)=>s+a.open,0)} accent="#3B82F6" />
        <MetricTile label="Resolved Today" value={AGENTS.reduce((s,a)=>s+a.resolved_today,0)} accent="#22C55E" />
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {sorted.map(a => {
          const st = AGENT_STATUS[a.status];
          const queuesIn = QUEUES.filter(q=>q.members.includes(a.id));
          return (
            <div key={a.id} style={{ padding:"16px 18px", borderRadius:12, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.05)" }}>
              {/* Agent header */}
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <Avatar initials={a.initials} size={38} status={a.status} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span style={{ fontFamily:font.sans, fontSize:14, fontWeight:600, color:"#F1F5F9" }}>{a.name}</span>
                    <Badge label={st.label} color={st.color} bg={st.bg} />
                  </div>
                  <div style={{ fontFamily:font.sans, fontSize:11, color:"#64748B", marginTop:2 }}>{a.role} · {a.dept} · Shift {a.shift}</div>
                </div>
              </div>

              {/* Capacity */}
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontFamily:font.sans, fontSize:11, color:"#64748B" }}>Capacity</span>
                  <span style={{ fontFamily:font.mono, fontSize:11, color:"#E2E8F0", fontWeight:500 }}>{a.open} / {a.capacity} open</span>
                </div>
                <CapacityBar current={a.open} max={a.capacity} height={6} />
              </div>

              {/* Metrics row */}
              <div style={{ display:"flex", gap:8, marginBottom:12 }}>
                <div style={{ flex:1, padding:"8px 10px", borderRadius:6, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)", textAlign:"center" }}>
                  <div style={{ fontFamily:font.mono, fontSize:16, fontWeight:700, color:"#22C55E" }}>{a.resolved_today}</div>
                  <div style={{ fontFamily:font.sans, fontSize:9, color:"#64748B", marginTop:2 }}>Resolved</div>
                </div>
                <div style={{ flex:1, padding:"8px 10px", borderRadius:6, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)", textAlign:"center" }}>
                  <div style={{ fontFamily:font.mono, fontSize:16, fontWeight:700, color:"#38BDF8" }}>{a.avg_response}</div>
                  <div style={{ fontFamily:font.sans, fontSize:9, color:"#64748B", marginTop:2 }}>Avg Response</div>
                </div>
                <div style={{ flex:1, padding:"8px 10px", borderRadius:6, background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.04)", textAlign:"center" }}>
                  <div style={{ fontFamily:font.mono, fontSize:16, fontWeight:700, color:a.sla_compliance>=95?"#22C55E":a.sla_compliance>=85?"#F59E0B":"#EF4444" }}>{a.sla_compliance>0?`${a.sla_compliance}%`:"—"}</div>
                  <div style={{ fontFamily:font.sans, fontSize:9, color:"#64748B", marginTop:2 }}>SLA Comp.</div>
                </div>
              </div>

              {/* Skills */}
              <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
                {a.skills.map(s=>(
                  <span key={s} style={{ padding:"2px 7px", borderRadius:4, fontFamily:font.mono, fontSize:9, background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.06)", color:"#94A3B8" }}>{s}</span>
                ))}
              </div>

              {/* Queues */}
              <div style={{ display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
                <span style={{ fontFamily:font.sans, fontSize:10, color:"#475569" }}>Queues:</span>
                {queuesIn.map(q=>(
                  <span key={q.id} style={{ padding:"2px 7px", borderRadius:4, fontFamily:font.mono, fontSize:9, background:"rgba(37,99,235,0.06)", border:"1px solid rgba(37,99,235,0.15)", color:"#60A5FA" }}>{q.code}</span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
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

/* ═══════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════ */
export default function QueueDashboard() {
  const [view, setView] = useState("queues"); // queues | agents
  const [selectedQueue, setSelectedQueue] = useState(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(()=>setNow(new Date()), 60000);
    return ()=>clearInterval(t);
  },[]);

  const viewQ = selectedQueue ? QUEUES.find(q=>q.id===selectedQueue) : null;

  const navBtn = (key, label) => ({
    padding:"8px 16px", borderRadius:8, cursor:"pointer", border:"none",
    fontFamily:font.sans, fontSize:13, fontWeight:600,
    background: view===key ? "rgba(37,99,235,0.12)" : "transparent",
    color: view===key ? "#60A5FA" : "#64748B",
    transition:"all 0.15s"
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.06); border-radius:3px; }
        @keyframes pulse { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.2);opacity:0} }
        .sla-pulse { animation: pulse 1.5s ease-out infinite; }
      `}</style>

      <div style={{ display: "flex", height: "100vh", width: "100%", background: "#0B0F17", overflow: "hidden" }}>
        <Rail active="queue" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", fontFamily: font.sans, color: "#E2E8F0", overflow: "hidden" }}>
        {/* Top Bar */}
        <div style={{
          padding:"14px 20px", borderBottom:"1px solid rgba(255,255,255,0.06)",
          background:"rgba(15,18,25,0.9)", flexShrink: 0
        }}>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:8 }}>
            <span style={{ fontFamily:font.mono, fontSize:10, fontWeight:600, color:"#3B82F6", letterSpacing:"0.1em", textTransform:"uppercase" }}>ClarityDesk</span>
            <span style={{ color:"#1E293B", fontSize:10 }}>›</span>
            <span style={{ fontFamily:font.mono, fontSize:10, color:"#64748B", letterSpacing:"0.05em" }}>Operations</span>
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:4, background:"rgba(255,255,255,0.03)", borderRadius:10, padding:3 }}>
              <button onClick={()=>{setView("queues");setSelectedQueue(null)}} style={navBtn("queues")}>Queues</button>
              <button onClick={()=>{setView("agents");setSelectedQueue(null)}} style={navBtn("agents")}>Agent Workload</button>
            </div>
            <div style={{ fontFamily:font.mono, fontSize:10, color:"#475569" }}>
              {now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})} AST
            </div>
          </div>
        </div>

        {/* Queues View */}
        {view==="queues" && !viewQ && (
          <div style={{ padding:"16px 20px", overflowY: "auto" }}>
            {/* Summary bar */}
            <div style={{ display:"flex", gap:8, marginBottom:18, flexWrap:"wrap" }}>
              <MetricTile label="Total Queues" value={QUEUES.length} />
              <MetricTile label="Unassigned" value={QUEUES.reduce((s,q)=>s+q.health.unassigned,0)} accent={QUEUES.reduce((s,q)=>s+q.health.unassigned,0)>5?"#F59E0B":"#E2E8F0"} />
              <MetricTile label="Avg SLA" value={`${Math.round(QUEUES.reduce((s,q)=>s+q.health.sla_response,0)/QUEUES.length)}%`} accent="#22C55E" />
              <MetricTile label="Agents Online" value={AGENTS.filter(a=>a.status==="online").length} accent="#22C55E" sub={`of ${AGENTS.length} total`} />
            </div>

            <div style={{ fontFamily:font.sans, fontSize:11, fontWeight:600, color:"#64748B", letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:10 }}>All Queues</div>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {QUEUES.map(q=>(
                <QueueCard key={q.id} queue={q} selected={false} onClick={()=>setSelectedQueue(q.id)} />
              ))}
            </div>
          </div>
        )}

        {/* Queue Detail */}
        {view==="queues" && viewQ && (
          <div style={{ overflowY: "auto" }}>
            <button onClick={()=>setSelectedQueue(null)} style={{
              display:"flex", alignItems:"center", gap:5, margin:"14px 20px 0",
              padding:"6px 12px", borderRadius:6, cursor:"pointer",
              background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)",
              fontFamily:font.sans, fontSize:12, color:"#94A3B8"
            }}>← All Queues</button>
            <QueueDetail queue={viewQ} />
          </div>
        )}

        {/* Agents View */}
        {view==="agents" && <div style={{ overflowY: "auto" }}><AgentWorkloadView /></div>}
        </div>
      </div>
    </>
  );
}
