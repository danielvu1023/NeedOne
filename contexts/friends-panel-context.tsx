"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface FriendsPanelContextType {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  toggleExpanded: () => void;
}

const FriendsPanelContext = createContext<FriendsPanelContextType | undefined>(
  undefined
);

export function FriendsPanelProvider({ children }: { children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  return (
    <FriendsPanelContext.Provider
      value={{ isExpanded, setIsExpanded, toggleExpanded }}
    >
      {children}
    </FriendsPanelContext.Provider>
  );
}

export function useFriendsPanel() {
  const context = useContext(FriendsPanelContext);
  if (context === undefined) {
    throw new Error(
      "useFriendsPanel must be used within a FriendsPanelProvider"
    );
  }
  return context;
}