"use client";

import React, { useState, createContext, useContext } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Script from 'next/script';

const FONT_STACK = {
  display: "'Newsreader', Georgia, serif",
  body: "'Söhne', 'Inter', -apple-system, sans-serif",
  mono: "'Söhne Mono', 'JetBrains Mono', ui-monospace, monospace",
};

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
    govern: "#3B82F6",
    automate: "#22C7A9",
    intel: "#A78BFA",
    execute: "#F5A524",
    danger: "#F26D6D",
    ok: "#4ADE80",
    railBg: "#0A0B0D",
    badgeFill: "#06121F",
    scrollThumb: "#2B323B",
  },
  light: {
    name: "light",
    bg: "#F6F4EF",            
    panel: "#FFFFFF",
    panelHi: "#FBFAF6",
    line: "#E6E2D8",
    lineHi: "#D5CFC1",
    text: "#1A1C20",          
    textDim: "#5E6066",
    textFaint: "#9A968C",
    govern: "#2563EB",
    automate: "#0E9B86",
    intel: "#7C5CD6",
    execute: "#C9821A",
    danger: "#D6453F",
    ok: "#10B981",
    railBg: "#F6F4EF",
    badgeFill: "#FFFFFF",
    scrollThumb: "#D5CFC1",
  }
};

export const ThemeCtx = createContext(THEMES.dark);
export const useT = () => useContext(ThemeCtx);

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
  { key: "orchestration", label: "Orchestration", glyph: "⚙️", live: true, href: "/orchestration" },
];

function Rail({ active }: { active: string }) {
  const T = useT();
  return (
    <div style={{
      width: 76, background: T.railBg, borderRight: `1px solid ${T.line}`,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "20px 0", gap: 6, flexShrink: 0,
      height: "100vh", overflowY: "auto"
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 10, marginBottom: 18,
        background: `linear-gradient(135deg, ${T.govern}, ${T.intel})`,
        display: "grid", placeItems: "center",
        font: `700 16px ${FONT_STACK.display}`, color: "#fff", flexShrink: 0
      }}>4x</div>
      {MODULES.map((m) => {
        const on = active === m.key;
        return (
          <Link key={m.key} href={m.href || "#"} title={m.label} style={{
            position: "relative", width: 52, height: 52, borderRadius: 12, cursor: "pointer",
            background: on ? T.panelHi : "transparent",
            border: `1px solid ${on ? T.lineHi : "transparent"}`,
            color: on ? T.text : T.textFaint, transition: "all .15s",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2,
            textDecoration: "none", flexShrink: 0
          }}>
            <span style={{ font: `400 18px ${FONT_STACK.body}` }}>{m.glyph}</span>
            <span style={{ font: `500 9px ${FONT_STACK.body}`, letterSpacing: ".02em", whiteSpace: "nowrap" }}>{m.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

export default function OrchestrationLayout({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState("dark");
  const theme = THEMES[mode as keyof typeof THEMES] || THEMES.dark;
  const pathname = usePathname();
  const isOverview = pathname === "/orchestration" || pathname === "/orchestration/";

  // Simple inner nav header for the orchestration module
  const subNav = [
    { label: "Overview", href: "/orchestration" },
    { label: "Saga Monitor", href: "/orchestration/saga" },
    { label: "Prototype", href: "/orchestration/orchestration" },
    { label: "Examples", href: "/orchestration/examples" },
    { label: "Categories", href: "/orchestration/categories" },
  ];

  return (
    <ThemeCtx.Provider value={theme}>
      <div style={{ 
        display: "flex", height: "100vh", width: "100%", 
        background: theme.bg, color: theme.text, 
        font: `400 14px ${FONT_STACK.body}`, overflow: "hidden" 
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600;6..72,700&family=Inter:wght@400;500;600&display=swap');
          * { box-sizing: border-box; }
          ::-webkit-scrollbar { width: 8px; } ::-webkit-scrollbar-thumb { background:${theme.scrollThumb}; border-radius:8px; }
          ::-webkit-scrollbar-track { background: transparent; }
          body { margin: 0; padding: 0; }
        `}</style>

        <Rail active="orchestration" />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, minHeight: 0 }}>
          {/* Header */}
          <div style={{ padding: "20px 28px 0", borderBottom: `1px solid ${theme.line}` }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <h1 style={{ font: `600 26px ${FONT_STACK.display}`, color: theme.text, margin: 0, letterSpacing: "-.01em" }}>
                  Blueprint Central — Orchestration
                </h1>
                <p style={{ font: `400 13.5px ${FONT_STACK.body}`, color: theme.textDim, margin: "4px 0 0" }}>
                  Design, manage, and execute complex sagas natively on the platform.
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <button
                  onClick={() => setMode(mode === "dark" ? "light" : "dark")}
                  style={{
                    display: "flex", alignItems: "center", gap: 7, cursor: "pointer",
                    background: theme.panelHi, border: `1px solid ${theme.lineHi}`, borderRadius: 8,
                    padding: "6px 11px", color: theme.textDim, font: `500 12px ${FONT_STACK.body}`,
                    transition: "all .15s",
                  }}>
                  <span style={{ font: `400 13px ${FONT_STACK.body}` }}>{mode === "dark" ? "☾" : "☀"}</span>
                  {mode === "dark" ? "Control room" : "Ledger"}
                </button>
              </div>
            </div>
            
            <div style={{ display: "flex", gap: 4, marginTop: 16, overflowX: "auto" }}>
              {subNav.map((f) => {
                const on = pathname === f.href || pathname === f.href + '/';
                return (
                  <Link key={f.label} href={f.href} style={{
                    position: "relative", font: `500 13px ${FONT_STACK.body}`, textDecoration: "none",
                    color: on ? theme.text : theme.textFaint, background: "transparent",
                    border: "none", borderBottom: `2px solid ${on ? theme.govern : "transparent"}`,
                    padding: "8px 14px 12px", cursor: "pointer", transition: "color .15s",
                    whiteSpace: "nowrap"
                  }}>
                    {f.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Main Content Area */}
          <div style={{ 
            flex: 1, overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", minHeight: 0,
            filter: (!isOverview && mode === "light") ? "invert(1) hue-rotate(180deg)" : "none",
            transition: "filter 0.3s ease"
          }}>
            <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
            {children}
          </div>
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
