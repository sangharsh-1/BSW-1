import { Post } from '../components/MemoriesPage';

// --- Turso Integration Guide ---
// This service is now configured to work with a backend API that connects to Turso.
// You need to create this backend yourself. Here's what you need to do:
//
// 1. Create a Turso Database:
//    - Go to https://turso.tech/ and create a new database.
//    - Get your Database URL (e.g., libsql://your-db-name.turso.io)
//    - Get your Auth Token.
//
// 2. Create a Backend API:
//    - Use a service like Vercel, Netlify, or Cloudflare Workers.
//    - Store your Turso URL and Auth Token as secure environment variables
//      (e.g., TURSO_DATABASE_URL, TURSO_AUTH_TOKEN). NEVER expose these in the frontend.
//    - Create two API endpoints:
//
//      a) GET /api/memories
//         - This endpoint should connect to your Turso DB, query all memories,
//           and return them as a JSON array.
//
//      b) PUT /api/memories
//         - This endpoint should receive a JSON array of memories in the request body.
//         - It should then connect to your Turso DB and overwrite the existing
//           memories with the new array.
//
// This frontend code is now ready to communicate with those endpoints.

const API_ENDPOINT = '/api/memories';

/**
 * Fetches the array of memories from your backend API.
 * @returns A promise that resolves to an array of Post objects.
 */
export const getMemories = async (): Promise<Post[]> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      // For a new database, your API might return 404. We'll treat it as empty.
      if (response.status === 404) return [];
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Could not fetch memories from your API:", error);
    throw error;
  }
};

/**
 * Saves the entire array of memories to your backend API.
 * @param memories The array of Post objects to save.
 */
export const saveMemories = async (memories: Post[]): Promise<void> => {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(memories),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("Could not save memories via your API:", error);
        throw error;
    }
};
