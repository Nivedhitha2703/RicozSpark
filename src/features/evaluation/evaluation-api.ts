import { supabase } from '../../lib/supabase/client'

export type EvaluationStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'COMPLETED'

export type EvaluationRecommendation =
  | 'MOVE_TO_DECISION'
  | 'REQUEST_CHANGES'
  | 'REJECT'
  | 'NEEDS_INFORMATION'

export type EvaluationCriterion = {
  id: string
  name: string
  description: string | null
  weight: number
  maxScore: number
  displayOrder: number
}

export type EvaluationScore = {
  id?: string
  criterionId: string
  score: number
  comments: string
}

export type EvaluationRecord = {
  id: string
  ideaId: string
  evaluatorId: string
  status: EvaluationStatus
  overallScore: number | null
  recommendation: EvaluationRecommendation | null
  evaluationNotes: string | null
  evaluatedAt: string | null
  createdAt: string
  updatedAt: string
}

export type EvaluationIdea = {
  id: string
  ideaCode: string
  title: string
  shortDescription: string
  problemStatement: string
  proposedSolution: string
  expectedBenefits: string | null
  businessImpact: string | null
  estimatedEffort: string | null
  estimatedCost: number | null
  status: string
}

export type EvaluationWorkspace = {
  idea: EvaluationIdea
  evaluation: EvaluationRecord | null
  scores: EvaluationScore[]
  criteria: EvaluationCriterion[]
}

export type SaveEvaluationInput = {
  ideaId: string
  evaluationId?: string
  scores: EvaluationScore[]
  evaluationNotes: string
  recommendation: EvaluationRecommendation
  complete?: boolean
}

type CriterionRow = {
  id: string
  name: string
  description: string | null
  weight: number
  max_score: number
  display_order: number
}

type EvaluationRow = {
  id: string
  idea_id: string
  evaluator_id: string
  status: EvaluationStatus
  overall_score: number | null
  recommendation: EvaluationRecommendation | null
  evaluation_notes: string | null
  evaluated_at: string | null
  created_at: string
  updated_at: string
}

type ScoreRow = {
  id: string
  evaluation_id: string
  criterion_id: string
  score: number
  comments: string | null
}

type IdeaRow = {
  id: string
  idea_code: string
  title: string
  short_description: string
  problem_statement: string
  proposed_solution: string
  expected_benefits: string | null
  business_impact: string | null
  estimated_effort: string | null
  estimated_cost: number | null
  status: string
}

function mapCriterion(row: CriterionRow): EvaluationCriterion {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    weight: Number(row.weight),
    maxScore: Number(row.max_score),
    displayOrder: Number(row.display_order),
  }
}

function mapEvaluation(row: EvaluationRow): EvaluationRecord {
  return {
    id: row.id,
    ideaId: row.idea_id,
    evaluatorId: row.evaluator_id,
    status: row.status,
    overallScore:
      row.overall_score === null
        ? null
        : Number(row.overall_score),
    recommendation: row.recommendation,
    evaluationNotes: row.evaluation_notes,
    evaluatedAt: row.evaluated_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapScore(row: ScoreRow): EvaluationScore {
  return {
    id: row.id,
    criterionId: row.criterion_id,
    score: Number(row.score),
    comments: row.comments ?? '',
  }
}

function mapIdea(row: IdeaRow): EvaluationIdea {
  return {
    id: row.id,
    ideaCode: row.idea_code,
    title: row.title,
    shortDescription: row.short_description,
    problemStatement: row.problem_statement,
    proposedSolution: row.proposed_solution,
    expectedBenefits: row.expected_benefits,
    businessImpact: row.business_impact,
    estimatedEffort: row.estimated_effort,
    estimatedCost:
      row.estimated_cost === null
        ? null
        : Number(row.estimated_cost),
    status: row.status,
  }
}

function isEvaluationRecommendation(
  value: string | null,
): value is EvaluationRecommendation {
  return (
    value === 'MOVE_TO_DECISION' ||
    value === 'REQUEST_CHANGES' ||
    value === 'REJECT' ||
    value === 'NEEDS_INFORMATION'
  )
}

function isEvaluationStatus(
  value: string,
): value is EvaluationStatus {
  return (
    value === 'DRAFT' ||
    value === 'IN_PROGRESS' ||
    value === 'COMPLETED'
  )
}

export async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error('You must be logged in.')
  }

  return user.id
}

