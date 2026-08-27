"use client";

import { createContext, useContext, ReactNode } from "react";

interface Team {
  id: string;
  slug: string;
  name: string;
}

interface TeamContextType {
  team: Team;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

// TODO: update this when we add additional teams
const teams: Record<string, Team> = {
  "treasure-valley": {
    id: "treasure-valley",
    slug: "treasure-valley",
    name: "Treasure Valley Roller Derby",
  },
};

export function TeamProvider({
  children,
  slug,
}: {
  children: ReactNode;
  slug: string;
}) {
  const team = teams[slug];

//   TODO: update this to redirect to 404
  if (!team) {
    return null;
  }

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