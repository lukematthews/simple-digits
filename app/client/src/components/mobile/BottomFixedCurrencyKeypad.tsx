import React, { useState, useEffect, useRef } from "react";

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  onClose?: () => void;
  currency?: string;
  locale?: string;
}

export default function BottomFixedCurrencyNumpad({ value = 0, onChange, onClose, currency = "USD", locale = "en-US" }: Props) {
  const [rawValue, setRawValue] = useState("0");
  const [isNegative, setIsNegative] = useState(value < 0);
  const [hasDecimal, setHasDecimal] = useState(false);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync external value to internal rawValue only if not focused (to avoid overwriting user typing)
  useEffect(() => {
    if (!focused) {
      const absVal = Math.abs(value);
      const strVal = absVal.toString();
      if (strVal.includes(".")) {
        const [intPart, decPart] = strVal.split(".");
        if (decPart.length > 0) {
          setRawValue(absVal.toFixed(decPart.length));
          setHasDecimal(true);
        } else {
          setRawValue(intPart);
          setHasDecimal(false);
        }
      } else {
        setRawValue(strVal);
        setHasDecimal(false);
      }
      setIsNegative(value < 0);
    }
  }, [value, focused]);

  function formatCurrency(val: string | number) {
    let num = typeof val === "string" ? Number(val) : val;
    if (isNaN(num)) return "";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  }

  function formatDisplay(val: string) {
    if (!hasDecimal) {
      // integer only - format with locale commas
      const num = Number(val);
      if (isNaN(num)) return "0";
      return num.toLocaleString(locale);
    }
    // decimal present
    if (val.endsWith(".")) {
      // show trailing decimal point
      return val;
    }
    const parts = val.split(".");
    const intPart = Number(parts[0]).toLocaleString(locale);
    const decPart = parts[1]?.slice(0, 2) ?? "";
    return decPart.length > 0 ? `${intPart}.${decPart}` : `${intPart}.`;
  }

  function updateValue(newRaw: string, newHasDecimal: boolean) {
    // Clean leading zeros from integer part, but keep decimal intact
    let cleanRaw = newRaw;
    if (!newHasDecimal) {
      cleanRaw = cleanRaw.replace(/^0+(?=\d)/, "") || "0";
    } else {
      const [intPart, decPart] = cleanRaw.split(".");
      const cleanInt = intPart.replace(/^0+(?=\d)/, "") || "0";
      cleanRaw = decPart !== undefined ? `${cleanInt}.${decPart}` : cleanInt;
    }

    setRawValue(cleanRaw);
    setHasDecimal(newHasDecimal);

    // Notify parent if valid number (but allow raw ending with '.' without notifying)
    if (cleanRaw === "" || cleanRaw === "." || cleanRaw.endsWith(".")) {
      return;
    }
    const numeric = Number(cleanRaw);
    if (!isNaN(numeric)) {
      onChange?.((isNegative ? -1 : 1) * numeric);
    }
  }

  function onDigit(digit: string) {
    if (hasDecimal) {
      const parts = rawValue.split(".");
      if (parts.length === 2) {
        if (parts[1].length >= 2) return; // max 2 decimals
        updateValue(rawValue + digit, true);
      } else {
        // fallback just in case
        updateValue(rawValue + digit, true);
      }
    } else {
      if (rawValue === "0") {
        updateValue(digit, false);
      } else if (rawValue.length < 9) {
        updateValue(rawValue + digit, false);
      }
    }
  }

  function onDecimal() {
    if (!hasDecimal) {
      updateValue(rawValue + ".", true);
    }
  }

  function onBackspace() {
    if (rawValue.length <= 1) {
      updateValue("0", false);
      setHasDecimal(false);
    } else {
      let newVal = rawValue.slice(0, -1);
      if (newVal.endsWith(".")) {
        setHasDecimal(true);
      } else {
        setHasDecimal(newVal.includes("."));
      }
      if (newVal === "") {
        newVal = "0";
        setHasDecimal(false);
      }
      updateValue(newVal, newVal.includes("."));
    }
  }

  function onToggleSign() {
    setIsNegative((neg) => {
      const newNeg = !neg;
      const numeric = Number(rawValue);
      onChange?.(newNeg ? -numeric : numeric);
      return newNeg;
    });
  }

  function onFocus() {
    setFocused(true);
  }

  function onDone() {
    setFocused(false);
    onClose?.();
    inputRef.current?.blur();
  }

  useEffect(() => {
    function onClickOutside(event: Event) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setFocused(false);
        onClose?.();
        inputRef.current?.blur();
      }
    }
    if (focused) {
      document.addEventListener("mousedown", onClickOutside);
      document.addEventListener("touchstart", onClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("touchstart", onClickOutside);
    };
  }, [focused, onClose]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        readOnly
        onFocus={onFocus}
        value={(isNegative ? "-" : "") + (focused ? formatDisplay(rawValue) : formatCurrency(rawValue))}
        style={{
          fontSize: 20,
          padding: 12,
          width: "100%",
          boxSizing: "border-box",
          borderRadius: 6,
          border: "1px solid #ccc",
          textAlign: "right",
          userSelect: "none",
        }}
        aria-label="Currency input"
      />

      {focused && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "#222",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8,
            padding: 12,
            zIndex: 9999,
            touchAction: "manipulation",
          }}
          role="application"
          aria-label="Numeric keypad"
        >
          {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
            <button key={num} type="button" onClick={() => onDigit(num.toString())} style={btnStyle} aria-label={`Number ${num}`}>
              {num}
            </button>
          ))}
          <button type="button" onClick={onToggleSign} style={btnStyle} aria-label="Toggle positive negative">
            ±
          </button>
          <button type="button" onClick={() => onDigit("0")} style={btnStyle} aria-label="Number 0">
            0
          </button>
          <button type="button" onClick={onDecimal} style={btnStyle} aria-label="Decimal point">
            .
          </button>
          <button type="button" onClick={onBackspace} style={btnStyle} aria-label="Backspace">
            ⌫
          </button>
          <button type="button" onClick={onDone} style={{ ...btnStyle, gridColumn: "span 2", backgroundColor: "#1e90ff", fontWeight: "bold" }} aria-label="Done">
            Done
          </button>
        </div>
      )}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  fontSize: 28,
  padding: "18px 0",
  backgroundColor: "#444",
  border: "none",
  borderRadius: 8,
  color: "white",
  userSelect: "none",
  touchAction: "manipulation",
};
