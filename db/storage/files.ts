import { toast } from "sonner"

export const uploadFile = async (
  file: File,
  payload: {
    name: string
    user_id: string
    file_id: string
  }
) => {
  const SIZE_LIMIT = parseInt(
    process.env.NEXT_PUBLIC_USER_FILE_SIZE_LIMIT || "10000000"
  )

  if (file.size > SIZE_LIMIT) {
    throw new Error(
      `File must be less than ${Math.floor(SIZE_LIMIT / 1000000)}MB`
    )
  }

  const filePath = `${payload.user_id}/${btoa(payload.file_id)}`

  // Implemente aqui a lógica de upload para S3, local, etc.
  // Exemplo:
  // await uploadToStorage(filePath, file)

  return filePath
}

export const deleteFileFromStorage = async (filePath: string) => {
  // Implemente aqui a lógica de remoção do arquivo do storage (S3, local, etc.)
  // Exemplo:
  // await deleteFromStorage(filePath)
  // Se falhar:
  // toast.error("Failed to remove file!")
}

export const getFileFromStorage = async (filePath: string) => {
  // Implemente aqui a lógica para obter a URL do arquivo (S3, local, etc.)
  // Exemplo para S3:
  // return getSignedUrlFromS3(filePath)
  // Exemplo para local:
  // return `/uploads/files/${filePath}`
  return null // Retorne a URL real aqui
}
