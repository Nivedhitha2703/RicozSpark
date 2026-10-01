import { supabase } from '../../lib/supabase/client'

export type IdeaTag = {
  id: string
  name: string
}

export async function getIdeaTags(): Promise<IdeaTag[]> {
  const { data, error } = await supabase
    .from('idea_tags')
    .select('id, name')
    .order('name')

  if (error) {
    console.error('Failed to load idea tags:', error)
    throw new Error('Unable to load idea tags.')
  }

  return data ?? []
}

export async function saveIdeaTags(
  ideaId: string,
  tagIds: string[],
): Promise<void> {
  if (tagIds.length === 0) {
    return
  }

  const rows = tagIds.map((tagId) => ({
    idea_id: ideaId,
    tag_id: tagId,
  }))

  const { error } = await supabase
    .from('idea_tag_links')
    .insert(rows)

  if (error) {
    console.error('Failed to save idea tags:', error)
    throw new Error('Idea was created, but its tags could not be saved.')
  }
}