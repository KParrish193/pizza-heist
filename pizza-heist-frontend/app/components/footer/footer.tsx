import Image from "next/image";
import styles from "./footer.module.css";

export default function Footer() {
    return (
      <footer className={styles.footer}>
          {/* center */}
          <div className={styles.centerContainer}>
            <div className={styles.hasIcon}>
                <a
                    href={"https://www.instagram.com/pizzaheistjerseys/"}
                    target="_blank"
                    >
                    Send a carrier pigeon:
                    <Image
                        className={styles.icon}
                        src={"/icons/insta.svg"}
                        alt={"instagram icon"}
                        width={28}
                        height={28}
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
                        width={28}
                        height={28}
                    />
                </a>
            </div>
            <p className={styles.copyright}>&copy;Copyright Pizza Heist 2026</p>

          </div>
          {/* right */}
          <div className={styles.socials}>

          </div>
      </footer>
    );
}