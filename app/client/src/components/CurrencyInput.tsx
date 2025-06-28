import React, { useState } from "react";

interface CurrencyInputProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  placeholder?: string;
}

export const CurrencyInput: React.FC<CurrencyInputProps> = ({
  value,
  onChange,
  name,
  placeholder,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const isValidInput = (input: string) => {
    // Allows: "", "-", ".5", "-.5", "0.5", "1.", "1.23"
    return /^-?\d*(\.\d{0,2})?$/.test(input);
  };

  const formatCurrency = (input: string) => {
    const parsed = parseFloat(input);
    if (isNaN(parsed)) return input;
    return new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(parsed);
  };

  const handleFocus = () => setIsFocused(true);

  const handleBlur = () => {
    setIsFocused(false);

    const parsed = parseFloat(value);
    if (!isNaN(parsed)) {
      onChange(parsed.toFixed(2)); // normalized value
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    if (isValidInput(input)) {
      onChange(input); // only update if valid format
    }
  };

  const showInvalid = value !== "" && !isValidInput(value);
  const displayValue = isFocused ? value : formatCurrency(value);

  return (
    <input
      type="text"
      name={name}
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={`border p-1 rounded w-full ${
        showInvalid ? "border-red-500" : "border-gray-300"
      }`}
    />
  );
};
