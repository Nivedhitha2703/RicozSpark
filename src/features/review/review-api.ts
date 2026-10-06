import { supabase } from '../../lib/supabase/client'

/* =========================================================
   TYPES
   ========================================================= */

export type ReviewStatus =
  | 'PENDING'
  | 'IN_REVIEW'
  | 'COMPLETED'

export type ReviewRecommendation =
  | 'MOVE_TO_EVALUATION'
  | 'REQUEST_CHANGES'
  | 'REJECT'
  | 'NEEDS_INFORMATION'

export interface ReviewInput {
  ideaId: string
  recommendation: ReviewRecommendation
  reviewNotes?: string
  requestedInformation?: string
}

export interface ReviewQueueItem {
  reviewId: string | null
  ideaId: string
  ideaCode: string
  title: string
  shortDescription: string | null
  categoryName: string | null
  status: string
  priority: string | null
  createdAt: string
  submittedAt: string | null
  submitterName: string | null
  submitterId: string
  reviewerName: string | null
  reviewerId: string | null
  reviewStatus: ReviewStatus | null
  recommendation: ReviewRecommendation | null
  reviewNotes: string | null
  requestedInformation: string | null
  assignedAt: string | null
  reviewedAt: string | null
}

/* =========================================================
   DATABASE TYPES
   ========================================================= */

interface ReviewRow {
  id: string
  idea_id: string
  reviewer_id: string | null
  assigned_by: string | null
  status: string
  recommendation: string | null
  review_notes: string | null
  requested_information: string | null
  assigned_at: string | null
  reviewed_at: string | null
  created_at: string
  updated_at: string
}

interface IdeaRow {
  id: string
  idea_code: string
  title: string
  short_description: string | null
  status: string
  priority: string | null
  submitter_id: string
  created_at: string
  submitted_at: string | null
  idea_categories:
    | { name: string }
    | { name: string }[]
    | null
  profiles:
    | { full_name: string | null }
    | { full_name: string | null }[]
    | null
}

interface ReviewerProfile {
  full_name: string | null
}

/* =========================================================
   HELPERS
   ========================================================= */

function normalizeRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (!relation) {
    return null
  }

  return Array.isArray(relation)
    ? relation[0] ?? null
    : relation
}

function isReviewStatus(
  value: string | null,
): value is ReviewStatus {
  return (
    value === 'PENDING' ||
    value === 'IN_REVIEW' ||
    value === 'COMPLETED'
  )
}

function isReviewRecommendation(
  value: string | null,
): value is ReviewRecommendation {
  return (
    value === 'MOVE_TO_EVALUATION' ||
    value === 'REQUEST_CHANGES' ||
    value === 'REJECT' ||
    value === 'NEEDS_INFORMATION'
  )
}

