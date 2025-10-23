import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import Layout from './Layout';
import { useAppContext } from '../context/AppContext';
import TerminalModal from './TerminalModal';
import { getMemories, saveMemories } from '../services/memoryService';
import ErrorAlert from './ErrorAlert';

export interface Post {
  id: number;
  message: string;
  author: string;
  photoUrl: string;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const PostModal: React.FC<{ onClose: () => void; onAddPost: (post: Omit<Post, 'id'>) => Promise<void>; }> = ({ onClose, onAddPost }) => {
    const [message, setMessage] = useState('');
    const [author, setAuthor] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Clean up the blob URL when the component unmounts
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setPhoto(file);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(URL.createObjectURL(file));
      }
    };

    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault();
      if (message && author && photo) {
        setIsSubmitting(true);
        try {
          const photoUrl = await fileToBase64(photo);
          await onAddPost({ message, author, photoUrl });
          onClose();
        } catch (error) {
          console.error("Error creating memory:", error);
          const errorMessage = error instanceof Error ? error.message : "Sorry, we couldn't create your memory. Please try again.";
          alert(errorMessage);
        } finally {
          setIsSubmitting(false);
        }
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100] p-4">
        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-md animate-fadeIn relative">
            {isSubmitting && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col justify-center items-center z-10 rounded-2xl">
                    <svg className="animate-spin h-10 w-10 text-[#a1a5ff] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="font-semibold text-gray-700">Saving to the Memory Wall...</p>
                    <p className="text-sm text-gray-500">Please wait.</p>
                </div>
            )}
          <h2 className="text-2xl font-bold mb-6 text-gray-800 font-hero-serif">Add a Memory</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Message</label>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-1 block w-full rounded-md bg-white/50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50" required disabled={isSubmitting} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
              <input type="text" value={author} onChange={(e) => setAuthor(e.target.value)} className="mt-1 block w-full rounded-md bg-white/50 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50" required disabled={isSubmitting} />
            </div>
            <div className="mb-6">
               <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
               <input type="file" accept="image/*" onChange={handlePhotoChange} className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50" required disabled={isSubmitting}/>
               {previewUrl && <img src={previewUrl} alt="Preview" className="mt-4 h-24 w-24 object-cover rounded-md shadow-md" />}
            </div>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={onClose} className="rounded-full px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors disabled:opacity-50" disabled={isSubmitting}>Cancel</button>
              <button type="submit" className="rounded-full px-6 py-2 text-white bg-[#a1a5ff] hover:bg-opacity-90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};

