import type { Team } from "@/app/components/ordering/team/teamContext";

export function calculatePriceByTeam(team: Team): number {
  if (team.salePrice > 0) {
    return team.salePrice;
  }

  if (team.discountPercentage > 0) {
    return Math.round(
      team.basePrice *
        (1 - team.discountPercentage / 100) * 100
    ) / 100;
  }

  return team.basePrice;
}