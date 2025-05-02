import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const next = requestUrl.searchParams.get("next")

  // Aqui você pode implementar lógica de callback para outros provedores de autenticação, se necessário

  if (next) {
    return NextResponse.redirect(requestUrl.origin + next)
  } else {
    return NextResponse.redirect(requestUrl.origin)
  }
}
