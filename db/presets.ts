import { query } from "@/lib/postgres/client"

export interface PresetInsert {
  user_id: string
  name: string
  description: string
  folder_id?: string | null
  sharing: string
  created_at?: string
  updated_at?: string | null
}

export interface PresetUpdate {
  name?: string
  description?: string
  folder_id?: string | null
  sharing?: string
  updated_at?: string | null
}

export interface PresetWorkspaceInsert {
  user_id: string
  preset_id: string
  workspace_id: string
}

export const getPresetById = async (presetId: string) => {
  const result = await query(`SELECT * FROM presets WHERE id = $1`, [presetId])
  const preset = result.rows[0]
  if (!preset) {
    throw new Error("Preset não encontrado")
  }
  return preset
}

export const getPresetWorkspacesByWorkspaceId = async (workspaceId: string) => {
  const result = await query(
    `SELECT w.id, w.name, json_agg(p.*) as presets
     FROM workspaces w
     LEFT JOIN preset_workspaces pw ON pw.workspace_id = w.id
     LEFT JOIN presets p ON p.id = pw.preset_id
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

export const getPresetWorkspacesByPresetId = async (presetId: string) => {
  const result = await query(
    `SELECT p.id, p.name, json_agg(w.*) as workspaces
     FROM presets p
     LEFT JOIN preset_workspaces pw ON pw.preset_id = p.id
     LEFT JOIN workspaces w ON w.id = pw.workspace_id
     WHERE p.id = $1
     GROUP BY p.id, p.name`,
    [presetId]
  )
  const preset = result.rows[0]
  if (!preset) {
    throw new Error("Preset não encontrado")
  }
  return preset
}

export const createPreset = async (
  preset: PresetInsert,
  workspace_id: string
) => {
  let createdPreset
  try {
    const result = await query(
      `INSERT INTO presets (user_id, name, description, folder_id, sharing, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING *`,
      [
        preset.user_id,
        preset.name,
        preset.description,
        preset.folder_id,
        preset.sharing
      ]
    )
    createdPreset = result.rows[0]
    if (!createdPreset) throw new Error("Erro ao criar preset")
  } catch (error: any) {
    throw new Error(error.message)
  }
  await createPresetWorkspace({
    user_id: preset.user_id,
    preset_id: createdPreset.id,
    workspace_id: workspace_id
  })
  return createdPreset
}

export const createPresets = async (
  presets: PresetInsert[],
  workspace_id: string
) => {
  const values = presets
    .map(
      p =>
        `('${p.user_id}', '${p.name}', '${p.description}', ${p.folder_id ? `'${p.folder_id}'` : "NULL"}, '${p.sharing}', NOW(), NOW())`
    )
    .join(",")
  let createdPresets
  try {
    const result = await query(
      `INSERT INTO presets (user_id, name, description, folder_id, sharing, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdPresets = result.rows
    if (!createdPresets) throw new Error("Erro ao criar presets")
  } catch (error: any) {
    throw new Error(error.message)
  }
  await createPresetWorkspaces(
    createdPresets.map(preset => ({
      user_id: preset.user_id,
      preset_id: preset.id,
      workspace_id
    }))
  )
  return createdPresets
}

export const createPresetWorkspace = async (item: PresetWorkspaceInsert) => {
  let createdPresetWorkspace
  try {
    const result = await query(
      `INSERT INTO preset_workspaces (user_id, preset_id, workspace_id, created_at, updated_at)
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING *`,
      [item.user_id, item.preset_id, item.workspace_id]
    )
    createdPresetWorkspace = result.rows[0]
    if (!createdPresetWorkspace)
      throw new Error("Erro ao criar relação preset-workspace")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdPresetWorkspace
}

export const createPresetWorkspaces = async (
  items: PresetWorkspaceInsert[]
) => {
  const values = items
    .map(
      i =>
        `('${i.user_id}', '${i.preset_id}', '${i.workspace_id}', NOW(), NOW())`
    )
    .join(",")
  let createdPresetWorkspaces
  try {
    const result = await query(
      `INSERT INTO preset_workspaces (user_id, preset_id, workspace_id, created_at, updated_at)
       VALUES ${values}
       RETURNING *`
    )
    createdPresetWorkspaces = result.rows
    if (!createdPresetWorkspaces)
      throw new Error("Erro ao criar relações preset-workspace")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return createdPresetWorkspaces
}

export const updatePreset = async (presetId: string, preset: PresetUpdate) => {
  const fields = Object.keys(preset)
  if (fields.length === 0) throw new Error("Nada para atualizar")
  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 2}`)
    .join(", ")
  const values = fields.map(field => (preset as any)[field])
  let updatedPreset
  try {
    const result = await query(
      `UPDATE presets SET ${setClause} WHERE id = $1 RETURNING *`,
      [presetId, ...values]
    )
    updatedPreset = result.rows[0]
    if (!updatedPreset)
      throw new Error("Preset não encontrado para atualização")
  } catch (error: any) {
    throw new Error(error.message)
  }
  return updatedPreset
}

export const deletePreset = async (presetId: string) => {
  try {
    const result = await query(`DELETE FROM presets WHERE id = $1`, [presetId])
    if (result.rowCount === 0) {
      throw new Error("Preset não encontrado")
    }
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const deletePresetWorkspace = async (
  presetId: string,
  workspaceId: string
) => {
  try {
    const result = await query(
      `DELETE FROM preset_workspaces WHERE preset_id = $1 AND workspace_id = $2`,
      [presetId, workspaceId]
    )
    if (result.rowCount === 0) throw new Error("Relação não encontrada")
    return true
  } catch (error: any) {
    throw new Error(error.message)
  }
}
