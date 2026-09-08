"use client";

import { useEffect, useState } from "react";
import styles from "./sizeChart.module.css";

type SizeChartRow = {
  "": string;
  [size: string]: string | number;
};

type MeasuringInstruction = {
  label: string;
  description: string;
};

type SizeChartData = {
  sizeChart: SizeChartRow[];
  measuringInstructions: MeasuringInstruction[];
};

type SizeChartProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function SizeChart({
  isOpen,
  onClose,
}: SizeChartProps) {
  const [data, setData] = useState<SizeChartData | null>(null);
  const [loading, setLoading] = useState(false);

  // Lock layer beneath the chart modal
  useEffect(() => {
    if (!isOpen) return;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Use Escape key to close
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

  // Load size chart data
  useEffect(() => {
    if (!isOpen || data) return;

    const fetchSizeChart = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/size-chart");

        if (!res.ok) {
          throw new Error("Failed to fetch size chart");
        }
        const result: SizeChartData = await res.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching size chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSizeChart();
    
  }, [isOpen, data]);

  if (!isOpen) return null;

  const sizeChart = data?.sizeChart ?? [];
  const measuringInstructions = data?.measuringInstructions ?? [];

  const sizes =
    sizeChart.length > 0
      ? Object.keys(sizeChart[0]).filter((key) => key !== "")
      : [];

  return (
    <div
      className={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="size-chart-title"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="size-chart-title">Size Chart</h2>
          {/* TODO: Add a toggle for cm (metric) */}
          <span className={styles.disclaimer}>(inches)</span>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close size chart"
            className={styles.closeBtn}
          />
        </div>

        <div className={styles.content}>
          {loading && <p>Loading size chart...</p>}

          {!loading && data && (
            <>
              {sizeChart.length > 0 && (
                <table>
                  <thead>
                    <tr>
                      <th></th>

                      {sizes.map((size) => (
                        <th
                          className={styles.sizeLabel}
                          key={size}
                        >
                          {size}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {sizeChart.map((row, index) => {
                      if (row[""] === "Length:") {
                        return (
                          <tr key={index}>
                            <th></th>
                            <th
                              className={styles.lengthLabel}
                              colSpan={sizes.length}
                            >
                              Length
                            </th>
                          </tr>
                        );
                      }

                      return (
                        <tr key={index}>
                          <th className={styles.headingColumn}>
                            {row[""]}
                          </th>

                          {sizes.map((size) => (
                            <td key={size}>
                              {row[size]}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
              
              {measuringInstructions.length > 0 && (
                <div className={styles.instructions}>
                  {measuringInstructions.map((instruction) => (
                    <div key={instruction.label}>
                      <h4>{instruction.label}:</h4>
                      <p>{instruction.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {!loading && !data && (
            <p>Unable to load size chart.</p>
          )}
        </div>
      </div>
    </div>
  );
}