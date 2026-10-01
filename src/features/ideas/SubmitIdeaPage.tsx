import type React from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  Lightbulb,
  Save,
  Sparkles,
} from 'lucide-react'

import {
  createIdea,
  getIdeaCategories,
  type IdeaCategory,
} from './idea-api'

import {
  getIdeaTags,
  saveIdeaTags,
  type IdeaTag,
} from './idea-tags-api'

type Step = 1 | 2 | 3 | 4

type FormData = {
  title: string
  shortDescription: string
  problemStatement: string
  proposedSolution: string
  category: string
  tags: string[]
  expectedBenefits: string
  businessImpact: string
  targetUsers: string
  strategicAlignment: string
  urgency: string
  implementationApproach: string
  estimatedEffort: string
  estimatedCost: string
  dependencies: string
  risks: string
}

const initialFormData: FormData = {
  title: '',
  shortDescription: '',
  problemStatement: '',
  proposedSolution: '',
  category: '',
  tags: [],
  expectedBenefits: '',
  businessImpact: '',
  targetUsers: '',
  strategicAlignment: '',
  urgency: 'Medium',
  implementationApproach: '',
  estimatedEffort: '',
  estimatedCost: '',
  dependencies: '',
  risks: '',
}

const urgencyOptions = [
  'Low',
  'Medium',
  'High',
  'Critical',
]

const effortOptions = [
  'Small',
  'Medium',
  'Large',
  'Enterprise',
]

type ReviewSectionProps = {
  title: string
  children: React.ReactNode
}

function ReviewSection({
  title,
  children,
}: ReviewSectionProps) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
        {title}
      </p>

      <div className="text-sm leading-6 text-foreground">
        {children}
      </div>
    </div>
  )
}

function EmptyValue() {
  return (
    <span className="text-muted">
      Not provided
    </span>
  )
}

