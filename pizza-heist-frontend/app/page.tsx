import { fetchSheetData, SheetRow } from "@/app/lib/gsheet";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export const revalidate = 0;

export default async function Home() {
  
  let heroContent: SheetRow[] = [];
  let aboutContent: SheetRow[] = [];
  let services: string[] = [];
  let location: string[] = [];

  try {
    const heroRows = await fetchSheetData("Home", "A2:F10");
    heroContent = heroRows;

    const aboutRows = await fetchSheetData("Home", "K2:N10");
    aboutContent = aboutRows;

    // filter services data
    const servicesRows = await fetchSheetData("Home", "H1:H10");
    services = servicesRows.map((row) => row["Services"]).filter((s): s is string => Boolean(s));

    const locationRows = await fetchSheetData("Home", "I1:I10");
    location = locationRows.map((row) => row["Service Location"]).filter((l): l is string => Boolean(l));
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to fetch sheet data:", err.message);
    } else {
      console.error("Unknown error fetching sheet data", err);
    }
  }
  
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <Image
          className={styles.logo}
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />
        <div className={styles.intro}>
          <h1>
            To get started, edit the{" "}
            <code className={styles.code}>page.tsx</code> file.
          </h1>
          <p>
            Looking for a starting point or more instructions? Head over to{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className={styles.ctas}>
          <a
            className={styles.primary}
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className={styles.logo}
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={14}
            />
            Deploy Now
          </a>
          <a
            className={styles.secondary}
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
