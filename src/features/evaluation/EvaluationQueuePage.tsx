import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase/client'

type EvaluationIdea = {
  id: string
  idea_code: string
  title: string
  short_description: string | null
  status: string
  priority: string | null
  created_at: string
  category: {
    name: string
  } | null
  submitter: {
    full_name: string | null
  } | null
}

type SupabaseIdeaRow = {
  id: string
  idea_code: string
  title: string
  short_description: string | null
  status: string
  priority: string | null
  created_at: string
  category:
    | {
        name: string
      }
    | {
        name: string
      }[]
    | null
  submitter:
    | {
        full_name: string | null
      }
    | {
        full_name: string | null
      }[]
    | null
}

function normalizeRelation<T>(
  relation: T | T[] | null,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null
  }

  return relation
}

function getPriorityClass(priority: string | null) {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-500/10 text-red-400'

    case 'MEDIUM':
      return 'bg-yellow-500/10 text-yellow-400'

    case 'LOW':
      return 'bg-green-500/10 text-green-400'

    default:
      return 'bg-muted text-muted-foreground'
  }
}

export function EvaluationQueuePage() {
  const [ideas, setIdeas] = useState<EvaluationIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadIdeas = async () => {
      setLoading(true)
      setError(null)

      const { data, error: queryError } = await supabase
        .from('ideas')
        .select(`
          id,
          idea_code,
          title,
          short_description,
          status,
          priority,
          created_at,
          category:idea_categories (
            name
          ),
          submitter:profiles!ideas_submitter_id_fkey (
            full_name
          )
        `)
        .eq('status', 'UNDER_EVALUATION')
        .order('created_at', { ascending: false })

      if (cancelled) {
        return
      }

      if (queryError) {
        setError(queryError.message)
        setIdeas([])
        setLoading(false)
        return
      }

      const rows = (data ?? []) as SupabaseIdeaRow[]

      const normalizedIdeas: EvaluationIdea[] =
        rows.map((row) => ({
          id: row.id,
          idea_code: row.idea_code,
          title: row.title,
          short_description: row.short_description,
          status: row.status,
          priority: row.priority,
          created_at: row.created_at,
          category: normalizeRelation(row.category),
          submitter: normalizeRelation(row.submitter),
        }))

      setIdeas(normalizedIdeas)
      setLoading(false)
    }

    const timer = window.setTimeout(() => {
      void loadIdeas()
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <p className="text-sm font-medium text-primary">
          Innovation
        </p>

        <h1 className="mt-1 text-3xl font-semibold tracking-tight">
          Evaluation
        </h1>

        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Evaluate ideas using the organization&apos;s weighted
          evaluation criteria before they move to the final
          decision stage.
        </p>
      </div>

      {/* Queue */}

      <div className="rounded-xl border border-border bg-card">
        {/* Queue header */}

        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="font-semibold">
              Evaluation Queue
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Ideas currently waiting for evaluation.
            </p>
          </div>

          <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            {loading ? '—' : ideas.length} ideas
          </span>
        </div>

        {/* Loading */}

        {loading && (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        )}

        {/* Error */}

        {!loading && error && (
          <div className="p-5">
            <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
              <p className="font-medium text-red-400">
                Unable to load evaluation queue
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Empty */}

        {!loading && !error && ideas.length === 0 && (
          <div className="px-5 py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-xl">
              ✓
            </div>

            <h3 className="mt-4 font-semibold">
              No ideas waiting for evaluation
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Ideas recommended for evaluation from the Review
              Queue will appear here.
            </p>
          </div>
        )}

        {/* Ideas */}

        {!loading && !error && ideas.length > 0 && (
          <div className="divide-y divide-border">
            {ideas.map((idea) => (
              <div
                key={idea.id}
                className="flex flex-col gap-4 p-5 transition hover:bg-muted/30 md:flex-row md:items-center md:justify-between"
              >
                {/* Idea information */}

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {idea.idea_code}
                    </span>

                    {idea.priority && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${getPriorityClass(
                          idea.priority,
                        )}`}
                      >
                        {idea.priority}
                      </span>
                    )}
                  </div>

                  <h3 className="mt-1 truncate text-base font-semibold">
                    {idea.title}
                  </h3>

                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {idea.short_description ||
                      'No short description provided.'}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      Category:{' '}
                      <span className="text-foreground">
                        {idea.category?.name ||
                          'Uncategorized'}
                      </span>
                    </span>

                    <span>
                      Submitted by:{' '}
                      <span className="text-foreground">
                        {idea.submitter?.full_name ||
                          'Unknown'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Open evaluation */}

                <Link
                  to={`/evaluation/${idea.id}`}
                  className="inline-flex shrink-0 items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Open Evaluation
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}