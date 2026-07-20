import { useState, useId, forwardRef, type InputHTMLAttributes } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input({ label, error, hint, className = '', id, value, ...props }, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  const [focused, setFocused] = useState(false);

  return (
    <div className={`input-group ${error ? 'input-error shake' : ''} ${focused ? 'input-focused' : ''} ${className}`}>
      <label htmlFor={inputId} className="input-label">
        {label}
      </label>
      <div className="input-wrapper">
        <input
          ref={ref}
          id={inputId}
          className="input-field"
          value={value}
          onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        <span className="input-border" aria-hidden="true" />
      </div>
      {error && <p id={`${inputId}-error`} className="input-message input-message-error" role="alert">{error}</p>}
      {hint && !error && <p id={`${inputId}-hint`} className="input-message">{hint}</p>}
    </div>
  );
});

export default Input;
