import { query } from "@/lib/postgres/client"

export interface PromptInsert {
  user_id: string
  name: string
  content: string
  folder_id?: string | null
  sharing?: string
  created_at?: string
  updated_at?: string | null
}

export interface PromptUpdate {
  name?: string
  content?: string
  folder_id?: string | null
  sharing?: string
  updated_at?: string | null
}

export interface PromptWorkspaceInsert {
  user_id: string
  prompt_id: string
  workspace_id: string
}

export const getPromptById = async (promptId: string) => {
  const result = await query(`SELECT * FROM prompts WHERE id = $1`, [promptId])
  const prompt = result.rows[0]
  if (!prompt) {
    throw new Error("Prompt não encontrado")
  }
  return prompt
}

export const getPromptWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const result = await query(
    `SELECT w.id, w.name, json_agg(p.*) as prompts
     FROM workspaces w
     LEFT JOIN prompt_workspaces pw ON pw.workspace_id = w.id
     LEFT JOIN prompts p ON p.id = pw.prompt_id
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

export const getPromptWorkspacesByPromptId = async (promptId: string) => {
  const result = await query(
    `SELECT p.id, p.name, json_agg(w.*) as workspaces
     FROM prompts p
     LEFT JOIN prompt_workspaces pw ON pw.prompt_id = p.id
     LEFT JOIN workspaces w ON w.id = pw.workspace_id
     WHERE p.id = $1
     GROUP BY p.id, p.name`,
    [promptId]
  )
  const prompt = result.rows[0]
  if (!prompt) {
    throw new Error("Prompt não encontrado")
  }
  return prompt
}

export const createPrompt = async (
  prompt: PromptInsert,
  workspace_id: string
) => {
  let createdPrompt
  try {
    const fields = Object.keys(prompt)
    const values = fields.map(field => prompt[field as keyof typeof prompt])
    const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(", ")
    const result = await query(
      `INSERT INTO prompts (${fields.join(", ")}, created_at) VALUES (${placeholders}, NOW()) RETURNING *`,
      values
    )
    createdPrompt = result.rows[0]
    if (!createdPrompt) throw new Error("Erro ao criar prompt")
  } catch (error: any) {
    throw new Error(error.message)
  }
  await createPromptWorkspace({
    user_id: prompt.user_id,
    prompt_id: createdPrompt.id,
    workspace_id
  })
  return createdPrompt
}

export const createPrompts = async (
  prompts: PromptInsert[],
  workspace_id: string
) => {
  const values = prompts
    .map(
      p =>
        `('${p.user_id}', '${p.name}', '${p.content}', ${p.folder_id ? `'${p.folder_id}'` : "NULL"}, '${p.sharing || ""}', NOW(), NOW())`
    )
    .join(",")
  let createdPrompts
  try {
    const result = await query(
      `INSERT INTO prompts (user_id, name, content, folder_id, sharing, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdPrompts = result.rows
    if (!createdPrompts) throw new Error("Erro ao criar prompts")
  } catch (error: any) {
    throw new Error(error.message)
  }
  await createPromptWorkspaces(
    createdPrompts.map((prompt: any) => ({
      user_id: prompt.user_id,
      prompt_id: prompt.id,
      workspace_id
    }))
  )
  return createdPrompts
}

export const createPromptWorkspace = async (item: PromptWorkspaceInsert) => {
  let createdPromptWorkspace
  try {
    const result = await query(
      `INSERT INTO prompt_workspaces (user_id, prompt_id, workspace_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [item.user_id, item.prompt_id, item.workspace_id]
    )
    createdPromptWorkspace = result.rows[0]
    if (!createdPromptWorkspace)
      throw new Error("Erro ao criar relação prompt-workspace")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdPromptWorkspace
}

export const createPromptWorkspaces = async (
  items: PromptWorkspaceInsert[]
) => {
  const values = items
    .map(
      i =>
        `('${i.user_id}', '${i.prompt_id}', '${i.workspace_id}', NOW(), NOW())`
    )
    .join(",")
  let createdPromptWorkspaces
  try {
    const result = await query(
      `INSERT INTO prompt_workspaces (user_id, prompt_id, workspace_id, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdPromptWorkspaces = result.rows
    if (!createdPromptWorkspaces)
      throw new Error("Erro ao criar relações prompt-workspace")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdPromptWorkspaces
}

export const updatePrompt = async (promptId: string, prompt: PromptUpdate) => {
  const fields = Object.keys(prompt)
  if (fields.length === 0) throw new Error("Nada para atualizar")
  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 2}`)
    .join(", ")
  const values = fields.map(field => (prompt as any)[field])
  let updatedPrompt
  try {
    const result = await query(
      `UPDATE prompts SET ${setClause} WHERE id = $1 RETURNING *`,
      [promptId, ...values]
    )
    updatedPrompt = result.rows[0]
    if (!updatedPrompt)
      throw new Error("Prompt não encontrado para atualização")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return updatedPrompt
}

export const deletePrompt = async (promptId: string) => {
  try {
    const result = await query(`DELETE FROM prompts WHERE id = $1`, [promptId])
    if (result.rowCount === 0) {
      throw new Error("Prompt não encontrado")
    }
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const deletePromptWorkspace = async (
  promptId: string,
  workspaceId: string
) => {
  try {
    const result = await query(
      `DELETE FROM prompt_workspaces WHERE prompt_id = $1 AND workspace_id = $2`,
      [promptId, workspaceId]
    )
    if (result.rowCount === 0) throw new Error("Relação não encontrada")
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}
