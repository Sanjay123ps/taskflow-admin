import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close

const sheetVariants = cva('fixed z-50 gap-4 bg-white shadow-[var(--shadow-raised)]', {
  variants: {
    side: {
      right:
        'inset-y-0 right-0 h-full w-full max-w-md border-l border-ink-200 data-[state=open]:animate-[slide-in-right_250ms_ease-out] data-[state=closed]:animate-[slide-out-right_200ms_ease-in]',
      bottom:
        'inset-x-0 bottom-0 max-h-[88vh] rounded-t-3xl border-t border-ink-200 data-[state=open]:animate-[slide-in-bottom_250ms_ease-out] data-[state=closed]:animate-[slide-out-bottom_200ms_ease-in]',
      left: 'inset-y-0 left-0 h-full w-full max-w-xs border-r border-ink-200 data-[state=open]:animate-[slide-in-left_250ms_ease-out] data-[state=closed]:animate-[slide-out-left_200ms_ease-in]',
    },
  },
  defaultVariants: { side: 'right' },
})

export interface SheetContentProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
    VariantProps<typeof sheetVariants> {
  hideClose?: boolean
}

export const SheetContent = forwardRef<React.ElementRef<typeof DialogPrimitive.Content>, SheetContentProps>(
  ({ className, side, children, hideClose, ...props }, ref) => (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm data-[state=open]:animate-[fade-in_150ms_ease-out] data-[state=closed]:animate-[fade-out_150ms_ease-in]" />
      <DialogPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), 'flex flex-col', className)} {...props}>
        {children}
        {!hideClose && (
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-1.5 text-ink-400 transition-colors hover:bg-ink-100 hover:text-ink-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  ),
)
SheetContent.displayName = 'SheetContent'

export function SheetHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('border-b border-ink-100 px-6 py-5', className)} {...props} />
}

export const SheetTitle = forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title ref={ref} className={cn('text-base font-bold text-ink-900', className)} {...props} />
))
SheetTitle.displayName = 'SheetTitle'
