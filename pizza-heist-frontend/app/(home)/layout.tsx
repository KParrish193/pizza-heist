import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local'

import "../globals.css";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";

const manic = localFont({
  src: '../MANIC-Regular.woff2',
  variable: "--font-manic",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // regular → bold
  variable: "--font-inter",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "700"], // normal & bold for code
  variable: "--font-geist-mono",
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
    <html lang="en-US" className={`${inter.variable} ${geistMono.variable} ${manic.variable}`}>
      <body>
        <Header />
          {children}
        <Footer />
      </body>
    </html>
  );
}

