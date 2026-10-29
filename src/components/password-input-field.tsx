"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { inputClass } from "@/components/ui";

export function PasswordInputField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  placeholder = "Password",
  required = true,
}: {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-1.5 block text-muted">{label}</span>
      <div className="relative">
        <input
          id={id}
          className={`${inputClass} pr-11`}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          placeholder={placeholder}
          required={required}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </label>
  );
}
