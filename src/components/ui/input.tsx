import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

const inputVariants = cva('am-ui-input', {
  variants: {
    size: {
      sm: 'am-ui-input--sm',
      md: 'am-ui-input--md',
      lg: 'am-ui-input--lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface InputProps
    extends InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = forwardRef<HTMLInputElement, InputProps>(({ className, size, type = 'text', ...props }, ref) => (
  <input
    className={cn(inputVariants({ size }), className)}
    ref={ref}
    type={type}
    {...props}
  />
));

Input.displayName = 'Input';

export { Input, inputVariants };
