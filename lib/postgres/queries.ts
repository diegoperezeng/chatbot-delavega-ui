import { query } from "./client"
import type {
  User,
  Profile,
  Assistant,
  Chat,
  Message,
  File,
  FileItem,
  Collection,
  Workspace,
  Tool,
  Model
} from "./types"

// Users
export const getUserById = async (id: string): Promise<User | null> => {
  const result = await query("SELECT * FROM users WHERE id = $1", [id])
  return result.rows[0] || null
}

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const result = await query("SELECT * FROM users WHERE email = $1", [email])
  return result.rows[0] || null
}

// Profiles
export const getProfileByUserId = async (
  userId: string
): Promise<Profile | null> => {
  const result = await query("SELECT * FROM profiles WHERE user_id = $1", [
    userId
  ])
  return result.rows[0] || null
}

export const getProfilesByUserId = async (
  userId: string
): Promise<Profile[]> => {
  const result = await query("SELECT * FROM profiles WHERE user_id = $1", [
    userId
  ])
  return result.rows
}

export const createProfile = async (
  profile: Omit<Profile, "id" | "created_at" | "updated_at">
): Promise<Profile> => {
  const fields = Object.keys(profile)
  const values = fields.map(field => profile[field as keyof typeof profile])
  const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ")
  const result = await query(
    `INSERT INTO profiles (${fields.join(", ")}, created_at) VALUES (${placeholders}, NOW()) RETURNING *`,
    values
  )
  return result.rows[0]
}

export const updateProfile = async (
  profile: Partial<Profile> & { user_id: string }
): Promise<Profile | null> => {
  const fields = Object.keys(profile).filter(key => key !== "user_id")
  const values = fields.map(field => profile[field as keyof Profile])
  const setClause = fields
    .map((field, index) => `${field} = $${index + 2}`)
    .join(", ")
  const result = await query(
    `UPDATE profiles SET ${setClause}, updated_at = NOW() WHERE user_id = $1 RETURNING *`,
    [profile.user_id, ...values]
  )
  return result.rows[0] || null
}

export const deleteProfile = async (profileId: string): Promise<boolean> => {
  const result = await query("DELETE FROM profiles WHERE id = $1", [profileId])
  return (result.rowCount ?? 0) > 0
}

// Assistants
export const getAssistantsByUserId = async (
  userId: string
): Promise<Assistant[]> => {
  const result = await query("SELECT * FROM assistants WHERE user_id = $1", [
    userId
  ])
  return result.rows
}

export const createAssistant = async (
  assistant: Omit<Assistant, "id" | "created_at" | "updated_at">
): Promise<Assistant> => {
  const fields = Object.keys(assistant)
  const values = fields.map(field => assistant[field as keyof typeof assistant])
  const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ")

  const result = await query(
    `INSERT INTO assistants (${fields.join(", ")}, created_at) VALUES (${placeholders}, NOW()) RETURNING *`,
    values
  )
  return result.rows[0]
}

// Chats
export const getChatsByUserId = async (userId: string): Promise<Chat[]> => {
  const result = await query("SELECT * FROM chats WHERE user_id = $1", [userId])
  return result.rows
}

export const getChatById = async (
  chatId: string,
  userId: string
): Promise<Chat | null> => {
  const result = await query(
    "SELECT * FROM chats WHERE id = $1 AND user_id = $2",
    [chatId, userId]
  )
  return result.rows[0] || null
}

// Messages
export const getMessagesByChatId = async (
  chatId: string
): Promise<Message[]> => {
  const result = await query(
    "SELECT * FROM messages WHERE chat_id = $1 ORDER BY sequence_number ASC",
    [chatId]
  )
  return result.rows
}

export const createMessage = async (
  message: Omit<Message, "id" | "created_at" | "updated_at">
): Promise<Message> => {
  const fields = Object.keys(message)
  const values = fields.map(field => message[field as keyof typeof message])
  const placeholders = fields.map((_, index) => `$${index + 1}`).join(", ")

  const result = await query(
    `INSERT INTO messages (${fields.join(", ")}, created_at) VALUES (${placeholders}, NOW()) RETURNING *`,
    values
  )
  return result.rows[0]
}

// Files
export const getFilesByUserId = async (userId: string): Promise<File[]> => {
  const result = await query("SELECT * FROM files WHERE user_id = $1", [userId])
  return result.rows
}

export const getFileItemsByFileId = async (
  fileId: string
): Promise<FileItem[]> => {
  const result = await query("SELECT * FROM file_items WHERE file_id = $1", [
    fileId
  ])
  return result.rows
}

// Collections
export const getCollectionsByUserId = async (
  userId: string
): Promise<Collection[]> => {
  const result = await query("SELECT * FROM collections WHERE user_id = $1", [
    userId
  ])
  return result.rows
}

// Workspaces
export const getWorkspacesByUserId = async (
  userId: string
): Promise<Workspace[]> => {
  const result = await query("SELECT * FROM workspaces WHERE user_id = $1", [
    userId
  ])
  return result.rows
}

export const getHomeWorkspace = async (
  userId: string
): Promise<Workspace | null> => {
  const result = await query(
    "SELECT * FROM workspaces WHERE user_id = $1 AND is_home = true",
    [userId]
  )
  return result.rows[0] || null
}

// Tools
export const getToolsByUserId = async (userId: string): Promise<Tool[]> => {
  const result = await query("SELECT * FROM tools WHERE user_id = $1", [userId])
  return result.rows
}

// Models
export const getModelsByUserId = async (userId: string): Promise<Model[]> => {
  const result = await query("SELECT * FROM models WHERE user_id = $1", [
    userId
  ])
  return result.rows
}
