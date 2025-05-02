import { query } from "@/lib/postgres/client"
import mammoth from "mammoth"
import { toast } from "sonner"
import { uploadFile } from "./storage/files"

export interface FileInsert {
  user_id: string
  name: string
  description: string
  type: string
  tokens: number
  size: number
  file_path: string
  folder_id?: string | null
  sharing: string
  created_at?: string
  updated_at?: string | null
}

export interface FileUpdate {
  name?: string
  description?: string
  type?: string
  tokens?: number
  size?: number
  file_path?: string
  folder_id?: string | null
  sharing?: string
  updated_at?: string | null
}

export interface FileWorkspaceInsert {
  user_id: string
  file_id: string
  workspace_id: string
}

export const getFileById = async (fileId: string) => {
  const result = await query(`SELECT * FROM files WHERE id = $1`, [fileId])
  const file = result.rows[0]
  if (!file) {
    throw new Error("Arquivo não encontrado")
  }
  return file
}

export const getFileWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const result = await query(
    `SELECT w.id, w.name, json_agg(f.*) as files
     FROM workspaces w
     LEFT JOIN file_workspaces fw ON fw.workspace_id = w.id
     LEFT JOIN files f ON f.id = fw.file_id
     WHERE w.id = $1
     GROUP BY w.id, w.name`,
    [workspaceId]
  )
  const workspace = result.rows[0]
  if (!workspace) {
    throw new Error("Workspace não encontrado")
  }
  return workspace
}

export const getFileWorkspacesByFileId = async (fileId: string) => {
  const result = await query(
    `SELECT f.id, f.name, json_agg(w.*) as workspaces
     FROM files f
     LEFT JOIN file_workspaces fw ON fw.file_id = f.id
     LEFT JOIN workspaces w ON w.id = fw.workspace_id
     WHERE f.id = $1
     GROUP BY f.id, f.name`,
    [fileId]
  )
  const file = result.rows[0]
  if (!file) {
    throw new Error("Arquivo não encontrado")
  }
  return file
}

export const createFileBasedOnExtension = async (
  file: File,
  fileRecord: FileInsert,
  workspace_id: string,
  embeddingsProvider: "openai" | "local"
) => {
  const fileExtension = file.name.split(".").pop()

  if (fileExtension === "docx") {
    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({
      arrayBuffer
    })

    return createDocXFile(
      result.value,
      file,
      fileRecord,
      workspace_id,
      embeddingsProvider
    )
  } else {
    return createFile(file, fileRecord, workspace_id, embeddingsProvider)
  }
}

// For non-docx files
export const createFile = async (
  file: File,
  fileRecord: FileInsert,
  workspace_id: string,
  embeddingsProvider: "openai" | "local"
) => {
  let validFilename = fileRecord.name.replace(/[^a-z0-9.]/gi, "_").toLowerCase()
  const extension = file.name.split(".").pop()
  const extensionIndex = validFilename.lastIndexOf(".")
  const baseName = validFilename.substring(
    0,
    extensionIndex < 0 ? undefined : extensionIndex
  )
  const maxBaseNameLength = 100 - (extension?.length || 0) - 1
  if (baseName.length > maxBaseNameLength) {
    fileRecord.name = baseName.substring(0, maxBaseNameLength) + "." + extension
  } else {
    fileRecord.name = baseName + "." + extension
  }
  let createdFile
  try {
    const result = await query(
      `INSERT INTO files (user_id, name, description, type, tokens, size, file_path, folder_id, sharing, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        fileRecord.user_id,
        fileRecord.name,
        fileRecord.description,
        fileRecord.type,
        fileRecord.tokens,
        fileRecord.size,
        fileRecord.file_path,
        fileRecord.folder_id,
        fileRecord.sharing
      ]
    )
    createdFile = result.rows[0]
    if (!createdFile) throw new Error("Erro ao criar arquivo")
  } catch (error: any) {
    throw new Error(error.message)
  }

  await createFileWorkspace({
    user_id: createdFile.user_id,
    file_id: createdFile.id,
    workspace_id
  })

  const filePath = await uploadFile(file, {
    name: createdFile.name,
    user_id: createdFile.user_id,
    file_id: createdFile.name
  })

  await updateFile(createdFile.id, {
    file_path: filePath
  })

  const formData = new FormData()
  formData.append("file_id", createdFile.id)
  formData.append("embeddingsProvider", embeddingsProvider)

  const response = await fetch("/api/retrieval/process", {
    method: "POST",
    body: formData
  })

  if (!response.ok) {
    const jsonText = await response.text()
    const json = JSON.parse(jsonText)
    console.error(
      `Error processing file:${createdFile.id}, status:${response.status}, response:${json.message}`
    )
    toast.error("Failed to process file. Reason:" + json.message, {
      duration: 10000
    })
    await deleteFile(createdFile.id)
  }

  const fetchedFile = await getFileById(createdFile.id)

  return fetchedFile
}

// // Handle docx files
export const createDocXFile = async (
  text: string,
  file: File,
  fileRecord: FileInsert,
  workspace_id: string,
  embeddingsProvider: "openai" | "local"
) => {
  let createdFile
  try {
    const result = await query(
      `INSERT INTO files (user_id, name, description, type, tokens, size, file_path, folder_id, sharing, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        fileRecord.user_id,
        fileRecord.name,
        fileRecord.description,
        fileRecord.type,
        fileRecord.tokens,
        fileRecord.size,
        fileRecord.file_path,
        fileRecord.folder_id,
        fileRecord.sharing
      ]
    )
    createdFile = result.rows[0]
    if (!createdFile) throw new Error("Erro ao criar arquivo docx")
  } catch (error: any) {
    throw new Error(error.message)
  }

  await createFileWorkspace({
    user_id: createdFile.user_id,
    file_id: createdFile.id,
    workspace_id
  })

  const filePath = await uploadFile(file, {
    name: createdFile.name,
    user_id: createdFile.user_id,
    file_id: createdFile.name
  })

  await updateFile(createdFile.id, {
    file_path: filePath
  })

  const response = await fetch("/api/retrieval/process/docx", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: text,
      fileId: createdFile.id,
      embeddingsProvider,
      fileExtension: "docx"
    })
  })

  if (!response.ok) {
    const jsonText = await response.text()
    const json = JSON.parse(jsonText)
    console.error(
      `Error processing file:${createdFile.id}, status:${response.status}, response:${json.message}`
    )
    toast.error("Failed to process file. Reason:" + json.message, {
      duration: 10000
    })
    await deleteFile(createdFile.id)
  }

  const fetchedFile = await getFileById(createdFile.id)

  return fetchedFile
}

