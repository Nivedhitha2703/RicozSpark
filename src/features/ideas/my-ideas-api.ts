import { supabase } from '../../lib/supabase/client'

export type MyIdea = {
  id: string
  idea_code: string
  title: string
  short_description: string
  status: string
  priority: string
  revision_number: number
  created_at: string
  updated_at: string
  submitted_at: string | null
  category: {
    id: string
    name: string
  } | null
}

export async function getMyIdeas(): Promise<MyIdea[]> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Failed to get current user:', userError)
    throw new Error('Unable to identify the current user.')
  }

  if (!user) {
    throw new Error('You must be signed in to view your ideas.')
  }

  const { data, error } = await supabase
    .from('ideas')
    .select(
      `
        id,
        idea_code,
        title,
        short_description,
        status,
        priority,
        revision_number,
        created_at,
        updated_at,
        submitted_at,
        category:idea_categories (
          id,
          name
        )
      `,
    )
    .eq('submitter_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to load my ideas:', error)
    throw new Error('Unable to load your ideas.')
  }

  return (data ?? []).map((idea) => {
    const category = Array.isArray(idea.category)
      ? idea.category[0] ?? null
      : idea.category ?? null

    return {
      id: idea.id,
      idea_code: idea.idea_code,
      title: idea.title,
      short_description: idea.short_description,
      status: idea.status,
      priority: idea.priority,
      revision_number: idea.revision_number,
      created_at: idea.created_at,
      updated_at: idea.updated_at,
      submitted_at: idea.submitted_at,
      category: category
        ? {
            id: category.id,
            name: category.name,
          }
        : null,
    }
  })
}