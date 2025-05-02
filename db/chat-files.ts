import { query } from "@/lib/postgres/client"

export interface ChatFileInsert {
  chat_id: string
  file_id: string
  user_id: string
}

export const getChatFilesByChatId = async (chatId: string) => {
  const result = await query(
    `SELECT c.id, c.name, json_agg(f.*) as files
     FROM chats c
     LEFT JOIN chat_files cf ON cf.chat_id = c.id
     LEFT JOIN files f ON f.id = cf.file_id
     WHERE c.id = $1
     GROUP BY c.id, c.name`,
    [chatId]
  )
  const chatFiles = result.rows[0]
  if (!chatFiles) {
    throw new Error("Chat não encontrado")
  }
  return chatFiles
}

export const createChatFile = async (chatFile: ChatFileInsert) => {
  const result = await query(
    `INSERT INTO chat_files (chat_id, file_id, user_id, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [chatFile.chat_id, chatFile.file_id, chatFile.user_id]
  )
  const createdChatFile = result.rows[0]
  if (!createdChatFile) {
    throw new Error("Erro ao criar relação chat-arquivo")
  }
  return createdChatFile
}

export const createChatFiles = async (chatFiles: ChatFileInsert[]) => {
  const values = chatFiles
    .map(
      cf => `('${cf.chat_id}', '${cf.file_id}', '${cf.user_id}', NOW(), NOW())`
    )
    .join(",")
  const result = await query(
    `INSERT INTO chat_files (chat_id, file_id, user_id, created_at, updated_at)
     VALUES ${values}
     RETURNING *`
  )
  const createdChatFiles = result.rows
  if (!createdChatFiles) {
    throw new Error("Erro ao criar relações chat-arquivo")
  }
  return createdChatFiles
}
