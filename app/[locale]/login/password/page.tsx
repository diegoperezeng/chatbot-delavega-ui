"use client"

import { ChangePassword } from "@/components/utility/change-password"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ChangePasswordPage() {
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Verifica autenticação via JWT em cookie (auth_token)
    const checkAuth = async () => {
      const token = document.cookie
        .split("; ")
        .find(row => row.startsWith("auth_token="))
        ?.split("=")[1]
      if (!token) {
        router.push("/login")
      } else {
        setLoading(false)
      }
    }
    checkAuth()
  }, [router])

  if (loading) {
    return null
  }

  return <ChangePassword />
}
