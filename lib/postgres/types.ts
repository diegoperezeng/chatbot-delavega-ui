export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface User {
  id: string
  created_at: string
  updated_at: string | null
  email: string
  username: string
}

export interface Profile {
  id: string
  user_id: string
  created_at: string
  updated_at: string | null
  username: string
  display_name: string
  bio: string
  image_path: string
  image_url: string
  has_onboarded: boolean
  profile_context: string
  use_azure_openai: boolean
  openai_api_key: string | null
  openai_organization_id: string | null
  anthropic_api_key: string | null
  google_gemini_api_key: string | null
  mistral_api_key: string | null
  groq_api_key: string | null
  perplexity_api_key: string | null
  openrouter_api_key: string | null
  azure_openai_api_key: string | null
  azure_openai_endpoint: string | null
  azure_openai_35_turbo_id: string | null
  azure_openai_45_turbo_id: string | null
  azure_openai_45_vision_id: string | null
  azure_openai_embeddings_id: string | null
}

export interface Assistant {
  id: string
  user_id: string
  created_at: string
  updated_at: string | null
  name: string
  description: string
  model: string
  context_length: number
  temperature: number
  embeddings_provider: string
  prompt: string
  image_path: string
  include_profile_context: boolean
  include_workspace_instructions: boolean
  folder_id: string | null
  sharing: string
}

export interface Chat {
  id: string
  user_id: string
  created_at: string
  updated_at: string | null
  assistant_id: string
  name: string
  description: string
  folder_id: string | null
  sharing: string
}

export interface Message {
  id: string
  chat_id: string
  user_id: string
  created_at: string
  updated_at: string | null
  role: string
  content: string
  sequence_number: number
}

export interface File {
  id: string
  user_id: string
  created_at: string
  updated_at: string | null
  name: string
  description: string
  type: string
  tokens: number
  size: number
  file_path: string
  folder_id: string | null
  sharing: string
}

export interface FileItem {
  id: string
  file_id: string
  user_id: string
  created_at: string
  updated_at: string | null
  content: string
  tokens: number
  local_embedding: string | null
  openai_embedding: string | null
  sharing: string
}

export interface Collection {
  id: string
  user_id: string
  created_at: string
  updated_at: string | null
  name: string
  description: string
  folder_id: string | null
  sharing: string
}

export interface Folder {
  id: string
  user_id: string
  workspace_id: string
  created_at: string
  updated_at: string | null
  name: string
  description: string
  type: string
}

export interface Workspace {
  id: string
  user_id: string
  created_at: string
  updated_at: string | null
  name: string
  description: string
  default_context: string
  embeddings_provider: string
  is_home: boolean
  sharing: string
}

export interface Tool {
  id: string
  user_id: string
  created_at: string
  updated_at: string | null
  name: string
  description: string
  url: string
  schema: Json
  custom_headers: Json
  folder_id: string | null
  sharing: string
}

export interface Model {
  id: string
  user_id: string
  created_at: string
  updated_at: string | null
  name: string
  description: string
  model_id: string
  api_key: string
  base_url: string
  context_length: number
  folder_id: string | null
  sharing: string
}

export interface AssistantFileInsert {
  assistant_id: string
  file_id: string
  user_id: string
}
