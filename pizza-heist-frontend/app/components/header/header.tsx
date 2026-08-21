"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import styles from "./header.module.css";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const pathname = usePathname();
  const noHero = pathname === "/contact-us";

  const headerRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {

    let prevScrollPos = window.scrollY;
    const threshold = 15; // pixels you must scroll before toggling
    const hideAfter = 80; // how far down before hiding can happen
    
    const handleScroll = () => {
      const currentScrollPos = Math.max(window.scrollY, 0);
      if (!headerRef.current) return;

      // Only hide if we've scrolled past the initial visible area 
      if (currentScrollPos > hideAfter) { if (currentScrollPos - prevScrollPos > threshold) { 
        // scrolling down past threshold 
        headerRef.current.style.top = "-95px"; } else if (prevScrollPos - currentScrollPos > threshold) { 
          // scrolling up past threshold 
          headerRef.current.style.top = "0px"; } } else { 
            // always show if we're near the top 
            headerRef.current.style.top = "0px"; } 
      prevScrollPos = currentScrollPos; 
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [noHero]);

  return (
    <header
      ref={headerRef}
      className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}
    >
      <div className={styles.headerWrapper}>
        {/* logo */}
        <Link href="/" className={styles.logo}>
          <Image
            src={"/logos/horizontal-logo.svg"}
            alt={"pizza heist logo"}
            width={100}
            height={50}
            priority
          />
        </Link>

        <div className={styles.searchWrapper}></div>
        <div className={styles.ctaWrapper}>
            <a className="button-secondary" href={"/"}>
                New Teams
            </a>
        </div>
      </div>
    </header>
  );
}
