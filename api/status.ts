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
    const errorResponse = {
      status: 'error',
      message: 'Server configuration error: The `TURSO_DATABASE_URL` and/or `TURSO_AUTH_TOKEN` environment variables are missing in your Vercel project settings. Please add them and redeploy.'
    };
    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const client = createClient({
      url: TURSO_DATABASE_URL,
      authToken: TURSO_AUTH_TOKEN,
    });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Database connection timed out after 5 seconds. This is a strong indicator that your `TURSO_DATABASE_URL` or `TURSO_AUTH_TOKEN` is incorrect in Vercel.')), 5000)
    );

    // Race the connection attempt (a simple SELECT) against our custom timeout.
    await Promise.race([
        client.execute('SELECT 1'),
        timeoutPromise
    ]);
    
    return new Response(JSON.stringify({ status: 'ok', message: 'Database connection successful.' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error("[API_STATUS_ERROR]", e);
    
    let message = e.message || 'An unknown error occurred while trying to connect to the database.';
    // Provide more specific, helpful error messages.
    if (e.message && e.message.includes('LIBSQL_AUTH_INVALID')) {
        message = 'Authentication failed: The `TURSO_AUTH_TOKEN` environment variable in your Vercel project is invalid or has expired.';
    } else if (e.message && (e.message.includes('failed to fetch') || e.message.includes('invalid url'))) {
        message = 'Connection failed: The `TURSO_DATABASE_URL` environment variable in your Vercel project appears to be incorrect.';
    }

    const errorResponse = {
      status: 'error',
      message: message
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500, // Internal Server Error is appropriate for connection failures.
      headers: { 'Content-Type': 'application/json' },
    });
  }
}