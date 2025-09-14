import React, { forwardRef } from 'react';
import { Input } from './input';
import { Label } from './label';
import { useInputMask, useCurrencyInput, MaskType } from '../../hooks/useInputMask';
import { cn } from './utils';

// Props base para todos os inputs com máscara
interface BaseMaskedInputProps {
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  className?: string;
  onValueChange?: (value: string) => void;
  initialValue?: string;
}

// Input de Telefone
interface PhoneInputProps extends BaseMaskedInputProps {
  onValueChange?: (value: string) => void;
}

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ id, label, required, error, disabled, className, onValueChange, initialValue = '', ...props }, ref) => {
    const mask = useInputMask('phone', initialValue, onValueChange);

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
            {label}
          </Label>
        )}
        <Input
          {...props}
          ref={ref}
          id={id}
          type="tel"
          value={mask.displayValue}
          onChange={mask.onChange}
          onBlur={mask.onBlur}
          placeholder={mask.placeholder}
          maxLength={mask.maxLength}
          disabled={disabled}
          className={cn(
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            !mask.isValid && mask.displayValue && "border-yellow-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
        {!mask.isValid && mask.displayValue && !error && (
          <p className="text-sm text-yellow-600">
            Telefone deve ter pelo menos 10 dígitos
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';

// Input de Data
interface DateInputProps extends BaseMaskedInputProps {
  onValueChange?: (value: string) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ id, label, required, error, disabled, className, onValueChange, initialValue = '', ...props }, ref) => {
    const mask = useInputMask('date', initialValue, onValueChange);

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
            {label}
          </Label>
        )}
        <Input
          {...props}
          ref={ref}
          id={id}
          type="text"
          value={mask.displayValue}
          onChange={mask.onChange}
          onBlur={mask.onBlur}
          placeholder={mask.placeholder}
          maxLength={mask.maxLength}
          disabled={disabled}
          className={cn(
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            !mask.isValid && mask.displayValue && "border-yellow-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
        {!mask.isValid && mask.displayValue && !error && (
          <p className="text-sm text-yellow-600">
            Data deve estar no formato dd/mm/aaaa
          </p>
        )}
      </div>
    );
  }
);

DateInput.displayName = 'DateInput';

// Input de Instagram
interface InstagramInputProps extends BaseMaskedInputProps {
  onValueChange?: (value: string) => void;
}

export const InstagramInput = forwardRef<HTMLInputElement, InstagramInputProps>(
  ({ id, label, required, error, disabled, className, onValueChange, initialValue = '', ...props }, ref) => {
    const mask = useInputMask('instagram', initialValue, onValueChange);

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
            {label}
          </Label>
        )}
        <Input
          {...props}
          ref={ref}
          id={id}
          type="text"
          value={mask.displayValue}
          onChange={mask.onChange}
          onBlur={mask.onBlur}
          placeholder={mask.placeholder}
          maxLength={mask.maxLength}
          disabled={disabled}
          className={cn(
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            !mask.isValid && mask.displayValue && "border-yellow-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
        {!mask.isValid && mask.displayValue && !error && (
          <p className="text-sm text-yellow-600">
            Instagram deve começar com @ e ter pelo menos 1 caractere
          </p>
        )}
      </div>
    );
  }
);

InstagramInput.displayName = 'InstagramInput';

// Input de Moeda (valor numérico)
interface CurrencyInputProps extends Omit<BaseMaskedInputProps, 'onValueChange' | 'initialValue'> {
  onValueChange?: (value: number) => void;
  initialValue?: number;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ id, label, required, error, disabled, className, onValueChange, initialValue = 0, ...props }, ref) => {
    const currency = useCurrencyInput(initialValue, onValueChange);

    return (
      <div className="space-y-2">
        {label && (
          <Label htmlFor={id} className={cn(required && "after:content-['*'] after:text-red-500 after:ml-1")}>
            {label}
          </Label>
        )}
        <Input
          {...props}
          ref={ref}
          id={id}
          type="text"
          value={currency.displayValue}
          onChange={currency.onChange}
          placeholder={currency.placeholder}
          disabled={disabled}
          className={cn(
            error && "border-red-500 focus:border-red-500 focus:ring-red-500",
            !currency.isValid && "border-yellow-500",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        {error && (
          <p id={`${id}-error`} className="text-sm text-red-600">
            {error}
          </p>
        )}
        {!currency.isValid && !error && (
          <p className="text-sm text-yellow-600">
            Valor deve ser positivo
          </p>
        )}
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

// Input genérico com máscara
interface MaskedInputProps extends BaseMaskedInputProps {
  maskType: MaskType;
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ maskType, ...props }, ref) => {
    switch (maskType) {
      case 'phone':
        return <PhoneInput {...props} ref={ref} />;
      case 'date':
        return <DateInput {...props} ref={ref} />;
      case 'instagram':
        return <InstagramInput {...props} ref={ref} />;
      case 'currency':
        return <CurrencyInput {...props} ref={ref} initialValue={0} />;
      default:
        return <Input {...props} ref={ref} />;
    }
  }
);

MaskedInput.displayName = 'MaskedInput';