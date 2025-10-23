import { Post } from '../components/MemoriesPage';

const API_ENDPOINT = '/api/memories';

/**
 * Fetches all memories from the backend API.
 * @returns A promise that resolves to an array of Post objects.
 */
export const getMemories = async (): Promise<Post[]> => {
  try {
    const response = await fetch(API_ENDPOINT);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Could not fetch memories from the API:", error);
    throw error;
  }
};

/**
 * Adds a single new memory to the database via the API.
 * @param post The new Post object to add, without an ID.
 * @returns The newly created post, including the database-generated ID.
 */
export const addMemory = async (post: Omit<Post, 'id'>): Promise<Post> => {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(post),
        });
        if (!response.ok) {
            const errorBody = await response.text();
            console.error('API Error Response:', errorBody);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        // The API now returns the fully created post object.
        return await response.json();
    } catch (error) {
        console.error("Could not add memory via the API:", error);
        throw error;
    }
};

/**
 * Deletes a single memory from the database by its ID via the API.
 * @param id The ID of the post to delete.
 */
export const deleteMemory = async (id: number): Promise<void> => {
    try {
        const response = await fetch(`${API_ENDPOINT}?id=${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("Could not delete memory via the API:", error);
        throw error;
    }
};

/**
 * Deletes all memories from the database.
 */
export const resetAllMemories = async (): Promise<void> => {
    try {
        const response = await fetch(API_ENDPOINT, {
            method: 'DELETE',
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error("Could not reset all memories via the API:", error);
        throw error;
    }
};