import { Post } from '../components/MemoriesPage';

// Initial memories to populate the wall if localStorage is empty.
const initialMemories: Post[] = [];

const STORAGE_KEY = 'memoriesData';

/**
 * Fetches memories, prioritizing localStorage and falling back to initial data.
 * The function is async to maintain a consistent interface with a potential future API.
 * @returns A promise that resolves to an array of Post objects.
 */
export const getMemories = async (): Promise<Post[]> => {
  return new Promise((resolve) => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        resolve(JSON.parse(storedData));
      } else {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMemories));
        resolve(initialMemories);
      }
    } catch (error) {
      console.error("Could not access localStorage:", error);
      // Fallback to initial data without saving if localStorage is blocked or fails.
      resolve(initialMemories);
    }
  });
};

/**
 * Adds a single new memory to localStorage.
 * @param post The new Post object to add, without an ID.
 * @returns The newly created post, including a timestamp-based ID.
 */
export const addMemory = async (post: Omit<Post, 'id'>): Promise<Post> => {
    return new Promise(async (resolve, reject) => {
        try {
            // Fetch current memories to ensure we're updating the latest list.
            const memories = await getMemories();
            
            const newPost: Post = {
                ...post,
                id: Date.now(), // Use timestamp for a unique ID
            };
            
            const updatedMemories = [newPost, ...memories];
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemories));
            resolve(newPost);
        } catch (error) {
            console.error("Could not add memory to localStorage:", error);
            reject(error);
        }
    });
};

/**
 * Deletes all memories from localStorage.
 */
export const resetAllMemories = async (): Promise<void> => {
    return new Promise((resolve, reject) => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            resolve();
        } catch (error) {
            console.error("Could not reset memories in localStorage:", error);
            reject(error);
        }
    });
};