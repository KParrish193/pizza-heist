import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Inter, Courier_Prime } from "next/font/google";
import localFont from 'next/font/local'
import "@/app/globals.css";
import Footer from "@/app/components/footer/footer";
import { fetchTeamBySlug } from "@/app/lib/gsheet";
import { CartProvider } from "@/app/components/ordering/cart/cartContext";
import { TeamProvider } from "@/app/components/ordering/team/teamContext";

const manic = localFont({
  src: "../../../MANIC-Regular.woff2",
  variable: "--font-manic",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // regular → bold
  variable: "--font-inter",
});

const courierPrime = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"], // normal & bold for code
  variable: "--font-courier-prime",
});

export const metadata: Metadata = {
  title: "Pizza Heist Jerseys",
  description: ""
};

export default async function ShopLayout({
    children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ team: string }>;
}) {
  const { team: slug } = await params;

  const team = await fetchTeamBySlug(slug);

  if (!team || !team.active) {
    notFound();
  }

  return (
    <html lang="en-US" className={`${inter.variable} ${courierPrime.variable} ${manic.variable}`}>
      <body>
        <TeamProvider team={team}>
          <CartProvider>
            {children}
          </CartProvider>
        </TeamProvider>
        <Footer />
      </body>
    </html>
  );
}
