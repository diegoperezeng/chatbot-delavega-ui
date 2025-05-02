import { query } from "@/lib/postgres/client"

export const runtime = "edge"

export async function POST(request: Request) {
  const json = await request.json()
  const { username } = json as {
    username: string
  }

  try {
    const result = await query(
      "SELECT username FROM profiles WHERE username = $1",
      [username]
    )
    const usernames = result.rows

    return new Response(JSON.stringify({ isAvailable: !usernames.length }), {
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
