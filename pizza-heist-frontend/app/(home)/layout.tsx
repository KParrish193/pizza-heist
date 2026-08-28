import type { Metadata } from "next";
import { Inter, Courier_Prime } from "next/font/google";
import localFont from 'next/font/local'

import "../globals.css";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";

const manic = localFont({
  src: '../MANIC-Regular.woff2',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-US" className={`${inter.variable} ${courierPrime.variable} ${manic.variable}`}>
      <body>
        <Header />
          {children}
        <Footer />
      </body>
    </html>
  );
}

