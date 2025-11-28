'use client'

import { useSession } from 'next-auth/react'
import { createContext, ReactNode, useContext } from 'react'
import { useCurrentUser } from '../hooks/users'
import type { UserWithPermissions } from '../types/users'

interface PermissionsContextValue {
  user: UserWithPermissions | null | undefined
  isLoading: boolean
}

const PermissionsContext = createContext<PermissionsContextValue>({
  user: null,
  isLoading: false,
})

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()
  const { data: userData, isLoading } = useCurrentUser(session?.user?.id)

  return (
    <PermissionsContext.Provider
      value={{
        user: userData?.data,
        isLoading,
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissionsContext() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error(
      'usePermissionsContext must be used within a PermissionsProvider'
    )
  }
  return context
}
