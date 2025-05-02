import { query } from "@/lib/postgres/client"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { userId } = json as {
    userId: string
  }

  try {
    const result = await query(
      "SELECT username FROM profiles WHERE user_id = $1",
      [userId]
    )
    const data = result.rows[0]

    if (!data) {
      throw new Error("Usuário não encontrado")
    }

    return new Response(JSON.stringify({ username: data.username }), {
      status: 200
    })
  } catch (error: any) {
    const errorMessage = error.message || "An unexpected error occurred"
    const errorCode = error.status || 500
    return new Response(JSON.stringify({ message: errorMessage }), {
      status: errorCode
    })
  }
}
