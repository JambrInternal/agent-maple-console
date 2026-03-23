import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

const buttonVariants = cva('am-ui-button', {
  variants: {
    variant: {
      primary: 'am-ui-button--primary',
      secondary: 'am-ui-button--secondary',
      danger: 'am-ui-button--danger',
      ghost: 'am-ui-button--ghost',
      icon: 'am-ui-button--icon',
    },
    size: {
      sm: 'am-ui-button--sm',
      md: 'am-ui-button--md',
      lg: 'am-ui-button--lg',
      icon: 'am-ui-button--size-icon',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

export interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type = 'button', ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        type={type}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';

export { Button, buttonVariants };
