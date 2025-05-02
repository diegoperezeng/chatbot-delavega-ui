import {
  getProfileByUserId,
  getProfilesByUserId,
  createProfile,
  updateProfile,
  deleteProfile
} from "@/lib/postgres/queries"
import type { Profile } from "@/lib/postgres/types"

export const getProfileByUserIdDb = async (userId: string) => {
  const profile = await getProfileByUserId(userId)
  if (!profile) {
    throw new Error("Perfil não encontrado")
  }
  return profile
}

export const getProfilesByUserIdDb = async (userId: string) => {
  const profiles = await getProfilesByUserId(userId)
  if (!profiles || profiles.length === 0) {
    throw new Error("Nenhum perfil encontrado")
  }
  return profiles
}

export const createProfileDb = async (
  profile: Omit<Profile, "id" | "created_at" | "updated_at">
) => {
  const createdProfile = await createProfile(profile)
  if (!createdProfile) {
    throw new Error("Erro ao criar perfil")
  }
  return createdProfile
}

export const updateProfileDb = async (
  user_id: string,
  profile: Partial<Profile>
) => {
  const updatedProfile = await updateProfile({ user_id, ...profile })
  if (!updatedProfile) {
    throw new Error("Erro ao atualizar perfil")
  }
  return updatedProfile
}

export const deleteProfileDb = async (profileId: string) => {
  const deleted = await deleteProfile(profileId)
  if (!deleted) {
    throw new Error("Erro ao deletar perfil")
  }
  return true
}
