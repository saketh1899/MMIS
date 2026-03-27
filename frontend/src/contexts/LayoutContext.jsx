import { createContext, useContext } from "react";

const LayoutContext = createContext(false);

export function LayoutProvider({ value, children }) {
  return <LayoutContext.Provider value={value}>{children}</LayoutContext.Provider>;
}

export function useIsInsideLayout() {
  return useContext(LayoutContext);
}