export const createFiles = async (
  files: FileInsert[],
  workspace_id: string
) => {
  const values = files
    .map(
      f =>
        `('${f.user_id}', '${f.name}', '${f.description}', '${f.type}', ${f.tokens}, ${f.size}, '${f.file_path}', ${f.folder_id ? `'${f.folder_id}'` : "NULL"}, '${f.sharing}', NOW(), NOW())`
    )
    .join(",")
  let createdFiles
  try {
    const result = await query(
      `INSERT INTO files (user_id, name, description, type, tokens, size, file_path, folder_id, sharing, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdFiles = result.rows
    if (!createdFiles) throw new Error("Erro ao criar arquivos")
  } catch (error: any) {
    throw new Error(error.message)
  }

  await createFileWorkspaces(
    createdFiles.map(file => ({
      user_id: file.user_id,
      file_id: file.id,
      workspace_id
    }))
  )

  return createdFiles
}

export const createFileWorkspace = async (item: FileWorkspaceInsert) => {
  let createdFileWorkspace
  try {
    const result = await query(
      `INSERT INTO file_workspaces (user_id, file_id, workspace_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [item.user_id, item.file_id, item.workspace_id]
    )
    createdFileWorkspace = result.rows[0]
    if (!createdFileWorkspace)
      throw new Error("Erro ao criar relação arquivo-workspace")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdFileWorkspace
}

export const createFileWorkspaces = async (items: FileWorkspaceInsert[]) => {
  const values = items
    .map(
      i => `('${i.user_id}', '${i.file_id}', '${i.workspace_id}', NOW(), NOW())`
    )
    .join(",")
  let createdFileWorkspaces
  try {
    const result = await query(
      `INSERT INTO file_workspaces (user_id, file_id, workspace_id, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdFileWorkspaces = result.rows
    if (!createdFileWorkspaces)
      throw new Error("Erro ao criar relações arquivo-workspace")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdFileWorkspaces
}

export const updateFile = async (fileId: string, file: FileUpdate) => {
  const fields = Object.keys(file)
  if (fields.length === 0) throw new Error("Nada para atualizar")
  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 2}`)
    .join(", ")
  const values = fields.map(field => (file as any)[field])
  let updatedFile
  try {
    const result = await query(
      `UPDATE files SET ${setClause} WHERE id = $1 RETURNING *`,
      [fileId, ...values]
    )
    updatedFile = result.rows[0]
    if (!updatedFile) throw new Error("Arquivo não encontrado para atualização")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return updatedFile
}

export const deleteFile = async (fileId: string) => {
  try {
    const result = await query(`DELETE FROM files WHERE id = $1`, [fileId])
    if (result.rowCount === 0) {
      throw new Error("Arquivo não encontrado")
    }
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const deleteFileWorkspace = async (
  fileId: string,
  workspaceId: string
) => {
  try {
    const result = await query(
      `DELETE FROM file_workspaces WHERE file_id = $1 AND workspace_id = $2`,
      [fileId, workspaceId]
    )
    if (result.rowCount === 0) throw new Error("Relação não encontrada")
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}
