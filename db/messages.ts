import { query } from "@/lib/postgres/client"

export interface MessageInsert {
  chat_id: string
  user_id: string
  role: string
  content: string
  sequence_number: number
  created_at?: string
  updated_at?: string | null
}

export interface MessageUpdate {
  role?: string
  content?: string
  sequence_number?: number
  updated_at?: string | null
}

export const getMessageById = async (messageId: string) => {
  const result = await query(`SELECT * FROM messages WHERE id = $1`, [
    messageId
  ])
  const message = result.rows[0]
  if (!message) {
    throw new Error("Message not found")
  }
  return message
}

export const getMessagesByChatId = async (chatId: string) => {
  const result = await query(`SELECT * FROM messages WHERE chat_id = $1`, [
    chatId
  ])
  const messages = result.rows
  if (!messages) {
    throw new Error("Messages not found")
  }
  return messages
}

export const createMessage = async (message: MessageInsert) => {
  let createdMessage
  try {
    const result = await query(
      `INSERT INTO messages (chat_id, user_id, role, content, sequence_number, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        message.chat_id,
        message.user_id,
        message.role,
        message.content,
        message.sequence_number
      ]
    )
    createdMessage = result.rows[0]
    if (!createdMessage) throw new Error("Erro ao criar mensagem")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdMessage
}

export const createMessages = async (messages: MessageInsert[]) => {
  const values = messages
    .map(
      m =>
        `('${m.chat_id}', '${m.user_id}', '${m.role}', '${m.content}', ${m.sequence_number}, NOW(), NOW())`
    )
    .join(",")
  let createdMessages
  try {
    const result = await query(
      `INSERT INTO messages (chat_id, user_id, role, content, sequence_number, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdMessages = result.rows
    if (!createdMessages) throw new Error("Erro ao criar mensagens")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdMessages
}

export const updateMessage = async (
  messageId: string,
  message: MessageUpdate
) => {
  const fields = Object.keys(message)
  if (fields.length === 0) throw new Error("Nada para atualizar")
  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 2}`)
    .join(", ")
  const values = fields.map(field => (message as any)[field])
  let updatedMessage
  try {
    const result = await query(
      `UPDATE messages SET ${setClause} WHERE id = $1 RETURNING *`,
      [messageId, ...values]
    )
    updatedMessage = result.rows[0]
    if (!updatedMessage)
      throw new Error("Mensagem não encontrada para atualização")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return updatedMessage
}

export const deleteMessage = async (messageId: string) => {
  try {
    const result = await query(`DELETE FROM messages WHERE id = $1`, [
      messageId
    ])
    if (result.rowCount === 0) {
      throw new Error("Mensagem não encontrada")
    }
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export async function deleteMessagesIncludingAndAfter(
  userId: string,
  chatId: string,
  sequenceNumber: number
) {
  try {
    const result = await query(
      `DELETE FROM messages WHERE user_id = $1 AND chat_id = $2 AND sequence_number >= $3`,
      [userId, chatId, sequenceNumber]
    )
    return (result.rowCount ?? 0) > 0
  } catch (error: any) {
    return {
      error: "Failed to delete messages."
    }
  }
}