function mapReview(row: ReviewRow) {
  return {
    id: row.id,
    ideaId: row.idea_id,
    reviewerId: row.reviewer_id,
    assignedBy: row.assigned_by,
    status: isReviewStatus(row.status)
      ? row.status
      : 'PENDING',
    recommendation: isReviewRecommendation(
      row.recommendation,
    )
      ? row.recommendation
      : null,
    reviewNotes: row.review_notes,
    requestedInformation:
      row.requested_information,
    assignedAt: row.assigned_at,
    reviewedAt: row.reviewed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function mapIdea(row: IdeaRow) {
  const category = normalizeRelation(
    row.idea_categories,
  )

  const submitter = normalizeRelation(
    row.profiles,
  )

  return {
    id: row.id,
    ideaCode: row.idea_code,
    title: row.title,
    shortDescription: row.short_description,
    status: row.status,
    priority: row.priority,
    categoryName: category?.name ?? null,
    submitterName:
      submitter?.full_name ?? null,
    submitterId: row.submitter_id,
    createdAt: row.created_at,
    submittedAt: row.submitted_at,
  }
}

/* =========================================================
   AUTH
   ========================================================= */

export async function getCurrentUserId(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw error
  }

  if (!user) {
    throw new Error(
      'You must be signed in to perform this action.',
    )
  }

  return user.id
}

/* =========================================================
   BUILD QUEUE ITEMS
   ========================================================= */

async function buildQueueItems(
  reviews: ReviewRow[],
  ideas: IdeaRow[],
): Promise<ReviewQueueItem[]> {
  const ideaMap = new Map(
    ideas.map((idea) => [
      idea.id,
      mapIdea(idea),
    ]),
  )

  const reviewerIds = Array.from(
    new Set(
      reviews
        .map(
          (review) =>
            review.reviewer_id,
        )
        .filter(
          (id): id is string =>
            Boolean(id),
        ),
    ),
  )

  const reviewerMap =
    new Map<string, ReviewerProfile>()

  if (reviewerIds.length > 0) {
    const {
      data: reviewers,
      error: reviewerError,
    } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', reviewerIds)

    if (reviewerError) {
      throw reviewerError
    }

    for (const reviewer of reviewers ?? []) {
      reviewerMap.set(
        reviewer.id,
        {
          full_name:
            reviewer.full_name,
        },
      )
    }
  }

  const items: ReviewQueueItem[] = []

  for (const review of reviews) {
    const idea =
      ideaMap.get(review.idea_id)

    if (!idea) {
      continue
    }

    const mappedReview =
      mapReview(review)

    const reviewer =
      mappedReview.reviewerId
        ? reviewerMap.get(
            mappedReview.reviewerId,
          )
        : null

    items.push({
      reviewId:
        mappedReview.id,
      ideaId:
        idea.id,
      ideaCode:
        idea.ideaCode,
      title:
        idea.title,
      shortDescription:
        idea.shortDescription,
      categoryName:
        idea.categoryName,
      status:
        idea.status,
      priority:
        idea.priority,
      createdAt:
        idea.createdAt,
      submittedAt:
        idea.submittedAt,
      submitterName:
        idea.submitterName,
      submitterId:
        idea.submitterId,
      reviewerName:
        reviewer?.full_name ?? null,
      reviewerId:
        mappedReview.reviewerId,
      reviewStatus:
        mappedReview.status,
      recommendation:
        mappedReview.recommendation,
      reviewNotes:
        mappedReview.reviewNotes,
      requestedInformation:
        mappedReview.requestedInformation,
      assignedAt:
        mappedReview.assignedAt,
      reviewedAt:
        mappedReview.reviewedAt,
    })
  }

  return items
}

/* =========================================================
   GET REVIEW QUEUE
   ========================================================= */

/*
 * IMPORTANT:
 *
 * A newly submitted idea does NOT necessarily have an
 * idea_reviews row yet.
 *
 * Therefore the Review Queue starts from ideas rather than
 * idea_reviews.
 *
 * Queue contains:
 *
 * SUBMITTED
 * UNDER_REVIEW
 *
 * Completed reviews are not included.
 */
export async function getReviewQueue(): Promise<
  ReviewQueueItem[]
> {
  const {
    data: ideas,
    error: ideaError,
  } = await supabase
    .from('ideas')
    .select(`
      id,
      idea_code,
      title,
      short_description,
      status,
      priority,
      submitter_id,
      created_at,
      submitted_at,
      idea_categories(name),
      profiles!ideas_submitter_id_fkey(full_name)
    `)
    .in('status', [
      'SUBMITTED',
      'UNDER_REVIEW',
    ])
    .order('created_at', {
      ascending: false,
    })

  if (ideaError) {
    throw ideaError
  }

  if (!ideas || ideas.length === 0) {
    return []
  }

  const ideaRows =
    ideas as unknown as IdeaRow[]

  const ideaIds =
    ideaRows.map(
      (idea) => idea.id,
    )

  /*
   * Only active reviews are loaded.
   */
  const {
    data: reviews,
    error: reviewError,
  } = await supabase
    .from('idea_reviews')
    .select('*')
    .in('idea_id', ideaIds)
    .in('status', [
      'PENDING',
      'IN_REVIEW',
    ])

  if (reviewError) {
    throw reviewError
  }

  const reviewRows =
    (reviews ?? []) as ReviewRow[]

  const reviewMap =
    new Map<string, ReviewRow>()

  for (const review of reviewRows) {
    reviewMap.set(
      review.idea_id,
      review,
    )
  }

  /*
   * Load reviewer profiles.
   */
  const reviewerIds =
    Array.from(
      new Set(
        reviewRows
          .map(
            (review) =>
              review.reviewer_id,
          )
          .filter(
            (id): id is string =>
              Boolean(id),
          ),
      ),
    )

  const reviewerMap =
    new Map<
      string,
      ReviewerProfile
    >()

  if (reviewerIds.length > 0) {
    const {
      data: reviewers,
      error: reviewerError,
    } = await supabase
      .from('profiles')
      .select(
        'id, full_name',
      )
      .in(
        'id',
        reviewerIds,
      )

    if (reviewerError) {
      throw reviewerError
    }

    for (
      const reviewer of
        reviewers ?? []
    ) {
      reviewerMap.set(
        reviewer.id,
        {
          full_name:
            reviewer.full_name,
        },
      )
    }
  }

  const items: ReviewQueueItem[] =
    []

  for (const ideaRow of ideaRows) {
    const idea =
      mapIdea(ideaRow)

    const review =
      reviewMap.get(
        idea.id,
      )

    /*
     * No active review.
     *
     * This is normally a new SUBMITTED idea.
     */
    if (!review) {
      items.push({
        reviewId: null,
        ideaId: idea.id,
        ideaCode:
          idea.ideaCode,
        title:
          idea.title,
        shortDescription:
          idea.shortDescription,
        categoryName:
          idea.categoryName,
        status:
          idea.status,
        priority:
          idea.priority,
        createdAt:
          idea.createdAt,
        submittedAt:
          idea.submittedAt,
        submitterName:
          idea.submitterName,
        submitterId:
          idea.submitterId,
        reviewerName:
          null,
        reviewerId:
          null,
        reviewStatus:
          null,
        recommendation:
          null,
        reviewNotes:
          null,
        requestedInformation:
          null,
        assignedAt:
          null,
        reviewedAt:
          null,
      })

      continue
    }

    /*
     * Existing active review.
     */
    const mappedReview =
      mapReview(review)

    const reviewer =
      mappedReview.reviewerId
        ? reviewerMap.get(
            mappedReview.reviewerId,
          )
        : null

    items.push({
      reviewId:
        mappedReview.id,
      ideaId:
        idea.id,
      ideaCode:
        idea.ideaCode,
      title:
        idea.title,
      shortDescription:
        idea.shortDescription,
      categoryName:
        idea.categoryName,
      status:
        idea.status,
      priority:
        idea.priority,
      createdAt:
        idea.createdAt,
      submittedAt:
        idea.submittedAt,
      submitterName:
        idea.submitterName,
      submitterId:
        idea.submitterId,
      reviewerName:
        reviewer?.full_name ??
        null,
      reviewerId:
        mappedReview.reviewerId,
      reviewStatus:
        mappedReview.status,
      recommendation:
        mappedReview.recommendation,
      reviewNotes:
        mappedReview.reviewNotes,
      requestedInformation:
        mappedReview.requestedInformation,
      assignedAt:
        mappedReview.assignedAt,
      reviewedAt:
        mappedReview.reviewedAt,
    })
  }

  return items
}

/* =========================================================
   GET REVIEW BY ID
   ========================================================= */

export async function getReviewById(
  reviewId: string,
): Promise<ReviewQueueItem | null> {
  const {
    data: review,
    error: reviewError,
  } = await supabase
    .from('idea_reviews')
    .select('*')
    .eq('id', reviewId)
    .maybeSingle()

  if (reviewError) {
    throw reviewError
  }

  if (!review) {
    return null
  }

  const {
    data: idea,
    error: ideaError,
  } = await supabase
    .from('ideas')
    .select(`
      id,
      idea_code,
      title,
      short_description,
      status,
      priority,
      submitter_id,
      created_at,
      submitted_at,
      idea_categories(name),
      profiles!ideas_submitter_id_fkey(full_name)
    `)
    .eq('id', review.idea_id)
    .maybeSingle()

  if (ideaError) {
    throw ideaError
  }

  if (!idea) {
    return null
  }

  const items =
    await buildQueueItems(
      [review as ReviewRow],
      [
        idea as unknown as IdeaRow,
      ],
    )

  return items[0] ?? null
}

/* =========================================================
   ASSIGN REVIEW
   ========================================================= */

export async function assignReview(
  ideaId: string,
  reviewerId: string,
): Promise<ReviewQueueItem> {
  const now =
    new Date().toISOString()

  /*
   * Check whether this idea already has a review.
   */
  const {
    data: existingReview,
    error: existingError,
  } = await supabase
    .from('idea_reviews')
    .select('*')
    .eq('idea_id', ideaId)
    .maybeSingle()

  if (existingError) {
    throw existingError
  }

  let review: ReviewRow

  /*
   * Existing review:
   * assign/reassign it.
   */
  if (existingReview) {
    const {
      data,
      error,
    } = await supabase
      .from('idea_reviews')
      .update({
        reviewer_id:
          reviewerId,
        assigned_by:
          reviewerId,
        status:
          existingReview.status ===
          'COMPLETED'
            ? 'COMPLETED'
            : 'IN_REVIEW',
        assigned_at:
          existingReview.assigned_at ??
          now,
        updated_at:
          now,
      })
      .eq(
        'id',
        existingReview.id,
      )
      .select('*')
      .single()

    if (error) {
      throw error
    }

    review = data as ReviewRow
  } else {
    /*
     * New review:
     * create the review record.
     */
    const {
      data,
      error,
    } = await supabase
      .from('idea_reviews')
      .insert({
        idea_id:
          ideaId,
        reviewer_id:
          reviewerId,
        assigned_by:
          reviewerId,
        status:
          'IN_REVIEW',
        assigned_at:
          now,
      })
      .select('*')
      .single()

    if (error) {
      throw error
    }

    review = data as ReviewRow
  }

  /*
   * Get current idea status.
   */
  const {
    data: currentIdea,
    error: currentIdeaError,
  } = await supabase
    .from('ideas')
    .select('status')
    .eq('id', ideaId)
    .single()

  if (currentIdeaError) {
    throw currentIdeaError
  }

  /*
   * SUBMITTED → UNDER_REVIEW
   */
  if (
    currentIdea.status ===
    'SUBMITTED'
  ) {
    const {
      error: statusError,
    } = await supabase
      .from('ideas')
      .update({
        status:
          'UNDER_REVIEW',
        updated_at:
          now,
      })
      .eq(
        'id',
        ideaId,
      )

    if (statusError) {
      throw statusError
    }

    const {
      error: historyError,
    } = await supabase
      .from('idea_status_history')
      .insert({
        idea_id:
          ideaId,
        from_status:
          'SUBMITTED',
        to_status:
          'UNDER_REVIEW',
        changed_by:
          reviewerId,
        reason:
          'Idea assigned for review.',
      })

    if (historyError) {
      console.warn(
        'Idea moved to UNDER_REVIEW, but status history could not be recorded:',
        historyError,
      )
    }
  }

  /*
   * Reload updated idea.
   */
  const {
    data: refreshedIdea,
    error:
      refreshedIdeaError,
  } = await supabase
    .from('ideas')
    .select(`
      id,
      idea_code,
      title,
      short_description,
      status,
      priority,
      submitter_id,
      created_at,
      submitted_at,
      idea_categories(name),
      profiles!ideas_submitter_id_fkey(full_name)
    `)
    .eq('id', ideaId)
    .single()

  if (refreshedIdeaError) {
    throw refreshedIdeaError
  }

  const items =
    await buildQueueItems(
      [review],
      [
        refreshedIdea as unknown as IdeaRow,
      ],
    )

  if (!items[0]) {
    throw new Error(
      'Review was assigned, but the review item could not be loaded.',
    )
  }

  return items[0]
}

/* =========================================================
   ASSIGN REVIEW TO ME
   ========================================================= */

export async function assignReviewToMe(
  reviewId: string,
): Promise<ReviewQueueItem> {
  const userId =
    await getCurrentUserId()

  const reviewItem =
    await getReviewById(
      reviewId,
    )

  if (!reviewItem) {
    throw new Error(
      'Review record could not be found.',
    )
  }

  return assignReview(
    reviewItem.ideaId,
    userId,
  )
}

/* =========================================================
   SAVE REVIEW
   ========================================================= */

export async function saveReview(
  reviewId: string,
  input: ReviewInput,
): Promise<ReviewQueueItem> {
  const userId =
    await getCurrentUserId()

  const now =
    new Date().toISOString()

  /*
   * Load review.
   */
  const {
    data: existingReview,
    error: reviewError,
  } = await supabase
    .from('idea_reviews')
    .select('*')
    .eq('id', reviewId)
    .single()

  if (reviewError) {
    throw reviewError
  }

  if (!existingReview) {
    throw new Error(
      'Review record could not be found.',
    )
  }

  if (
    existingReview.idea_id !==
    input.ideaId
  ) {
    throw new Error(
      'The selected idea does not match this review.',
    )
  }

  /*
   * Determine lifecycle transition.
   */
  let nextIdeaStatus:
    | 'UNDER_EVALUATION'
    | 'CHANGES_REQUESTED'
    | 'REJECTED'
    | 'UNDER_REVIEW'

  switch (
    input.recommendation
  ) {
    case 'MOVE_TO_EVALUATION':
      nextIdeaStatus =
        'UNDER_EVALUATION'
      break

    case 'REQUEST_CHANGES':
      nextIdeaStatus =
        'CHANGES_REQUESTED'
      break

    case 'REJECT':
      nextIdeaStatus =
        'REJECTED'
      break

    case 'NEEDS_INFORMATION':
      nextIdeaStatus =
        'UNDER_REVIEW'
      break

    default:
      throw new Error(
        'A valid review recommendation is required.',
      )
  }

  /*
   * Get current idea status.
   */
  const {
    data: currentIdea,
    error: currentIdeaError,
  } = await supabase
    .from('ideas')
    .select('status')
    .eq('id', input.ideaId)
    .single()

  if (currentIdeaError) {
    throw currentIdeaError
  }

  const fromStatus =
    currentIdea.status

  /*
   * Complete review.
   */
  const {
    data: updatedReview,
    error:
      updateReviewError,
  } = await supabase
    .from('idea_reviews')
    .update({
      reviewer_id:
        existingReview.reviewer_id ??
        userId,
      status:
        'COMPLETED',
      recommendation:
        input.recommendation,
      review_notes:
        input.reviewNotes?.trim() ||
        null,
      requested_information:
        input.requestedInformation?.trim() ||
        null,
      reviewed_at:
        now,
      updated_at:
        now,
    })
    .eq(
      'id',
      reviewId,
    )
    .select('*')
    .single()

  if (updateReviewError) {
    throw updateReviewError
  }

  /*
   * Update idea status.
   *
   * MOVE_TO_EVALUATION means exactly that.
   * It does NOT mean APPROVED.
   */
  const {
    data: updatedIdea,
    error:
      ideaUpdateError,
  } = await supabase
    .from('ideas')
    .update({
      status:
        nextIdeaStatus,
      updated_at:
        now,
    })
    .eq(
      'id',
      input.ideaId,
    )
    .select(`
      id,
      idea_code,
      title,
      short_description,
      status,
      priority,
      submitter_id,
      created_at,
      submitted_at,
      idea_categories(name),
      profiles!ideas_submitter_id_fkey(full_name)
    `)
    .single()

  if (ideaUpdateError) {
    throw ideaUpdateError
  }

  /*
   * Record lifecycle history.
   */
  if (
    fromStatus !==
    nextIdeaStatus
  ) {
    const {
      error:
        historyError,
    } = await supabase
      .from('idea_status_history')
      .insert({
        idea_id:
          input.ideaId,
        from_status:
          fromStatus,
        to_status:
          nextIdeaStatus,
        changed_by:
          userId,
        reason:
          input.reviewNotes?.trim() ||
          `Review completed with recommendation: ${input.recommendation}`,
      })

    if (historyError) {
      console.warn(
        'Review completed, but status history could not be recorded:',
        historyError,
      )
    }
  }

  /*
   * Return updated queue item.
   */
  const items =
    await buildQueueItems(
      [
        updatedReview as ReviewRow,
      ],
      [
        updatedIdea as unknown as IdeaRow,
      ],
    )

  if (!items[0]) {
    throw new Error(
      'Review was saved, but the updated review could not be loaded.',
    )
  }

  return items[0]
}

/* =========================================================
   UPDATE REVIEW
   ========================================================= */

export async function updateReview(
  reviewId: string,
  input: {
    recommendation?: ReviewRecommendation
    reviewNotes?: string
    requestedInformation?: string
  },
) {
  const updatePayload: Record<
    string,
    unknown
  > = {
    updated_at:
      new Date().toISOString(),
  }

  if (
    input.recommendation !==
    undefined
  ) {
    updatePayload.recommendation =
      input.recommendation
  }

  if (
    input.reviewNotes !==
    undefined
  ) {
    updatePayload.review_notes =
      input.reviewNotes
  }

  if (
    input.requestedInformation !==
    undefined
  ) {
    updatePayload.requested_information =
      input.requestedInformation
  }

  const {
    data,
    error,
  } = await supabase
    .from('idea_reviews')
    .update(updatePayload)
    .eq(
      'id',
      reviewId,
    )
    .select('*')
    .single()

  if (error) {
    throw error
  }

  return data
}

/* =========================================================
   COMPLETE REVIEW
   ========================================================= */

export async function completeReview(
  input: {
    reviewId: string
    recommendation: ReviewRecommendation
    reviewNotes?: string
    requestedInformation?: string
  },
) {
  const review =
    await getReviewById(
      input.reviewId,
    )

  if (!review) {
    throw new Error(
      'Review record could not be found.',
    )
  }

  return saveReview(
    input.reviewId,
    {
      ideaId:
        review.ideaId,
      recommendation:
        input.recommendation,
      reviewNotes:
        input.reviewNotes,
      requestedInformation:
        input.requestedInformation,
    },
  )
}

/* =========================================================
   DELETE REVIEW
   ========================================================= */

export async function deleteReview(
  reviewId: string,
): Promise<void> {
  const {
    error,
  } = await supabase
    .from('idea_reviews')
    .delete()
    .eq(
      'id',
      reviewId,
    )

  if (error) {
    throw error
  }
}

/* =========================================================
   LABEL HELPERS
   ========================================================= */

export function getRecommendationLabel(
  recommendation:
    | ReviewRecommendation
    | null,
): string {
  switch (recommendation) {
    case 'MOVE_TO_EVALUATION':
      return 'Move to Evaluation'

    case 'REQUEST_CHANGES':
      return 'Request Changes'

    case 'REJECT':
      return 'Reject'

    case 'NEEDS_INFORMATION':
      return 'Needs Information'

    default:
      return 'No recommendation'
  }
}

export function getReviewStatusLabel(
  status: ReviewStatus,
): string {
  switch (status) {
    case 'PENDING':
      return 'Pending'

    case 'IN_REVIEW':
      return 'In Review'

    case 'COMPLETED':
      return 'Completed'

    default:
      return status
  }
}