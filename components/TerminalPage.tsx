
import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import Layout from './Layout';
import { useAppContext } from '../context/AppContext';

const TerminalPage: React.FC = () => {
  const { navigateWithTransition } = useAppContext();
  const [lines, setLines] = useState<React.ReactNode[]>([
    'System Alert: Missing Wish Detected',
    'You’ve entered the system console. One wish failed to load.',
    'To restore it, run a few commands.',
    '----------------------------------------------------------',
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAwaitingCode, setIsAwaitingCode] = useState(false);
  
  // New state to track progress
  const [diagnosticsRun, setDiagnosticsRun] = useState(false);
  const [wishesRepaired, setWishesRepaired] = useState(false);
  const [wishDeployed, setWishDeployed] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = (line: React.ReactNode, delay = 0) => {
    return new Promise(resolve => {
        setTimeout(() => {
            setLines(prev => [...prev, line]);
            resolve(true);
        }, delay);
    });
  }

  const handleCommand = async () => {
    const command = input.trim().toLowerCase();
    if (!command) return;

    setInput('');
    setIsProcessing(true);
    await addLine(`> ${command}`);

    if (isAwaitingCode) {
        if (command === '1022') {
            await addLine('Access granted.', 100);
            await addLine('Decrypting final node...', 300);
            await addLine('Final node unlocked. Preparing redirect...', 500);
            setTimeout(() => navigateWithTransition('/final-video'), 1000);
        } else {
            await addLine('Error: Invalid key. Access denied.', 100);
            setIsAwaitingCode(false);
        }
        setIsProcessing(false);
        return;
    }

    switch (command) {
      case 'run_diagnostics':
        await addLine('Running system diagnostics...', 200);
        await addLine('Analyzing memory nodes...', 500);
        await addLine("99 wishes loaded successfully.", 500);
        await addLine("1 wish failed to initialize: 'Krish'", 200);
        setDiagnosticsRun(true);
        break;
      case 'repair_wishes':
        if (!diagnosticsRun) {
            await addLine('Error: Please run diagnostics first.', 100);
            break;
        }
        await addLine('Attempting automated repairs...', 200);
        await addLine('Scanning for data corruption...', 600);
        await addLine('Repairing media links...', 800);
        await addLine('Success. Node: Krish_final_wish restored.', 500);
        setWishesRepaired(true);
        break;
      case 'deploy_wish':
        if (!wishesRepaired) {
            await addLine('Error: Please repair wishes first.', 100);
            break;
        }
        await addLine('Packaging final wish payload...', 200);
        await addLine('Signing with ephemeral key...', 500);
        setWishDeployed(true);
        break;
      case 'auth':
        if (!wishDeployed) {
            await addLine('Error: Please deploy the wish first.', 100);
            break;
        }
        await addLine('Enter authentication key: (4 digits)', 200);
        setIsAwaitingCode(true);
        break;
      default:
        await addLine(`Command not found: ${command}`, 100);
        break;
    }
    setIsProcessing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCommand();
    }
  };

  return (
    <Layout isTerminal={true}>
      <div className="min-h-screen flex items-center justify-center p-4 font-terminal text-green-400">
        <div className="w-full max-w-4xl h-[80vh] bg-black/80 backdrop-blur-sm rounded-lg shadow-2xl shadow-green-500/10 overflow-hidden flex flex-col p-4 border border-green-500/20">
          <div className="flex-grow overflow-y-auto pr-2">
            {lines.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap break-words">{line}</div>
            ))}
            <div ref={terminalEndRef} />
          </div>
          <div className="flex items-center mt-4">
            <span className="text-green-400">{isAwaitingCode ? 'Enter auth key:' : '>'}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isProcessing}
              className="flex-grow bg-transparent border-none outline-none ml-2 text-green-400"
              autoFocus
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TerminalPage;