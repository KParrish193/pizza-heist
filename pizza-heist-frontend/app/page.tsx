import { fetchSheetData, SheetRow } from "@/app/lib/gsheet";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

export const revalidate = 0;

export default async function Home() {
  let heroContent: SheetRow[] = [];
  let ctaContent: SheetRow[] = [];
  let orderContent: SheetRow[] = [];
  let orderProcess: SheetRow[] = [];
  let aboutContent: SheetRow[] = [];

  try {
    const heroRows = await fetchSheetData("Home", "A2:I3");
    heroContent = heroRows;

    const ctaRows = await fetchSheetData("Home", "A7:H8");
    ctaContent = ctaRows;

    const orderRows = await fetchSheetData("Home", "A11:C12");
    orderContent = orderRows;

    // filter order process data
    const processRows = await fetchSheetData("Home", "A13:G20");
    orderProcess = processRows

    const aboutRows = await fetchSheetData("Home", "A23:E29");
    aboutContent = aboutRows;

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
        <section className={styles.hero}>
          <Image
            src={"/logos/slice-03.svg"}
            alt={"pizza slice logo"}
            width={125}
            height={150}
            priority
          />
          {heroContent.map((hero, i: number) => {
            return (              
                <div className={styles.heroWrapper} key={i}>
                    {hero.heading ? <h1>{hero.heading}</h1> : null}
                    {hero.subheading ? <h3>{hero.subheading}</h3> : null}
                    {hero.copy ? <p> {hero.copy}</p> : null}
                    {hero.copy2 ? <p> {hero.copy2}</p> : null}
                </div>
            );
          })}
        </section>

        <section className={styles.cta}>
          {ctaContent.map((cta, i: number) => {
            return (              
                <div className={styles.ctaWrapper} key={i}>
                    {cta.heading ? <h2>{cta.heading}</h2> : null}
                    {cta.subheading ? <h3>{cta.subheading}</h3> : null}
                    {cta.copy ? <p> {cta.copy}</p> : null}
                    {/* link */}
                    {cta.link && cta.link !== " " ? (
                      <a className="button-primary" href={cta.link}>
                        {cta.link_text}
                      </a>
                    ) : (
                      <Link className="button-primary" href={"/"}>
                      </Link>
                    )}
                </div>
            );
          })}
        </section>

        <section>
          <div className={styles.processCopy}>
          {orderContent.map((copy, i: number) => {
            return (              
                <div className={styles.orderContentWrapper} key={i}>
                    {copy.heading ? <h2>{copy.heading}</h2> : null}
                    {copy.subheading ? <h3>{copy.subheading}</h3> : null}
                    {copy.copy ? <p> {copy.copy}</p> : null}
                </div>
            );
          })} 
          </div>

          <div className={styles.processListing}>
            <ul>
              {orderProcess.map((step, i: number) => {
                return (
                  <li key={i}>
                    <h5>{step.heading} </h5>
                    <p>{step.copy}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>
        
        <section className={styles.about}>
          <h2>The Mastermind Behind the Operation</h2>
          {aboutContent.map((copy, i: number) => {
            return (              
                <div className={styles.aboutContentWrapper} key={i}>
                    {copy.heading ? <h1>{copy.heading}</h1> : null}
                    {copy.subheading ? <h3>{copy.subheading}</h3> : null}
                    {copy.copy ? <p> {copy.copy}</p> : null}
                </div>
            );
          })} 
        </section>
      </main>
    </div>
  );
}
