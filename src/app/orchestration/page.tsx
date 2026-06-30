"use client";

import React from 'react';
import { useT } from './layout';

const MODULES = [
  {
    title: "Saga Monitor",
    description: "Visualize distributed transactions, state progression, and compensations in real-time.",
    icon: "⚡",
    href: "/orchestration/saga",
    color: "#22C7A9", // automate teal
  },
  {
    title: "Orchestration Prototype",
    description: "End-to-end entity-native workflow engine prototype with multiple actors.",
    icon: "⚙️",
    href: "/orchestration/orchestration",
    color: "#7C5CD6", // intel violet
  },
  {
    title: "Blueprint Examples",
    description: "Explore structured blueprint definitions, contracts, and schema patterns.",
    icon: "📦",
    href: "/orchestration/examples",
    color: "#3B82F6", // govern blue
  },
  {
    title: "Blueprint Categories",
    description: "Discover the 6 distinct execution models, from standard workflows to SLA-bound tasks.",
    icon: "📚",
    href: "/orchestration/categories",
    color: "#F5A524", // execute amber
  }
];

export default function OrchestrationHome() {
  const T = useT();
  const FONT_BODY = "'Söhne', 'Inter', -apple-system, sans-serif";
  const FONT_MONO = "'Söhne Mono', 'JetBrains Mono', ui-monospace, monospace";

  return (
    <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px", background: T.bg }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        
        {/* Hero */}
        <div style={{ marginBottom: 40, textAlign: "center" }}>
          <div style={{ 
            display: "inline-block", padding: "4px 12px", borderRadius: 20, 
            background: T.panel, border: `1px solid ${T.lineHi}`, 
            color: T.execute, font: `600 11px ${FONT_MONO}`,
            letterSpacing: ".05em", marginBottom: 16
          }}>
            PLATFORM ENGINE v3.0
          </div>
          <h2 style={{ font: `600 32px ${FONT_BODY}`, color: T.text, margin: "0 0 12px", letterSpacing: "-.02em" }}>
            Orchestration Hub
          </h2>
          <p style={{ font: `400 15px ${FONT_BODY}`, color: T.textDim, margin: 0, lineHeight: 1.6, maxWidth: 600, marginInline: "auto" }}>
            The central nervous system for governed agentic workflows. 
            Choose a module below to inspect state, simulate executions, or review architectural blueprints.
          </p>
        </div>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {MODULES.map((mod, i) => (
            <a key={i} href={mod.href} style={{ textDecoration: "none" }}>
              <div 
                style={{
                  background: T.panel,
                  border: `1px solid ${T.line}`,
                  borderRadius: 16,
                  padding: 24,
                  cursor: "pointer",
                  transition: "all .2s ease-out",
                  height: "100%",
                  display: "flex", flexDirection: "column"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = T.panelHi;
                  e.currentTarget.style.borderColor = T.lineHi;
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 8px 30px -12px ${mod.color}30`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = T.panel;
                  e.currentTarget.style.borderColor = T.line;
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: 12, 
                    background: `${mod.color}15`, border: `1px solid ${mod.color}30`,
                    display: "grid", placeItems: "center", fontSize: 20
                  }}>
                    {mod.icon}
                  </div>
                  <div style={{ 
                    width: 28, height: 28, borderRadius: 14, 
                    background: T.bg, border: `1px solid ${T.line}`,
                    display: "grid", placeItems: "center",
                    color: T.textDim, font: `500 14px ${FONT_BODY}`
                  }}>
                    →
                  </div>
                </div>
                
                <h3 style={{ font: `600 18px ${FONT_BODY}`, color: T.text, margin: "0 0 8px" }}>
                  {mod.title}
                </h3>
                <p style={{ font: `400 13.5px ${FONT_BODY}`, color: T.textFaint, margin: 0, lineHeight: 1.5, flex: 1 }}>
                  {mod.description}
                </p>
              </div>
            </a>
          ))}
        </div>

      </div>
    </div>
  );
}
