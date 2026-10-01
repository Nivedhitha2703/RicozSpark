import { supabase } from '../../lib/supabase/client'

export type IdeaDetail = {
  id: string
  idea_code: string
  title: string
  short_description: string
  problem_statement: string
  proposed_solution: string
  expected_benefits: string
  business_impact: string
  target_users: string
  strategic_alignment: string
  implementation_approach: string
  estimated_effort: string
  estimated_cost: number | null
  dependencies: string
  risks: string
  status: string
  priority: string
  revision_number: number
  created_at: string
  updated_at: string
  submitted_at: string | null
  category: {
    id: string
    name: string
    description: string | null
  } | null
}

export type IdeaStatusHistory = {
  id: string
  from_status: string | null
  to_status: string
  reason: string | null
  changed_by: string | null
  created_at: string
}

export type IdeaActivity = {
  id: string
  user_id: string | null
  activity_type: string
  description: string
  metadata: Record<string, unknown>
  created_at: string
}

export type IdeaDetailData = {
  idea: IdeaDetail
  statusHistory: IdeaStatusHistory[]
  activity: IdeaActivity[]
}

export async function getIdeaDetail(
  ideaId: string,
): Promise<IdeaDetailData> {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Failed to get current user:', userError)
    throw new Error('Unable to identify the current user.')
  }

  if (!user) {
    throw new Error('You must be signed in to view an idea.')
  }

  const { data: ideaData, error: ideaError } = await supabase
    .from('ideas')
    .select(
      `
        id,
        idea_code,
        title,
        short_description,
        problem_statement,
        proposed_solution,
        expected_benefits,
        business_impact,
        target_users,
        strategic_alignment,
        implementation_approach,
        estimated_effort,
        estimated_cost,
        dependencies,
        risks,
        status,
        priority,
        revision_number,
        created_at,
        updated_at,
        submitted_at,
        category:idea_categories (
          id,
          name,
          description
        )
      `,
    )
    .eq('id', ideaId)
    .maybeSingle()

  if (ideaError) {
    console.error('Failed to load idea:', ideaError)
    throw new Error('Unable to load the idea.')
  }

  if (!ideaData) {
    throw new Error('Idea not found.')
  }

  const category = Array.isArray(ideaData.category)
    ? ideaData.category[0] ?? null
    : ideaData.category ?? null

  const idea: IdeaDetail = {
    id: ideaData.id,
    idea_code: ideaData.idea_code,
    title: ideaData.title,
    short_description: ideaData.short_description,
    problem_statement: ideaData.problem_statement,
    proposed_solution: ideaData.proposed_solution,
    expected_benefits: ideaData.expected_benefits,
    business_impact: ideaData.business_impact,
    target_users: ideaData.target_users,
    strategic_alignment: ideaData.strategic_alignment,
    implementation_approach: ideaData.implementation_approach,
    estimated_effort: ideaData.estimated_effort,
    estimated_cost: ideaData.estimated_cost,
    dependencies: ideaData.dependencies,
    risks: ideaData.risks,
    status: ideaData.status,
    priority: ideaData.priority,
    revision_number: ideaData.revision_number,
    created_at: ideaData.created_at,
    updated_at: ideaData.updated_at,
    submitted_at: ideaData.submitted_at,
    category: category
      ? {
          id: category.id,
          name: category.name,
          description: category.description,
        }
      : null,
  }

  const { data: statusHistoryData, error: statusHistoryError } =
    await supabase
      .from('idea_status_history')
      .select(
        `
          id,
          from_status,
          to_status,
          reason,
          changed_by,
          created_at
        `,
      )
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false })

  if (statusHistoryError) {
    console.error(
      'Failed to load idea status history:',
      statusHistoryError,
    )
    throw new Error('Unable to load idea status history.')
  }

  const { data: activityData, error: activityError } = await supabase
    .from('idea_activity')
    .select(
      `
        id,
        user_id,
        activity_type,
        description,
        metadata,
        created_at
      `,
    )
    .eq('idea_id', ideaId)
    .order('created_at', { ascending: false })

  if (activityError) {
    console.error('Failed to load idea activity:', activityError)
    throw new Error('Unable to load idea activity.')
  }

  return {
    idea,
    statusHistory: (statusHistoryData ?? []) as IdeaStatusHistory[],
    activity: (activityData ?? []) as IdeaActivity[],
  }
}