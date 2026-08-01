import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast:
            'rounded-xl! border! border-ink-200! bg-white! shadow-[var(--shadow-raised)]! font-body! text-ink-900!',
          title: 'font-semibold!',
          description: 'text-ink-500!',
          success: 'data-[type=success]:border-l-4! data-[type=success]:border-l-success!',
          error: 'data-[type=error]:border-l-4! data-[type=error]:border-l-danger!',
        },
      }}
    />
  )
}
