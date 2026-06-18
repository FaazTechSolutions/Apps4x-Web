"use client";
import { useState, useEffect, useCallback, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   DESIGN SYSTEM
   ═══════════════════════════════════════════════════════ */
const F = { sans:"'DM Sans',sans-serif", mono:"'JetBrains Mono',monospace" };
const C = {
  bg:"#080B12", surface:"#0D1117", surface2:"#131922", surface3:"#1A2130",
  border:"rgba(255,255,255,0.06)", borderHover:"rgba(255,255,255,0.12)",
  text:"#E2E8F0", textMuted:"#94A3B8", textDim:"#64748B", textFaint:"#475569",
  blue:"#2563EB", blueLight:"#60A5FA", blueBg:"rgba(37,99,235,0.08)",
  green:"#22C55E", greenBg:"rgba(34,197,94,0.08)",
  amber:"#F59E0B", amberBg:"rgba(245,158,11,0.08)",
  red:"#EF4444", redBg:"rgba(239,68,68,0.08)",
  coral:"#F97316", coralBg:"rgba(249,115,22,0.08)",
  purple:"#8B5CF6", purpleBg:"rgba(139,92,246,0.08)",
  cyan:"#06B6D4", cyanBg:"rgba(6,182,212,0.08)",
};
const PRI = { P1:{c:"#EF4444",bg:"#EF444418",b:"#EF444440"}, P2:{c:"#F59E0B",bg:"#F59E0B18",b:"#F59E0B40"}, P3:{c:"#3B82F6",bg:"#3B82F618",b:"#3B82F640"}, P4:{c:"#64748B",bg:"#64748B18",b:"#64748B40"} };
const SLA = { healthy:C.green, warning:C.amber, breaching:C.red, breached:"#991B1B" };
const ASTATUS = { online:{l:"Online",c:C.green}, on_break:{l:"On Break",c:C.amber}, on_leave:{l:"On Leave",c:C.red}, offline:{l:"Offline",c:C.textFaint} };

/* ═══════════════════════════════════════════════════════
   DATA
   ═══════════════════════════════════════════════════════ */
const AGENTS_HUMAN = [
  {id:"h1",name:"Fatima Hassan",ini:"FH",role:"Senior IT Analyst",dept:"IT",status:"online",open:5,cap:8,resolved:7,avgResp:"12m",sla:96,skills:["SAP FICO","Network","API"]},
  {id:"h2",name:"Omar Bakr",ini:"OB",role:"IT Support Specialist",dept:"IT",status:"online",open:7,cap:8,resolved:4,avgResp:"18m",sla:88,skills:["Hardware","Desktop"]},
  {id:"h3",name:"Ahmed Noor",ini:"AN",role:"GRO Supervisor",dept:"Ops",status:"on_break",open:3,cap:6,resolved:5,avgResp:"8m",sla:100,skills:["GOSI","Qiwa","Iqama"]},
  {id:"h4",name:"Sara Al-Dosari",ini:"SA",role:"HR Coordinator",dept:"HR",status:"online",open:4,cap:7,resolved:6,avgResp:"15m",sla:92,skills:["Onboarding","Benefits"]},
  {id:"h5",name:"Nadia Youssef",ini:"NY",role:"Finance Analyst",dept:"Finance",status:"online",open:2,cap:5,resolved:3,avgResp:"10m",sla:100,skills:["ZATCA","Budget"]},
];

const AGENTS_AI = [
  {id:"ai1",name:"Atlas",type:"Support Triage Agent",status:"active",processed:48,accuracy:97,avgTime:"14s",model:"Claude Sonnet",governed:true,
    desc:"Classifies incoming tickets, extracts entities, routes to the correct queue, and drafts initial responses for L1 issues.",
    recentActions:[
      {ticket:"TKT-4511",action:"Classified as P1 Network, routed to IT-RUH queue",time:"2m ago"},
      {ticket:"TKT-4512",action:"Auto-resolved with KB article #218 (monitor calibration)",time:"8m ago"},
      {ticket:"TKT-4510",action:"Classified as P3 Hardware, routed to IT-RUH queue",time:"15m ago"},
    ]},
  {id:"ai2",name:"Sentinel",type:"Compliance Monitor Agent",status:"active",processed:12,accuracy:99,avgTime:"45s",model:"Claude Sonnet",governed:true,
    desc:"Monitors Qiwa, GOSI, and Muqeem deadlines. Auto-creates tickets when compliance windows are approaching.",
    recentActions:[
      {ticket:"TKT-4507",action:"Created Iqama renewal ticket — 12 workers expiring in 14 days",time:"1h ago"},
      {ticket:"TKT-4515",action:"GOSI contribution deadline alert — 3 days remaining",time:"3h ago"},
    ]},
  {id:"ai3",name:"Resolver",type:"Auto-Resolution Agent",status:"active",processed:31,accuracy:94,avgTime:"22s",model:"Claude Sonnet",governed:true,
    desc:"Attempts to resolve L1 tickets autonomously using knowledge base, runbooks, and approved action playbooks. Escalates to human when confidence < 85%.",
    recentActions:[
      {ticket:"TKT-4498",action:"Ran laptop provisioning playbook — awaiting asset assignment approval",time:"30m ago"},
      {ticket:"TKT-4506",action:"Reset SAP password via HITL-approved runbook",time:"1h ago"},
      {ticket:"TKT-4499",action:"Escalated to human — confidence 72% on VPN config issue",time:"2h ago"},
    ]},
  {id:"ai4",name:"Insight",type:"Analytics & Reporting Agent",status:"idle",processed:6,accuracy:98,avgTime:"2m",model:"Claude Sonnet",governed:true,
    desc:"Generates daily queue health reports, identifies trending issues, and recommends staffing adjustments.",
    recentActions:[
      {ticket:"RPT-041",action:"Generated daily SLA compliance report for all queues",time:"6h ago"},
      {ticket:"RPT-040",action:"Flagged 34% increase in VPN tickets — recommended KB update",time:"1d ago"},
    ]},
];

const QUEUES = [
  {id:"q1",name:"IT Support — Riyadh",code:"IT-RUH",strategy:"skill_match",stratColor:C.coral,stratIcon:"◈",unassigned:3,sla:94,util:78,agents:4,tickets:12},
  {id:"q2",name:"HR Operations",code:"HR-OPS",strategy:"round_robin",stratColor:C.cyan,stratIcon:"↻",unassigned:1,sla:97,util:52,agents:2,tickets:5},
  {id:"q3",name:"Finance & Compliance",code:"FIN-COMP",strategy:"least_load",stratColor:C.green,stratIcon:"◎",unassigned:0,sla:100,util:40,agents:2,tickets:3},
  {id:"q4",name:"Facilities — Emergency",code:"FAC-EMR",strategy:"ai_routed",stratColor:C.purple,stratIcon:"◆",unassigned:0,sla:100,util:25,agents:2,tickets:1},
];

const TICKETS = [
  {id:"TKT-4511",subject:"Email delivery failing to external domains",priority:"P1",status:"in_progress",category:"Network",queue:"IT-RUH",assignee:"h1",assigneeName:"Fatima",slaStatus:"warning",slaRemaining:"22m",created:"38m ago",channel:"Portal",requester:"Mohammed Ali",
    aiInvolved:true,aiAgent:"Atlas",
    reasoningTrace:[
      {step:"Intake",detail:"Received via portal. Extracted: email delivery failure, external domains, multiple users affected.",ts:"38m ago",type:"ai"},
      {step:"Classification",detail:"Category: Network → Email Infrastructure. Priority: P1 (service affecting, multiple users). Confidence: 96%.",ts:"38m ago",type:"ai"},
      {step:"Routing",detail:"Queue: IT-RUH. Strategy: skill_match. Best match: Fatima Hassan (Network skill, 3/8 capacity, 96% SLA).",ts:"37m ago",type:"ai"},
      {step:"Initial Diagnosis",detail:"Checked KB — similar incident INC-3892 resolved by updating SPF record. Drafted diagnostic steps for assignee.",ts:"37m ago",type:"ai"},
      {step:"Assignment",detail:"Assigned to Fatima Hassan. Acknowledgment received in 45 seconds.",ts:"37m ago",type:"system"},
      {step:"Investigation",detail:"Fatima confirmed SPF/DKIM records are correct. Investigating MX relay. Requested network logs from NOC.",ts:"20m ago",type:"human"},
    ],
    activities:[
      {type:"created",actor:"Mohammed Ali",time:"38m ago",detail:"Ticket created via self-service portal"},
      {type:"ai_action",actor:"Atlas",time:"38m ago",detail:"Classified as P1 Network, routed to IT-RUH queue"},
      {type:"assigned",actor:"System",time:"37m ago",detail:"Assigned to Fatima Hassan via skill-match routing"},
      {type:"response",actor:"Fatima Hassan",time:"35m ago",detail:"Acknowledged. Investigating email relay configuration."},
      {type:"note",actor:"Fatima Hassan",time:"20m ago",detail:"SPF/DKIM valid. MX relay showing 4xx errors on outbound. Escalating to NOC for relay logs."},
    ]
  },
  {id:"TKT-4512",subject:"Monitor flickering intermittently",priority:"P4",status:"resolved",category:"Hardware",queue:"IT-RUH",assignee:null,assigneeName:"Resolver AI",slaStatus:"healthy",slaRemaining:"—",created:"5m ago",channel:"WhatsApp",requester:"Layla Qasim",
    aiInvolved:true,aiAgent:"Resolver",aiAutoResolved:true,
    reasoningTrace:[
      {step:"Intake",detail:"Received via WhatsApp. User reports monitor flickering on desk 4B-12. Extracted: hardware issue, single user, non-critical.",ts:"5m ago",type:"ai"},
      {step:"Classification",detail:"Category: Hardware → Display. Priority: P4 (single user, workaround available). Confidence: 98%.",ts:"5m ago",type:"ai"},
      {step:"Knowledge Search",detail:"Found KB-218: 'Monitor Flickering — Calibration Reset'. Match score: 94%. Resolution: guide user through display settings reset.",ts:"5m ago",type:"ai"},
      {step:"Confidence Check",detail:"Confidence 94% > 85% threshold. Proceeding with auto-resolution. No HITL approval required for P4 KB-based resolution.",ts:"5m ago",type:"ai",governance:true},
      {step:"Resolution",detail:"Sent step-by-step display calibration guide via WhatsApp. User confirmed flickering stopped after applying settings.",ts:"3m ago",type:"ai"},
      {step:"Closure",detail:"Auto-resolved. User satisfaction: confirmed. Total handling time: 2m 14s.",ts:"3m ago",type:"ai"},
    ],
    activities:[
      {type:"created",actor:"Layla Qasim",time:"5m ago",detail:"Ticket created via WhatsApp message"},
      {type:"ai_action",actor:"Atlas",time:"5m ago",detail:"Classified P4 Hardware, routed to Resolver agent"},
      {type:"ai_action",actor:"Resolver",time:"5m ago",detail:"Matched KB-218 with 94% confidence. Auto-resolving."},
      {type:"resolved",actor:"Resolver AI",time:"3m ago",detail:"Sent calibration guide via WhatsApp. User confirmed fix."},
    ]
  },
  {id:"TKT-4507",subject:"Iqama renewal for 12 workers — Jeddah site",priority:"P1",status:"in_progress",category:"Compliance",queue:"HR-OPS",assignee:"h3",assigneeName:"Ahmed",slaStatus:"healthy",slaRemaining:"5h 20m",created:"1h ago",channel:"Auto-generated",requester:"Sentinel AI",
    aiInvolved:true,aiAgent:"Sentinel",
    reasoningTrace:[
      {step:"Monitor",detail:"Scheduled Muqeem API scan detected 12 workers at Jeddah site with Iqama expiry within 14-day window.",ts:"1h ago",type:"ai"},
      {step:"Risk Assessment",detail:"Non-renewal risk: SAR 10,000 fine per worker. Total exposure: SAR 120,000. Nitaqat impact: potential yellow zone drop.",ts:"1h ago",type:"ai",governance:true},
      {step:"Ticket Creation",detail:"Auto-created P1 compliance ticket. Attached worker list, current Iqama dates, and Muqeem submission requirements.",ts:"1h ago",type:"ai"},
      {step:"Routing",detail:"Queue: HR-OPS. Assigned to Ahmed Noor (GRO Supervisor, Iqama skill, compliance authority).",ts:"1h ago",type:"ai"},
      {step:"HITL Checkpoint",detail:"Requires human confirmation before Muqeem batch submission. Approval request sent to Ahmed.",ts:"1h ago",type:"system",governance:true},
      {step:"Processing",detail:"Ahmed confirmed worker list. Preparing Muqeem batch submission for 12 renewals.",ts:"30m ago",type:"human"},
    ],
    activities:[
      {type:"ai_action",actor:"Sentinel",time:"1h ago",detail:"Detected 12 Iqama renewals due within 14 days at Jeddah site"},
      {type:"created",actor:"Sentinel AI",time:"1h ago",detail:"Auto-created compliance ticket with SAR 120K exposure assessment"},
      {type:"assigned",actor:"System",time:"1h ago",detail:"Assigned to Ahmed Noor via skill-match routing"},
      {type:"approval",actor:"Ahmed Noor",time:"30m ago",detail:"Confirmed worker list for Muqeem batch submission"},
    ]
  },
  {id:"TKT-4505",subject:"SAP login locked after password reset",priority:"P2",status:"pending_approval",category:"Software",queue:"IT-RUH",assignee:"h1",assigneeName:"Fatima",slaStatus:"warning",slaRemaining:"48m",created:"2h ago",channel:"Email",requester:"Yousef Rahman",
    aiInvolved:true,aiAgent:"Resolver",
    hitlPending:true,hitlAction:"SAP account unlock via admin console",hitlReason:"P2 ticket requires human approval for system admin actions per governance policy GOV-012.",
    reasoningTrace:[
      {step:"Intake",detail:"Received via email. User locked out of SAP after 3 failed password attempts post-reset.",ts:"2h ago",type:"ai"},
      {step:"Classification",detail:"Category: Software → SAP → Account Access. Priority: P2 (single user, business impact). Confidence: 97%.",ts:"2h ago",type:"ai"},
      {step:"Resolution Attempt",detail:"Identified runbook RB-045: SAP Account Unlock. Requires admin console access.",ts:"2h ago",type:"ai"},
      {step:"Governance Gate",detail:"Policy GOV-012: System admin actions on P2+ tickets require HITL approval. Cannot auto-execute.",ts:"2h ago",type:"ai",governance:true},
      {step:"Approval Request",detail:"HITL approval sent to Fatima Hassan (queue owner, SAP FICO skill). Awaiting confirmation to execute unlock.",ts:"2h ago",type:"system",governance:true},
      {step:"Waiting",detail:"Approval pending. SLA countdown: 48 minutes remaining.",ts:"now",type:"system"},
    ],
    activities:[
      {type:"created",actor:"Yousef Rahman",time:"2h ago",detail:"Ticket created via email — SAP account locked"},
      {type:"ai_action",actor:"Resolver",time:"2h ago",detail:"Identified resolution: RB-045 SAP Account Unlock"},
      {type:"governance",actor:"System",time:"2h ago",detail:"HITL approval required per GOV-012 for admin actions"},
      {type:"approval_pending",actor:"System",time:"2h ago",detail:"Awaiting approval from Fatima Hassan"},
    ]
  },
  {id:"TKT-4502",subject:"ZATCA e-invoice rejection — Phase 2 format",priority:"P2",status:"in_progress",category:"ZATCA",queue:"FIN-COMP",assignee:"h5",assigneeName:"Nadia",slaStatus:"healthy",slaRemaining:"5h",created:"2h ago",channel:"Portal",requester:"Accounting Dept",
    aiInvolved:false,
    activities:[
      {type:"created",actor:"Accounting Dept",time:"2h ago",detail:"ZATCA clearance rejected — XML schema validation error on invoice batch #2847"},
      {type:"assigned",actor:"System",time:"2h ago",detail:"Assigned to Nadia Youssef via least-load routing"},
      {type:"note",actor:"Nadia Youssef",time:"1h ago",detail:"Identified issue: TaxCategory code missing on zero-rated line items. Preparing corrected batch."},
    ]
  },
  {id:"TKT-4514",subject:"AC unit failure — server room B2",priority:"P1",status:"in_progress",category:"Facilities",queue:"FAC-EMR",assignee:"h3",assigneeName:"Ahmed",slaStatus:"warning",slaRemaining:"35m",created:"25m ago",channel:"Sensor Alert",requester:"IoT Monitoring",
    aiInvolved:true,aiAgent:"Atlas",
    reasoningTrace:[
      {step:"Intake",detail:"IoT temperature sensor alert: Server room B2 temperature rising above 28°C threshold. AC unit #3 reporting fault code E-07.",ts:"25m ago",type:"ai"},
      {step:"Classification",detail:"Category: Facilities → HVAC → Emergency. Priority: P1 (infrastructure risk, potential data loss). Confidence: 99%.",ts:"25m ago",type:"ai"},
      {step:"Risk Context",detail:"Server room B2 hosts primary database cluster. Sustained temperature above 35°C risks hardware failure. Current trajectory: 35°C in ~40 minutes.",ts:"25m ago",type:"ai",governance:true},
      {step:"Routing",detail:"Queue: FAC-EMR (AI-routed). Selected Ahmed Noor — on-site, facilities skill, 3/6 capacity. Backup: Tariq Mahmoud (off-shift, auto-paged).",ts:"25m ago",type:"ai"},
    ],
    activities:[
      {type:"created",actor:"IoT Monitoring",time:"25m ago",detail:"Auto-created from sensor alert — server room B2 temperature threshold exceeded"},
      {type:"ai_action",actor:"Atlas",time:"25m ago",detail:"P1 emergency classified. Risk assessment: database cluster at risk in 40 minutes."},
      {type:"assigned",actor:"AI Router",time:"25m ago",detail:"Assigned to Ahmed Noor. Backup paged: Tariq Mahmoud."},
      {type:"note",actor:"Ahmed Noor",time:"15m ago",detail:"On-site at B2. AC unit #3 compressor fault confirmed. Activated backup cooling unit #4."},
    ]
  },
];

/* ═══════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════ */

const Av = ({ini,size=32,status,ai}) => (
  <div style={{position:"relative",width:size,height:size,flexShrink:0}}>
    <div style={{width:size,height:size,borderRadius:ai?"8px":"50%",background:ai?"linear-gradient(135deg,#7C3AED,#2563EB)":"linear-gradient(135deg,#1E40AF,#2563EB)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:F.mono,fontSize:ai?size*0.28:size*0.34,fontWeight:600,color:"#fff",letterSpacing:"0.02em"}}>{ini}</div>
    {status&&<div style={{position:"absolute",bottom:-1,right:-1,width:size*0.28,height:size*0.28,borderRadius:"50%",background:ASTATUS[status]?.c||C.textFaint,border:`2px solid ${C.bg}`}}/>}
  </div>
);

const Badge = ({label,color,bg,border,mono,small}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:4,padding:small?"2px 6px":"3px 9px",borderRadius:5,background:bg||`${color}15`,border:`1px solid ${border||color+"40"}`,fontFamily:mono?F.mono:F.sans,fontSize:small?9:11,fontWeight:500,color,whiteSpace:"nowrap",letterSpacing:"0.02em"}}>{label}</span>
);

const GovShield = ({small}) => (
  <span style={{display:"inline-flex",alignItems:"center",gap:3,padding:small?"1px 5px":"2px 7px",borderRadius:4,background:C.blueBg,border:`1px solid ${C.blue}30`,fontFamily:F.mono,fontSize:small?8:10,fontWeight:600,color:C.blueLight,letterSpacing:"0.05em"}}>
    <svg width={small?8:10} height={small?8:10} viewBox="0 0 16 16" fill="none"><path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" stroke={C.blueLight} strokeWidth="1.5" fill={`${C.blue}25`}/><path d="M5.5 8L7 9.5L10.5 6" stroke={C.blueLight} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
    GOV
  </span>
);

const Pulse = ({status}) => {
  const c = SLA[status]||SLA.healthy;
  return <span style={{display:"inline-block",position:"relative",width:8,height:8}}><span style={{position:"absolute",inset:0,borderRadius:"50%",background:c}}/>{(status==="warning"||status==="breaching")&&<span className="sla-pulse" style={{position:"absolute",inset:-3,borderRadius:"50%",border:`2px solid ${c}`,opacity:0}}/>}</span>;
};

const CapBar = ({cur,max,h=6}) => {
  const p = max>0?Math.min((cur/max)*100,100):0;
  const c = p>90?C.red:p>70?C.amber:C.green;
  return <div style={{width:"100%",height:h,borderRadius:h/2,background:"rgba(255,255,255,0.06)",overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",borderRadius:h/2,background:c,transition:"width 0.6s cubic-bezier(0.16,1,0.3,1)"}}/></div>;
};

const Metric = ({label,value,accent,sub}) => (
  <div style={{flex:1,minWidth:0,padding:"10px 11px",borderRadius:8,background:C.surface,border:`1px solid ${C.border}`}}>
    <div style={{fontFamily:F.mono,fontSize:18,fontWeight:700,color:accent||C.text,lineHeight:1,letterSpacing:"-0.02em"}}>{value}</div>
    <div style={{fontFamily:F.sans,fontSize:9,color:C.textDim,marginTop:3}}>{label}</div>
    {sub&&<div style={{fontFamily:F.mono,fontSize:8,color:C.textFaint,marginTop:1}}>{sub}</div>}
  </div>
);

/* ═══════════════════════════════════════════════════════
   VIEWS
   ═══════════════════════════════════════════════════════ */

/* ─── DASHBOARD ─── */
function DashboardView({onNav}) {
  const totalOpen = TICKETS.filter(t=>t.status!=="resolved").length;
  const p1Open = TICKETS.filter(t=>t.priority==="P1"&&t.status!=="resolved").length;
  const aiResolved = TICKETS.filter(t=>t.aiAutoResolved).length;
  const hitlPending = TICKETS.filter(t=>t.hitlPending).length;

  return (
    <div style={{padding:"16px 18px"}}>
      {/* KPI Strip */}
      <div style={{display:"flex",gap:6,marginBottom:18,flexWrap:"wrap"}}>
        <Metric label="Open Tickets" value={totalOpen} accent={totalOpen>8?C.amber:C.text} />
        <Metric label="P1 Active" value={p1Open} accent={p1Open>0?C.red:C.green} />
        <Metric label="AI Resolved" value={aiResolved} accent={C.purple} sub="today" />
        <Metric label="HITL Pending" value={hitlPending} accent={hitlPending>0?C.amber:C.text} />
      </div>

      {/* AI Agents Status */}
      <div style={{marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontFamily:F.sans,fontSize:12,fontWeight:700,color:C.text}}>AI Agents</span>
            <GovShield small />
          </div>
          <span style={{fontFamily:F.mono,fontSize:10,color:C.green}}>{AGENTS_AI.filter(a=>a.status==="active").length} active</span>
        </div>
        <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
          {AGENTS_AI.map(a=>(
            <div key={a.id} style={{minWidth:140,padding:"12px 14px",borderRadius:10,background:C.surface,border:`1px solid ${a.status==="active"?C.purple+"30":C.border}`,flexShrink:0}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                <Av ini={a.name[0]+a.name[1]} size={28} ai />
                <div>
                  <div style={{fontFamily:F.sans,fontSize:12,fontWeight:600,color:C.text}}>{a.name}</div>
                  <div style={{fontFamily:F.mono,fontSize:9,color:a.status==="active"?C.green:C.textFaint}}>{a.status}</div>
                </div>
              </div>
              <div style={{display:"flex",gap:12}}>
                <div><div style={{fontFamily:F.mono,fontSize:14,fontWeight:700,color:C.purple}}>{a.processed}</div><div style={{fontFamily:F.sans,fontSize:8,color:C.textDim}}>processed</div></div>
                <div><div style={{fontFamily:F.mono,fontSize:14,fontWeight:700,color:C.green}}>{a.accuracy}%</div><div style={{fontFamily:F.sans,fontSize:8,color:C.textDim}}>accuracy</div></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Queue Health */}
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:F.sans,fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>Queue Health</div>
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {QUEUES.map(q=>(
            <div key={q.id} onClick={()=>onNav("queues")} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:8,background:C.surface,border:`1px solid ${C.border}`,cursor:"pointer"}}>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontFamily:F.sans,fontSize:12,fontWeight:600,color:C.text}}>{q.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                  <span style={{fontFamily:F.mono,fontSize:9,color:q.stratColor}}>{q.stratIcon} {q.strategy.replace("_"," ")}</span>
                  {q.unassigned>0&&<span style={{fontFamily:F.mono,fontSize:9,color:C.amber,fontWeight:600}}>{q.unassigned} queued</span>}
                </div>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:5}}>
                <Pulse status={q.sla>=95?"healthy":q.sla>=85?"warning":"breaching"} />
                <span style={{fontFamily:F.mono,fontSize:12,fontWeight:600,color:q.sla>=95?C.green:q.sla>=85?C.amber:C.red}}>{q.sla}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div>
        <div style={{fontFamily:F.sans,fontSize:12,fontWeight:700,color:C.text,marginBottom:10}}>Live Activity</div>
        <div style={{position:"relative",paddingLeft:20}}>
          <div style={{position:"absolute",left:5,top:2,bottom:2,width:1,background:C.border}} />
          {[
            {icon:"◆",color:C.purple,text:"Resolver auto-resolved TKT-4512 via KB-218",time:"3m ago"},
            {icon:"◈",color:C.coral,text:"Atlas routed TKT-4511 (P1) to Fatima via skill-match",time:"5m ago"},
            {icon:"○",color:C.green,text:"Ahmed acknowledged TKT-4514 — on-site at server room B2",time:"10m ago"},
            {icon:"⛉",color:C.blueLight,text:"HITL gate triggered on TKT-4505 — awaiting Fatima's approval",time:"15m ago"},
            {icon:"◉",color:C.amber,text:"Sentinel detected 12 Iqama renewals due — created TKT-4507",time:"1h ago"},
          ].map((e,i)=>(
            <div key={i} style={{position:"relative",paddingBottom:i<4?14:0}}>
              <span style={{position:"absolute",left:-17,top:2,fontFamily:"monospace",fontSize:10,color:e.color}}>{e.icon}</span>
              <div style={{fontFamily:F.sans,fontSize:12,color:C.textMuted,lineHeight:1.5}}>{e.text}</div>
              <div style={{fontFamily:F.mono,fontSize:9,color:C.textFaint,marginTop:1}}>{e.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── TICKET LIST ─── */
function TicketListView({onSelect}) {
  const [filter,setFilter] = useState("all");
  const filtered = filter==="all"?TICKETS:filter==="ai"?TICKETS.filter(t=>t.aiInvolved):filter==="hitl"?TICKETS.filter(t=>t.hitlPending):TICKETS.filter(t=>t.priority===filter);

  return (
    <div style={{padding:"14px 18px"}}>
      {/* Filters */}
      <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:10,marginBottom:4}}>
        {[["all","All"],["P1","P1"],["P2","P2"],["ai","AI Involved"],["hitl","HITL Pending"]].map(([k,l])=>(
          <button key={k} onClick={()=>setFilter(k)} style={{padding:"5px 12px",borderRadius:6,border:"none",cursor:"pointer",flexShrink:0,fontFamily:F.sans,fontSize:11,fontWeight:filter===k?600:400,background:filter===k?C.blueBg:C.surface,color:filter===k?C.blueLight:C.textDim,whiteSpace:"nowrap",transition:"all 0.15s"}}>{l}</button>
        ))}
      </div>

      {/* Ticket cards */}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {filtered.sort((a,b)=>{const o={P1:0,P2:1,P3:2,P4:3};return(o[a.priority]||9)-(o[b.priority]||9)}).map(t=>{
          const p = PRI[t.priority];
          const slc = SLA[t.slaStatus];
          return (
            <div key={t.id} onClick={()=>onSelect(t.id)} style={{padding:"14px 16px",borderRadius:10,background:C.surface,border:`1px solid ${t.hitlPending?C.amber+"30":C.border}`,cursor:"pointer",transition:"border-color 0.2s"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:6,marginBottom:8}}>
                <div style={{minWidth:0}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:3,flexWrap:"wrap"}}>
                    <span style={{fontFamily:F.mono,fontSize:10,color:C.textFaint}}>{t.id}</span>
                    <span style={{fontFamily:F.mono,fontSize:9,fontWeight:600,color:p.c,padding:"1px 5px",borderRadius:3,background:p.bg,border:`1px solid ${p.b}`}}>{t.priority}</span>
                    {t.aiInvolved&&<Badge label={t.aiAutoResolved?"AI Resolved":"AI Involved"} color={t.aiAutoResolved?C.green:C.purple} small mono />}
                    {t.hitlPending&&<Badge label="HITL Pending" color={C.amber} small mono />}
                  </div>
                  <div style={{fontFamily:F.sans,fontSize:13,fontWeight:500,color:C.text,lineHeight:1.4}}>{t.subject}</div>
                </div>
                {t.slaRemaining!=="—"&&(
                  <div style={{display:"flex",alignItems:"center",gap:4,flexShrink:0}}>
                    <Pulse status={t.slaStatus} />
                    <span style={{fontFamily:F.mono,fontSize:11,fontWeight:600,color:slc}}>{t.slaRemaining}</span>
                  </div>
                )}
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontFamily:F.sans,fontSize:10,color:C.textDim}}>{t.category}</span>
                  <span style={{color:C.textFaint,fontSize:8}}>·</span>
                  <span style={{fontFamily:F.sans,fontSize:10,color:C.textDim}}>{t.queue}</span>
                  <span style={{color:C.textFaint,fontSize:8}}>·</span>
                  <span style={{fontFamily:F.sans,fontSize:10,color:C.textDim}}>{t.channel}</span>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:4}}>
                  {t.assigneeName&&<span style={{fontFamily:F.sans,fontSize:10,color:C.textMuted}}>{t.assigneeName}</span>}
                  <span style={{fontFamily:F.mono,fontSize:9,color:C.textFaint}}>{t.created}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── TICKET DETAIL ─── */
function TicketDetailView({ticketId,onBack}) {
  const [tab,setTab] = useState("trace");
  const t = TICKETS.find(x=>x.id===ticketId);
  if(!t) return null;
  const p = PRI[t.priority];
  const slc = SLA[t.slaStatus];

  const tabBtn = (k,l) => ({padding:"7px 12px",borderRadius:"6px 6px 0 0",border:"none",cursor:"pointer",fontFamily:F.sans,fontSize:11,fontWeight:tab===k?600:400,background:tab===k?"rgba(255,255,255,0.04)":"transparent",borderBottom:tab===k?`2px solid ${C.blue}`:"2px solid transparent",color:tab===k?C.text:C.textDim,transition:"all 0.15s"});

  return (
    <div>
      {/* Back + Header */}
      <div style={{padding:"14px 18px",borderBottom:`1px solid ${C.border}`}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:4,background:"none",border:"none",color:C.textMuted,fontFamily:F.sans,fontSize:12,cursor:"pointer",marginBottom:10,padding:0}}>← Back</button>
        <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6,flexWrap:"wrap"}}>
          <span style={{fontFamily:F.mono,fontSize:11,color:C.textFaint}}>{t.id}</span>
          <span style={{fontFamily:F.mono,fontSize:10,fontWeight:600,color:p.c,padding:"2px 6px",borderRadius:4,background:p.bg,border:`1px solid ${p.b}`}}>{t.priority}</span>
          <Badge label={t.status.replace("_"," ")} color={t.status==="resolved"?C.green:t.status==="pending_approval"?C.amber:C.blueLight} mono />
          {t.aiInvolved&&<GovShield small />}
        </div>
        <h2 style={{fontFamily:F.sans,fontSize:16,fontWeight:700,color:C.text,margin:0,lineHeight:1.3}}>{t.subject}</h2>
        <div style={{display:"flex",alignItems:"center",gap:8,marginTop:6,flexWrap:"wrap"}}>
          <span style={{fontFamily:F.sans,fontSize:11,color:C.textDim}}>Requester: <strong style={{color:C.textMuted}}>{t.requester}</strong></span>
          <span style={{fontFamily:F.sans,fontSize:11,color:C.textDim}}>Queue: <strong style={{color:C.textMuted}}>{t.queue}</strong></span>
          {t.slaRemaining!=="—"&&<span style={{display:"flex",alignItems:"center",gap:3}}><Pulse status={t.slaStatus}/><span style={{fontFamily:F.mono,fontSize:11,fontWeight:600,color:slc}}>{t.slaRemaining}</span></span>}
        </div>
      </div>

      {/* HITL Approval Banner */}
      {t.hitlPending && (
        <div style={{margin:"12px 18px",padding:"14px 16px",borderRadius:10,background:C.amberBg,border:`1px solid ${C.amber}30`}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
            <GovShield />
            <span style={{fontFamily:F.sans,fontSize:13,fontWeight:700,color:C.amber}}>Human Approval Required</span>
          </div>
          <div style={{fontFamily:F.sans,fontSize:12,color:C.textMuted,lineHeight:1.5,marginBottom:10}}>
            <strong>Action:</strong> {t.hitlAction}<br/>
            <strong>Reason:</strong> {t.hitlReason}
          </div>
          <div style={{display:"flex",gap:8}}>
            <button style={{flex:1,padding:"10px",borderRadius:8,border:"none",cursor:"pointer",background:C.green,fontFamily:F.sans,fontSize:13,fontWeight:600,color:"#fff"}}>Approve & Execute</button>
            <button style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${C.red}40`,cursor:"pointer",background:C.redBg,fontFamily:F.sans,fontSize:13,fontWeight:600,color:C.red}}>Reject</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{display:"flex",gap:2,padding:"0 18px",borderBottom:`1px solid ${C.border}`}}>
        {(t.reasoningTrace?[["trace","AI Trace"],["activity","Timeline"]]:[ ["activity","Timeline"]]).map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={tabBtn(k,l)}>{l}</button>
        ))}
      </div>

      <div style={{padding:"14px 18px"}}>
        {/* ── AI REASONING TRACE ── */}
        {tab==="trace"&&t.reasoningTrace&&(
          <div style={{position:"relative",paddingLeft:26}}>
            <div style={{position:"absolute",left:8,top:6,bottom:6,width:2,background:`linear-gradient(to bottom, ${C.purple}, ${C.blue}, ${C.green})`,borderRadius:1,opacity:0.3}} />
            {t.reasoningTrace.map((s,i)=>{
              const isAI = s.type==="ai";
              const isGov = s.governance;
              const nodeColor = isGov?C.blue:isAI?C.purple:s.type==="human"?C.green:C.textDim;
              return (
                <div key={i} style={{position:"relative",paddingBottom:i<t.reasoningTrace.length-1?18:0}}>
                  {/* Node */}
                  <div style={{position:"absolute",left:-22,top:3,width:14,height:14,borderRadius:isGov?3:"50%",background:C.bg,border:`2px solid ${nodeColor}`,display:"flex",alignItems:"center",justifyContent:"center"}}>
                    {isGov&&<svg width="8" height="8" viewBox="0 0 16 16" fill="none"><path d="M8 2L3 5v3.5c0 2.8 2.1 5.4 5 5.9 2.9-.5 5-3.1 5-5.9V5L8 2z" fill={nodeColor} opacity="0.6"/></svg>}
                    {isAI&&!isGov&&<span style={{width:4,height:4,borderRadius:"50%",background:nodeColor}}/>}
                  </div>
                  {/* Content */}
                  <div style={{padding:"10px 14px",borderRadius:8,background:isGov?`${C.blue}0A`:isAI?C.purpleBg:s.type==="human"?C.greenBg:C.surface,border:`1px solid ${isGov?C.blue+"25":isAI?C.purple+"20":s.type==="human"?C.green+"20":C.border}`}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                      <span style={{fontFamily:F.mono,fontSize:10,fontWeight:600,color:nodeColor,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.step}</span>
                      {isGov&&<GovShield small />}
                      <span style={{fontFamily:F.sans,fontSize:9,color:isAI?C.purple:s.type==="human"?C.green:C.textFaint}}>{isAI?"AI":s.type==="human"?"Human":"System"}</span>
                    </div>
                    <div style={{fontFamily:F.sans,fontSize:12,color:C.textMuted,lineHeight:1.55}}>{s.detail}</div>
                    <div style={{fontFamily:F.mono,fontSize:9,color:C.textFaint,marginTop:4}}>{s.ts}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── ACTIVITY TIMELINE ── */}
        {tab==="activity"&&(
          <div style={{position:"relative",paddingLeft:22}}>
            <div style={{position:"absolute",left:5,top:4,bottom:4,width:1,background:C.border}} />
            {t.activities.map((a,i)=>{
              const typeConfig = {
                created:{icon:"○",color:C.textMuted}, assigned:{icon:"→",color:C.blueLight},
                ai_action:{icon:"◆",color:C.purple}, response:{icon:"◇",color:C.green},
                note:{icon:"▪",color:C.textMuted}, resolved:{icon:"✓",color:C.green},
                governance:{icon:"⛉",color:C.blue}, approval:{icon:"✓",color:C.green},
                approval_pending:{icon:"⏳",color:C.amber},
              };
              const tc = typeConfig[a.type]||{icon:"·",color:C.textDim};
              return (
                <div key={i} style={{position:"relative",paddingBottom:i<t.activities.length-1?14:0}}>
                  <span style={{position:"absolute",left:-18,top:2,fontFamily:"monospace",fontSize:10,color:tc.color}}>{tc.icon}</span>
                  <div style={{fontFamily:F.sans,fontSize:12,color:C.textMuted,lineHeight:1.5}}>{a.detail}</div>
                  <div style={{fontFamily:F.mono,fontSize:9,color:C.textFaint,marginTop:2}}>{a.actor} · {a.time}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── QUEUES VIEW ─── */
function QueuesView() {
  return (
    <div style={{padding:"14px 18px"}}>
      <div style={{display:"flex",gap:6,marginBottom:16,flexWrap:"wrap"}}>
        <Metric label="Total Queues" value={QUEUES.length} />
        <Metric label="Unassigned" value={QUEUES.reduce((s,q)=>s+q.unassigned,0)} accent={C.amber} />
        <Metric label="Avg SLA" value={`${Math.round(QUEUES.reduce((s,q)=>s+q.sla,0)/QUEUES.length)}%`} accent={C.green} />
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {QUEUES.map(q=>(
          <div key={q.id} style={{padding:"14px 16px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
              <div>
                <div style={{fontFamily:F.sans,fontSize:14,fontWeight:700,color:C.text}}>{q.name}</div>
                <div style={{display:"flex",alignItems:"center",gap:6,marginTop:3}}>
                  <span style={{fontFamily:F.mono,fontSize:10,color:C.textFaint}}>{q.code}</span>
                  <span style={{fontFamily:F.mono,fontSize:9,color:q.stratColor,padding:"1px 6px",borderRadius:4,background:`${q.stratColor}12`,border:`1px solid ${q.stratColor}30`}}>{q.stratIcon} {q.strategy.replace(/_/g," ")}</span>
                </div>
              </div>
              {q.unassigned>0?<Badge label={`${q.unassigned} queued`} color={q.unassigned>3?C.red:C.amber} mono />:<Badge label="Clear" color={C.green} mono />}
            </div>
            <div style={{display:"flex",gap:16,alignItems:"center"}}>
              <div style={{display:"flex",alignItems:"center",gap:4}}>
                <Pulse status={q.sla>=95?"healthy":q.sla>=85?"warning":"breaching"} />
                <span style={{fontFamily:F.mono,fontSize:13,fontWeight:600,color:q.sla>=95?C.green:q.sla>=85?C.amber:C.red}}>{q.sla}%</span>
                <span style={{fontFamily:F.sans,fontSize:9,color:C.textFaint}}>SLA</span>
              </div>
              <div style={{flex:1}}><CapBar cur={q.util} max={100} h={5} /></div>
              <span style={{fontFamily:F.mono,fontSize:10,color:C.textDim}}>{q.util}%</span>
              <span style={{fontFamily:F.sans,fontSize:10,color:C.textDim}}>{q.agents} agents · {q.tickets} tickets</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── AGENTS VIEW ─── */
function AgentsView() {
  const [tab,setTab] = useState("human");
  const tabBtn = (k,l) => ({padding:"7px 14px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:F.sans,fontSize:12,fontWeight:tab===k?600:400,background:tab===k?C.blueBg:"transparent",color:tab===k?C.blueLight:C.textDim,transition:"all 0.15s"});

  return (
    <div style={{padding:"14px 18px"}}>
      <div style={{display:"flex",gap:4,background:C.surface,borderRadius:10,padding:3,marginBottom:16}}>
        <button onClick={()=>setTab("human")} style={tabBtn("human","Human Agents")}>Human Agents</button>
        <button onClick={()=>setTab("ai")} style={tabBtn("ai","AI Agents")}>AI Agents</button>
      </div>

      {tab==="human"&&(
        <div>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            <Metric label="Online" value={AGENTS_HUMAN.filter(a=>a.status==="online").length} accent={C.green} />
            <Metric label="Total Open" value={AGENTS_HUMAN.reduce((s,a)=>s+a.open,0)} accent={C.blueLight} />
            <Metric label="Resolved Today" value={AGENTS_HUMAN.reduce((s,a)=>s+a.resolved,0)} accent={C.green} />
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8}}>
            {[...AGENTS_HUMAN].sort((a,b)=>{const o={online:0,on_break:1,offline:2,on_leave:3};return(o[a.status]||9)-(o[b.status]||9)}).map(a=>{
              const st = ASTATUS[a.status];
              return (
                <div key={a.id} style={{padding:"14px 16px",borderRadius:10,background:C.surface,border:`1px solid ${C.border}`}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <Av ini={a.ini} size={36} status={a.status} />
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontFamily:F.sans,fontSize:13,fontWeight:600,color:C.text}}>{a.name}</span>
                        <Badge label={st.l} color={st.c} small />
                      </div>
                      <div style={{fontFamily:F.sans,fontSize:11,color:C.textDim}}>{a.role} · {a.dept}</div>
                    </div>
                  </div>
                  {/* Capacity */}
                  <div style={{marginBottom:10}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                      <span style={{fontFamily:F.sans,fontSize:10,color:C.textDim}}>Capacity</span>
                      <span style={{fontFamily:F.mono,fontSize:10,color:C.text}}>{a.open}/{a.cap}</span>
                    </div>
                    <CapBar cur={a.open} max={a.cap} h={5} />
                  </div>
                  {/* Stats */}
                  <div style={{display:"flex",gap:6,marginBottom:8}}>
                    {[[a.resolved,"Resolved",C.green],[a.avgResp,"Avg Resp",C.cyan],[`${a.sla>0?a.sla+"%":"—"}`,"SLA",a.sla>=95?C.green:a.sla>=85?C.amber:C.red]].map(([v,l,c],i)=>(
                      <div key={i} style={{flex:1,padding:"6px 8px",borderRadius:6,background:C.surface2,textAlign:"center"}}>
                        <div style={{fontFamily:F.mono,fontSize:13,fontWeight:700,color:c}}>{v}</div>
                        <div style={{fontFamily:F.sans,fontSize:8,color:C.textDim,marginTop:1}}>{l}</div>
                      </div>
                    ))}
                  </div>
                  {/* Skills */}
                  <div style={{display:"flex",flexWrap:"wrap",gap:3}}>
                    {a.skills.map(s=><span key={s} style={{padding:"2px 6px",borderRadius:4,fontFamily:F.mono,fontSize:8,background:C.surface2,border:`1px solid ${C.border}`,color:C.textMuted}}>{s}</span>)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tab==="ai"&&(
        <div>
          <div style={{display:"flex",gap:6,marginBottom:14,flexWrap:"wrap"}}>
            <Metric label="Active" value={AGENTS_AI.filter(a=>a.status==="active").length} accent={C.purple} />
            <Metric label="Processed Today" value={AGENTS_AI.reduce((s,a)=>s+a.processed,0)} accent={C.purple} />
            <Metric label="Avg Accuracy" value={`${Math.round(AGENTS_AI.reduce((s,a)=>s+a.accuracy,0)/AGENTS_AI.length)}%`} accent={C.green} />
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {AGENTS_AI.map(a=>(
              <div key={a.id} style={{padding:"16px 18px",borderRadius:12,background:C.surface,border:`1px solid ${a.status==="active"?C.purple+"25":C.border}`}}>
                {/* Header */}
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                  <Av ini={a.name.substring(0,2)} size={40} ai />
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontFamily:F.sans,fontSize:15,fontWeight:700,color:C.text}}>{a.name}</span>
                      <Badge label={a.status} color={a.status==="active"?C.green:C.textDim} small mono />
                      {a.governed&&<GovShield small />}
                    </div>
                    <div style={{fontFamily:F.sans,fontSize:11,color:C.textDim}}>{a.type}</div>
                  </div>
                </div>

                {/* Description */}
                <div style={{fontFamily:F.sans,fontSize:12,color:C.textMuted,lineHeight:1.5,marginBottom:12,padding:"10px 12px",borderRadius:8,background:C.surface2,border:`1px solid ${C.border}`}}>
                  {a.desc}
                </div>

                {/* Stats */}
                <div style={{display:"flex",gap:6,marginBottom:14}}>
                  <div style={{flex:1,padding:"8px 10px",borderRadius:6,background:C.surface2,textAlign:"center"}}>
                    <div style={{fontFamily:F.mono,fontSize:16,fontWeight:700,color:C.purple}}>{a.processed}</div>
                    <div style={{fontFamily:F.sans,fontSize:8,color:C.textDim,marginTop:1}}>Processed</div>
                  </div>
                  <div style={{flex:1,padding:"8px 10px",borderRadius:6,background:C.surface2,textAlign:"center"}}>
                    <div style={{fontFamily:F.mono,fontSize:16,fontWeight:700,color:C.green}}>{a.accuracy}%</div>
                    <div style={{fontFamily:F.sans,fontSize:8,color:C.textDim,marginTop:1}}>Accuracy</div>
                  </div>
                  <div style={{flex:1,padding:"8px 10px",borderRadius:6,background:C.surface2,textAlign:"center"}}>
                    <div style={{fontFamily:F.mono,fontSize:16,fontWeight:700,color:C.cyan}}>{a.avgTime}</div>
                    <div style={{fontFamily:F.sans,fontSize:8,color:C.textDim,marginTop:1}}>Avg Time</div>
                  </div>
                </div>

                {/* Model info */}
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:12}}>
                  <span style={{fontFamily:F.mono,fontSize:9,color:C.textFaint}}>Model:</span>
                  <span style={{fontFamily:F.mono,fontSize:9,color:C.purple,padding:"2px 6px",borderRadius:4,background:C.purpleBg,border:`1px solid ${C.purple}20`}}>{a.model}</span>
                </div>

                {/* Recent actions */}
                <div>
                  <div style={{fontFamily:F.sans,fontSize:10,fontWeight:600,color:C.textDim,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:8}}>Recent Actions</div>
                  {a.recentActions.map((ra,i)=>(
                    <div key={i} style={{display:"flex",gap:8,padding:"6px 0",borderBottom:i<a.recentActions.length-1?`1px solid ${C.border}`:"none"}}>
                      <span style={{fontFamily:F.mono,fontSize:10,color:C.purple,flexShrink:0}}>{ra.ticket}</span>
                      <span style={{fontFamily:F.sans,fontSize:11,color:C.textMuted,flex:1}}>{ra.action}</span>
                      <span style={{fontFamily:F.mono,fontSize:9,color:C.textFaint,flexShrink:0}}>{ra.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
  { key: "crm", label: "CRM", glyph: "◇", count: 8, href: "/crm" },
  { key: "hrm", label: "HRM", glyph: "○", count: 7 },
  { key: "erp", label: "ERP", glyph: "□", count: 2 },
  { key: "gov", label: "Governance", glyph: "🛡️", live: true, href: "/governance" },
  { key: "del", label: "Delegation", glyph: "🤝", live: true, count: 2, href: "/delegation" },
  { key: "proto", label: "Prototype", glyph: "🧪", live: true, href: "/prototype" },
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

/* ═══════════════════════════════════════════════════════
   MAIN APP
   ═══════════════════════════════════════════════════════ */
export default function ClarityDesk() {
  const [view, setView] = useState("dashboard");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [now, setNow] = useState(new Date());
  const scrollRef = useRef(null);

  useEffect(()=>{const t=setInterval(()=>setNow(new Date()),60000);return()=>clearInterval(t);},[]);
  useEffect(()=>{scrollRef.current?.scrollTo(0,0);},[view,selectedTicket]);

  const navItems = [
    {key:"dashboard",label:"Dashboard",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>},
    {key:"tickets",label:"Tickets",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.5 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>},
    {key:"queues",label:"Queues",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>},
    {key:"agents",label:"Agents",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>},
  ];

  const ticketCount = TICKETS.filter(t=>t.status!=="resolved").length;
  const hitlCount = TICKETS.filter(t=>t.hitlPending).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
        * { box-sizing:border-box; margin:0; padding:0; }
        ::-webkit-scrollbar { width:4px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.06); border-radius:2px; }
        @keyframes pulse { 0%{transform:scale(1);opacity:0.6} 100%{transform:scale(2.4);opacity:0} }
        .sla-pulse { animation:pulse 1.5s ease-out infinite; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .fade-in { animation:fadeIn 0.3s ease-out; }
      `}</style>

      <div style={{display: "flex", height: "100vh", width: "100%", background: C.bg, overflow: "hidden"}}>
        <Rail active="proto" />
        <div style={{flex:1, display:"flex", flexDirection:"column", fontFamily:F.sans, color:C.text, overflow:"hidden"}}>
        {/* ── TOP BAR ── */}
        <div style={{padding:"12px 18px",borderBottom:`1px solid ${C.border}`,background:C.surface,flexShrink:0}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <div style={{width:28,height:28,borderRadius:7,background:"linear-gradient(135deg,#2563EB,#7C3AED)",display:"flex",alignItems:"center",justifyContent:"center"}}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1L2 4v4c0 3.3 2.6 6.4 6 7 3.4-.6 6-3.7 6-7V4L8 1z" stroke="#fff" strokeWidth="1.5" fill="rgba(255,255,255,0.15)"/><path d="M5.5 8L7 9.5L10.5 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div>
                <div style={{fontFamily:F.sans,fontSize:15,fontWeight:700,color:C.text,lineHeight:1}}>ClarityDesk</div>
                <div style={{fontFamily:F.mono,fontSize:9,color:C.textFaint,letterSpacing:"0.06em"}}>GOVERNED HELPDESK</div>
              </div>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              {hitlCount>0&&(
                <div style={{display:"flex",alignItems:"center",gap:4,padding:"4px 10px",borderRadius:6,background:C.amberBg,border:`1px solid ${C.amber}30`}}>
                  <span style={{fontFamily:F.mono,fontSize:11,fontWeight:700,color:C.amber}}>{hitlCount}</span>
                  <span style={{fontFamily:F.sans,fontSize:9,color:C.amber}}>HITL</span>
                </div>
              )}
              <div style={{fontFamily:F.mono,fontSize:10,color:C.textFaint}}>
                {now.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
              </div>
            </div>
          </div>
        </div>

        {/* ── CONTENT ── */}
        <div ref={scrollRef} className="fade-in" key={view+(selectedTicket||"")} style={{flex:1,overflowY:"auto",overflowX:"hidden"}}>
          {view==="dashboard"&&<DashboardView onNav={setView} />}
          {view==="tickets"&&!selectedTicket&&<TicketListView onSelect={setSelectedTicket} />}
          {view==="tickets"&&selectedTicket&&<TicketDetailView ticketId={selectedTicket} onBack={()=>setSelectedTicket(null)} />}
          {view==="queues"&&<QueuesView />}
          {view==="agents"&&<AgentsView />}
        </div>

        {/* ── BOTTOM NAV ── */}
        <div style={{display:"flex",borderTop:`1px solid ${C.border}`,background:C.surface,flexShrink:0,paddingBottom:"env(safe-area-inset-bottom)"}}>
          {navItems.map(n=>(
            <button key={n.key} onClick={()=>{setView(n.key);setSelectedTicket(null);}} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3,padding:"10px 0 8px",border:"none",cursor:"pointer",background:"transparent",color:view===n.key?C.blueLight:C.textFaint,transition:"color 0.15s",position:"relative"}}>
              {view===n.key&&<div style={{position:"absolute",top:0,left:"25%",right:"25%",height:2,borderRadius:1,background:C.blue}} />}
              {n.icon}
              <span style={{fontFamily:F.sans,fontSize:9,fontWeight:view===n.key?600:400}}>{n.label}</span>
              {n.key==="tickets"&&ticketCount>0&&<span style={{position:"absolute",top:6,right:"calc(50% - 16px)",width:16,height:16,borderRadius:"50%",background:C.red,fontFamily:F.mono,fontSize:9,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{ticketCount}</span>}
            </button>
          ))}
        </div>
        </div>
      </div>
    </>
  );
}