export function SubmitIdeaPage() {
  const [step, setStep] = useState<Step>(1)

  const [formData, setFormData] =
    useState<FormData>(initialFormData)

  /* Categories */
  const [categories, setCategories] = useState<
    IdeaCategory[]
  >([])

  const [categoriesLoading, setCategoriesLoading] =
    useState(true)

  const [categoriesError, setCategoriesError] =
    useState<string | null>(null)

  /* Tags */
  const [tags, setTags] = useState<IdeaTag[]>([])

  const [tagsLoading, setTagsLoading] =
    useState(true)

  const [tagsError, setTagsError] =
    useState<string | null>(null)

  /* Submission state */
  const [saved, setSaved] = useState(false)

  const [submitted, setSubmitted] =
    useState(false)

  const [submitting, setSubmitting] =
    useState(false)

  const [submissionError, setSubmissionError] =
    useState<string | null>(null)

  const [submittedIdeaCode, setSubmittedIdeaCode] =
    useState<string | null>(null)

  const [validationError, setValidationError] =
    useState<string | null>(null)

  /*
   * Load categories from Supabase.
   */
  useEffect(() => {
    let mounted = true

    const loadCategories = async () => {
      try {
        setCategoriesLoading(true)
        setCategoriesError(null)

        const data = await getIdeaCategories()

        if (mounted) {
          setCategories(data)
        }
      } catch (error) {
        console.error(
          'Failed to load categories:',
          error,
        )

        if (mounted) {
          setCategoriesError(
            'Unable to load idea categories. Please try again.',
          )
        }
      } finally {
        if (mounted) {
          setCategoriesLoading(false)
        }
      }
    }

    void loadCategories()

    return () => {
      mounted = false
    }
  }, [])

  /*
   * Load tags from Supabase.
   */
  useEffect(() => {
    let mounted = true

    const loadTags = async () => {
      try {
        setTagsLoading(true)
        setTagsError(null)

        const data = await getIdeaTags()

        if (mounted) {
          setTags(data)
        }
      } catch (error) {
        console.error(
          'Failed to load tags:',
          error,
        )

        if (mounted) {
          setTagsError(
            'Unable to load idea tags. Please try again.',
          )
        }
      } finally {
        if (mounted) {
          setTagsLoading(false)
        }
      }
    }

    void loadTags()

    return () => {
      mounted = false
    }
  }, [])

  /*
   * Update one form field.
   */
  const updateField = (
    field: keyof FormData,
    value: string | string[],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }))

    setValidationError(null)
    setSubmissionError(null)
  }

  /*
   * Toggle database-backed tags.
   *
   * formData.tags stores tag UUIDs, not tag names.
   */
  const toggleTag = (tagId: string) => {
    setFormData((current) => {
      const exists =
        current.tags.includes(tagId)

      return {
        ...current,
        tags: exists
          ? current.tags.filter(
              (item) => item !== tagId,
            )
          : [...current.tags, tagId],
      }
    })

    setValidationError(null)
    setSubmissionError(null)
  }

  /*
   * Selected category.
   */
  const selectedCategory = useMemo(() => {
    return categories.find(
      (category) =>
        category.id === formData.category,
    )
  }, [categories, formData.category])

  /*
   * Selected tag objects.
   */
  const selectedTags = useMemo(() => {
    return formData.tags
      .map((tagId) =>
        tags.find((tag) => tag.id === tagId),
      )
      .filter(
        (tag): tag is IdeaTag =>
          Boolean(tag),
      )
  }, [formData.tags, tags])

  /*
   * Validate each step.
   */
  const validateStep = (
    currentStep: Step,
  ): boolean => {
    setValidationError(null)

    if (currentStep === 1) {
      if (!formData.title.trim()) {
        setValidationError(
          'Please enter an idea title.',
        )
        return false
      }

      if (!formData.shortDescription.trim()) {
        setValidationError(
          'Please provide a short description.',
        )
        return false
      }

      if (!formData.problemStatement.trim()) {
        setValidationError(
          'Please describe the problem or opportunity.',
        )
        return false
      }

      if (!formData.proposedSolution.trim()) {
        setValidationError(
          'Please describe your proposed solution.',
        )
        return false
      }

      if (!formData.category) {
        setValidationError(
          'Please select an idea category.',
        )
        return false
      }
    }

    if (currentStep === 2) {
      if (!formData.expectedBenefits.trim()) {
        setValidationError(
          'Please describe the expected benefits.',
        )
        return false
      }

      if (!formData.businessImpact.trim()) {
        setValidationError(
          'Please describe the expected business impact.',
        )
        return false
      }

      if (!formData.targetUsers.trim()) {
        setValidationError(
          'Please identify the target users or teams.',
        )
        return false
      }
    }

    if (currentStep === 3) {
      if (!formData.implementationApproach.trim()) {
        setValidationError(
          'Please describe the implementation approach.',
        )
        return false
      }

      if (!formData.estimatedEffort) {
        setValidationError(
          'Please select an estimated effort.',
        )
        return false
      }

      if (
        formData.estimatedCost &&
        Number.isNaN(
          Number(formData.estimatedCost),
        )
      ) {
        setValidationError(
          'Please enter a valid estimated cost.',
        )
        return false
      }

      if (
        formData.estimatedCost &&
        Number(formData.estimatedCost) < 0
      ) {
        setValidationError(
          'Estimated cost cannot be negative.',
        )
        return false
      }
    }

    return true
  }

  /*
   * Continue to next step.
   */
  const handleContinue = () => {
    if (!validateStep(step)) {
      return
    }

    if (step < 4) {
      setStep(
        (current) =>
          (current + 1) as Step,
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  /*
   * Go back.
   */
  const handleBack = () => {
    setValidationError(null)
    setSubmissionError(null)

    if (step > 1) {
      setStep(
        (current) =>
          (current - 1) as Step,
      )

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  /*
   * Save draft.
   *
   * Still session-local for now.
   */
  const handleSaveDraft = () => {
    setSaved(true)

    window.setTimeout(() => {
      setSaved(false)
    }, 2500)
  }

  /*
   * Submit idea to Supabase.
   */
  const handleSubmit = async () => {
    if (submitting) {
      return
    }

    setValidationError(null)
    setSubmissionError(null)

    /*
     * Validate all required steps.
     */
    if (!validateStep(1)) {
      setStep(1)

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      return
    }

    if (!validateStep(2)) {
      setStep(2)

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      return
    }

    if (!validateStep(3)) {
      setStep(3)

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

      return
    }

    try {
      setSubmitting(true)

      /*
       * Create the main idea record.
       */
      const createdIdea = await createIdea({
        title: formData.title,
        shortDescription:
          formData.shortDescription,
        problemStatement:
          formData.problemStatement,
        proposedSolution:
          formData.proposedSolution,
        expectedBenefits:
          formData.expectedBenefits,
        businessImpact:
          formData.businessImpact,
        targetUsers:
          formData.targetUsers,
        strategicAlignment:
          formData.strategicAlignment,
        implementationApproach:
          formData.implementationApproach,
        estimatedEffort:
          formData.estimatedEffort,
        estimatedCost:
          formData.estimatedCost
            ? Number(
                formData.estimatedCost,
              )
            : null,
        dependencies:
          formData.dependencies,
        risks:
          formData.risks,
        categoryId:
          formData.category,
        priority:
          formData.urgency.toUpperCase(),
      })

      /*
       * Save selected database tag relationships.
       */
      await saveIdeaTags(
        createdIdea.id,
        formData.tags,
      )

      console.log(
        'Idea submitted successfully:',
        createdIdea,
      )

      setSubmittedIdeaCode(
        createdIdea.idea_code,
      )

      setSubmitted(true)
    } catch (error) {
      console.error(
        'Idea submission failed:',
        error,
      )

      setSubmissionError(
        error instanceof Error
          ? error.message
          : 'Unable to submit the idea. Please try again.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  /*
   * Cancel.
   */
  const handleCancel = () => {
    window.history.back()
  }

  /*
   * Submitted success state.
   */
  if (submitted) {
    return (
      <div className="mx-auto max-w-2xl py-12">
        <div className="rounded-2xl border border-border bg-surface p-10 text-center shadow-card">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <CheckCircle2 className="h-8 w-8 text-primary" />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Idea submitted
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Your idea has been submitted
          </h1>

          <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-muted">
            Your idea has been submitted successfully
            and is now entering the organization's
            innovation review workflow.
          </p>

          {submittedIdeaCode && (
            <div className="mx-auto mt-6 inline-flex rounded-lg border border-primary/20 bg-primary/5 px-4 py-2.5">
              <span className="text-xs text-muted">
                Idea reference:
              </span>

              <span className="ml-2 text-sm font-semibold text-primary">
                {submittedIdeaCode}
              </span>
            </div>
          )}

          <div className="mt-8 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setFormData(initialFormData)
                setSubmitted(false)
                setSubmittedIdeaCode(null)
                setSubmissionError(null)
                setValidationError(null)
                setSaved(false)
                setStep(1)
              }}
              className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:border-primary"
            >
              Submit Another Idea
            </button>

            <button
              type="button"
              onClick={() =>
                window.history.back()
              }
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Return
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pb-12">
      {/* Header */}
      <section className="mb-8">
        <button
          type="button"
          onClick={handleCancel}
          className="mb-5 inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-surface">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              Innovation
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight">
              Submit an Idea
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              Capture an opportunity, explain the value,
              and provide enough context for your organization
              to evaluate and act on it.
            </p>
          </div>
        </div>
      </section>

      {/* Progress */}
      <section className="mb-8 rounded-xl border border-border bg-surface p-5">
        <div className="grid gap-3 sm:grid-cols-4">
          {[
            {
              number: 1,
              label: 'Idea',
              description: 'Core idea',
            },
            {
              number: 2,
              label: 'Business Context',
              description: 'Value & impact',
            },
            {
              number: 3,
              label: 'Implementation',
              description: 'Execution details',
            },
            {
              number: 4,
              label: 'Review',
              description: 'Confirm & submit',
            },
          ].map((item) => {
            const active =
              step === item.number

            const completed =
              step > item.number

            return (
              <div
                key={item.number}
                className={`rounded-lg border p-3 transition ${
                  active
                    ? 'border-primary/50 bg-primary/5'
                    : 'border-border bg-background'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      completed
                        ? 'bg-primary text-primary-foreground'
                        : active
                          ? 'border border-primary bg-primary/10 text-primary'
                          : 'border border-border text-muted'
                    }`}
                  >
                    {completed ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      item.number
                    )}
                  </div>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-medium ${
                        active
                          ? 'text-foreground'
                          : 'text-muted'
                      }`}
                    >
                      {item.label}
                    </p>

                    <p className="text-xs text-muted">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Validation error */}
      {validationError && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          {validationError}
        </div>
      )}

      {/* Submission error */}
      {submissionError && (
        <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-400">
          <p className="font-medium">
            Submission failed
          </p>

          <p className="mt-1">
            {submissionError}
          </p>
        </div>
      )}

      {/* Step 1 */}
      {step === 1 && (
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Step 1
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Tell us about your idea
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Start with the problem and the opportunity
              you want to address.
            </p>
          </div>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="idea-title"
                className="mb-2 block text-sm font-medium"
              >
                Idea title
                <span className="ml-1 text-primary">
                  *
                </span>
              </label>

              <input
                id="idea-title"
                type="text"
                value={formData.title}
                onChange={(event) =>
                  updateField(
                    'title',
                    event.target.value,
                  )
                }
                placeholder="Give your idea a clear, concise title"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Short description */}
            <div>
              <label
                htmlFor="short-description"
                className="mb-2 block text-sm font-medium"
              >
                Short description
                <span className="ml-1 text-primary">
                  *
                </span>
              </label>

              <textarea
                id="short-description"
                rows={3}
                value={formData.shortDescription}
                onChange={(event) =>
                  updateField(
                    'shortDescription',
                    event.target.value,
                  )
                }
                placeholder="Summarize the idea in a few sentences"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Problem */}
            <div>
              <label
                htmlFor="problem-statement"
                className="mb-2 block text-sm font-medium"
              >
                Problem or opportunity
                <span className="ml-1 text-primary">
                  *
                </span>
              </label>

              <textarea
                id="problem-statement"
                rows={5}
                value={formData.problemStatement}
                onChange={(event) =>
                  updateField(
                    'problemStatement',
                    event.target.value,
                  )
                }
                placeholder="What problem, inefficiency, unmet need, or opportunity does this address?"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Solution */}
            <div>
              <label
                htmlFor="proposed-solution"
                className="mb-2 block text-sm font-medium"
              >
                Proposed solution
                <span className="ml-1 text-primary">
                  *
                </span>
              </label>

              <textarea
                id="proposed-solution"
                rows={5}
                value={formData.proposedSolution}
                onChange={(event) =>
                  updateField(
                    'proposedSolution',
                    event.target.value,
                  )
                }
                placeholder="Describe how your idea would solve the problem"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Category */}
            <div>
              <label
                htmlFor="idea-category"
                className="mb-2 block text-sm font-medium"
              >
                Category
                <span className="ml-1 text-primary">
                  *
                </span>
              </label>

              <select
                id="idea-category"
                value={formData.category}
                onChange={(event) =>
                  updateField(
                    'category',
                    event.target.value,
                  )
                }
                disabled={categoriesLoading}
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <option value="">
                  {categoriesLoading
                    ? 'Loading categories...'
                    : 'Select a category'}
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {categoriesError && (
                <p className="mt-2 text-xs text-red-400">
                  {categoriesError}
                </p>
              )}

              {!categoriesLoading &&
                !categoriesError &&
                categories.length === 0 && (
                  <p className="mt-2 text-xs text-muted">
                    No active categories are available.
                  </p>
                )}
            </div>

            {/* Database-backed Tags */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Tags
              </label>

              <p className="mb-3 text-xs text-muted">
                Select tags that help others discover and
                understand your idea.
              </p>

              {tagsLoading ? (
                <p className="text-xs text-muted">
                  Loading tags...
                </p>
              ) : tagsError ? (
                <p className="text-xs text-red-400">
                  {tagsError}
                </p>
              ) : tags.length === 0 ? (
                <p className="text-xs text-muted">
                  No active tags are available.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => {
                    const selected =
                      formData.tags.includes(
                        tag.id,
                      )

                    return (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() =>
                          toggleTag(tag.id)
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs transition ${
                          selected
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted hover:border-primary/40 hover:text-foreground'
                        }`}
                      >
                        {selected && (
                          <Check className="mr-1 inline-block h-3 w-3" />
                        )}

                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Step 2
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Business context
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Explain who benefits and why the organization
              should consider this idea.
            </p>
          </div>

          <div className="space-y-6">
            {/* Benefits */}
            <div>
              <label
                htmlFor="expected-benefits"
                className="mb-2 block text-sm font-medium"
              >
                Expected benefits
                <span className="ml-1 text-primary">
                  *
                </span>
              </label>

              <textarea
                id="expected-benefits"
                rows={5}
                value={formData.expectedBenefits}
                onChange={(event) =>
                  updateField(
                    'expectedBenefits',
                    event.target.value,
                  )
                }
                placeholder="What positive outcomes could this idea create?"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Business impact */}
            <div>
              <label
                htmlFor="business-impact"
                className="mb-2 block text-sm font-medium"
              >
                Business impact
                <span className="ml-1 text-primary">
                  *
                </span>
              </label>

              <textarea
                id="business-impact"
                rows={5}
                value={formData.businessImpact}
                onChange={(event) =>
                  updateField(
                    'businessImpact',
                    event.target.value,
                  )
                }
                placeholder="How could this affect revenue, cost, productivity, quality, customers, employees, or operations?"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Target users */}
            <div>
              <label
                htmlFor="target-users"
                className="mb-2 block text-sm font-medium"
              >
                Target users / teams
                <span className="ml-1 text-primary">
                  *
                </span>
              </label>

              <input
                id="target-users"
                type="text"
                value={formData.targetUsers}
                onChange={(event) =>
                  updateField(
                    'targetUsers',
                    event.target.value,
                  )
                }
                placeholder="Who would use or benefit from this idea?"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Strategic alignment */}
            <div>
              <label
                htmlFor="strategic-alignment"
                className="mb-2 block text-sm font-medium"
              >
                Strategic alignment
              </label>

              <textarea
                id="strategic-alignment"
                rows={4}
                value={formData.strategicAlignment}
                onChange={(event) =>
                  updateField(
                    'strategicAlignment',
                    event.target.value,
                  )
                }
                placeholder="Which organizational goals, priorities, or strategic initiatives does this support?"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Urgency */}
            <div>
              <label
                htmlFor="urgency"
                className="mb-2 block text-sm font-medium"
              >
                Urgency
              </label>

              <select
                id="urgency"
                value={formData.urgency}
                onChange={(event) =>
                  updateField(
                    'urgency',
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition focus:border-primary"
              >
                {urgencyOptions.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <section className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              Step 3
            </p>

            <h2 className="mt-2 text-xl font-semibold">
              Implementation
            </h2>

            <p className="mt-1 text-sm leading-6 text-muted">
              Give reviewers enough information to understand
              how the idea could be implemented.
            </p>
          </div>

          <div className="space-y-6">
            {/* Approach */}
            <div>
              <label
                htmlFor="implementation-approach"
                className="mb-2 block text-sm font-medium"
              >
                Implementation approach
                <span className="ml-1 text-primary">
                  *
                </span>
              </label>

              <textarea
                id="implementation-approach"
                rows={6}
                value={formData.implementationApproach}
                onChange={(event) =>
                  updateField(
                    'implementationApproach',
                    event.target.value,
                  )
                }
                placeholder="Describe the major steps, technologies, processes, or teams that may be involved."
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Effort */}
            <div>
              <label
                htmlFor="estimated-effort"
                className="mb-2 block text-sm font-medium"
              >
                Estimated effort
                <span className="ml-1 text-primary">
                  *
                </span>
              </label>

              <select
                id="estimated-effort"
                value={formData.estimatedEffort}
                onChange={(event) =>
                  updateField(
                    'estimatedEffort',
                    event.target.value,
                  )
                }
                className="h-11 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition focus:border-primary"
              >
                <option value="">
                  Select estimated effort
                </option>

                {effortOptions.map((option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Cost */}
            <div>
              <label
                htmlFor="estimated-cost"
                className="mb-2 block text-sm font-medium"
              >
                Estimated cost
              </label>

              <input
                id="estimated-cost"
                type="number"
                min="0"
                step="0.01"
                value={formData.estimatedCost}
                onChange={(event) =>
                  updateField(
                    'estimatedCost',
                    event.target.value,
                  )
                }
                placeholder="Estimated cost in your organization's currency"
                className="h-11 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Dependencies */}
            <div>
              <label
                htmlFor="dependencies"
                className="mb-2 block text-sm font-medium"
              >
                Dependencies
              </label>

              <textarea
                id="dependencies"
                rows={4}
                value={formData.dependencies}
                onChange={(event) =>
                  updateField(
                    'dependencies',
                    event.target.value,
                  )
                }
                placeholder="Mention systems, teams, approvals, vendors, data, or other dependencies."
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>

            {/* Risks */}
            <div>
              <label
                htmlFor="risks"
                className="mb-2 block text-sm font-medium"
              >
                Risks / considerations
              </label>

              <textarea
                id="risks"
                rows={4}
                value={formData.risks}
                onChange={(event) =>
                  updateField(
                    'risks',
                    event.target.value,
                  )
                }
                placeholder="What risks, constraints, or concerns should reviewers consider?"
                className="w-full resize-none rounded-lg border border-border bg-background px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-muted focus:border-primary"
              />
            </div>
          </div>
        </section>
      )}

      {/* Step 4 */}
      {step === 4 && (
        <section className="space-y-5">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                <FileText className="h-4 w-4 text-primary" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Final review
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  Review your idea before submitting
                </h2>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Make sure the information is clear and
                  complete before sending it to the innovation
                  workflow.
                </p>
              </div>
            </div>
          </div>

          <ReviewSection title="Idea">
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted">
                  Title
                </p>

                <p className="mt-1 font-medium">
                  {formData.title || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Short description
                </p>

                <p className="mt-1 whitespace-pre-wrap">
                  {formData.shortDescription || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Problem / opportunity
                </p>

                <p className="mt-1 whitespace-pre-wrap">
                  {formData.problemStatement || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Proposed solution
                </p>

                <p className="mt-1 whitespace-pre-wrap">
                  {formData.proposedSolution || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Category
                </p>

                <p className="mt-1 font-medium">
                  {selectedCategory?.name || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Tags
                </p>

                {selectedTags.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <span
                        key={tag.id}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1">
                    <EmptyValue />
                  </p>
                )}
              </div>
            </div>
          </ReviewSection>

          <ReviewSection title="Business Context">
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted">
                  Expected benefits
                </p>

                <p className="mt-1 whitespace-pre-wrap">
                  {formData.expectedBenefits || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Business impact
                </p>

                <p className="mt-1 whitespace-pre-wrap">
                  {formData.businessImpact || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Target users / teams
                </p>

                <p className="mt-1">
                  {formData.targetUsers || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Strategic alignment
                </p>

                <p className="mt-1 whitespace-pre-wrap">
                  {formData.strategicAlignment || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Urgency
                </p>

                <p className="mt-1 font-medium">
                  {formData.urgency}
                </p>
              </div>
            </div>
          </ReviewSection>

          <ReviewSection title="Implementation">
            <div className="space-y-5">
              <div>
                <p className="text-xs text-muted">
                  Implementation approach
                </p>

                <p className="mt-1 whitespace-pre-wrap">
                  {formData.implementationApproach || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Estimated effort
                </p>

                <p className="mt-1 font-medium">
                  {formData.estimatedEffort || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Estimated cost
                </p>

                <p className="mt-1">
                  {formData.estimatedCost || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Dependencies
                </p>

                <p className="mt-1 whitespace-pre-wrap">
                  {formData.dependencies || (
                    <EmptyValue />
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted">
                  Risks / considerations
                </p>

                <p className="mt-1 whitespace-pre-wrap">
                  {formData.risks || (
                    <EmptyValue />
                  )}
                </p>
              </div>
            </div>
          </ReviewSection>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-5">
            <div className="flex gap-3">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />

              <div>
                <p className="text-sm font-medium">
                  What happens after submission?
                </p>

                <p className="mt-1 text-xs leading-5 text-muted">
                  Your idea will enter the organization's
                  innovation workflow for review and evaluation.
                  Reviewers can assess the opportunity, request
                  additional information, and recommend the next
                  step.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Bottom actions */}
      <section className="mt-6 flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-muted">
          {saved ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Draft saved for this session
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              You can save your progress before submitting.
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium text-muted transition hover:border-primary hover:text-foreground"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:border-primary"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>

          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-medium transition hover:border-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleContinue}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit Idea
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}