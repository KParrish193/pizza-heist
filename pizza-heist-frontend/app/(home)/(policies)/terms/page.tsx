import { fetchSheetData, SheetRow } from "@/app/lib/gsheet";
import styles from "../policies.module.css";
import pageStyles from "../../page.module.css";

export const revalidate = 0;

export default async function TermsandConditions() {
  let termsContent: SheetRow[] = [];

  try {
    const contentRows = await fetchSheetData("Terms", "A1:B20");
    termsContent = contentRows
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
        <section className={styles.privacyWrapper}>
            <h1>Terms and Conditions</h1>
            {termsContent.map((content, i: number) => {
                return (              
                    <div className={styles.wrapper} key={i}>
                        {content.children}
                    </div>
                );
            })}
        </section>
      </main>
    </div>
  );
}