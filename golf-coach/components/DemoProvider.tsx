"use client";

import { createContext, useContext } from "react";

const DemoContext = createContext(false);

export function DemoProvider({ children, isDemoMode }: { children: React.ReactNode; isDemoMode: boolean }) {
  return <DemoContext.Provider value={isDemoMode}>{children}</DemoContext.Provider>;
}

export function useDemoMode() {
  return useContext(DemoContext);
}
