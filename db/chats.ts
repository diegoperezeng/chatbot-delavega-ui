import { query } from "@/lib/postgres/client"

export interface ChatInsert {
  id?: string
  user_id: string
  workspace_id: string
  assistant_id: string
  name: string
  description: string
  folder_id?: string | null
  sharing: string
  created_at?: string
  updated_at?: string | null
}

export interface ChatUpdate {
  name?: string
  description?: string
  folder_id?: string | null
  sharing?: string
  updated_at?: string | null
}

export const getChatById = async (chatId: string) => {
  const result = await query(`SELECT * FROM chats WHERE id = $1`, [chatId])
  return result.rows[0] || null
}

export const getChatsByWorkspaceId = async (workspaceId: string) => {
  const result = await query(
    `SELECT * FROM chats WHERE workspace_id = $1 ORDER BY created_at DESC`,
    [workspaceId]
  )
  const chats = result.rows
  if (!chats) {
    throw new Error("Erro ao buscar chats")
  }
  return chats
}

export const createChat = async (chat: ChatInsert) => {
  const result = await query(
    `INSERT INTO chats (user_id, workspace_id, assistant_id, name, description, folder_id, sharing, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
     RETURNING *`,
    [
      chat.user_id,
      chat.workspace_id,
      chat.assistant_id,
      chat.name,
      chat.description,
      chat.folder_id,
      chat.sharing
    ]
  )
  return result.rows[0]
}

export const createChats = async (chats: ChatInsert[]) => {
  const values = chats
    .map(
      c =>
        `('${c.user_id}', '${c.workspace_id}', '${c.assistant_id}', '${c.name}', '${c.description}', ${c.folder_id ? `'${c.folder_id}'` : "NULL"}, '${c.sharing}', NOW(), NOW())`
    )
    .join(",")
  const result = await query(
    `INSERT INTO chats (user_id, workspace_id, assistant_id, name, description, folder_id, sharing, created_at, updated_at)
     VALUES ${values}
     RETURNING *`
  )
  return result.rows
}

export const updateChat = async (chatId: string, chat: ChatUpdate) => {
  const fields = Object.keys(chat)
  if (fields.length === 0) throw new Error("Nada para atualizar")
  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 2}`)
    .join(", ")
  const values = fields.map(field => (chat as any)[field])
  const result = await query(
    `UPDATE chats SET ${setClause} WHERE id = $1 RETURNING *`,
    [chatId, ...values]
  )
  return result.rows[0]
}

export const deleteChat = async (chatId: string) => {
  const result = await query(`DELETE FROM chats WHERE id = $1`, [chatId])
  if (result.rowCount === 0) {
    throw new Error("Chat não encontrado")
  }
  return true
}
