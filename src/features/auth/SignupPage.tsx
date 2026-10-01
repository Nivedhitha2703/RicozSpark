import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { supabase } from '../../lib/supabase/client'

export function SignupPage() {
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!fullName.trim()) {
      setError('Please enter your full name.')
      return
    }

    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.session) {
      navigate('/')
      return
    }

    setSuccess(
      'Account created successfully. Please check your email to confirm your account.',
    )

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
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
              JOIN THE INNOVATION WORKSPACE
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
              Turn your ideas into opportunities.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-muted">
              Share ideas, collaborate with colleagues, and help move
              promising opportunities from concept to measurable impact.
            </p>

            <div className="mt-8 flex items-center gap-2 text-xs text-muted">
              <span>Capture</span>
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Evaluate</span>
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Execute</span>
              <ArrowRight className="h-3.5 w-3.5" />
              <span>Measure</span>
            </div>
          </div>

          <p className="text-xs text-muted">
            Enterprise innovation workspace
          </p>
        </div>

        {/* Signup panel */}
        <div className="flex min-h-screen items-center justify-center px-6 py-12">
          <div className="w-full max-w-md">
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

            <div>
              <p className="text-sm font-medium text-primary">
                GET STARTED
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Join your organization's innovation workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {/* Full name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium"
                >
                  Full name
                </label>

                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Your full name"
                  className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition placeholder:text-muted focus:border-primary"
                />
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="signupEmail"
                  className="mb-2 block text-sm font-medium"
                >
                  Work email
                </label>

                <input
                  id="signupEmail"
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

              {/* Password */}
              <div>
                <label
                  htmlFor="signupPassword"
                  className="mb-2 block text-sm font-medium"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="signupPassword"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="At least 6 characters"
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
                      setShowPassword((current) => !current)
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
                      showConfirmPassword ? 'text' : 'password'
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    placeholder="Re-enter your password"
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

              {/* Success */}
              {success && (
                <div
                  role="status"
                  className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2.5 text-sm text-primary"
                >
                  {success}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-primary transition hover:opacity-80"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}