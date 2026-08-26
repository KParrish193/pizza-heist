// cart drawer, only contains drawer open/closed state, display cart state
"use client";

import { useEffect } from "react";
import styles from "./drawer.module.css";

type DrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  headingChildren: React.ReactNode;
  children: React.ReactNode;
};

export default function Drawer({
  isOpen,
  onClose,
  headingChildren,
  children,
}: DrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.drawerBackdrop} ${
          isOpen ? styles["drawerBackdrop--open"] : ""
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`${styles.drawer} ${
          isOpen ? styles["drawer--open"] : ""
        }`}
        aria-hidden={!isOpen}
      >
        <div className={styles.drawerHeader}>
          {headingChildren}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cart"
            className={styles.closeBtn}
          />
        </div>

        <div className={styles.drawerContent}>
          {children}
        </div>
      </aside>
    </>
  );
}
