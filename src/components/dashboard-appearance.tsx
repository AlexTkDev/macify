"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

export const dashboardStyles = [
  { id: "studio", name: "Studio", description: "An open workspace with a generous side rail." },
  { id: "dispatch", name: "Dispatch", description: "A publication masthead with bold editorial rules." },
  { id: "dock", name: "Dock", description: "A compact navigation dock and a centered canvas." },
  { id: "index", name: "Index", description: "A right-hand index with crisp, numbered navigation." },
  { id: "gallery", name: "Gallery", description: "An artwork-led collection with spacious app tiles." },
  { id: "ledger", name: "Ledger", description: "A compact working ledger with aligned data rows." },
  { id: "folio", name: "Folio", description: "A reading desk with a tall editorial masthead." },
  { id: "ribbon", name: "Ribbon", description: "A horizontal workspace ribbon and split status summary." },
  { id: "mosaic", name: "Mosaic", description: "An asymmetric workspace with a separate status column." },
  { id: "focus", name: "Focus", description: "A quiet single-column workspace with text navigation." },
] as const;
type Style = (typeof dashboardStyles)[number]["id"];
const storageKey = "macify-dashboard-style";
const eventName = "macify-dashboard-style-change";
function getStyle(): Style {
  try {
    const saved = localStorage.getItem(storageKey);
    return dashboardStyles.find(({ id }) => id === saved)?.id ?? "studio";
  } catch { return "studio"; }
}
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(eventName, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(eventName, callback);
  };
}
const AppearanceContext = createContext<{ style: Style; change: (style: Style) => void }>({ style: "studio", change: () => {} });
let sessionStyle: Style | undefined;
function snapshot() { return sessionStyle ?? getStyle(); }
function serverSnapshot(): Style { return "studio"; }

export function DashboardAppearance({ children }: { children: ReactNode }) {
  const style = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  function change(next: Style) {
    try {
      localStorage.setItem(storageKey, next);
      sessionStyle = undefined;
    } catch { sessionStyle = next; }
    window.dispatchEvent(new Event(eventName));
  }
  return <AppearanceContext value={{ style, change }}><div className="dashboard-appearance" data-style={style}>{children}</div></AppearanceContext>;
}

export function DashboardStylePicker() {
  const { style, change } = useContext(AppearanceContext);
  const selected = dashboardStyles.find(({ id }) => id === style)!;
  return <div className="dashboard-style-picker">
    <label htmlFor="dashboard-style">Workspace style</label>
    <select id="dashboard-style" value={style} onChange={(event) => change(event.target.value as Style)} aria-describedby="dashboard-style-description">
      {dashboardStyles.map(({ id, name }, index) => <option key={id} value={id}>{String(index + 1).padStart(2, "0")} · {name}</option>)}
    </select>
    <span id="dashboard-style-description" className="sr-only">{selected.description}</span>
  </div>;
}
