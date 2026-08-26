"use client";

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import styles from "./sizeChart.module.css";

type SizeChartProps = {
  isOpen: boolean;
  onClose: () => void;
};

type SizeChartData = string[][];

export default function SizeChart({
  isOpen,
  onClose,
}: SizeChartProps) {
  const [data, setData] = useState<any>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log("SizeChart effect", {
        isOpen,
        data,
    });

    if (!isOpen || data) return;
    
    const fetchSizeChart = async () => {
      setLoading(true);

      try {
        const res = await fetch("/api/size-chart");
        if (!res.ok) {
          throw new Error("Failed to fetch size chart");
        }
        const sizeChart = await res.json();
        setData(sizeChart);

      } catch (error) {
        console.error("Error fetching size chart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSizeChart();
  }, [isOpen, data]);

  if (!isOpen) return null;

  const sizes = data ? Object.keys(data[0]).filter((key) => key !== "")
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

          {!loading && data && data.length > 0 && (
            <table>
              <thead>
                <tr>
                  <th></th>
                    {sizes.map((size) => (
                    <th className={styles.sizeLabel} key={size}>{size}</th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {data.map((row: { [x: string]: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; }, index: Key | null | undefined) => {
                    if (row[""] === "Length:") {
                    return (
                        <tr key={index}>
                            <th></th>
                            <th className={styles.lengthLabel} colSpan={sizes.length}>
                                Length
                            </th>
                        </tr>
                    );
                    }

                    return (
                    <tr key={index}>
                        <th className={styles.headingColumn}>{row[""]}</th>
                        {sizes.map((size) => (
                            <td key={size}>{row[size]}</td>
                        ))}
                    </tr>
                    );
                })}
              </tbody>
            </table>
          )}

          {!loading && !data && (
            <p>Unable to load size chart.</p>
          )}
        </div>
      </div>
    </div>
  );
}