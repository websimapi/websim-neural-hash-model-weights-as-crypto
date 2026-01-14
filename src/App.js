import React, { useState, useEffect } from 'react';
import { OracleService } from './OracleService.js';
import { StorageService } from './StorageService.js';
import { Button, Card, Badge, Input, TextArea, CodeBlock } from './components.js';

function App() {
    const [view, setView] = useState('ledger'); // 'ledger' | 'lab'
    const [inputData, setInputData] = useState('');
    const [isCommitting, setIsCommitting] = useState(false);
    const [records, setRecords] = useState([]);
    
    // Lab state
    const [labData1, setLabData1] = useState('Transfer $500 to Alice');
    const [labData2, setLabData2] = useState('Transfer $500 to Alice!');
    const [labResult, setLabResult] = useState(null);
    const [isLabRunning, setIsLabRunning] = useState(false);

    useEffect(() => {
        const unsubscribe = StorageService.subscribeToCommits(setRecords);
        return () => unsubscribe();
    }, []);

    const handleCommit = async () => {
        if (!inputData.trim()) return;
        
        setIsCommitting(true);
        try {
            const nonce = OracleService.generateNonce();
            // 1. Get Fingerprint from AI
            const { fingerprint, analysis } = await OracleService.generateFingerprint(inputData, nonce);
            
            // 2. Store in DB
            await StorageService.createCommitment(inputData, fingerprint, nonce, analysis);
            
            setInputData('');
        } catch (err) {
            alert("Failed to commit data: " + err.message);
        } finally {
            setIsCommitting(false);
        }
    };

    const runAvalancheTest = async () => {
        setIsLabRunning(true);
        try {
            const nonce = "FIXED_NONCE_FOR_LAB";
            
            const [res1, res2] = await Promise.all([
                OracleService.generateFingerprint(labData1, nonce),
                OracleService.generateFingerprint(labData2, nonce)
            ]);

            // Calculate bit difference (similarity)
            let diffCount = 0;
            const len = Math.min(res1.fingerprint.length, res2.fingerprint.length);
            for(let i=0; i<len; i++) {
                if(res1.fingerprint[i] !== res2.fingerprint[i]) diffCount++;
            }
            const percentDiff = Math.round((diffCount / len) * 100);

            setLabResult({
                fp1: res1.fingerprint,
                fp2: res2.fingerprint,
                diff: percentDiff
            });
        } catch (err) {
            alert("Lab error: " + err.message);
        } finally {
            setIsLabRunning(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto pb-20">
            <header className="mb-8 flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-accent to-blue-500">
                        NEURAL HASH
                    </h1>
                    <p className="text-gray-400 text-sm">LLM Weights as Cryptographic Primitive</p>
                </div>
                
                <div className="flex gap-2">
                    <Button 
                        variant={view === 'ledger' ? 'primary' : 'ghost'} 
                        onClick={() => setView('ledger')}
                    >
                        Ledger
                    </Button>
                    <Button 
                        variant={view === 'lab' ? 'primary' : 'ghost'} 
                        onClick={() => setView('lab')}
                    >
                        Avalanche Lab
                    </Button>
                </div>
            </header>

            {view === 'ledger' && (
                <div className="space-y-8">
                    {/* Input Section */}
                    <Card className="border-cyber-accent/30 shadow-[0_0_20px_rgba(0,240,255,0.05)]">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyber-accent rounded-full animate-pulse"></span>
                            New Data Commitment
                        </h2>
                        <div className="space-y-4">
                            <TextArea 
                                value={inputData}
                                onChange={(e) => setInputData(e.target.value)}
                                placeholder="Enter sensitive data to fingerprint (e.g. 'Contract v1.0 signed by User A')..."
                            />
                            <div className="flex justify-end">
                                <Button 
                                    onClick={handleCommit} 
                                    disabled={isCommitting || !inputData}
                                >
                                    {isCommitting ? 'Computing Neural Hash...' : 'Cryptographic Commit'}
                                </Button>
                            </div>
                        </div>
                    </Card>

                    {/* Ledger List */}
                    <div className="space-y-4">
                        <h2 className="text-gray-400 text-sm uppercase tracking-widest font-bold">Immutable Ledger</h2>
                        
                        {records.length === 0 && (
                            <div className="text-center py-12 text-gray-500 border border-dashed border-gray-700 rounded-lg">
                                No records found. Start the chain above.
                            </div>
                        )}

                        {records.map(record => (
                            <RecordItem key={record.id} record={record} />
                        ))}
                    </div>
                </div>
            )}

            {view === 'lab' && (
                <div className="space-y-6">
                    <Card>
                        <h2 className="text-xl font-bold mb-4">The Avalanche Effect</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            In cryptography, a small change in input should result in a drastically different output. 
                            This experiment tests if the Neural Oracle exhibits this property.
                        </p>
                        
                        <div className="grid md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-xs text-cyber-accent mb-1 block">Input A</label>
                                <Input value={labData1} onChange={(e) => setLabData1(e.target.value)} />
                            </div>
                            <div>
                                <label className="text-xs text-cyber-danger mb-1 block">Input B (Slight variation)</label>
                                <Input value={labData2} onChange={(e) => setLabData2(e.target.value)} />
                            </div>
                        </div>

                        <div className="flex justify-center mb-6">
                            <Button onClick={runAvalancheTest} disabled={isLabRunning}>
                                {isLabRunning ? 'Analyzing...' : 'Run Comparison'}
                            </Button>
                        </div>

                        {labResult && (
                            <div className="space-y-4 animate-fade-in">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <CodeBlock label="Fingerprint A" content={labResult.fp1} />
                                    <CodeBlock label="Fingerprint B" content={labResult.fp2} />
                                </div>
                                
                                <div className="text-center p-4 bg-black/30 rounded border border-gray-700">
                                    <div className="text-sm text-gray-400 mb-1">Difference</div>
                                    <div className={`text-3xl font-mono font-bold ${labResult.diff > 50 ? 'text-cyber-success' : 'text-cyber-danger'}`}>
                                        {labResult.diff}%
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2">
                                        {labResult.diff > 50 
                                            ? "Strong Avalanche Effect observed." 
                                            : "Weak divergence. The model considers these inputs semantically similar."}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </div>
    );
}

const RecordItem = ({ record }) => {
    const [status, setStatus] = useState('idle'); // idle, verifying, tampered, verified
    const [localData, setLocalData] = useState(record.raw_data);
    const [showDetails, setShowDetails] = useState(false);

    const isTampered = localData !== record.raw_data;

    const verify = async () => {
        setStatus('verifying');
        try {
            // Re-run the oracle with local (potentially tampered) data
            const result = await OracleService.generateFingerprint(localData, record.nonce);
            
            if (result.fingerprint === record.fingerprint) {
                setStatus('verified');
            } else {
                setStatus('tampered');
            }
        } catch (e) {
            console.error(e);
            setStatus('error');
        }
    };

    // Reset status if data changes
    useEffect(() => {
        if (status !== 'idle') setStatus('idle');
    }, [localData]);

    return (
        <Card className="border-l-4 border-l-cyber-500 hover:border-l-cyber-accent transition-all">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">
                        {new Date(record.created_at).toLocaleTimeString()}
                    </span>
                    <span className="text-xs font-mono text-cyber-accent bg-cyber-accent/10 px-2 rounded">
                        ID: {record.id.slice(0, 8)}
                    </span>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    {status === 'idle' && <Badge variant="neutral">Unverified</Badge>}
                    {status === 'verifying' && <Badge variant="processing">Oracle checking...</Badge>}
                    {status === 'verified' && <Badge variant="success">Integrity Verified</Badge>}
                    {status === 'tampered' && <Badge variant="danger">TAMPER DETECTED</Badge>}
                </div>
            </div>

            <div className="space-y-3">
                {/* Data Display / Tamper Input */}
                <div>
                    <div className="flex justify-between items-end mb-1">
                        <label className="text-xs text-gray-400">Stored Data</label>
                        <button 
                            onClick={() => setLocalData(localData + " ")}
                            className="text-[10px] text-cyber-danger hover:underline opacity-50 hover:opacity-100"
                            title="Simulate a hack by modifying local data"
                        >
                            [Simulate Attack]
                        </button>
                    </div>
                    <div className="relative group">
                        <textarea 
                            value={localData}
                            onChange={(e) => setLocalData(e.target.value)}
                            className={`w-full bg-black/30 rounded p-2 text-sm font-mono border ${
                                isTampered ? 'border-cyber-danger/50 text-red-100' : 'border-transparent text-gray-300'
                            } focus:outline-none transition-colors`}
                            rows={2}
                        />
                        {isTampered && (
                            <div className="absolute top-0 right-0 p-1">
                                <div className="w-2 h-2 bg-cyber-danger rounded-full"></div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Fingerprint Display */}
                <div 
                    className="cursor-pointer" 
                    onClick={() => setShowDetails(!showDetails)}
                >
                    <label className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                        Neural Fingerprint
                        <span className="text-[10px] opacity-50">
                            (Click to {showDetails ? 'hide' : 'expand'})
                        </span>
                    </label>
                    <div className="font-mono text-xs text-cyber-accent break-all bg-black/50 p-2 rounded border border-cyber-800 hover:border-cyber-500 transition-colors">
                        {showDetails ? record.fingerprint : record.fingerprint.slice(0, 32) + '...'}
                    </div>
                </div>

                {/* Controls */}
                <div className="pt-2 flex gap-2">
                    <Button 
                        onClick={verify} 
                        className="w-full md:w-auto text-xs py-1"
                        disabled={status === 'verifying'}
                    >
                        Verify with Oracle
                    </Button>
                    {isTampered && (
                        <Button 
                            onClick={() => setLocalData(record.raw_data)} 
                            variant="ghost" 
                            className="text-xs py-1"
                        >
                            Reset Data
                        </Button>
                    )}
                </div>
                
                {showDetails && (
                    <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 grid grid-cols-2 gap-4">
                        <div>
                            <span className="block mb-1 font-bold">Nonce</span>
                            <span className="font-mono">{record.nonce}</span>
                        </div>
                        <div>
                            <span className="block mb-1 font-bold">Oracle Analysis</span>
                            <span>{record.analysis}</span>
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
};

export default App;