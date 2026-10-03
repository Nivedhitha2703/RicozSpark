import {
  Bookmark,
  CalendarDays,
  ChevronDown,
  Clock3,
  Filter,
  Lightbulb,
  MessageCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  ThumbsUp,
  X,
} from 'lucide-react'
import {
  Link,
  useSearchParams,
} from 'react-router-dom'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getIdeaCategories,
  type IdeaCategory,
} from './idea-api'

import {
  getDiscoveryIdeas,
  type DiscoveryIdea,
} from './idea-discovery-api'

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under review' },
  {
    value: 'UNDER_EVALUATION',
    label: 'Under evaluation',
  },
  { value: 'APPROVED', label: 'Approved' },
  {
    value: 'CHANGES_REQUESTED',
    label: 'Changes requested',
  },
  { value: 'IN_PIPELINE', label: 'In pipeline' },
  {
    value: 'CONVERTED_TO_PROJECT',
    label: 'Converted to project',
  },
]

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'oldest', label: 'Oldest first' },
]

function formatStatus(status: string) {
  return status
    .replaceAll('_', ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    )
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

function getStatusClasses(status: string) {
  switch (status) {
    case 'APPROVED':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'

    case 'REJECTED':
      return 'border-red-500/20 bg-red-500/10 text-red-400'

    case 'UNDER_REVIEW':
      return 'border-amber-500/20 bg-amber-500/10 text-amber-400'

    case 'UNDER_EVALUATION':
      return 'border-purple-500/20 bg-purple-500/10 text-purple-400'

    case 'CHANGES_REQUESTED':
      return 'border-orange-500/20 bg-orange-500/10 text-orange-400'

    case 'IN_PIPELINE':
      return 'border-blue-500/20 bg-blue-500/10 text-blue-400'

    case 'CONVERTED_TO_PROJECT':
      return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400'

    default:
      return 'border-border bg-surface text-muted'
  }
}

function getPriorityClasses(priority: string) {
  switch (priority) {
    case 'HIGH':
      return 'text-orange-400'

    case 'URGENT':
      return 'text-red-400'

    case 'LOW':
      return 'text-muted'

    default:
      return 'text-foreground'
  }
}

function getInitials(
  name: string | null | undefined,
) {
  if (!name) {
    return 'U'
  }

  const parts = name
    .trim()
    .split(/\s+/)

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 1)
      .toUpperCase()
  }

  return `${parts[0][0]}${
    parts[parts.length - 1][0]
  }`.toUpperCase()
}

type IdeaCardProps = {
  idea: DiscoveryIdea
}

