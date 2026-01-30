"use client";

import JsBarcode from "jsbarcode";
import { useEffect, useRef } from "react";

const detectBarcodeFormat = (value: string): string => {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length === 13) {
    return "EAN13";
  }
  if (cleaned.length === 8) {
    return "EAN8";
  }
  if (cleaned.length === 12) {
    return "UPC";
  }
  return "CODE128";
};

export default function BarcodeSvg({ value, height }: { value: string; height: number }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current || !value) {
      return;
    }
    try {
      const format = detectBarcodeFormat(value);
      JsBarcode(svgRef.current, value, {
        format,
        displayValue: true,
        height,
        margin: 2,
        width: format === "EAN13" || format === "EAN8" || format === "UPC" ? 1.5 : 2,
        fontSize: 10,
        textAlign: "center",
        textPosition: "bottom",
        textMargin: 2,
        background: "transparent",
        lineColor: "#000000",
      });
    } catch {
      svgRef.current.innerHTML = "";
    }
  }, [value, height]);

  return <svg ref={svgRef} className="h-auto w-full" style={{ maxWidth: "100%" }} />;
}
