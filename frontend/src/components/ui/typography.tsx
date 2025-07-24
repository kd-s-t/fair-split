import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-4xl font-extrabold lg:text-5xl',
      h2: 'scroll-m-20 text-3xl font-semibold',
      h3: 'scroll-m-20 text-2xl font-semibold',
      h4: 'scroll-m-20 text-xl font-semibold',
      p: '',
      list: 'my-6 ml-6 list-disc [&>li]:mt-2',
      large: 'text-lg font-semibold',
      base: 'text-base font-medium',
      small: 'text-sm font-medium',
      muted: 'text-sm text-[#BCBCBC]',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
});

export interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'list' | 'large' | 'small' | 'muted' | 'base';
  asChild?: boolean;
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(({ className, variant = 'p', asChild = false, ...props }, ref) => {
  const Comp =
    variant === 'h1' ? 'h1' :
    variant === 'h2' ? 'h2' :
    variant === 'h3' ? 'h3' :
    variant === 'h4' ? 'h4' :
    variant === 'list' ? 'ul' :
    variant === 'small' ? 'small' :
    'p';

  return (
    <Comp
      className={cn(typographyVariants({ variant: variant as NonNullable<TypographyProps['variant']> }), className)}
      ref={ref as any}
      {...props}
    />
  );
});

Typography.displayName = 'Typography';

export { Typography, typographyVariants };
