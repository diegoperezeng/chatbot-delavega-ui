import { query } from "@/lib/postgres/client"

export interface CollectionInsert {
  user_id: string
  name: string
  description: string
  folder_id?: string | null
  sharing: string
  created_at?: string
  updated_at?: string | null
}

export interface CollectionUpdate {
  name?: string
  description?: string
  folder_id?: string | null
  sharing?: string
  updated_at?: string | null
}

export interface CollectionWorkspaceInsert {
  user_id: string
  collection_id: string
  workspace_id: string
}

export const getCollectionById = async (collectionId: string) => {
  const result = await query(`SELECT * FROM collections WHERE id = $1`, [
    collectionId
  ])
  const collection = result.rows[0]
  if (!collection) {
    throw new Error("Coleção não encontrada")
  }
  return collection
}

export const getCollectionWorkspacesByWorkspaceId = async (
  workspaceId: string
) => {
  const result = await query(
    `SELECT w.id, w.name, json_agg(c.*) as collections
     FROM workspaces w
     LEFT JOIN collection_workspaces cw ON cw.workspace_id = w.id
     LEFT JOIN collections c ON c.id = cw.collection_id
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

export const getCollectionWorkspacesByCollectionId = async (
  collectionId: string
) => {
  const result = await query(
    `SELECT c.id, c.name, json_agg(w.*) as workspaces
     FROM collections c
     LEFT JOIN collection_workspaces cw ON cw.collection_id = c.id
     LEFT JOIN workspaces w ON w.id = cw.workspace_id
     WHERE c.id = $1
     GROUP BY c.id, c.name`,
    [collectionId]
  )
  const collection = result.rows[0]
  if (!collection) {
    throw new Error("Coleção não encontrada")
  }
  return collection
}

export const createCollection = async (
  collection: CollectionInsert,
  workspace_id: string
) => {
  const result = await query(
    `INSERT INTO collections (user_id, name, description, folder_id, sharing, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
     RETURNING *`,
    [
      collection.user_id,
      collection.name,
      collection.description,
      collection.folder_id,
      collection.sharing
    ]
  )
  const createdCollection = result.rows[0]
  if (!createdCollection) {
    throw new Error("Erro ao criar coleção")
  }
  await createCollectionWorkspace({
    user_id: createdCollection.user_id,
    collection_id: createdCollection.id,
    workspace_id
  })
  return createdCollection
}

export const createCollections = async (
  collections: CollectionInsert[],
  workspace_id: string
) => {
  const values = collections
    .map(
      c =>
        `('${c.user_id}', '${c.name}', '${c.description}', ${c.folder_id ? `'${c.folder_id}'` : "NULL"}, '${c.sharing}', NOW(), NOW())`
    )
    .join(",")
  const result = await query(
    `INSERT INTO collections (user_id, name, description, folder_id, sharing, created_at, updated_at)
     VALUES ${values}
     RETURNING *`
  )
  const createdCollections = result.rows
  if (!createdCollections) {
    throw new Error("Erro ao criar coleções")
  }
  await createCollectionWorkspaces(
    createdCollections.map(collection => ({
      user_id: collection.user_id,
      collection_id: collection.id,
      workspace_id
    }))
  )
  return createdCollections
}

export const createCollectionWorkspace = async (
  item: CollectionWorkspaceInsert
) => {
  const result = await query(
    `INSERT INTO collection_workspaces (user_id, collection_id, workspace_id, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [item.user_id, item.collection_id, item.workspace_id]
  )
  const createdCollectionWorkspace = result.rows[0]
  if (!createdCollectionWorkspace) {
    throw new Error("Erro ao criar relação coleção-workspace")
  }
  return createdCollectionWorkspace
}

export const createCollectionWorkspaces = async (
  items: CollectionWorkspaceInsert[]
) => {
  const values = items
    .map(
      i =>
        `('${i.user_id}', '${i.collection_id}', '${i.workspace_id}', NOW(), NOW())`
    )
    .join(",")
  const result = await query(
    `INSERT INTO collection_workspaces (user_id, collection_id, workspace_id, created_at, updated_at)
     VALUES ${values}
     RETURNING *`
  )
  const createdCollectionWorkspaces = result.rows
  if (!createdCollectionWorkspaces)
    throw new Error("Erro ao criar relações coleção-workspace")
  return createdCollectionWorkspaces
}

export const updateCollection = async (
  collectionId: string,
  collection: CollectionUpdate
) => {
  const fields = Object.keys(collection)
  if (fields.length === 0) throw new Error("Nada para atualizar")
  const setClause = fields
    .map((field, idx) => `${field} = $${idx + 2}`)
    .join(", ")
  const values = fields.map(field => (collection as any)[field])
  const result = await query(
    `UPDATE collections SET ${setClause} WHERE id = $1 RETURNING *`,
    [collectionId, ...values]
  )
  return result.rows[0]
}

export const deleteCollection = async (collectionId: string) => {
  const result = await query(`DELETE FROM collections WHERE id = $1`, [
    collectionId
  ])
  if (result.rowCount === 0) {
    throw new Error("Coleção não encontrada")
  }
  return true
}

export const deleteCollectionWorkspace = async (
  collectionId: string,
  workspaceId: string
) => {
  const result = await query(
    `DELETE FROM collection_workspaces WHERE collection_id = $1 AND workspace_id = $2`,
    [collectionId, workspaceId]
  )
  if (result.rowCount === 0) throw new Error("Relação não encontrada")
  return true
}
