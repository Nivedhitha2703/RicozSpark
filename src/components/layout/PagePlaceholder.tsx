type PagePlaceholderProps = {
  title: string
  description: string
  eyebrow?: string
}

export function PagePlaceholder({
  title,
  description,
  eyebrow,
}: PagePlaceholderProps) {
  return (
    <section className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
      <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-10 text-center shadow-sm">
        {eyebrow && (
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </p>
        )}

        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {title}
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted">
          {description}
        </p>
      </div>
    </section>
  )
}