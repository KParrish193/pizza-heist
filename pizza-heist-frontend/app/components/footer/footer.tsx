import Image from "next/image";
import styles from "./footer.module.css";

export default function Footer() {
    return (
      <footer className={styles.footer}>
          {/* center */}
          <div className={styles.centerContainer}>
            <div className={styles.hasIcon}>
                <a href={"mailto:agent@pizzaheistjerseys.com"}>
                    Send an encoded message: 
                    <Image
                        className={styles.icon}
                        src={"/icons/mail.svg"}
                        alt={"mail icon"}
                        width={20}
                        height={20}
                    />
                </a>
            </div>
            <div className={styles.hasIcon}>
                <a
                    href={"https://www.instagram.com/pizzaheistjerseys/"}
                    target="_blank"
                >Follow Us:
                    <Image
                        className={styles.icon}
                        src={"/icons/insta.svg"}
                        alt={"instagram icon"}
                        width={20}
                        height={20}
                    />
                </a>
            </div>
            <p className={styles.copyright}>&copy;Copyright Pizza Heist Jersey Co., 2026</p>
          </div>
      </footer>
    );
}