export async function getEvaluationCriteria(): Promise<
  EvaluationCriterion[]
> {
  const { data, error } = await supabase
    .from('evaluation_criteria')
    .select(
      'id, name, description, weight, max_score, display_order',
    )
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    throw error
  }

  return (data as CriterionRow[]).map(mapCriterion)
}

export async function getEvaluationWorkspace(
  ideaId: string,
): Promise<EvaluationWorkspace> {
  const [
    ideaResult,
    criteriaResult,
    evaluationResult,
  ] = await Promise.all([
    supabase
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
        estimated_effort,
        estimated_cost,
        status
        `,
      )
      .eq('id', ideaId)
      .single(),

    supabase
      .from('evaluation_criteria')
      .select(
        'id, name, description, weight, max_score, display_order',
      )
      .eq('is_active', true)
      .order('display_order', { ascending: true }),

    supabase
      .from('idea_evaluations')
      .select(
        `
        id,
        idea_id,
        evaluator_id,
        status,
        overall_score,
        recommendation,
        evaluation_notes,
        evaluated_at,
        created_at,
        updated_at
        `,
      )
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ])

  if (ideaResult.error) {
    throw ideaResult.error
  }

  if (criteriaResult.error) {
    throw criteriaResult.error
  }

  if (evaluationResult.error) {
    throw evaluationResult.error
  }

  const evaluationRow =
    evaluationResult.data as EvaluationRow | null

  let scores: EvaluationScore[] = []

  if (evaluationRow) {
    const { data, error } = await supabase
      .from('idea_evaluation_scores')
      .select(
        'id, evaluation_id, criterion_id, score, comments',
      )
      .eq('evaluation_id', evaluationRow.id)

    if (error) {
      throw error
    }

    scores = (data as ScoreRow[]).map(mapScore)
  }

  return {
    idea: mapIdea(ideaResult.data as IdeaRow),
    evaluation: evaluationRow
      ? mapEvaluation(evaluationRow)
      : null,
    scores,
    criteria: (criteriaResult.data as CriterionRow[]).map(
      mapCriterion,
    ),
  }
}

function calculateOverallScore(
  criteria: EvaluationCriterion[],
  scores: EvaluationScore[],
): number {
  if (criteria.length === 0) {
    return 0
  }

  const scoreMap = new Map(
    scores.map((score) => [
      score.criterionId,
      score.score,
    ]),
  )

  let weightedTotal = 0
  let totalWeight = 0

  for (const criterion of criteria) {
    const score = scoreMap.get(criterion.id)

    if (score === undefined) {
      continue
    }

    const normalizedScore =
      (score / criterion.maxScore) * 100

    weightedTotal +=
      normalizedScore * (criterion.weight / 100)

    totalWeight += criterion.weight
  }

  if (totalWeight === 0) {
    return 0
  }

  const normalizedTotal =
    (weightedTotal / totalWeight) * 100

  return Number(normalizedTotal.toFixed(2))
}

export async function saveEvaluation(
  input: SaveEvaluationInput,
): Promise<EvaluationRecord> {
  const userId = await getCurrentUserId()

  const criteria = await getEvaluationCriteria()

  const overallScore = calculateOverallScore(
    criteria,
    input.scores,
  )

  let evaluationId = input.evaluationId

  if (!evaluationId) {
    const { data, error } = await supabase
      .from('idea_evaluations')
      .insert({
        idea_id: input.ideaId,
        evaluator_id: userId,
        status: input.complete
          ? 'COMPLETED'
          : 'IN_PROGRESS',
        overall_score: overallScore,
        recommendation: input.recommendation,
        evaluation_notes: input.evaluationNotes,
        evaluated_at: input.complete
          ? new Date().toISOString()
          : null,
      })
      .select(
        `
        id,
        idea_id,
        evaluator_id,
        status,
        overall_score,
        recommendation,
        evaluation_notes,
        evaluated_at,
        created_at,
        updated_at
        `,
      )
      .single()

    if (error) {
      throw error
    }

    evaluationId = data.id
  } else {
    const { data, error } = await supabase
      .from('idea_evaluations')
      .update({
        status: input.complete
          ? 'COMPLETED'
          : 'IN_PROGRESS',
        overall_score: overallScore,
        recommendation: input.recommendation,
        evaluation_notes: input.evaluationNotes,
        evaluated_at: input.complete
          ? new Date().toISOString()
          : null,
      })
      .eq('id', evaluationId)
      .select(
        `
        id,
        idea_id,
        evaluator_id,
        status,
        overall_score,
        recommendation,
        evaluation_notes,
        evaluated_at,
        created_at,
        updated_at
        `,
      )
      .single()

    if (error) {
      throw error
    }

    return await saveEvaluationScores(
      data as EvaluationRow,
      input.scores,
    )
  }

  const { data, error } = await supabase
    .from('idea_evaluations')
    .select(
      `
      id,
      idea_id,
      evaluator_id,
      status,
      overall_score,
      recommendation,
      evaluation_notes,
      evaluated_at,
      created_at,
      updated_at
      `,
    )
    .eq('id', evaluationId)
    .single()

  if (error) {
    throw error
  }

  return await saveEvaluationScores(
    data as EvaluationRow,
    input.scores,
  )
}

async function saveEvaluationScores(
  evaluation: EvaluationRow,
  scores: EvaluationScore[],
): Promise<EvaluationRecord> {
  if (scores.length > 0) {
    const rows = scores.map((score) => ({
      evaluation_id: evaluation.id,
      criterion_id: score.criterionId,
      score: score.score,
      comments: score.comments || null,
    }))

    const { error } = await supabase
      .from('idea_evaluation_scores')
      .upsert(rows, {
        onConflict: 'evaluation_id,criterion_id',
      })

    if (error) {
      throw error
    }
  }

  return mapEvaluation(evaluation)
}

export async function completeEvaluation(
  input: SaveEvaluationInput,
): Promise<EvaluationRecord> {
  return saveEvaluation({
    ...input,
    complete: true,
  })
}

export async function updateIdeaForEvaluation(
  ideaId: string,
  recommendation: EvaluationRecommendation,
): Promise<void> {
  let nextStatus = 'UNDER_EVALUATION'

  if (recommendation === 'MOVE_TO_DECISION') {
    nextStatus = 'APPROVED'
  }

  if (recommendation === 'REJECT') {
    nextStatus = 'REJECTED'
  }

  if (recommendation === 'REQUEST_CHANGES') {
    nextStatus = 'CHANGES_REQUESTED'
  }

  const { error } = await supabase
    .from('ideas')
    .update({
      status: nextStatus,
    })
    .eq('id', ideaId)

  if (error) {
    throw error
  }
}

export function validateEvaluationScores(
  criteria: EvaluationCriterion[],
  scores: EvaluationScore[],
): string | null {
  for (const criterion of criteria) {
    const score = scores.find(
      (item) => item.criterionId === criterion.id,
    )

    if (!score) {
      return `Please provide a score for ${criterion.name}.`
    }

    if (
      score.score < 0 ||
      score.score > criterion.maxScore
    ) {
      return `${criterion.name} must be between 0 and ${criterion.maxScore}.`
    }
  }

  return null
}

export function getRecommendationLabel(
  recommendation: EvaluationRecommendation,
): string {
  switch (recommendation) {
    case 'MOVE_TO_DECISION':
      return 'Move to Decision'

    case 'REQUEST_CHANGES':
      return 'Request Changes'

    case 'REJECT':
      return 'Reject'

    case 'NEEDS_INFORMATION':
      return 'Needs More Information'

    default:
      return recommendation
  }
}

export function isCompletedEvaluation(
  evaluation: EvaluationRecord | null,
): boolean {
  return (
    evaluation !== null &&
    isEvaluationStatus(evaluation.status) &&
    evaluation.status === 'COMPLETED'
  )
}

export function hasRecommendation(
  evaluation: EvaluationRecord | null,
): evaluation is EvaluationRecord & {
  recommendation: EvaluationRecommendation
} {
  return (
    evaluation !== null &&
    isEvaluationRecommendation(evaluation.recommendation)
  )
}