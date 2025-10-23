// This is a Vercel Edge Function that acts as a secure backend API.
// It connects to your Turso database using environment variables.
// Place this file in the `/api` directory of your project.

import { createClient } from '@libsql/client';

// Vercel Edge Function configuration
export const config = {
  runtime: 'edge',
};

// Main API handler function
export default async function handler(req: Request) {
  const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

  // 1. Check for required environment variables
  if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    console.error("Server configuration error: Turso credentials are not set.");
    return new Response(JSON.stringify({ error: 'Server configuration error.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // 2. Create a Turso client
  const client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  // 3. Ensure the database table exists (runs only if it doesn't)
  // We store all memories as a single JSON string in one row for simplicity.
  try {
     await client.execute(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY,
        content TEXT NOT NULL
      );
    `);
  } catch (e: any) {
    console.error("Failed to ensure memories table exists:", e);
    return new Response(JSON.stringify({ error: 'Database initialization failed.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
    });
  }


  // 4. Handle GET requests (fetch memories)
  if (req.method === 'GET') {
    try {
      const result = await client.execute("SELECT content FROM memories ORDER BY id DESC LIMIT 1");
      
      // If there are no rows or content is empty, return an empty array.
      const memories = result.rows.length > 0 && typeof result.rows[0].content === 'string'
        ? JSON.parse(result.rows[0].content)
        : [];
        
      return new Response(JSON.stringify(memories), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
      });
    } catch (e: any) {
      console.error("Failed to fetch memories from Turso:", e);
      return new Response(JSON.stringify({ error: 'Failed to fetch memories.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 5. Handle PUT requests (save memories)
  if (req.method === 'PUT') {
    try {
      const memoriesToSave = JSON.stringify(await req.json());
      
      // Use a transaction to delete old memories and insert the new ones.
      // This is a simple "overwrite" operation.
      await client.batch([
        "DELETE FROM memories",
        { sql: "INSERT INTO memories (id, content) VALUES (1, ?)", args: [memoriesToSave] }
      ], 'write');

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e: any) {
      console.error("Failed to save memories to Turso:", e);
      return new Response(JSON.stringify({ error: 'Failed to save memories.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // 6. Handle any other HTTP methods
  return new Response('Method Not Allowed', { status: 405 });
}
