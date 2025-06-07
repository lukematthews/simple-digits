import { NumericFormat } from "react-number-format";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  decimalScale?: number;
  allowNegative?: boolean;
  className?: string;
  placeholder?: string;
}

/**
 * A reusable currency input component using react-number-format.
 */
export const CurrencyInput: React.FC<CurrencyInputProps> = ({ value, onChange, prefix = "$", decimalScale = 2, allowNegative = false, className, placeholder }) => {
  return (
    <NumericFormat
      value={value}
      onValueChange={(values) => {
        onChange(values.floatValue ?? 0);
      }}
      thousandSeparator=","
      decimalSeparator="."
      prefix={prefix}
      decimalScale={decimalScale}
      fixedDecimalScale
      allowNegative={allowNegative}
      className={className}
      placeholder={placeholder}
    />
  );
};
