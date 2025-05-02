import { query } from "@/lib/postgres/client"

export interface ToolInsert {
  user_id: string
  name: string
  description: string
  url: string
  schema: any
  custom_headers: any
  folder_id?: string | null
  sharing: string
  created_at?: string
  updated_at?: string | null
}

export interface ToolUpdate {
  name?: string
  description?: string
  url?: string
  schema?: any
  custom_headers?: any
  folder_id?: string | null
  sharing?: string
  updated_at?: string | null
}

export interface ToolWorkspaceInsert {
  user_id: string
  tool_id: string
  workspace_id: string
}

export const getToolById = async (toolId: string) => {
  const result = await query(`SELECT * FROM tools WHERE id = $1`, [toolId])
  const tool = result.rows[0]
  if (!tool) {
    throw new Error("Tool não encontrado")
  }
  return tool
}

export const getToolWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const result = await query(
    `SELECT w.id, w.name, json_agg(t.*) as tools
     FROM workspaces w
     LEFT JOIN tool_workspaces tw ON tw.workspace_id = w.id
     LEFT JOIN tools t ON t.id = tw.tool_id
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

export const getToolWorkspacesByToolId = async (toolId: string) => {
  const result = await query(
    `SELECT t.id, t.name, json_agg(w.*) as workspaces
     FROM tools t
     LEFT JOIN tool_workspaces tw ON tw.tool_id = t.id
     LEFT JOIN workspaces w ON w.id = tw.workspace_id
     WHERE t.id = $1
     GROUP BY t.id, t.name`,
    [toolId]
  )
  const tool = result.rows[0]
  if (!tool) {
    throw new Error("Tool não encontrado")
  }
  return tool
}

export const createTool = async (tool: ToolInsert, workspace_id: string) => {
  let createdTool
  try {
    const fields = Object.keys(tool)
    const values = fields.map(field => tool[field as keyof typeof tool])
    const placeholders = fields.map((_, idx) => `$${idx + 1}`).join(", ")
    const result = await query(
      `INSERT INTO tools (${fields.join(", ")}, created_at) VALUES (${placeholders}, NOW()) RETURNING *`,
      values
    )
    createdTool = result.rows[0]
    if (!createdTool) throw new Error("Erro ao criar tool")
  } catch (error: any) {
    throw new Error(error.message)
  }
  await createToolWorkspace({
    user_id: tool.user_id,
    tool_id: createdTool.id,
    workspace_id
  })
  return createdTool
}

export const createTools = async (
  tools: ToolInsert[],
  workspace_id: string
) => {
  const values = tools
    .map(
      t =>
        `('${t.user_id}', '${t.name}', '${t.description}', '${t.url}', '${JSON.stringify(t.schema)}', '${JSON.stringify(t.custom_headers)}', ${t.folder_id ? `'${t.folder_id}'` : "NULL"}, '${t.sharing}', NOW(), NOW())`
    )
    .join(",")
  let createdTools
  try {
    const result = await query(
      `INSERT INTO tools (user_id, name, description, url, schema, custom_headers, folder_id, sharing, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdTools = result.rows
    if (!createdTools) throw new Error("Erro ao criar tools")
  } catch (error: any) {
    throw new Error(error.message)
  }
  await createToolWorkspaces(
    createdTools.map((tool: any) => ({
      user_id: tool.user_id,
      tool_id: tool.id,
      workspace_id
    }))
  )
  return createdTools
}

export const createToolWorkspace = async (item: ToolWorkspaceInsert) => {
  let createdToolWorkspace
  try {
    const result = await query(
      `INSERT INTO tool_workspaces (user_id, tool_id, workspace_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [item.user_id, item.tool_id, item.workspace_id]
    )
    createdToolWorkspace = result.rows[0]
    if (!createdToolWorkspace)
      throw new Error("Erro ao criar relação tool-workspace")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdToolWorkspace
}

export const createToolWorkspaces = async (items: ToolWorkspaceInsert[]) => {
  const values = items
    .map(
      i => `('${i.user_id}', '${i.tool_id}', '${i.workspace_id}', NOW(), NOW())`
    )
    .join(",")
  let createdToolWorkspaces
  try {
    const result = await query(
      `INSERT INTO tool_workspaces (user_id, tool_id, workspace_id, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdToolWorkspaces = result.rows
    if (!createdToolWorkspaces)
      throw new Error("Erro ao criar relações tool-workspace")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdToolWorkspaces
}

export const updateTool = async (toolId: string, tool: ToolUpdate) => {
  const fields = Object.keys(tool)
  if (fields.length === 0) throw new Error("Nada para atualizar")
  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 2}`)
    .join(", ")
  const values = fields.map(field => (tool as any)[field])
  let updatedTool
  try {
    const result = await query(
      `UPDATE tools SET ${setClause} WHERE id = $1 RETURNING *`,
      [toolId, ...values]
    )
    updatedTool = result.rows[0]
    if (!updatedTool) throw new Error("Tool não encontrado para atualização")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return updatedTool
}

export const deleteTool = async (toolId: string) => {
  try {
    const result = await query(`DELETE FROM tools WHERE id = $1`, [toolId])
    if (result.rowCount === 0) {
      throw new Error("Tool não encontrado")
    }
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const deleteToolWorkspace = async (
  toolId: string,
  workspaceId: string
) => {
  try {
    const result = await query(
      `DELETE FROM tool_workspaces WHERE tool_id = $1 AND workspace_id = $2`,
      [toolId, workspaceId]
    )
    if (result.rowCount === 0) throw new Error("Relação não encontrada")
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}
