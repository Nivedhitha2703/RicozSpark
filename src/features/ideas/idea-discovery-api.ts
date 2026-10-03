import { supabase } from '../../lib/supabase/client'

export type DiscoveryIdea = {
  id: string
  idea_code: string
  title: string
  short_description: string
  status: string
  priority: string
  created_at: string
  submitted_at: string | null
  category: {
    id: string
    name: string
  } | null
  submitter: {
    id: string
    full_name: string | null
    avatar_url: string | null
  } | null
}

export type IdeaDiscoveryFilters = {
  search?: string
  categoryId?: string
  status?: string
  sortBy?: 'recent' | 'oldest'
}

/**
 * Load ideas for the Discover Ideas page.
 *
 * Supports:
 * - Search by title or description
 * - Category filtering
 * - Status filtering
 * - Recent/oldest sorting
 *
 * Draft ideas are excluded from discovery.
 */
export async function getDiscoveryIdeas(
  filters: IdeaDiscoveryFilters = {},
): Promise<DiscoveryIdea[]> {
  let query = supabase
    .from('ideas')
    .select(`
      id,
      idea_code,
      title,
      short_description,
      status,
      priority,
      created_at,
      submitted_at,
      category:idea_categories (
        id,
        name
      ),
      submitter:profiles!ideas_submitter_id_fkey (
        id,
        full_name,
        avatar_url
      )
    `)
    .neq('status', 'DRAFT')

  // Category filter
  if (filters.categoryId) {
    query = query.eq(
      'category_id',
      filters.categoryId,
    )
  }

  // Status filter
  if (filters.status) {
    query = query.eq(
      'status',
      filters.status,
    )
  }

  // Search filter
  if (filters.search?.trim()) {
    const search = filters.search.trim()

    query = query.or(
      `title.ilike.%${search}%,short_description.ilike.%${search}%`,
    )
  }

  // Sorting
  query = query.order(
    'created_at',
    {
      ascending:
        filters.sortBy === 'oldest',
    },
  )

  const { data, error } = await query

  if (error) {
    console.error(
      'Failed to load discovery ideas:',
      error,
    )

    throw new Error(
      error.message ||
        'Unable to load ideas.',
    )
  }

  /*
   * Supabase may return related records as arrays
   * depending on the relationship metadata.
   *
   * Normalize those relationships so the rest
   * of the application receives a predictable shape.
   */
  const ideas = (data ?? []).map((idea) => ({
    ...idea,

    category: Array.isArray(idea.category)
      ? idea.category[0] ?? null
      : idea.category ?? null,

    submitter: Array.isArray(idea.submitter)
      ? idea.submitter[0] ?? null
      : idea.submitter ?? null,
  }))

  return ideas as DiscoveryIdea[]
}