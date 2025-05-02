import { query } from "@/lib/postgres/client"

export interface ModelInsert {
  user_id: string
  name: string
  description: string
  model_id: string
  api_key: string
  base_url: string
  context_length: number
  folder_id?: string | null
  sharing: string
  created_at?: string
  updated_at?: string | null
}

export interface ModelUpdate {
  name?: string
  description?: string
  model_id?: string
  api_key?: string
  base_url?: string
  context_length?: number
  folder_id?: string | null
  sharing?: string
  updated_at?: string | null
}

export interface ModelWorkspaceInsert {
  user_id: string
  model_id: string
  workspace_id: string
}

export const getModelById = async (modelId: string) => {
  const result = await query(`SELECT * FROM models WHERE id = $1`, [modelId])
  const model = result.rows[0]
  if (!model) {
    throw new Error("Modelo não encontrado")
  }
  return model
}

export const getModelWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const result = await query(
    `SELECT w.id, w.name, json_agg(m.*) as models
     FROM workspaces w
     LEFT JOIN model_workspaces mw ON mw.workspace_id = w.id
     LEFT JOIN models m ON m.id = mw.model_id
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

export const getModelWorkspacesByModelId = async (modelId: string) => {
  const result = await query(
    `SELECT m.id, m.name, json_agg(w.*) as workspaces
     FROM models m
     LEFT JOIN model_workspaces mw ON mw.model_id = m.id
     LEFT JOIN workspaces w ON w.id = mw.workspace_id
     WHERE m.id = $1
     GROUP BY m.id, m.name`,
    [modelId]
  )
  const model = result.rows[0]
  if (!model) {
    throw new Error("Modelo não encontrado")
  }
  return model
}

export const createModel = async (model: ModelInsert, workspace_id: string) => {
  let createdModel
  try {
    const result = await query(
      `INSERT INTO models (user_id, name, description, model_id, api_key, base_url, context_length, folder_id, sharing, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
       RETURNING *`,
      [
        model.user_id,
        model.name,
        model.description,
        model.model_id,
        model.api_key,
        model.base_url,
        model.context_length,
        model.folder_id,
        model.sharing
      ]
    )
    createdModel = result.rows[0]
    if (!createdModel) throw new Error("Erro ao criar modelo")
  } catch (error: any) {
    throw new Error(error.message)
  }
  await createModelWorkspace({
    user_id: model.user_id,
    model_id: createdModel.id,
    workspace_id: workspace_id
  })
  return createdModel
}

export const createModels = async (
  models: ModelInsert[],
  workspace_id: string
) => {
  const values = models
    .map(
      m =>
        `('${m.user_id}', '${m.name}', '${m.description}', '${m.model_id}', '${m.api_key}', '${m.base_url}', ${m.context_length}, ${m.folder_id ? `'${m.folder_id}'` : "NULL"}, '${m.sharing}', NOW(), NOW())`
    )
    .join(",")
  let createdModels
  try {
    const result = await query(
      `INSERT INTO models (user_id, name, description, model_id, api_key, base_url, context_length, folder_id, sharing, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdModels = result.rows
    if (!createdModels) throw new Error("Erro ao criar modelos")
  } catch (error: any) {
    throw new Error(error.message)
  }
  await createModelWorkspaces(
    createdModels.map(model => ({
      user_id: model.user_id,
      model_id: model.id,
      workspace_id
    }))
  )
  return createdModels
}

export const createModelWorkspace = async (item: ModelWorkspaceInsert) => {
  let createdModelWorkspace
  try {
    const result = await query(
      `INSERT INTO model_workspaces (user_id, model_id, workspace_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [item.user_id, item.model_id, item.workspace_id]
    )
    createdModelWorkspace = result.rows[0]
    if (!createdModelWorkspace)
      throw new Error("Erro ao criar relação modelo-workspace")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdModelWorkspace
}

export const createModelWorkspaces = async (items: ModelWorkspaceInsert[]) => {
  const values = items
    .map(
      i =>
        `('${i.user_id}', '${i.model_id}', '${i.workspace_id}', NOW(), NOW())`
    )
    .join(",")
  let createdModelWorkspaces
  try {
    const result = await query(
      `INSERT INTO model_workspaces (user_id, model_id, workspace_id, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdModelWorkspaces = result.rows
    if (!createdModelWorkspaces)
      throw new Error("Erro ao criar relações modelo-workspace")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdModelWorkspaces
}

export const updateModel = async (modelId: string, model: ModelUpdate) => {
  const fields = Object.keys(model)
  if (fields.length === 0) throw new Error("Nada para atualizar")
  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 2}`)
    .join(", ")
  const values = fields.map(field => (model as any)[field])
  let updatedModel
  try {
    const result = await query(
      `UPDATE models SET ${setClause} WHERE id = $1 RETURNING *`,
      [modelId, ...values]
    )
    updatedModel = result.rows[0]
    if (!updatedModel) throw new Error("Modelo não encontrado para atualização")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return updatedModel
}

export const deleteModel = async (modelId: string) => {
  try {
    const result = await query(`DELETE FROM models WHERE id = $1`, [modelId])
    if (result.rowCount === 0) {
      throw new Error("Modelo não encontrado")
    }
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const deleteModelWorkspace = async (
  modelId: string,
  workspaceId: string
) => {
  try {
    const result = await query(
      `DELETE FROM model_workspaces WHERE model_id = $1 AND workspace_id = $2`,
      [modelId, workspaceId]
    )
    if (result.rowCount === 0) throw new Error("Relação não encontrada")
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}
