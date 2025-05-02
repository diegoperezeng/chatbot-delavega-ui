import { Pool } from "pg"

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl:
    process.env.POSTGRES_SSL === "true"
      ? {
          rejectUnauthorized: false
        }
      : false
})

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect()
  try {
    const result = await client.query(text, params)
    return result
  } finally {
    client.release()
  }
}

export const getClient = async () => {
  const client = await pool.connect()
  return client
}

export default {
  query,
  getClient
}
