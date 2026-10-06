import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  completeEvaluation,
  getEvaluationWorkspace,
  saveEvaluation,
  type EvaluationWorkspace,
  type SaveEvaluationInput,
} from './evaluation-api'

const recommendationOptions = [
  {
    value: 'MOVE_TO_DECISION',
    label: 'Move to Decision',
    description:
      'Evaluation is complete and the idea should proceed to the management decision stage.',
  },
  {
    value: 'REQUEST_CHANGES',
    label: 'Request Changes',
    description:
      'The idea requires changes or additional work before a decision can be made.',
  },
  {
    value: 'NEEDS_INFORMATION',
    label: 'Needs Information',
    description:
      'Additional information is required before the evaluation can be completed.',
  },
  {
    value: 'REJECT',
    label: 'Reject',
    description:
      'The idea is not recommended to proceed.',
  },
] as const

type Recommendation =
  (typeof recommendationOptions)[number]['value']

type ScoreState = Record<string, number>

function formatDate(value: string | null) {
  if (!value) {
    return 'Not available'
  }

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getScoreColor(score: number) {
  if (score >= 80) {
    return 'text-green-400'
  }

  if (score >= 60) {
    return 'text-yellow-400'
  }

  if (score > 0) {
    return 'text-red-400'
  }

  return 'text-muted-foreground'
}

export function EvaluationWorkspacePage() {
  const { ideaId } = useParams<{ ideaId: string }>()
  const navigate = useNavigate()

  const [workspace, setWorkspace] =
    useState<EvaluationWorkspace | null>(null)

  const [scores, setScores] = useState<ScoreState>({})
  const [comments, setComments] = useState<Record<string, string>>({})
  const [recommendation, setRecommendation] =
    useState<Recommendation>('MOVE_TO_DECISION')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)

  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadWorkspace = async () => {
      if (!ideaId) {
        setError('No idea was provided for evaluation.')
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const result = await getEvaluationWorkspace(ideaId)

        if (cancelled) {
          return
        }

        setWorkspace(result)

        const initialScores: ScoreState = {}
        const initialComments: Record<string, string> = {}

        result.scores.forEach((score) => {
          initialScores[score.criterionId] = score.score
          initialComments[score.criterionId] =
            score.comments ?? ''
        })

        result.criteria.forEach((criterion) => {
          if (initialScores[criterion.id] === undefined) {
            initialScores[criterion.id] = 0
          }

          if (initialComments[criterion.id] === undefined) {
            initialComments[criterion.id] = ''
          }
        })

        setScores(initialScores)
        setComments(initialComments)

        if (result.evaluation) {
          if (
            result.evaluation.recommendation &&
            recommendationOptions.some(
              (option) =>
                option.value ===
                result.evaluation?.recommendation,
            )
          ) {
            setRecommendation(
              result.evaluation
                .recommendation as Recommendation,
            )
          }

          setNotes(result.evaluation.evaluationNotes ?? '')
        }
      } catch (loadError) {
        if (cancelled) {
          return
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : 'Unable to load the evaluation workspace.',
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    const timer = window.setTimeout(() => {
      void loadWorkspace()
    }, 0)

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [ideaId])

  const calculatedScore = useMemo(() => {
    if (!workspace || workspace.criteria.length === 0) {
      return 0
    }

    const totalWeight = workspace.criteria.reduce(
      (sum, criterion) => sum + criterion.weight,
      0,
    )

    if (totalWeight <= 0) {
      return 0
    }

    const weightedScore = workspace.criteria.reduce(
      (sum, criterion) => {
        const score = scores[criterion.id] ?? 0

        const normalizedScore =
          criterion.maxScore > 0
            ? (score / criterion.maxScore) * 100
            : 0

        return (
          sum +
          normalizedScore *
            (criterion.weight / totalWeight)
        )
      },
      0,
    )

    return Math.round(weightedScore * 100) / 100
  }, [workspace, scores])

  const updateScore = (
    criterionId: string,
    value: number,
    maxScore: number,
  ) => {
    const safeValue = Math.min(
      Math.max(value, 0),
      maxScore,
    )

    setScores((current) => ({
      ...current,
      [criterionId]: safeValue,
    }))

    setSuccessMessage(null)
  }

  const updateComment = (
    criterionId: string,
    value: string,
  ) => {
    setComments((current) => ({
      ...current,
      [criterionId]: value,
    }))

    setSuccessMessage(null)
  }

  const buildInput = (): SaveEvaluationInput => ({
    ideaId: ideaId as string,
    scores: workspace?.criteria.map((criterion) => ({
      criterionId: criterion.id,
      score: scores[criterion.id] ?? 0,
      comments: comments[criterion.id] ?? '',
    })) ?? [],
    recommendation,
    evaluationNotes: notes,
  })

  const handleSaveDraft = async () => {
    if (!workspace || !ideaId) {
      return
    }

    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const result = await saveEvaluation(buildInput())

      setWorkspace((current) =>
        current
          ? {
              ...current,
              evaluation: result,
            }
          : current,
      )

      setSuccessMessage(
        'Evaluation draft saved successfully.',
      )
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save the evaluation.',
      )
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async () => {
    if (!workspace || !ideaId) {
      return
    }

    const missingScores = workspace.criteria.filter(
      (criterion) =>
        scores[criterion.id] === undefined ||
        scores[criterion.id] < 0,
    )

    if (missingScores.length > 0) {
      setError(
        'Please provide a score for every evaluation criterion.',
      )
      return
    }

    if (!recommendation) {
      setError(
        'Please select a recommendation before completing the evaluation.',
      )
      return
    }

    setCompleting(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const result = await completeEvaluation(
        buildInput(),
      )

      setWorkspace((current) =>
        current
          ? {
              ...current,
              evaluation: result,
            }
          : current,
      )

      setSuccessMessage(
        'Evaluation completed successfully.',
      )
    } catch (completeError) {
      setError(
        completeError instanceof Error
          ? completeError.message
          : 'Unable to complete the evaluation.',
      )
    } finally {
      setCompleting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-muted" />
        <div className="h-32 animate-pulse rounded-xl bg-muted" />
        <div className="h-96 animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (error && !workspace) {
    return (
      <div className="space-y-4">
        <Link
          to="/evaluation"
          className="text-sm text-primary hover:underline"
        >
          ← Back to Evaluation Queue
        </Link>

        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
          <h1 className="font-semibold text-red-400">
            Unable to load evaluation
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      </div>
    )
  }

  if (!workspace) {
    return null
  }

  const isCompleted =
    workspace.evaluation?.status === 'COMPLETED'

  return (
    <div className="space-y-6">
      {/* Header */}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <Link
            to="/evaluation"
            className="text-sm text-primary hover:underline"
          >
            ← Back to Evaluation Queue
          </Link>

          <p className="mt-4 text-sm font-medium text-primary">
            Evaluation Workspace
          </p>

          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {workspace.idea.title}
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            {workspace.idea.ideaCode}
          </p>
        </div>

        {isCompleted && (
          <span className="rounded-full bg-green-500/10 px-3 py-1.5 text-sm font-medium text-green-400">
            Evaluation Completed
          </span>
        )}
      </div>

      {/* Error / success */}

      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
          <p className="font-medium text-red-400">
            Something went wrong
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            {error}
          </p>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-green-500/20 bg-green-500/5 p-4">
          <p className="font-medium text-green-400">
            {successMessage}
          </p>
        </div>
      )}

      {/* Idea summary */}

      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-semibold">
            Idea Summary
          </h2>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Problem
            </p>

            <p className="mt-2 text-sm leading-6">
              {workspace.idea.problemStatement ||
                'No problem statement provided.'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Proposed Solution
            </p>

            <p className="mt-2 text-sm leading-6">
              {workspace.idea.proposedSolution ||
                'No proposed solution provided.'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Expected Benefits
            </p>

            <p className="mt-2 text-sm leading-6">
              {workspace.idea.expectedBenefits ||
                'No expected benefits provided.'}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Business Impact
            </p>

            <p className="mt-2 text-sm leading-6">
              {workspace.idea.businessImpact ||
                'No business impact provided.'}
            </p>
          </div>
        </div>
      </section>

      {/* Score overview */}

      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium">
              Overall Evaluation Score
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Calculated from the weighted evaluation criteria.
            </p>
          </div>

          <div className="text-right">
            <span
              className={`text-4xl font-bold ${getScoreColor(
                calculatedScore,
              )}`}
            >
              {calculatedScore.toFixed(1)}
            </span>

            <span className="ml-1 text-sm text-muted-foreground">
              / 100
            </span>
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{
              width: `${Math.min(
                Math.max(calculatedScore, 0),
                100,
              )}%`,
            }}
          />
        </div>
      </section>

      {/* Criteria */}

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">
            Evaluation Criteria
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Score every criterion based on the evidence provided
            by the idea.
          </p>
        </div>

        {workspace.criteria.map((criterion, index) => {
          const score = scores[criterion.id] ?? 0

          return (
            <div
              key={criterion.id}
              className="rounded-xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {index + 1}
                  </div>

                  <div>
                    <h3 className="font-semibold">
                      {criterion.name}
                    </h3>

                    <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">
                      {criterion.description ||
                        'Evaluate this criterion based on the available evidence.'}
                    </p>
                  </div>
                </div>

                <div className="shrink-0 rounded-lg bg-muted px-3 py-2 text-sm">
                  <span className="font-medium">
                    Weight {criterion.weight}%
                  </span>
                </div>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-[180px_1fr] md:items-start">
                <div>
                  <label
                    htmlFor={`score-${criterion.id}`}
                    className="text-sm font-medium"
                  >
                    Score
                  </label>

                  <div className="mt-2 flex items-center gap-2">
                    <input
                      id={`score-${criterion.id}`}
                      type="number"
                      min={0}
                      max={criterion.maxScore}
                      step={1}
                      value={score}
                      disabled={isCompleted}
                      onChange={(event) =>
                        updateScore(
                          criterion.id,
                          Number(event.target.value),
                          criterion.maxScore,
                        )
                      }
                      className="w-24 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                    />

                    <span className="text-sm text-muted-foreground">
                      / {criterion.maxScore}
                    </span>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor={`comment-${criterion.id}`}
                    className="text-sm font-medium"
                  >
                    Evaluation Comment
                  </label>

                  <textarea
                    id={`comment-${criterion.id}`}
                    rows={3}
                    value={comments[criterion.id] ?? ''}
                    disabled={isCompleted}
                    onChange={(event) =>
                      updateComment(
                        criterion.id,
                        event.target.value,
                      )
                    }
                    placeholder="Explain the reasoning behind this score..."
                    className="mt-2 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* Recommendation */}

      <section className="rounded-xl border border-border bg-card p-5">
        <div>
          <h2 className="font-semibold">
            Recommendation
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Select what should happen after this evaluation.
          </p>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {recommendationOptions.map((option) => {
            const selected =
              recommendation === option.value

            return (
              <button
                key={option.value}
                type="button"
                disabled={isCompleted}
                onClick={() => {
                  setRecommendation(option.value)
                  setSuccessMessage(null)
                }}
                className={`rounded-xl border p-4 text-left transition ${
                  selected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/40'
                } ${
                  isCompleted
                    ? 'cursor-not-allowed opacity-60'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                      selected
                        ? 'border-primary bg-primary'
                        : 'border-muted-foreground'
                    }`}
                  >
                    {selected && (
                      <span className="h-2 w-2 rounded-full bg-primary-foreground" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold">
                      {option.label}
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {option.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      {/* Evaluation notes */}

      <section className="rounded-xl border border-border bg-card p-5">
        <label
          htmlFor="evaluation-notes"
          className="font-semibold"
        >
          Evaluation Notes
        </label>

        <p className="mt-1 text-sm text-muted-foreground">
          Add an overall assessment or important observations.
        </p>

        <textarea
          id="evaluation-notes"
          rows={5}
          value={notes}
          disabled={isCompleted}
          onChange={(event) => {
            setNotes(event.target.value)
            setSuccessMessage(null)
          }}
          placeholder="Write the overall evaluation assessment..."
          className="mt-4 w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
        />
      </section>

      {/* Actions */}

      {!isCompleted && (
        <div className="sticky bottom-4 z-10 rounded-xl border border-border bg-card/95 p-4 shadow-lg backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving || completing}
              onClick={() => void handleSaveDraft()}
              className="rounded-lg border border-border px-5 py-2.5 text-sm font-medium transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </button>

            <button
              type="button"
              disabled={saving || completing}
              onClick={() => void handleComplete()}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {completing
                ? 'Completing...'
                : 'Complete Evaluation'}
            </button>
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate('/evaluation')}
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Back to Evaluation Queue
          </button>
        </div>
      )}

      {/* Evaluation metadata */}

      {workspace.evaluation && (
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">
            Evaluation Record
          </h2>

          <div className="mt-4 grid gap-4 text-sm md:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Status
              </p>

              <p className="mt-1 font-medium">
                {workspace.evaluation.status}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Last Updated
              </p>

              <p className="mt-1 font-medium">
                {formatDate(
                  workspace.evaluation.updatedAt,
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Evaluated At
              </p>

              <p className="mt-1 font-medium">
                {formatDate(
                  workspace.evaluation.evaluatedAt,
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}