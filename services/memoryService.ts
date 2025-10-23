import { Post } from '../components/MemoriesPage';

const API_ENDPOINT = '/api/memories';

/**
 * A helper function to process API responses and throw detailed errors.
 * @param response The fetch Response object.
 * @param operation A string describing the operation (e.g., 'fetching memories').
 */
const handleApiResponse = async (response: Response, operation: string) => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      // Try to parse a more specific error message from the API's JSON response.
      const errorBody = await response.json();
      // Using .message now to align with the new standardized API error response.
      errorMessage = errorBody.message || `Failed during ${operation}.`;
    } catch (e) {
      // The response body wasn't JSON or was empty.
      console.error(`Could not parse error JSON during ${operation}.`);
    }
    // Throw an error with the detailed message.
    throw new Error(errorMessage);
  }
  // If the response is OK, parse and return the JSON body.
  // This handles successful GET/POST requests that return data.
  // For DELETE requests, it will correctly parse the { success: true } body.
  return response.json();
};


/**
 * Fetches all memories from the backend API.
 * @returns A promise that resolves to an array of Post objects.
 */
export const getMemories = async (): Promise<Post[]> => {
  try {
    const response = await fetch(API_ENDPOINT);
    const data = await handleApiResponse(response, 'fetching memories');
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
        return await handleApiResponse(response, 'adding memory');
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
        await handleApiResponse(response, 'deleting memory');
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
        await handleApiResponse(response, 'resetting all memories');
    } catch (error) {
        console.error("Could not reset all memories via the API:", error);
        throw error;
    }
};