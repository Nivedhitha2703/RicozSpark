import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Lightbulb,
  Loader2,
  Mail,
} from 'lucide-react'
import { supabase } from '../../lib/supabase/client'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')
    setSuccess(false)

    const normalizedEmail = email.trim()

    if (!normalizedEmail) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)

    const redirectTo = `${window.location.origin}/reset-password`

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo,
        },
      )

    setLoading(false)

    if (resetError) {
      setError(resetError.message)
      return
    }

    setSuccess(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* =====================================================
            BRAND PANEL
        ===================================================== */}

        <div className="hidden border-r border-border bg-surface lg:flex lg:flex-col lg:justify-between lg:p-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                <Lightbulb className="h-5 w-5 text-primary-foreground" />
              </div>

              <div>
                <p className="text-base font-semibold">
                  RicozSpark
                </p>

                <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                  Innovation
                </p>
              </div>
            </div>
          </div>

          <div className="max-w-lg">
            <p className="text-sm font-medium text-primary">
              ACCOUNT RECOVERY
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
              Get back to your innovation workspace.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-muted">
              Enter your registered work email and we'll send you a
              secure link to reset your RicozSpark password.
            </p>
          </div>

          <p className="text-xs text-muted">
            Enterprise innovation workspace
          </p>
        </div>

        {/* =====================================================
            FORM PANEL
        ===================================================== */}

        <div className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
            {/* Mobile logo */}

            <div className="mb-8 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
                  <Lightbulb className="h-5 w-5 text-primary-foreground" />
                </div>

                <div>
                  <p className="text-base font-semibold">
                    RicozSpark
                  </p>

                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted">
                    Innovation
                  </p>
                </div>
              </div>
            </div>

            {/* Back */}

            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted transition hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>

            {/* Heading */}

            <div className="mt-8">
              <p className="text-sm font-medium text-primary">
                PASSWORD RECOVERY
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Forgot your password?
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Enter the email address associated with your RicozSpark
                account.
              </p>
            </div>

            {/* =================================================
                SUCCESS STATE
            ================================================= */}

            {success ? (
              <div className="mt-8 space-y-5">
                <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-4">
                  <div className="flex items-start gap-3">
                    <Mail className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                    <div>
                      <p className="text-sm font-medium">
                        Check your email
                      </p>

                      <p className="mt-1 text-sm leading-6 text-muted">
                        If an account exists for{' '}
                        <span className="font-medium text-foreground">
                          {email.trim()}
                        </span>
                        , we've sent a password reset link.
                      </p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/login"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium transition hover:bg-muted/40"
                >
                  Return to sign in
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="w-full text-center text-sm font-medium text-primary transition hover:opacity-80"
                >
                  Try another email
                </button>
              </div>
            ) : (
              /* =================================================
                 FORM
              ================================================= */

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium"
                  >
                    Work email
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@company.com"
                    className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition placeholder:text-muted focus:border-primary"
                  />
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
                  >
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    <>
                      Send reset link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom link */}

            {!success && (
              <p className="mt-8 text-center text-sm text-muted">
                Remember your password?{' '}
                <Link
                  to="/login"
                  className="font-medium text-primary transition hover:opacity-80"
                >
                  Sign in
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}