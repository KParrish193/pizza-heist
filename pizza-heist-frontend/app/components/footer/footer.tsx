import Image from "next/image";
import styles from "./footer.module.css";

export default function Footer() {
    return (
      <footer className={styles.footer}>
        <div className={styles.footerWrapper}>
          {/* left */}
          <div className={styles.phone}>

          </div>

          {/* center */}
          <p className={styles.copyright}>&copy;Copyright Gourley Tree Removal LLC 2026</p>
          
          {/* right */}
          <div className={styles.socials}>
            <a
              href={"https://www.instagram.com/gourley_tree_removal/"}
              target="_blank"
            >
              <Image
                className={styles.icon}
                src={"/icons/insta.svg"}
                alt={"instagram icon"}
                width={28}
                height={28}
              />
            </a>
          </div>
        </div>
      </footer>
    );
}