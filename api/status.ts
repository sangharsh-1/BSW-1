// This is a Vercel Edge Function for checking database connectivity.
// It helps diagnose issues with environment variables.
// Place this file in the `/api` directory of your project.

import { createClient } from '@libsql/client';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } = process.env;

  if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    return new Response(JSON.stringify({
      status: 'error',
      message: 'Server configuration error: Environment variables for the database are missing.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const client = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    // A simple, fast query to verify the connection and credentials are valid.
    await client.execute('SELECT 1');
    return new Response(JSON.stringify({ status: 'ok', message: 'Database connection successful.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error("Database connection failed:", e);
    // Provide a more specific error message if possible
    let message = 'Failed to connect to the database. Please check your credentials and database URL.';
    if (e.message && e.message.includes('LIBSQL_AUTH_INVALID')) {
        message = 'Authentication failed: The provided TURSO_AUTH_TOKEN is invalid.';
    }

    return new Response(JSON.stringify({
      status: 'error',
      message: message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
