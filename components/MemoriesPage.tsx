import React, { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import Layout from './Layout';
import { useAppContext } from '../context/AppContext';
import { getMemories, addMemory } from '../services/memoryService';
import ErrorAlert from './ErrorAlert';
import TerminalModal from './TerminalModal';

export interface Post {
  id: number;
  message: string;
  author: string;
  photoUrl: string;
}

const resizeImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.8): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error("Couldn't read file."));
      }
      const img = new Image();
      img.src = event.target.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round(height * (maxWidth / width));
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round(width * (maxHeight / height));
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Failed to get canvas context'));
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to JPEG for better compression, which is ideal for photos.
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });

const PostModal: React.FC<{ onClose: () => void; onAddPost: (post: Omit<Post, 'id'>) => Promise<void>; }> = ({ onClose, onAddPost }) => {
    const [message, setMessage] = useState('');
    const [author, setAuthor] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Clean up the blob URL when the component unmounts
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
      setError(null);
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        // Simple client-side validation for file size (e.g., 10MB)
        if (file.size > 10 * 1024 * 1024) {
          setError('File is too large. Please select an image under 10MB.');
          return;
        }
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
        setError(null);
        try {
          const photoUrl = await resizeImage(photo);
          await onAddPost({ message, author, photoUrl });
          onClose();
        } catch (error) {
          console.error("Error creating memory:", error);
          const errorMessage = error instanceof Error ? error.message : "Sorry, we couldn't create your memory. Please try again.";
          setError(errorMessage);
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
                    <p className="text-sm text-gray-500">This may take a moment.</p>
                </div>
            )}
          <h2 className="text-2xl font-bold mb-6 text-gray-800 font-hero-serif">Add a Memory</h2>
          {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                <strong className="font-bold">Oops! </strong>
                <span className="block sm:inline">{error}</span>
              </div>
          )}
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
              <button type="submit" className="rounded-full px-6 py-2 text-white bg-[#a1a5ff] hover:bg-opacity-90 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSubmitting || !!error}>
                {isSubmitting ? 'Saving...' : 'Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
};

const MemoriesPage: React.FC = () => {
    const { setShowNavToggle, navigateWithTransition } = useAppContext();
    const [posts, setPosts] = useState<Post[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showTerminal, setShowTerminal] = useState(false);

    useEffect(() => {
        setShowNavToggle(true);
        const loadPosts = async () => {
            setIsLoading(true);
            try {
                const memories = await getMemories();
                setPosts(memories);
            } catch (e) {
                console.error("Failed to load memories:", e);
                setError("Could not load memories. Your browser's storage might be disabled or full.");
            } finally {
                setIsLoading(false);
            }
        };

        loadPosts();
    }, [setShowNavToggle]);

    const addPost = async (postData: Omit<Post, 'id'>) => {
        try {
            const savedPost = await addMemory(postData);
            setPosts(currentPosts => [savedPost, ...currentPosts]);
        } catch (error) {
            console.error("Failed to save post to localStorage:", error);
            if (error instanceof Error && error.message.includes("is too large")) {
                throw new Error("The uploaded image is too large. Please try a smaller file.");
            }
            throw new Error("Failed to save your memory. Please check browser permissions and try again.");
        }
    };

    const handleTerminalSuccess = () => {
        setShowTerminal(false);
        navigateWithTransition('/final-video');
    };
    
    return (
        <Layout isTerminal={true} noScanlines={true} bgOverride="bg-[linear-gradient(to_bottom_right,#fde047,#fb7185,#2dd4bf,#c084fc)]">
            {isModalOpen && <PostModal onClose={() => setIsModalOpen(false)} onAddPost={addPost} />}
            {showTerminal && <TerminalModal onSuccess={handleTerminalSuccess} onClose={() => setShowTerminal(false)} />}
            
            <div className="min-h-screen p-4 sm:p-8 flex flex-col">
                <header className="text-center mb-8 animate-fadeIn">
                    <div className="inline-block relative">
                        <h1 className="font-hero-serif text-5xl sm:text-7xl font-extrabold text-white tracking-tight" style={{textShadow: '0 4px 10px rgba(0,0,0,0.3)'}}>
                            Memory Wall
                        </h1>
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
                               Loading memories...
                            </div>
                        ) : error ? (
                            <div className="text-center text-white h-full min-h-[40vh] flex flex-col justify-center items-center bg-red-900/30 rounded-2xl p-4">
                                <p className="text-2xl font-semibold mb-2">Loading Error</p>
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
                                                <div className="w-1/3 flex-shrink-0 bg-gray-200 flex items-center justify-center">
                                                    <img 
                                                        src={post.photoUrl} 
                                                        alt="Memory" 
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="w-2/3 p-4 sm:p-5 flex flex-col overflow-y-auto">
                                                    <p className="text-gray-700 text-lg leading-relaxed mb-4 flex-grow font-doodle">"{post.message}"</p>
                                                    <p className="text-right text-gray-800 font-accent text-xl mt-auto flex-shrink-0">- {post.author}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </main>
            </div>
            
            {/* This error alert is intentionally part of the user experience */}
            <ErrorAlert onFixClick={() => setShowTerminal(true)} />
        </Layout>
    );
};

export default MemoriesPage;