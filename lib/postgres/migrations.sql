-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL
);

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT NOT NULL DEFAULT '',
  image_path TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  has_onboarded BOOLEAN NOT NULL DEFAULT false,
  profile_context TEXT NOT NULL DEFAULT '',
  use_azure_openai BOOLEAN NOT NULL DEFAULT false,
  openai_api_key TEXT,
  openai_organization_id TEXT,
  anthropic_api_key TEXT,
  google_gemini_api_key TEXT,
  mistral_api_key TEXT,
  groq_api_key TEXT,
  perplexity_api_key TEXT,
  openrouter_api_key TEXT,
  azure_openai_api_key TEXT,
  azure_openai_endpoint TEXT,
  azure_openai_35_turbo_id TEXT,
  azure_openai_45_turbo_id TEXT,
  azure_openai_45_vision_id TEXT,
  azure_openai_embeddings_id TEXT,
  UNIQUE(user_id)
);

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  default_context TEXT NOT NULL DEFAULT '',
  embeddings_provider TEXT NOT NULL DEFAULT 'openai',
  is_home BOOLEAN NOT NULL DEFAULT false,
  sharing TEXT NOT NULL DEFAULT 'private'
);

-- Folders table
CREATE TABLE IF NOT EXISTS folders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL
);

-- Assistants table
CREATE TABLE IF NOT EXISTS assistants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  model TEXT NOT NULL,
  context_length INTEGER NOT NULL DEFAULT 4096,
  temperature FLOAT NOT NULL DEFAULT 0.7,
  embeddings_provider TEXT NOT NULL DEFAULT 'openai',
  prompt TEXT NOT NULL DEFAULT '',
  image_path TEXT NOT NULL DEFAULT '',
  include_profile_context BOOLEAN NOT NULL DEFAULT false,
  include_workspace_instructions BOOLEAN NOT NULL DEFAULT false,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  sharing TEXT NOT NULL DEFAULT 'private'
);

-- Chats table
CREATE TABLE IF NOT EXISTS chats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  sharing TEXT NOT NULL DEFAULT 'private'
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  sequence_number INTEGER NOT NULL
);

-- Files table
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  size INTEGER NOT NULL DEFAULT 0,
  file_path TEXT NOT NULL,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  sharing TEXT NOT NULL DEFAULT 'private'
);

-- File items table
CREATE TABLE IF NOT EXISTS file_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  content TEXT NOT NULL,
  tokens INTEGER NOT NULL DEFAULT 0,
  local_embedding TEXT,
  openai_embedding TEXT,
  sharing TEXT NOT NULL DEFAULT 'private'
);

-- Collections table
CREATE TABLE IF NOT EXISTS collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  sharing TEXT NOT NULL DEFAULT 'private'
);

-- Tools table
CREATE TABLE IF NOT EXISTS tools (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  url TEXT NOT NULL,
  schema JSONB NOT NULL DEFAULT '{}',
  custom_headers JSONB NOT NULL DEFAULT '{}',
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  sharing TEXT NOT NULL DEFAULT 'private'
);

-- Models table
CREATE TABLE IF NOT EXISTS models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  model_id TEXT NOT NULL,
  api_key TEXT NOT NULL,
  base_url TEXT NOT NULL,
  context_length INTEGER NOT NULL DEFAULT 4096,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  sharing TEXT NOT NULL DEFAULT 'private'
);

-- Assistant collections table
CREATE TABLE IF NOT EXISTS assistant_collections (
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (assistant_id, collection_id)
);

-- Assistant files table
CREATE TABLE IF NOT EXISTS assistant_files (
  assistant_id UUID REFERENCES assistants(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (assistant_id, file_id)
);

-- Chat files table
CREATE TABLE IF NOT EXISTS chat_files (
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (chat_id, file_id)
);

-- Collection files table
CREATE TABLE IF NOT EXISTS collection_files (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (collection_id, file_id)
);

-- Collection workspaces table
CREATE TABLE IF NOT EXISTS collection_workspaces (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  PRIMARY KEY (collection_id, workspace_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_assistants_user_id ON assistants(user_id);
CREATE INDEX IF NOT EXISTS idx_chats_user_id ON chats(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_files_user_id ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_file_items_file_id ON file_items(file_id);
CREATE INDEX IF NOT EXISTS idx_collections_user_id ON collections(user_id);
CREATE INDEX IF NOT EXISTS idx_folders_user_id ON folders(user_id);
CREATE INDEX IF NOT EXISTS idx_workspaces_user_id ON workspaces(user_id);
CREATE INDEX IF NOT EXISTS idx_tools_user_id ON tools(user_id);
CREATE INDEX IF NOT EXISTS idx_models_user_id ON models(user_id); 