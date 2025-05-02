import { query } from "@/lib/postgres/client"
import { AssistantFileInsert } from "@/lib/postgres/types"

export const getAssistantFilesByAssistantId = async (assistantId: string) => {
  const result = await query(
    `SELECT a.id, a.name, json_agg(f.*) as files
     FROM assistants a
     LEFT JOIN assistant_files af ON af.assistant_id = a.id
     LEFT JOIN files f ON f.id = af.file_id
     WHERE a.id = $1
     GROUP BY a.id, a.name`,
    [assistantId]
  )
  const assistantFiles = result.rows[0]
  if (!assistantFiles) {
    throw new Error("Assistente não encontrado")
  }
  return assistantFiles
}

export const createAssistantFile = async (
  assistantFile: AssistantFileInsert
) => {
  const result = await query(
    `INSERT INTO assistant_files (assistant_id, file_id, user_id, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [assistantFile.assistant_id, assistantFile.file_id, assistantFile.user_id]
  )
  const createdAssistantFile = result.rows[0]
  if (!createdAssistantFile) {
    throw new Error("Erro ao criar relação assistente-arquivo")
  }
  return createdAssistantFile
}

export const createAssistantFiles = async (
  assistantFiles: AssistantFileInsert[]
) => {
  const values = assistantFiles
    .map(
      af =>
        `('${af.assistant_id}', '${af.file_id}', '${af.user_id}', NOW(), NOW())`
    )
    .join(",")
  const result = await query(
    `INSERT INTO assistant_files (assistant_id, file_id, user_id, created_at, updated_at)
     VALUES ${values}
     RETURNING *`
  )
  const createdAssistantFiles = result.rows
  if (!createdAssistantFiles) {
    throw new Error("Erro ao criar relações assistente-arquivo")
  }
  return createdAssistantFiles
}

export const deleteAssistantFile = async (
  assistantId: string,
  fileId: string
) => {
  const result = await query(
    `DELETE FROM assistant_files WHERE assistant_id = $1 AND file_id = $2`,
    [assistantId, fileId]
  )
  if (result.rowCount === 0) throw new Error("Relação não encontrada")
  return true
}
