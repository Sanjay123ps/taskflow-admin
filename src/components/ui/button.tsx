import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-control)] text-sm font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
  {
    variants: {
      variant: {
        primary:
          'bg-brand-700 text-white shadow-[0_1px_2px_rgba(15,42,107,0.08),0_8px_16px_-6px_rgba(27,72,214,0.45)] hover:bg-brand-600 active:bg-brand-800',
        secondary:
          'bg-white text-ink-700 border border-ink-200 shadow-sm hover:bg-brand-50 hover:border-brand-200 hover:text-brand-700',
        ghost: 'text-ink-500 hover:bg-ink-100 hover:text-ink-900',
        danger: 'bg-danger text-white hover:bg-red-700 shadow-sm',
        outlineDanger: 'border border-danger/30 text-danger hover:bg-danger-soft',
        link: 'text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-11 px-5 text-[15px]',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  },
)
Button.displayName = 'Button'
