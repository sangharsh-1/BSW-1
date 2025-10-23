
import React, { useState, useEffect, useRef, KeyboardEvent } from 'react';

interface TerminalModalProps {
  onSuccess: () => void;
  onClose: () => void;
}

const TerminalModal: React.FC<TerminalModalProps> = ({ onSuccess, onClose }) => {
    // Configuration
    const expectedAuthKey = '1022';

    // State
    const [lines, setLines] = useState<React.ReactNode[]>([
        'Welcome to MemorySys v3.7 — Recovery Console',
        'A critical error was detected in the memory rendering system.',
        'Please run system commands to restore functionality.',
        'Awaiting command input.',
    ]);
    const [input, setInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const terminalEndRef = useRef<HTMLDivElement>(null);

    // Command progression state
    const [diagnosticsRun, setDiagnosticsRun] = useState(false);
    const [wishesRepaired, setWishesRepaired] = useState(false);
    const [wishDeployed, setWishDeployed] = useState(false);
    const [waitingForAuth, setWaitingForAuth] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [lines]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [isProcessing]);

    const addLines = (newLines: (string|React.ReactNode)[], lineDelay = 220): Promise<void> => {
        return new Promise(resolve => {
            let i = 0;
            const next = () => {
                if (i >= newLines.length) {
                    resolve();
                    return;
                }
                setLines(prev => [...prev, newLines[i++]]);
                setTimeout(next, lineDelay);
            };
            next();
        });
    };

    const handleCommand = async () => {
        const raw = input.trim();
        if (!raw || isProcessing) return;
        
        setLines(prev => [...prev, `> ${raw}`]);
        setInput('');
        setIsProcessing(true);

        if (waitingForAuth) {
            const code = raw.trim();
            if (code === expectedAuthKey) {
                setWaitingForAuth(false);
                await addLines(['Auth OK. Decrypting final node...', 'Final node unlocked. Preparing redirect...'], 450);
                await addLines(['Process complete. Redirecting...'], 400);
                setTimeout(() => { onSuccess(); }, 1200);
            } else {
                await addLines(['ERR_INVALID_KEY: Authentication failed. Try again.'], 280);
                setWaitingForAuth(true); // Keep waiting
            }
            setIsProcessing(false);
            return;
        }

        const parts = raw.split(' ');
        const cmd = parts[0].toLowerCase();
        
        const commands: { [key: string]: () => Promise<void> } = {
            run_diagnostics: async () => {
                await addLines(['Initializing system scan...', 'Scanning memory nodes...'], 300);
                await addLines([
                    'Wishes nodes found: 99/100',
                    'Node status: OK (partial)',
                    'ERROR: ERR_MISSING_NODE [node: Krish_final_wish]',
                ], 350);
                setDiagnosticsRun(true);
            },
            repair_wishes: async () => {
                if (!diagnosticsRun) {
                    await addLines(['ERR_DEPENDENCY: Please run `run_diagnostics` first.']);
                    return;
                }
                await addLines(['Attempting automated repairs...', 'Rebuilding memory index from backup...'], 300);
                await new Promise(res => setTimeout(res, 420)).then(() => setLines(p => [...p, 'Rebuilding... 25%']));
                await new Promise(res => setTimeout(res, 420)).then(() => setLines(p => [...p, 'Rebuilding... 50%']));
                await new Promise(res => setTimeout(res, 420)).then(() => setLines(p => [...p, 'Rebuilding... 75%']));
                await new Promise(res => setTimeout(res, 420)).then(() => setLines(p => [...p, 'Rebuilding... 100%']));
                await addLines(['Index rebuild complete. Node: Krish_final_wish restored.'], 250);
                setWishesRepaired(true);
            },
            deploy_wish: async () => {
                if (!wishesRepaired) {
                    await addLines(['ERR_DEPENDENCY: Please run `repair_wishes` first.']);
                    return;
                }
                await addLines(['Packaging final wish payload...', 'Signing with ephemeral key...'], 300);
                await addLines(['Payload signed: UID_0xAB12FF', 'Uploading to secure node...', 'Upload complete.'], 320);
                setWishDeployed(true);
            },
            auth: async () => {
                if (!wishDeployed) {
                    await addLines(['ERR_DEPENDENCY: Please run `deploy_wish` first.']);
                    return;
                }
                setWaitingForAuth(true);
                await addLines(['Enter authentication key: (4 digits)'], 220);
            },
        };

        const commandFn = commands[cmd];
        if (commandFn) {
            await commandFn();
        } else {
            await addLines([`Unknown command: ${cmd}`]);
        }
        setIsProcessing(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleCommand();
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[100] p-4 font-terminal text-green-400 animate-fadeIn">
            <div className="w-full max-w-4xl h-[80vh] bg-black/80 backdrop-blur-sm rounded-lg shadow-2xl shadow-green-500/10 overflow-hidden flex flex-col p-4 border border-green-500/20 relative">
                <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors" aria-label="Close terminal">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <div className="flex-grow overflow-y-auto pr-2" onClick={() => inputRef.current?.focus()}>
                    {lines.map((line, index) => (
                        <div key={index} className="whitespace-pre-wrap break-words">{line}</div>
                    ))}
                    <div ref={terminalEndRef} />
                </div>
                <div className="flex items-center mt-4">
                    <span className="text-green-400">{waitingForAuth ? 'Enter auth key:' : '>'}</span>
                    <input
                        ref={inputRef}
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        disabled={isProcessing}
                        className="flex-grow bg-transparent border-none outline-none ml-2 text-green-400 disabled:opacity-50"
                        autoFocus
                        placeholder={waitingForAuth ? 'Type 4-digit key and press Enter' : ''}
                    />
                </div>
            </div>
        </div>
    );
};

export default TerminalModal;