const MemoriesPage: React.FC = () => {
    const { navigateWithTransition, setShowNavToggle } = useAppContext();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isTerminalOpen, setIsTerminalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSyncing, setIsSyncing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showError, setShowError] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);
    const CACHE_KEY = 'memoriesCache';

    const updateCache = (postsToCache: Post[]) => {
      try {
        const lightPosts = postsToCache.map(p => ({
          ...p,
          photoUrl: p.photoUrl.startsWith('data:image') ? '' : p.photoUrl,
        }));
        localStorage.setItem(CACHE_KEY, JSON.stringify(lightPosts));
      } catch (error) {
        console.error("Failed to update cache. Local storage might be full or corrupted.", error);
        localStorage.removeItem(CACHE_KEY);
      }
    };

    useEffect(() => {
        setShowNavToggle(true);
    }, [setShowNavToggle]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowError(true);
        }, 4000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        const loadAndFetchPosts = async () => {
            const isReset = sessionStorage.getItem('memoriesReset') === 'true';
            if (isReset) {
                sessionStorage.removeItem('memoriesReset');
                localStorage.setItem(CACHE_KEY, '[]');
                setPosts([]);
            }

            setIsLoading(true);
            let hasCache = false;
            
            if (!isReset) {
                try {
                    const cachedData = localStorage.getItem(CACHE_KEY);
                    if (cachedData) {
                        const cachedPosts: Post[] = JSON.parse(cachedData);
                        setPosts(cachedPosts.sort((a, b) => b.id - a.id));
                        setIsLoading(false);
                        hasCache = true;
                    }
                } catch (error) {
                    console.error("Failed to load memories from cache:", error);
                    localStorage.removeItem(CACHE_KEY);
                }
            }

            setIsSyncing(true);
            try {
                const memories = await getMemories();
                const sortedMemories = memories.sort((a, b) => b.id - a.id);
                setPosts(sortedMemories);
                updateCache(sortedMemories);
                setError(null); // Clear previous errors on a successful fetch
            } catch (error) {
                console.error("Failed to load memories from the cloud:", error);
                // If we have no cached posts to show, display an error message.
                // Otherwise, we can fail silently and show the cached data.
                if (!hasCache && !isReset) {
                   setError("Failed to fetch memories. The memory wall is currently unavailable. Please check your internet connection and try again later.");
                }
            } finally {
                setIsLoading(false);
                setIsSyncing(false);
            }
        };

        loadAndFetchPosts();
    }, []);

    const addPost = async (post: Omit<Post, 'id'>) => {
        const newPost = { ...post, id: Date.now() };
        const originalPosts = [...posts];
      
        const updatedPosts = [newPost, ...originalPosts].sort((a, b) => b.id - a.id);
      
        setPosts(updatedPosts);
        updateCache(updatedPosts);

        try {
            await saveMemories(updatedPosts);
        } catch (error) {
            console.error("Failed to save post to cloud:", error);
            setPosts(originalPosts);
            updateCache(originalPosts);
            throw new Error("Failed to save your memory to the cloud. Please try again.");
        }
    };

    const deletePost = async (id: number) => {
      const originalPosts = [...posts];
      
      const newPosts = posts.filter(post => post.id !== id);
      setPosts(newPosts);
      updateCache(newPosts);

      try {
        await saveMemories(newPosts);
      } catch(error) {
        console.error("Failed to delete memory from cloud:", error);
        alert('Could not delete the memory from the server. The memory has been restored.');
        setPosts(originalPosts);
        updateCache(originalPosts);
      }
    };

    const handleTerminalSuccess = () => {
      setIsTerminalOpen(false);
      navigateWithTransition('/final-video');
    };

    return (
        <Layout isTerminal={true} noScanlines={true} bgOverride="bg-[linear-gradient(to_bottom_right,#fde047,#fb7185,#2dd4bf,#c084fc)]">
            {isModalOpen && <PostModal onClose={() => setIsModalOpen(false)} onAddPost={addPost} />}
            {isTerminalOpen && <TerminalModal onClose={() => setIsTerminalOpen(false)} onSuccess={handleTerminalSuccess} />}
            
            {postToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100] p-4 animate-fadeIn">
                  <div className="bg-white/90 backdrop-blur-xl p-8 rounded-2xl shadow-2xl w-full max-w-sm text-center">
                    <h2 className="text-xl font-bold mb-4 text-gray-800 font-hero-serif">Delete Memory?</h2>
                    <p className="text-gray-600 mb-6">
                      Are you sure you want to delete the memory from "<strong>{postToDelete.author}</strong>"? This action is permanent.
                    </p>
                    <div className="flex justify-center space-x-4">
                      <button onClick={() => setPostToDelete(null)} className="rounded-full px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 transition-colors">
                        Cancel
                      </button>
                      <button 
                        onClick={() => {
                          deletePost(postToDelete.id);
                          setPostToDelete(null);
                        }} 
                        className="rounded-full px-6 py-2 text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
            )}

            <div className="min-h-screen p-4 sm:p-8 flex flex-col">
                <header className="text-center mb-8 animate-fadeIn">
                    <div className="inline-block relative">
                        <h1 className="font-hero-serif text-5xl sm:text-7xl font-extrabold text-white tracking-tight" style={{textShadow: '0 4px 10px rgba(0,0,0,0.3)'}}>
                            Memory Wall
                        </h1>
                        {isSyncing && !isLoading && (
                            <div className="absolute -top-2 -right-32 flex items-center text-sm text-white/80 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full animate-fadeIn">
                                <svg className="animate-spin h-4 w-4 text-white mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Syncing...
                            </div>
                        )}
                    </div>
                    <p className="mt-4 max-w-2xl mx-auto text-lg sm:text-xl text-white/90">
                        A collection of beautiful moments and heartfelt messages, shared by friends.
                    </p>
                    <div className="mt-6 flex justify-center gap-4">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-full px-8 py-3 bg-white text-gray-800 font-semibold shadow-2xl hover:scale-105 hover:bg-gray-100 transition-all duration-300"
                        >
                            Add Your Memory
                        </button>
                    </div>
                </header>

                <main className="flex-grow flex flex-col justify-center">
                    <div className="w-full max-w-6xl mx-auto bg-white/20 backdrop-blur-lg rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[65vh] overflow-y-auto animate-fadeIn">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full min-h-[40vh] text-white font-semibold text-lg">
                               <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                               </svg>
                               Loading memories from the cloud...
                            </div>
                        ) : error ? (
                            <div className="text-center text-white h-full min-h-[40vh] flex flex-col justify-center items-center bg-red-900/30 rounded-2xl p-4">
                                <p className="text-2xl font-semibold mb-2">Connection Error</p>
                                <p className="max-w-md">{error}</p>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="text-center text-white/90 h-full min-h-[40vh] flex flex-col justify-center items-center">
                                <p className="text-2xl font-semibold">The wall is empty!</p>
                                <p>Be the first to add a memory.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col gap-8">
                                {posts.map((post, index) => {
                                    const isLeftAligned = index % 2 === 0;

                                    return (
                                        <div key={post.id} className={`flex w-full ${isLeftAligned ? 'justify-start' : 'justify-end'}`}>
                                            <div className="group relative bg-white rounded-xl shadow-lg overflow-hidden flex w-full md:w-5/6 lg:w-[70%] h-[9rem] transition-shadow hover:shadow-2xl">
                                                {/* Left side: Photo */}
                                                <div className="w-1/3 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                                                    <img 
                                                        src={post.photoUrl} 
                                                        alt="Memory" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {/* Right side: Message and Author */}
                                                <div className="w-2/3 p-4 sm:p-5 flex flex-col overflow-y-auto">
                                                    <p className="text-gray-700 text-lg leading-relaxed mb-4 flex-grow font-doodle">"{post.message}"</p>
                                                    <p className="text-right text-gray-800 font-accent text-xl mt-auto flex-shrink-0">- {post.author}</p>
                                                </div>

                                                {/* Delete Button */}
                                                <button 
                                                    onClick={() => setPostToDelete(post)} 
                                                    className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 z-10"
                                                    aria-label="Delete memory"
                                                >
                                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                  </svg>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            {showError && <ErrorAlert onFixClick={() => setIsTerminalOpen(true)} />}
        </Layout>
    );
};

export default MemoriesPage;