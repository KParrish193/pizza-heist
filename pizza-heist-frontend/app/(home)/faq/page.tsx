import { fetchSheetData, SheetRow } from "@/app/lib/gsheet";
// import Link from "next/link";
import Image from "next/image";
import styles from "./faq.module.css";
import pageStyles from "../page.module.css";

export const revalidate = 0;

export default async function Faq() {
  let faqContent: SheetRow[] = [];

  try {
    const faqRows = await fetchSheetData("FAQ", "A1:B20");
    faqContent = faqRows
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Failed to fetch sheet data:", err.message);
    } else {
      console.error("Unknown error fetching sheet data", err);
    }
  }
  
  return (
    <div className={pageStyles.page}>
      <main className={pageStyles.main}>
        <section className={styles.faqWrapper}>
            <div className={styles.headingWrapper}>
                <Image
                    src={"/logos/slice-03.svg"}
                    alt={"pizza slice logo"}
                    width={125}
                    height={125}
                    priority
                />
                <h1>Frequently Asked Questions</h1>
          </div>
          {faqContent.map((faq, i: number) => {
            return (              
                <div className={styles.questionsWrapper} key={i}>
                    {faq.question ? <h3>{faq.question}</h3> : null}
                    {faq.copy ? <p> {faq.copy}</p> : null}
                </div>
            );
          })}
        </section>
        
      </main>
    </div>
  );
}