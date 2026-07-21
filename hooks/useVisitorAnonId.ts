import { useCallback, useState } from "react"

const ANON_ID_KEY = "anonId"

export function useVisitorAnonId() {
  const [anonId, setAnonIdState] = useState<string | null>(() => {
    if (typeof window === "undefined") return null
    return localStorage.getItem(ANON_ID_KEY)
  })

  const setAnonId = useCallback((id: string | null) => {
    if (id) {
      localStorage.setItem(ANON_ID_KEY, id)
    } else {
      localStorage.removeItem(ANON_ID_KEY)
    }
    setAnonIdState(id)
  }, [])

  return { anonId, setAnonId }
}