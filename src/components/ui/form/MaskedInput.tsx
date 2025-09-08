// viaa\src\components\ui\form\MaskedInput.tsx

"use client";
import React, {
  forwardRef,
  useState,
  useEffect,
  ChangeEvent,
  KeyboardEvent,
} from "react";

interface MaskedInputProps {
  mask: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      mask,
      value,
      onChange,
      onBlur,
      placeholder,
      className,
      required,
      disabled,
    },
    ref
  ) => {
    const [displayValue, setDisplayValue] = useState(value);

    const applyMask = (
      inputValue: string,
      maskPattern: string
    ): { masked: string; clean: string } => {
      const cleanValue = inputValue.replace(/\D/g, "");
      let maskedValue = "";
      let cleanIndex = 0;

      for (
        let i = 0;
        i < maskPattern.length && cleanIndex < cleanValue.length;
        i++
      ) {
        if (maskPattern[i] === "9") {
          maskedValue += cleanValue[cleanIndex];
          cleanIndex++;
        } else {
          maskedValue += maskPattern[i];
        }
      }

      return { masked: maskedValue, clean: cleanValue };
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const { masked, clean } = applyMask(inputValue, mask);

      setDisplayValue(masked);
      onChange(clean);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
      // Permitir teclas especiais
      if (
        [
          "Backspace",
          "Delete",
          "Tab",
          "Escape",
          "Enter",
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
        ].includes(e.key)
      ) {
        return;
      }

      // Para CEP, permitir apenas números
      if (!/\d/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    };

    // Atualizar displayValue quando value prop mudar
    useEffect(() => {
      if (value !== displayValue.replace(/\D/g, "")) {
        const { masked } = applyMask(value, mask);
        setDisplayValue(masked);
      }
    }, [value, mask, displayValue]);

    return (
      <input
        ref={ref}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onBlur={onBlur}
        placeholder={placeholder}
        className={className}
        required={required}
        disabled={disabled}
      />
    );
  }
);

MaskedInput.displayName = "MaskedInput";

export default MaskedInput;
