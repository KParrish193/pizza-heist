import { cookies } from "next/headers";
import { fetchTeamBySlug } from "@/app/lib/gsheet";
import Shop from "./shop";
import ShopPassword from "@/app/components/ordering/shopPassword/shopPassword";

interface OrderPageProps {
  params: Promise<{
    team: string;
  }>;
}

export default async function OrderPage({
  params,
}: OrderPageProps) {
  const { team: teamSlug } = await params;

  const team = await fetchTeamBySlug(teamSlug);

  if (!team) {
    return <p>Shop not found.</p>;
  }

  const cookieStore = await cookies();
  const authCookie = cookieStore.get(`shop-auth-${teamSlug}`);

  if (authCookie?.value !== "authenticated") {
    return (
      <ShopPassword
        teamSlug={team.slug}
        teamName={team.name}
      />
    );
  }

  return <Shop />;
}