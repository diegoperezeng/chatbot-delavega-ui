import { query } from "@/lib/postgres/client"

export interface FolderInsert {
  user_id: string
  workspace_id: string
  name: string
  description: string
  type: string
  created_at?: string
  updated_at?: string | null
}

export interface FolderUpdate {
  name?: string
  description?: string
  type?: string
  updated_at?: string | null
}

export const getFoldersByWorkspaceId = async (workspaceId: string) => {
  const result = await query(`SELECT * FROM folders WHERE workspace_id = $1`, [
    workspaceId
  ])
  const folders = result.rows
  if (!folders) {
    throw new Error("Erro ao buscar pastas")
  }
  return folders
}

export const createFolder = async (folder: FolderInsert) => {
  let createdFolder
  try {
    const result = await query(
      `INSERT INTO folders (user_id, workspace_id, name, description, type, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        folder.user_id,
        folder.workspace_id,
        folder.name,
        folder.description,
        folder.type
      ]
    )
    createdFolder = result.rows[0]
    if (!createdFolder) throw new Error("Erro ao criar pasta")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdFolder
}

export const updateFolder = async (folderId: string, folder: FolderUpdate) => {
  const fields = Object.keys(folder)
  if (fields.length === 0) throw new Error("Nada para atualizar")
  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 2}`)
    .join(", ")
  const values = fields.map(field => (folder as any)[field])
  let updatedFolder
  try {
    const result = await query(
      `UPDATE folders SET ${setClause} WHERE id = $1 RETURNING *`,
      [folderId, ...values]
    )
    updatedFolder = result.rows[0]
    if (!updatedFolder) throw new Error("Pasta não encontrada para atualização")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return updatedFolder
}

export const deleteFolder = async (folderId: string) => {
  try {
    const result = await query(`DELETE FROM folders WHERE id = $1`, [folderId])
    if (result.rowCount === 0) {
      throw new Error("Pasta não encontrada")
    }
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}
