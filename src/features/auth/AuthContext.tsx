import { useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase/client'
import {
  AuthContext,
  type Profile,
  type UserRole,
} from './auth-context'

type AuthProviderProps = {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [role, setRole] = useState<UserRole | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUserData = async (currentUser: User | null) => {
    if (!currentUser) {
      setProfile(null)
      setRole(null)
      return
    }

    const [profileResult, roleResult] = await Promise.all([
      supabase
        .from('profiles')
        .select(
          'id, full_name, email, job_title, department_id, avatar_url, bio, is_active',
        )
        .eq('id', currentUser.id)
        .maybeSingle(),

      supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', currentUser.id)
        .maybeSingle(),
    ])

    if (profileResult.error) {
      console.error(
        'Failed to load profile:',
        profileResult.error,
      )
    } else {
      setProfile(profileResult.data)
    }

    if (roleResult.error) {
      console.error(
        'Failed to load user role:',
        roleResult.error,
      )
    } else {
      setRole(roleResult.data?.role ?? null)
    }
  }

  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      const {
        data: { session: currentSession },
      } = await supabase.auth.getSession()

      if (!mounted) {
        return
      }

      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      await loadUserData(currentSession?.user ?? null)

      if (mounted) {
        setLoading(false)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        if (!mounted) {
          return
        }

        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        await loadUserData(currentSession?.user ?? null)

        if (mounted) {
          setLoading(false)
        }
      },
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    setSession(null)
    setUser(null)
    setProfile(null)
    setRole(null)
  }

  const refreshProfile = async () => {
    if (!user) {
      return
    }

    await loadUserData(user)
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        role,
        loading,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}