import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase/client'

export function ResetPasswordPage() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] =
    useState('')

  const [showPassword, setShowPassword] =
    useState(false)

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false)

  const [loading, setLoading] = useState(false)
  const [checkingSession, setCheckingSession] =
    useState(true)

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!cancelled) {
        if (!session) {
          setError(
            'This password reset link is invalid or has expired. Please request a new reset link.',
          )
        }

        setCheckingSession(false)
      }
    }

    void checkSession()

    return () => {
      cancelled = true
    }
  }, [])

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')

    if (password.length < 8) {
      setError(
        'Password must contain at least 8 characters.',
      )
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { error: updateError } =
      await supabase.auth.updateUser({
        password,
      })

    setLoading(false)

    if (updateError) {
      setError(updateError.message)
      return
    }

    setSuccess(true)

    window.setTimeout(() => {
      navigate('/login')
    }, 2000)
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
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
              SECURE ACCOUNT ACCESS
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
              Create a new password and get back to work.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-muted">
              Choose a strong password to keep your RicozSpark
              workspace secure.
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

            {/* Heading */}

            <div>
              <p className="text-sm font-medium text-primary">
                PASSWORD RESET
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Set a new password
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Create a new password for your RicozSpark account.
              </p>
            </div>

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success ? (
              <div className="mt-8 rounded-lg border border-primary/30 bg-primary/10 px-4 py-4">
                <p className="text-sm font-medium">
                  Password updated successfully.
                </p>

                <p className="mt-1 text-sm leading-6 text-muted">
                  Redirecting you to the sign-in page...
                </p>
              </div>
            ) : (
              /* =================================================
                 RESET FORM
              ================================================= */

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                {/* New password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium"
                  >
                    New password
                  </label>

                  <div className="relative">
                    <input
                      id="password"
                      type={
                        showPassword
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="new-password"
                      value={password}
                      onChange={(event) =>
                        setPassword(
                          event.target.value,
                        )
                      }
                      placeholder="Enter your new password"
                      className="h-11 w-full rounded-lg border border-border bg-surface px-3 pr-11 text-sm outline-none transition placeholder:text-muted focus:border-primary"
                    />

                    <button
                      type="button"
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      onClick={() =>
                        setShowPassword(
                          (current) => !current,
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted transition hover:bg-background hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <p className="mt-2 text-xs text-muted">
                    Use at least 8 characters.
                  </p>
                </div>

                {/* Confirm password */}

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium"
                  >
                    Confirm password
                  </label>

                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={
                        showConfirmPassword
                          ? 'text'
                          : 'password'
                      }
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(event) =>
                        setConfirmPassword(
                          event.target.value,
                        )
                      }
                      placeholder="Confirm your new password"
                      className="h-11 w-full rounded-lg border border-border bg-surface px-3 pr-11 text-sm outline-none transition placeholder:text-muted focus:border-primary"
                    />

                    <button
                      type="button"
                      aria-label={
                        showConfirmPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                      onClick={() =>
                        setShowConfirmPassword(
                          (current) => !current,
                        )
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted transition hover:bg-background hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error */}

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-300"
                  >
                    {error}
                  </div>
                )}

                {/* Submit */}

                <button
                  type="submit"
                  disabled={loading || Boolean(error)}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Sign in */}

            <p className="mt-8 text-center text-sm text-muted">
              <Link
                to="/login"
                className="font-medium text-primary transition hover:opacity-80"
              >
                Return to sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}