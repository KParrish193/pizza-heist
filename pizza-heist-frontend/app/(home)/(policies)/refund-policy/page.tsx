import { fetchSheetData, SheetRow } from "@/app/lib/gsheet";
import styles from "./privacy.module.css";
import pageStyles from "../page.module.css";

export const revalidate = 0;

export default async function RefundPolicy() {
  let refundContent: SheetRow[] = [];

  try {
    const contentRows = await fetchSheetData("RefundPolicy", "A1:B20");
    refundContent = contentRows
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
            <h1>Refund & Cancellation Policy</h1>
            {refundContent.map((content, i: number) => {
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