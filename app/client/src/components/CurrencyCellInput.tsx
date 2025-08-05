import React, { useState, useEffect } from "react";

type Props = {
  value: number;
  onChange?: (newValue: number) => void;
  onBlur?: (newValue: number) => void;
  placeholder: string;
  className?: string;
};

export const CurrencyCellInput: React.FC<Props> = ({ value, onChange, onBlur, placeholder, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value.toString());

  useEffect(() => {
    if (!isEditing) {
      setDraft(value.toString());
    }
  }, [value, isEditing]);

  const handleFocus = () => setIsEditing(true);

  const handleBlur = () => {
    setIsEditing(false);
    const parsed = parseFloat(draft);
    if (!isNaN(parsed)) {
      onChange?.(parsed);
      onBlur?.(parsed);
    } else {
      setDraft(value.toString()); // Revert to last valid value
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow numbers, decimals, and minus
    if (/^-?\d*\.?\d*$/.test(raw)) {
      setDraft(raw);
    }
  };

  const formatCurrency = (num: number) =>
    new Intl.NumberFormat("en-AU", {
      style: "currency",
      currency: "AUD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);

  return (
    <input
      type="text"
      inputMode="decimal"
      pattern="[0-9]*"
      value={isEditing ? draft : formatCurrency(value)}
      placeholder={placeholder}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      className={`${className ? className : "border p-1 w-full "} text-right`}
    />
  );
};

export default CurrencyCellInput;