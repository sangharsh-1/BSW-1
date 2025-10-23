// This is a Vercel Edge Function that acts as a secure backend API.
// It connects to your Turso database using environment variables.
// Place this file in the `/api` directory of your project.

import { createClient } from '@libsql/client';
import { Post } from '../components/MemoriesPage';

// Vercel Edge Function configuration
export const config = {
  runtime: 'edge',
};

// Helper to create and initialize the database client
async function getDbClient() {
  const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

  if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    throw new Error("Server configuration error: Turso credentials are not set.");
  }

  const client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  // Using a normalized schema where each memory is a row.
  // id INTEGER PRIMARY KEY is implicitly autoincrementing in SQLite.
  // This is a much more scalable and reliable approach.
  await client.execute(`
    CREATE TABLE IF NOT EXISTS memories (
      id INTEGER PRIMARY KEY,
      message TEXT NOT NULL,
      author TEXT NOT NULL,
      photoUrl TEXT NOT NULL
    );
  `);

  return client;
}

// Main API handler function
export default async function handler(req: Request) {
  try {
    const client = await getDbClient();
    const { method } = req;
    const url = new URL(req.url);

    switch (method) {
      // --- GET: Fetch all memories ---
      case 'GET': {
        const result = await client.execute("SELECT id, message, author, photoUrl FROM memories ORDER BY id DESC");
        return new Response(JSON.stringify(result.rows), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' },
        });
      }

      // --- POST: Add a single new memory ---
      case 'POST': {
        const { message, author, photoUrl } = (await req.json()) as Omit<Post, 'id'>;
        
        if (!message || !author || !photoUrl) {
           return new Response(JSON.stringify({ error: 'Invalid post data provided.' }), { status: 400 });
        }
        
        const sql = "INSERT INTO memories (message, author, photoUrl) VALUES (?, ?, ?)";
        const result = await client.execute({ sql, args: [message, author, photoUrl] });

        const newIdBigInt = result.lastInsertRowid;
        if (newIdBigInt === undefined) {
             throw new Error("Failed to retrieve ID of the new memory.");
        }
        
        // The complete, saved post that will be returned to the client for confirmation.
        const newPost: Post = {
            id: Number(newIdBigInt), // lastInsertRowid is a BigInt, cast to Number
            message,
            author,
            photoUrl
        };
        
        return new Response(JSON.stringify(newPost), { 
            status: 201, // 201 Created status
            headers: { 'Content-Type': 'application/json' }
        });
      }

      // --- DELETE: Remove one or all memories ---
      case 'DELETE': {
        const idToDelete = url.searchParams.get('id');

        if (idToDelete) {
          // Delete a single memory
          const id = parseInt(idToDelete, 10);
          if (isNaN(id)) {
            return new Response(JSON.stringify({ error: 'Invalid ID format.' }), { status: 400 });
          }
          await client.execute({ sql: "DELETE FROM memories WHERE id = ?", args: [id] });
          return new Response(JSON.stringify({ success: true, id }), { status: 200 });
        } else {
          // Delete all memories (for the reset feature)
          await client.execute("DELETE FROM memories");
          return new Response(JSON.stringify({ success: true, message: "All memories deleted." }), { status: 200 });
        }
      }

      // --- Handle other methods ---
      default:
        return new Response(JSON.stringify({ error: `Method ${method} Not Allowed` }), {
          status: 405,
          headers: { 'Content-Type': 'application/json' },
        });
    }
  } catch (e: any) {
    console.error("API Error:", e);
    return new Response(JSON.stringify({ error: e.message || 'An internal server error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}