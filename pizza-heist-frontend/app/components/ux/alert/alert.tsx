"use client";

import styles from "./alert.module.css";

interface ModalAlertProps {
  heading: string;
  message: string;
  type?: "error" | "success"; // optional, defaults to error
  onClose: () => void;
}

export default function Alert({
  heading,
  message,
  type = "error",
  onClose,
}: ModalAlertProps) {
  return (
    <div role="alertdialog" aria-modal="true" className={styles.overlay}>
      <div
        className={`${styles.modal} ${
          type === "error" ? styles.error : styles.success
        }`}
      >
        <h2>{heading}</h2>
        <div className={styles.message}>{message}</div>
        <button className={`button-secondary ${styles.closeButton}`} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}
