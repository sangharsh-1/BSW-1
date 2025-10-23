// This is a Vercel Edge Function that acts as a secure backend API.
// It connects to your Turso database using environment variables.
// Place this file in the `/api` directory of your project.

import { createClient, Client } from '@libsql/client';
import { Post } from '../components/MemoriesPage';

// Vercel Edge Function configuration
export const config = {
  runtime: 'edge',
};

// Helper function to create a standardized error response.
function createErrorResponse(message: string, status: number) {
  return new Response(JSON.stringify({ status: 'error', message }), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// Main API handler function
export default async function handler(req: Request) {
  const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

  if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    return createErrorResponse(
      'Server configuration error: `TURSO_DATABASE_URL` and/or `TURSO_AUTH_TOKEN` are not set in Vercel environment variables.',
      500
    );
  }
  
  let client: Client;
  try {
    // Initialize the client and establish a connection with a timeout.
    client = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timed out after 8 seconds. Please double-check your TURSO environment variables in Vercel.')), 8000)
    );

    // The first `execute` call establishes the connection. We race this critical
    // step against our timeout to prevent a Vercel FUNCTION_INVOCATION_TIMEOUT.
    await Promise.race([
      client.execute(`
        CREATE TABLE IF NOT EXISTS memories (
          id INTEGER PRIMARY KEY,
          message TEXT NOT NULL,
          author TEXT NOT NULL,
          photoUrl TEXT NOT NULL
        );
      `),
      timeoutPromise
    ]);

  } catch (e: any) {
     console.error("[API_DB_CONNECTION_ERROR]", e);
     let status = 500;
     let message = `A server error occurred while connecting to the database: ${e.message}`;
     if (e.message?.includes('LIBSQL_AUTH_INVALID')) {
        status = 401; // Unauthorized
        message = 'Database authentication failed. The `TURSO_AUTH_TOKEN` is invalid.';
     }
     return createErrorResponse(message, status);
  }

  // --- From this point, we assume the database connection is successful ---
  try {
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
           return createErrorResponse('Invalid post data provided.', 400);
        }
        const sql = "INSERT INTO memories (message, author, photoUrl) VALUES (?, ?, ?)";
        const result = await client.execute({ sql, args: [message, author, photoUrl] });
        const newIdBigInt = result.lastInsertRowid;
        if (newIdBigInt === undefined) {
             throw new Error("Failed to retrieve ID of the new memory.");
        }
        const newPost: Post = {
            id: Number(newIdBigInt),
            message,
            author,
            photoUrl
        };
        return new Response(JSON.stringify(newPost), { 
            status: 201,
            headers: { 'Content-Type': 'application/json' }
        });
      }

      // --- DELETE: Remove one or all memories ---
      case 'DELETE': {
        const idToDelete = url.searchParams.get('id');
        if (idToDelete) {
          const id = parseInt(idToDelete, 10);
          if (isNaN(id)) {
            return createErrorResponse('Invalid ID format.', 400);
          }
          await client.execute({ sql: "DELETE FROM memories WHERE id = ?", args: [id] });
          return new Response(JSON.stringify({ success: true, id }), { status: 200 });
        } else {
          await client.execute("DELETE FROM memories");
          return new Response(JSON.stringify({ success: true, message: "All memories deleted." }), { status: 200 });
        }
      }

      // --- Handle other methods ---
      default:
        return createErrorResponse(`Method ${method} Not Allowed`, 405);
    }
  } catch (e: any) {
    console.error("[API_HANDLER_ERROR]", e);
    const message = `An internal server error occurred during the API operation: ${e.message}`;
    return createErrorResponse(message, 500);
  }
}