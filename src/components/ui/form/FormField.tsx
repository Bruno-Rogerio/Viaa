// viaa\src\components\ui\form\FormField.tsx

interface BaseFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  icon?: string;
  disabled?: boolean;
  className?: string;
}

interface InputFieldProps extends BaseFieldProps {
  type?: "text" | "email" | "tel" | "date" | "number" | "url";
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  mask?: (value: string) => string;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  loading?: boolean;
  placeholder?: string;
}

interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}

export function InputField({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  icon,
  disabled = false,
  mask,
  className = "",
}: InputFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = mask ? mask(e.target.value) : e.target.value;
    onChange(newValue);
  };

  return (
    <div className={`group ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-bold text-gray-700 mb-3 group-focus-within:text-orange-600"
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-6 py-4 border-2 rounded-2xl focus:border-orange-500 focus:ring-0 transition-all duration-300 text-lg placeholder-gray-400 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-red-500" : "border-gray-200"
          }`}
          required={required}
        />
        {icon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error,
  icon,
  disabled = false,
  loading = false,
  placeholder,
  className = "",
}: SelectFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`group ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-bold text-gray-700 mb-3 group-focus-within:text-orange-600"
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          disabled={disabled || loading}
          className={`w-full px-6 py-4 border-2 rounded-2xl focus:border-orange-500 focus:ring-0 transition-all duration-300 text-lg hover:border-gray-300 appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-red-500" : "border-gray-200"
          }`}
          required={required}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {icon && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export function TextAreaField({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  rows = 4,
  required = false,
  error,
  icon,
  disabled = false,
  className = "",
}: TextAreaFieldProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    if (onBlur) onBlur();
  };

  return (
    <div className={`group ${className}`}>
      <label
        htmlFor={name}
        className="block text-sm font-bold text-gray-700 mb-3 group-focus-within:text-orange-600"
      >
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <div className="relative">
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          rows={rows}
          disabled={disabled}
          className={`w-full px-6 py-4 border-2 rounded-2xl focus:border-orange-500 focus:ring-0 transition-all duration-300 text-lg placeholder-gray-400 hover:border-gray-300 resize-y disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-red-500" : "border-gray-200"
          }`}
          required={required}
        />
        {icon && (
          <div className="absolute top-4 right-0 pr-4 flex items-center pointer-events-none">
            <span className="text-2xl">{icon}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

import { useState, useCallback } from "react";

interface TextAreaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  rows?: number;
  placeholder?: string;
}

// Hook para validação de formulário
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validators: Partial<Record<keyof T, (value: any) => string | undefined>>
) {
  const [data, setData] = useState<T>(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});

  const setValue = useCallback(
    (field: keyof T, value: any) => {
      setData((prev: T) => ({ ...prev, [field]: value }));

      // Limpar erro do campo quando o usuário digita
      if (errors[field]) {
        setErrors((prev: Partial<Record<keyof T, string>>) => {
          const newErrors = { ...prev };
          delete newErrors[field];
          return newErrors;
        });
      }
    },
    [errors]
  );

  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev: Partial<Record<keyof T, boolean>>) => ({
      ...prev,
      [field]: true,
    }));
  }, []);

  const validateField = useCallback(
    (field: keyof T) => {
      const validator = validators[field];
      if (validator) {
        const error = validator(data[field]);
        if (error) {
          setErrors((prev) => ({ ...prev, [field]: error }));
          return false;
        }
      }
      return true;
    },
    [data, validators]
  );

  const validateAll = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(validators).forEach((key) => {
      const field = key as keyof T;
      const validator = validators[field];
      if (validator) {
        const error = validator(data[field]);
        if (error) {
          newErrors[field] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [data, validators]);

  const reset = useCallback(() => {
    setData(initialData);
    setErrors({});
    setTouched({});
  }, [initialData]);

  return {
    data,
    errors,
    touched,
    setValue,
    setTouched: setFieldTouched,
    validateField,
    validateAll,
    reset,
    isValid: Object.keys(errors).length === 0,
  };
}