function IdeaCard({
  idea,
}: IdeaCardProps) {
  const submitterName =
    idea.submitter?.full_name ||
    'Unknown user'

  return (
    <Link
      to={`/ideas/${idea.id}`}
      className="group block rounded-2xl border border-border bg-surface p-5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg hover:shadow-black/10"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">
              {idea.idea_code}
            </p>

            <h2 className="mt-1 line-clamp-2 text-base font-semibold text-foreground transition group-hover:text-primary">
              {idea.title}
            </h2>
          </div>
        </div>

        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-medium ${getStatusClasses(
            idea.status,
          )}`}
        >
          {formatStatus(idea.status)}
        </span>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-muted">
        {idea.short_description}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {idea.category && (
          <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
            {idea.category.name}
          </span>
        )}

        {idea.priority && (
          <span
            className={`rounded-full border border-border bg-background px-2.5 py-1 text-xs font-medium ${getPriorityClasses(
              idea.priority,
            )}`}
          >
            {formatStatus(idea.priority)} priority
          </span>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-border pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border bg-background text-[10px] font-semibold text-muted">
            {getInitials(submitterName)}
          </div>

          <span className="truncate text-xs text-muted">
            {submitterName}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 text-xs text-muted">
          <CalendarDays className="h-3.5 w-3.5" />

          {formatDate(
            idea.submitted_at ||
              idea.created_at,
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1.5">
          <ThumbsUp className="h-3.5 w-3.5" />
          Community
        </span>

        <span className="inline-flex items-center gap-1.5">
          <MessageCircle className="h-3.5 w-3.5" />
          Discuss
        </span>

        <span className="inline-flex items-center gap-1.5">
          <Bookmark className="h-3.5 w-3.5" />
          Save
        </span>
      </div>
    </Link>
  )
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl border border-border bg-surface p-5">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-background" />

        <div className="flex-1">
          <div className="h-3 w-20 rounded bg-background" />
          <div className="mt-2 h-4 w-3/4 rounded bg-background" />
        </div>
      </div>

      <div className="mt-5 h-3 w-full rounded bg-background" />
      <div className="mt-2 h-3 w-5/6 rounded bg-background" />

      <div className="mt-5 h-6 w-24 rounded-full bg-background" />

      <div className="mt-5 border-t border-border pt-4">
        <div className="h-3 w-32 rounded bg-background" />
      </div>
    </div>
  )
}

export function IdeaDiscoveryPage() {
  const [searchParams, setSearchParams] =
    useSearchParams()

  const [ideas, setIdeas] = useState<
    DiscoveryIdea[]
  >([])

  const [categories, setCategories] =
    useState<IdeaCategory[]>([])

  const [searchInput, setSearchInput] =
    useState(
      searchParams.get('search') || '',
    )

  const [search, setSearch] =
    useState(
      searchParams.get('search') || '',
    )

  const [categoryId, setCategoryId] =
    useState(
      searchParams.get('category') || '',
    )

  const [status, setStatus] =
    useState(
      searchParams.get('status') || '',
    )

  const [sortBy, setSortBy] =
    useState<'recent' | 'oldest'>(
      searchParams.get('sort') ===
        'oldest'
        ? 'oldest'
        : 'recent',
    )

  const [loading, setLoading] =
    useState(true)

  const [categoriesLoading, setCategoriesLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  const [showFilters, setShowFilters] =
    useState(false)

  const loadIdeas = useCallback(
    async () => {
      setLoading(true)
      setError(null)

      try {
        const data =
          await getDiscoveryIdeas({
            search,
            categoryId,
            status,
            sortBy,
          })

        setIdeas(data)
      } catch (loadError) {
        console.error(
          'Failed to load discovery page:',
          loadError,
        )

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load ideas.',
        )
      } finally {
        setLoading(false)
      }
    },
    [
      search,
      categoryId,
      status,
      sortBy,
    ],
  )

  const loadCategories =
    useCallback(async () => {
      setCategoriesLoading(true)

      try {
        const data =
          await getIdeaCategories()

        setCategories(data)
      } catch (categoryError) {
        console.error(
          'Failed to load categories:',
          categoryError,
        )
      } finally {
        setCategoriesLoading(false)
      }
    }, [])

  useEffect(() => {
    let cancelled = false

    const timer = window.setTimeout(() => {
      if (!cancelled) {
        void loadCategories()
      }
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [loadCategories])

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        setSearch(searchInput)
      },
      400,
    )

    return () => {
      window.clearTimeout(timer)
    }
  }, [searchInput])

  useEffect(() => {
    let cancelled = false

    const timer = window.setTimeout(() => {
      if (!cancelled) {
        void loadIdeas()
      }
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [loadIdeas])

  useEffect(() => {
    const params =
      new URLSearchParams()

    if (search.trim()) {
      params.set(
        'search',
        search.trim(),
      )
    }

    if (categoryId) {
      params.set(
        'category',
        categoryId,
      )
    }

    if (status) {
      params.set(
        'status',
        status,
      )
    }

    if (sortBy !== 'recent') {
      params.set(
        'sort',
        sortBy,
      )
    }

    setSearchParams(params, {
      replace: true,
    })
  }, [
    search,
    categoryId,
    status,
    sortBy,
    setSearchParams,
  ])

  const activeFilterCount =
    useMemo(() => {
      let count = 0

      if (categoryId) {
        count += 1
      }

      if (status) {
        count += 1
      }

      if (sortBy !== 'recent') {
        count += 1
      }

      return count
    }, [
      categoryId,
      status,
      sortBy,
    ])

  function clearFilters() {
    setSearchInput('')
    setSearch('')
    setCategoryId('')
    setStatus('')
    setSortBy('recent')
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            <Sparkles className="h-4 w-4" />
            Innovation community
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Discover Ideas
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            Explore ideas submitted across the
            organization, discover opportunities,
            and follow innovations that matter to
            you.
          </p>
        </div>

        <Link
          to="/ideas/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Lightbulb className="mr-2 h-4 w-4" />
          Submit an Idea
        </Link>
      </div>

      {/* Search and controls */}
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value,
                )
              }
              placeholder="Search ideas by title or description..."
              className="h-11 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary"
            />

            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput('')
                  setSearch('')
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() =>
              setShowFilters(
                (current) => !current,
              )
            }
            className={`inline-flex h-11 items-center justify-center rounded-lg border px-4 text-sm font-medium transition ${
              showFilters ||
              activeFilterCount > 0
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-background text-muted hover:text-foreground'
            }`}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Filters

            {activeFilterCount > 0 && (
              <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-semibold text-primary-foreground">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-border pt-4 md:grid-cols-3">
            {/* Category */}
            <div>
              <label
                htmlFor="idea-category"
                className="mb-2 block text-xs font-medium text-muted"
              >
                Category
              </label>

              <div className="relative">
                <select
                  id="idea-category"
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(
                      event.target.value,
                    )
                  }
                  disabled={
                    categoriesLoading
                  }
                  className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    All categories
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              </div>
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="idea-status"
                className="mb-2 block text-xs font-medium text-muted"
              >
                Status
              </label>

              <div className="relative">
                <select
                  id="idea-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(
                      event.target.value,
                    )
                  }
                  className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm text-foreground outline-none focus:border-primary"
                >
                  {STATUS_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label
                htmlFor="idea-sort"
                className="mb-2 block text-xs font-medium text-muted"
              >
                Sort by
              </label>

              <div className="relative">
                <select
                  id="idea-sort"
                  value={sortBy}
                  onChange={(event) =>
                    setSortBy(
                      event.target.value as
                        | 'recent'
                        | 'oldest',
                    )
                  }
                  className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm text-foreground outline-none focus:border-primary"
                >
                  {SORT_OPTIONS.map(
                    (option) => (
                      <option
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="md:col-span-3">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center text-xs font-medium text-primary transition hover:underline"
                >
                  <X className="mr-1.5 h-3.5 w-3.5" />
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Results summary */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted" />

          <p className="text-sm text-muted">
            {loading
              ? 'Loading ideas...'
              : `${ideas.length} ${
                  ideas.length === 1
                    ? 'idea'
                    : 'ideas'
                } found`}
          </p>
        </div>

        {(search ||
          categoryId ||
          status) && (
          <p className="text-xs text-muted">
            Results update automatically as
            filters change.
          </p>
        )}
      </div>

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400">
              <X className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Unable to load ideas
              </h2>

              <p className="mt-1 text-sm text-muted">
                {error}
              </p>

              <button
                type="button"
                onClick={loadIdeas}
                className="mt-3 text-xs font-medium text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from(
            { length: 6 },
            (_, index) => (
              <LoadingCard key={index} />
            ),
          )}
        </div>
      )}

      {/* Empty state */}
      {!loading &&
        !error &&
        ideas.length === 0 && (
          <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-8">
            <div className="max-w-md text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lightbulb className="h-7 w-7" />
              </div>

              <h2 className="mt-5 text-lg font-semibold text-foreground">
                No ideas found
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                {search ||
                categoryId ||
                status
                  ? 'Try changing your search or filters to find more ideas.'
                  : 'There are no submitted ideas available yet. Be the first to share an innovation.'}
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {(search ||
                  categoryId ||
                  status) && (
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-background"
                  >
                    Clear filters
                  </button>
                )}

                <Link
                  to="/ideas/new"
                  className="inline-flex items-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Submit an Idea
                </Link>
              </div>
            </div>
          </div>
        )}

      {/* Idea cards */}
      {!loading &&
        !error &&
        ideas.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {ideas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
              />
            ))}
          </div>
        )}

      {/* Bottom helper */}
      {!loading &&
        !error &&
        ideas.length > 0 && (
          <div className="flex items-center justify-center gap-2 border-t border-border pt-6 text-xs text-muted">
            <Clock3 className="h-3.5 w-3.5" />
            Showing live ideas from your RicozSpark
            workspace
          </div>
        )}
    </section>
  )
}