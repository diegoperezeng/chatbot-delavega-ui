import { i18nRouter } from "next-i18n-router"
import { NextResponse, type NextRequest } from "next/server"
import i18nConfig from "./i18nConfig"
import { query } from "@/lib/postgres/client"
import jwt from "jsonwebtoken"

export async function middleware(request: NextRequest) {
  const i18nResult = i18nRouter(request, i18nConfig)
  if (i18nResult) return i18nResult

  try {
    const token = request.cookies.get("auth_token")?.value
    if (!token) return NextResponse.next()

    let userId: string | undefined
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET!)
      userId = (payload as any).user_id
    } catch {
      return NextResponse.next()
    }
    if (!userId) return NextResponse.next()

    if (request.nextUrl.pathname === "/") {
      const result = await query(
        "SELECT id FROM workspaces WHERE user_id = $1 AND is_home = true",
        [userId]
      )
      const homeWorkspace = result.rows[0]
      if (homeWorkspace) {
        return NextResponse.redirect(
          new URL(`/${homeWorkspace.id}/chat`, request.url)
        )
      }
    }

    return NextResponse.next()
  } catch (e) {
    return NextResponse.next({
      request: {
        headers: request.headers
      }
    })
  }
}

export const config = {
  matcher: "/((?!api|static|.*\\..*|_next|auth).*)"
}
