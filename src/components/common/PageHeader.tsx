import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  breadcrumb?: string
  description?: string
  actions?: ReactNode
}

export function PageHeader({ title, breadcrumb, description, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {breadcrumb && <p className="text-xs font-medium text-ink-400">{breadcrumb}</p>}
        <h1 className="font-display text-2xl font-extrabold text-ink-900 sm:text-[26px]">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-500">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  )
}
