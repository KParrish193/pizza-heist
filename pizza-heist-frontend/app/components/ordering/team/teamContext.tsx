"use client";

import { createContext, useContext, ReactNode } from "react";

export interface Team {
  slug: string;
  id: string;
  name: string;
  basePrice: number;
  discountPercentage: number;
  salePrice: number;
  pricingType: string;
  active: boolean;
  pickupAvailable: boolean;
  tabName: string;
}

interface TeamContextType {
  team: Team;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({
  children,
  team,
}: {
  children: ReactNode;
  team: Team;
}) {
  return (
    <TeamContext.Provider value={{ team }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);

  if (!context) {
    throw new Error("useTeam must be used within a TeamProvider");
  }

  return context;
}