import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'

export type Profile = {
  id: string
  full_name: string
  email: string | null
  job_title: string | null
  department_id: string | null
  avatar_url: string | null
  bio: string | null
  is_active: boolean
}

export type UserRole =
  | 'EMPLOYEE'
  | 'REVIEWER'
  | 'MANAGER'
  | 'ADMIN'

export type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: UserRole | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

export const AuthContext = createContext<
  AuthContextValue | undefined
>(undefined)