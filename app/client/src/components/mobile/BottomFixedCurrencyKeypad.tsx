import React, { useState, useEffect, useRef } from "react";

interface Props {
  value?: number;
  onChange?: (value: number) => void;
  onClose?: () => void;
  currency?: string;
  locale?: string;
}

export default function BottomFixedCurrencyNumpad({
  value: initialValue = 0,
  onChange,
  onClose,
  currency = "USD",
  locale = "en-US",
}: Props) {
  const [rawValue, setRawValue] = useState<string>("0"); // user input string
  const [isNegative, setIsNegative] = useState<boolean>(initialValue < 0);
  const [hasDecimal, setHasDecimal] = useState<boolean>(false);
  const [visible, setVisible] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize rawValue from initialValue prop
  useEffect(() => {
    const absVal = Math.abs(initialValue);
    setIsNegative(initialValue < 0);
    const asStr = absVal.toFixed(2);
    if (asStr.includes(".")) {
      const [intPart, decPart] = asStr.split(".");
      setRawValue(decPart === "00" ? intPart : asStr);
      setHasDecimal(decPart !== "00");
    } else {
      setRawValue(absVal.toString());
      setHasDecimal(false);
    }
  }, [initialValue]);

  function formatCurrency(value: number | string): string {
    if (value === "" || isNaN(Number(value))) return "";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(value));
  }

  function formatDisplay(valueStr: string): string {
    if (valueStr === "") return "0";

    const num = Number(valueStr);
    if (isNaN(num)) return "0";

    if (!hasDecimal) {
      return num.toLocaleString(locale);
    } else {
      const parts = valueStr.split(".");
      const intPart = Number(parts[0]).toLocaleString(locale);
      const decPart = parts[1]?.slice(0, 2) || "";
      return decPart.length > 0 ? `${intPart}.${decPart}` : intPart;
    }
  }

  function updateValue(newRawValue: string, newHasDecimal: boolean) {
    setRawValue(newRawValue);
    setHasDecimal(newHasDecimal);
    const numeric = parseFloat(newRawValue);
    onChange?.((isNegative ? -1 : 1) * (isNaN(numeric) ? 0 : numeric));
  }

  function handleDigit(digit: string) {
    if (hasDecimal) {
      const parts = rawValue.split(".");
      if (parts.length === 2 && parts[1].length >= 2) return;
      updateValue(rawValue + digit, true);
    } else {
      if (rawValue === "0") {
        updateValue(digit, false);
      } else if (rawValue.length < 9) {
        updateValue(rawValue + digit, false);
      }
    }
  }

  function handleDecimal() {
    if (!hasDecimal) {
      updateValue(rawValue + ".", true);
    }
  }

  function handleBackspace() {
    if (rawValue.length === 1) {
      updateValue("0", false);
      setHasDecimal(false);
    } else {
      let newVal = rawValue.slice(0, -1);
      if (newVal.endsWith(".")) {
        newVal = newVal.slice(0, -1);
        setHasDecimal(false);
      }
      updateValue(newVal, newVal.includes("."));
    }
  }

  function toggleSign() {
    setIsNegative((v) => {
      const newNeg = !v;
      const numeric = parseFloat(rawValue);
      onChange?.(newNeg ? -numeric : numeric);
      return newNeg;
    });
  }

  // Show keypad on input focus
  function handleFocus() {
    setIsFocused(true);
    setVisible(true);
  }

  // Hide keypad on click outside container
  useEffect(() => {
    function handleClickOutside(event: Event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setVisible(false);
        setIsFocused(false);
        onClose?.();
        if (inputRef.current) inputRef.current.blur();
      }
    }
    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [visible, onClose]);

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        readOnly
        onFocus={handleFocus}
        value={
          (isNegative ? "-" : "") +
          (isFocused
            ? formatDisplay(rawValue)
            : formatCurrency(parseFloat(rawValue)))
        }
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

      {visible && (
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
          {[7,8,9,4,5,6,1,2,3].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => handleDigit(d.toString())}
              style={btnStyle}
              aria-label={`Number ${d}`}
            >
              {d}
            </button>
          ))}

          <button
            type="button"
            onClick={toggleSign}
            style={btnStyle}
            aria-label="Toggle positive negative"
          >
            ±
          </button>

          <button
            type="button"
            onClick={() => handleDigit("0")}
            style={btnStyle}
            aria-label="Number 0"
          >
            0
          </button>

          <button
            type="button"
            onClick={handleDecimal}
            style={btnStyle}
            aria-label="Decimal point"
          >
            .
          </button>

          <button
            type="button"
            onClick={handleBackspace}
            style={btnStyle}
            aria-label="Backspace"
          >
            ⌫
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
