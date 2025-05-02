import { Brand } from "@/components/ui/brand"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SubmitButton } from "@/components/ui/submit-button"
import { Metadata } from "next"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { query } from "@/lib/postgres/client"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export const metadata: Metadata = {
  title: "Login"
}

export default async function Login({
  searchParams
}: {
  searchParams: { message: string }
}) {
  const signIn = async (formData: FormData) => {
    "use server"
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const result = await query("SELECT * FROM users WHERE email = $1", [email])
    const user = result.rows[0]
    if (!user) {
      return redirect(`/login?message=Usuário não encontrado`)
    }

    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return redirect(`/login?message=Senha incorreta`)
    }

    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    )
    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: true,
      path: "/"
    })

    const wsResult = await query(
      "SELECT id FROM workspaces WHERE user_id = $1 AND is_home = true",
      [user.id]
    )
    const homeWorkspace = wsResult.rows[0]
    if (!homeWorkspace) {
      return redirect(`/login?message=Workspace principal não encontrado`)
    }

    return redirect(`/${homeWorkspace.id}/chat`)
  }

  const signUp = async (formData: FormData) => {
    "use server"
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const exists = await query("SELECT 1 FROM users WHERE email = $1", [email])
    if (exists.rows.length > 0) {
      return redirect(`/login?message=Email já cadastrado`)
    }

    const password_hash = await bcrypt.hash(password, 10)
    const userResult = await query(
      "INSERT INTO users (email, password_hash, created_at) VALUES ($1, $2, NOW()) RETURNING *",
      [email, password_hash]
    )
    const user = userResult.rows[0]

    const wsResult = await query(
      "INSERT INTO workspaces (user_id, name, is_home, created_at) VALUES ($1, $2, true, NOW()) RETURNING *",
      [user.id, `${user.email.split("@")[0]}'s Workspace`]
    )
    const homeWorkspace = wsResult.rows[0]

    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    )
    cookies().set("auth_token", token, {
      httpOnly: true,
      secure: true,
      path: "/"
    })

    return redirect(`/${homeWorkspace.id}/chat`)
  }

  const handleResetPassword = async (formData: FormData) => {
    "use server"
    return redirect("/login?message=Função de reset de senha não implementada.")
  }

  return (
    <div className="flex w-full flex-1 flex-col justify-center gap-2 px-8 sm:max-w-md">
      <form
        className="animate-in text-foreground flex w-full flex-1 flex-col justify-center gap-2"
        action={signIn}
      >
        <Brand />

        <Label className="text-md mt-4" htmlFor="email">
          Email
        </Label>
        <Input
          className="mb-3 rounded-md border bg-inherit px-4 py-2"
          name="email"
          placeholder="you@example.com"
          required
        />

        <Label className="text-md" htmlFor="password">
          Password
        </Label>
        <Input
          className="mb-6 rounded-md border bg-inherit px-4 py-2"
          type="password"
          name="password"
          placeholder="••••••••"
        />

        <SubmitButton className="mb-2 rounded-md bg-blue-700 px-4 py-2 text-white">
          Login
        </SubmitButton>

        <SubmitButton
          formAction={signUp}
          className="border-foreground/20 mb-2 rounded-md border px-4 py-2"
        >
          Sign Up
        </SubmitButton>

        <div className="text-muted-foreground mt-1 flex justify-center text-sm">
          <span className="mr-1">Forgot your password?</span>
          <button
            formAction={handleResetPassword}
            className="text-primary ml-1 underline hover:opacity-80"
          >
            Reset
          </button>
        </div>

        {searchParams?.message && (
          <p className="bg-foreground/10 text-foreground mt-4 p-4 text-center">
            {searchParams.message}
          </p>
        )}
      </form>
    </div>
  )
}
