import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Lightbulb, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase/client'

export function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    navigate('/')
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
              INNOVATION MANAGEMENT
            </p>

            <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight">
              Turn organizational ideas into measurable impact.
            </h1>

            <p className="mt-5 max-w-md text-sm leading-6 text-muted">
              Capture ideas, evaluate opportunities, execute approved
              initiatives, and measure the outcomes that matter.
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

        {/* Login panel */}
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
                WELCOME BACK
              </p>

              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                Sign in to RicozSpark
              </h2>

              <p className="mt-2 text-sm leading-6 text-muted">
                Access your innovation workspace and continue where you left
                off.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm outline-none transition placeholder:text-muted focus:border-primary"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium"
                  >
                    Password
                  </label>

                  <Link
                    to="/forgot-password"
                    className="text-xs font-medium text-primary transition hover:opacity-80"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Enter your password"
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-medium text-primary transition hover:opacity-80"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}