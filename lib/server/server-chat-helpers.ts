import { VALID_ENV_KEYS } from "@/types/valid-keys"
import { cookies } from "next/headers"
import { query } from "@/lib/postgres/client"
import { Profile } from "@/lib/postgres/types"
import jwt from "jsonwebtoken"

export async function getServerProfile() {
  const cookieStore = cookies()
  const token = cookieStore.get("auth_token")?.value
  if (!token) {
    throw new Error("Usuário não autenticado")
  }
  let userId: string | undefined
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!)
    userId = (payload as any).user_id
  } catch {
    throw new Error("Token inválido")
  }
  if (!userId) {
    throw new Error("User not found")
  }
  const result: { rows: Profile[] } = await query(
    "SELECT * FROM profiles WHERE user_id = $1",
    [userId]
  )
  const profile = result.rows[0] as Profile | undefined
  if (!profile) {
    throw new Error("Profile not found")
  }
  const profileWithKeys = addApiKeysToProfile(profile)
  return profileWithKeys
}

function addApiKeysToProfile(profile: any) {
  const apiKeys = {
    [VALID_ENV_KEYS.OPENAI_API_KEY]: "openai_api_key",
    [VALID_ENV_KEYS.ANTHROPIC_API_KEY]: "anthropic_api_key",
    [VALID_ENV_KEYS.GOOGLE_GEMINI_API_KEY]: "google_gemini_api_key",
    [VALID_ENV_KEYS.MISTRAL_API_KEY]: "mistral_api_key",
    [VALID_ENV_KEYS.GROQ_API_KEY]: "groq_api_key",
    [VALID_ENV_KEYS.PERPLEXITY_API_KEY]: "perplexity_api_key",
    [VALID_ENV_KEYS.AZURE_OPENAI_API_KEY]: "azure_openai_api_key",
    [VALID_ENV_KEYS.OPENROUTER_API_KEY]: "openrouter_api_key",
    [VALID_ENV_KEYS.OPENAI_ORGANIZATION_ID]: "openai_organization_id",
    [VALID_ENV_KEYS.AZURE_OPENAI_ENDPOINT]: "azure_openai_endpoint",
    [VALID_ENV_KEYS.AZURE_GPT_35_TURBO_NAME]: "azure_openai_35_turbo_id",
    [VALID_ENV_KEYS.AZURE_GPT_45_VISION_NAME]: "azure_openai_45_vision_id",
    [VALID_ENV_KEYS.AZURE_GPT_45_TURBO_NAME]: "azure_openai_45_turbo_id",
    [VALID_ENV_KEYS.AZURE_EMBEDDINGS_NAME]: "azure_openai_embeddings_id"
  }
  for (const [envKey, profileKey] of Object.entries(apiKeys)) {
    if (process.env[envKey]) {
      ;(profile as any)[profileKey] = process.env[envKey]
    }
  }
  return profile
}

export function checkApiKey(apiKey: string | null, keyName: string) {
  if (apiKey === null || apiKey === "") {
    throw new Error(`${keyName} API Key not found`)
  }
}
