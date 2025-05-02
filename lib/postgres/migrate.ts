import { Pool } from "pg"
import * as fs from "fs"
import * as path from "path"

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  database: process.env.POSTGRES_DB || "chatbot",
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD,
  ssl:
    process.env.POSTGRES_SSL === "true"
      ? {
          rejectUnauthorized: false
        }
      : false
})

async function migrate() {
  const client = await pool.connect()

  try {
    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `)

    // Read migration file
    const migrationFile = path.join(__dirname, "migrations.sql")
    const migrationSQL = fs.readFileSync(migrationFile, "utf8")

    // Start transaction
    await client.query("BEGIN")

    try {
      // Execute migration
      await client.query(migrationSQL)

      // Record migration
      await client.query("INSERT INTO migrations (name) VALUES ($1)", [
        "initial_migration"
      ])

      // Commit transaction
      await client.query("COMMIT")

      console.log("Migration completed successfully")
    } catch (error) {
      // Rollback on error
      await client.query("ROLLBACK")
      console.error("Error during migration:", error)
      throw error
    }
  } finally {
    client.release()
  }
}

// Run migration
migrate()
  .then(() => process.exit(0))
  .catch(error => {
    console.error("Migration failed:", error)
    process.exit(1)
  })
