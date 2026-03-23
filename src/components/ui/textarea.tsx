import { cva, type VariantProps } from 'class-variance-authority';
import { forwardRef, type TextareaHTMLAttributes } from 'react';

import { cn } from '../../utils/cn';

const textareaVariants = cva('am-ui-textarea', {
  variants: {
    size: {
      sm: 'am-ui-textarea--sm',
      md: 'am-ui-textarea--md',
      lg: 'am-ui-textarea--lg',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

export interface TextareaProps
    extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, size, ...props }, ref) => (
    <textarea
      className={cn(textareaVariants({ size }), className)}
      ref={ref}
      {...props}
    />
  ),
);

Textarea.displayName = 'Textarea';

export { Textarea, textareaVariants };
