"use client"

import type React from "react"
import Image from 'next/image'
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface LoginFormData {
  email: string
  password: string
}

interface AuthError {
  message: string
}

export function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  })
  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        throw error
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err) {
      const authError = err as AuthError
      setError(authError.message || "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <Card className="p-6 border-0 shadow-lg bg-[#6CB4EE]">
      <CardHeader className="space-y-1 flex flex-col items-center">
        {/* Aquí irá el logo - Reemplaza este div con tu imagen cuando tengas el PNG */}
        <Image 
              src="/assets/logo.png" // Cambia esto a la ruta correcta de tu logo
              alt="CEEN Logo" 
              width={160} 
              height={160} 
              className="rounded-full"
           />
       
        <CardTitle className="text-2xl text-center text-white">Panel Administrativo</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Usuario
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="admin@ejemplo.com"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="bg-white border-0"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">
              Contraseña
            </Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="bg-white border-0"
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full bg-[#0F3460] hover:bg-[#0A2647] text-white" disabled={loading}>
            {loading ? "Iniciando sesión..." : "Ingresar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

