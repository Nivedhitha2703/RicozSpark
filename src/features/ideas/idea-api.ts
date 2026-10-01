import { supabase } from '../../lib/supabase/client'

export type IdeaCategory = {
  id: string
  name: string
  description: string | null
}

export type CreateIdeaInput = {
  title: string
  shortDescription: string
  problemStatement: string
  proposedSolution: string
  expectedBenefits: string
  businessImpact: string
  targetUsers: string
  strategicAlignment: string
  implementationApproach: string
  estimatedEffort: string
  estimatedCost: number | null
  dependencies: string
  risks: string
  categoryId: string
  priority: string
}

export type CreatedIdea = {
  id: string
  idea_code: string
  title: string
  status: string
}

/**
 * Load all active idea categories.
 */
export async function getIdeaCategories(): Promise<
  IdeaCategory[]
> {
  const { data, error } = await supabase
    .from('idea_categories')
    .select('id, name, description')
    .eq('is_active', true)
    .order('name')

  if (error) {
    console.error('Failed to load idea categories:', error)
    throw new Error('Unable to load idea categories.')
  }

  return data ?? []
}

/**
 * Generate the next human-readable idea code.
 *
 * Example:
 * IDEA-0001
 * IDEA-0002
 * IDEA-0003
 *
 * NOTE:
 * This is suitable for our current development stage.
 * Later we will move code generation into PostgreSQL/RPC
 * so concurrent submissions are handled safely.
 */
async function generateIdeaCode(): Promise<string> {
  const { data, error } = await supabase
    .from('ideas')
    .select('idea_code')
    .order('created_at', {
      ascending: false,
    })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(
      'Failed to determine next idea code:',
      error,
    )

    throw new Error(
      'Unable to generate an idea reference number.',
    )
  }

  if (!data?.idea_code) {
    return 'IDEA-0001'
  }

  const match = data.idea_code.match(/^IDEA-(\d+)$/)

  if (!match) {
    return 'IDEA-0001'
  }

  const nextNumber = Number(match[1]) + 1

  return `IDEA-${String(nextNumber).padStart(4, '0')}`
}

/**
 * Create a new submitted idea.
 */
export async function createIdea(
  input: CreateIdeaInput,
): Promise<CreatedIdea> {
  const {
    data: {
      user,
    },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError) {
    console.error('Failed to get current user:', userError)
    throw new Error('Unable to identify the current user.')
  }

  if (!user) {
    throw new Error(
      'You must be signed in to submit an idea.',
    )
  }

  const ideaCode = await generateIdeaCode()

  const { data, error } = await supabase
    .from('ideas')
    .insert({
      idea_code: ideaCode,
      title: input.title.trim(),
      short_description:
        input.shortDescription.trim(),
      problem_statement:
        input.problemStatement.trim(),
      proposed_solution:
        input.proposedSolution.trim(),
      expected_benefits:
        input.expectedBenefits.trim(),
      business_impact:
        input.businessImpact.trim(),
      target_users:
        input.targetUsers.trim(),
      strategic_alignment:
        input.strategicAlignment.trim(),
      implementation_approach:
        input.implementationApproach.trim(),
      estimated_effort:
        input.estimatedEffort.trim(),
      estimated_cost:
        input.estimatedCost,
      dependencies:
        input.dependencies.trim(),
      risks:
        input.risks.trim(),
      category_id:
        input.categoryId,
      submitter_id:
        user.id,
      status: 'SUBMITTED',
      priority:
        input.priority,
      revision_number: 1,
      submitted_at:
        new Date().toISOString(),
    })
    .select(
      'id, idea_code, title, status',
    )
    .single()

  if (error) {
    console.error('Failed to create idea:', error)

    throw new Error(
      error.message ||
        'Unable to submit the idea.',
    )
  }

  return data
}