import React from 'react';

export const Button = ({ children, onClick, variant = 'primary', disabled, className = '' }) => {
    const baseStyle = "px-4 py-2 rounded font-mono text-sm font-bold transition-all duration-200 border transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
        primary: "bg-cyber-800 border-cyber-accent text-cyber-accent hover:bg-cyber-accent hover:text-cyber-900 shadow-[0_0_10px_rgba(0,240,255,0.2)]",
        danger: "bg-cyber-800 border-cyber-danger text-cyber-danger hover:bg-cyber-danger hover:text-cyber-900 shadow-[0_0_10px_rgba(255,42,109,0.2)]",
        ghost: "border-transparent text-gray-400 hover:text-white hover:bg-cyber-700"
    };

    return (
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`${baseStyle} ${variants[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

export const Card = ({ children, className = '' }) => (
    <div className={`glass-panel rounded-lg p-6 ${className}`}>
        {children}
    </div>
);

export const Badge = ({ children, variant = 'neutral' }) => {
    const variants = {
        neutral: "bg-cyber-700 text-gray-300 border-gray-600",
        success: "bg-green-900/30 text-green-400 border-green-500",
        danger: "bg-red-900/30 text-red-400 border-red-500",
        processing: "bg-blue-900/30 text-blue-400 border-blue-500 animate-pulse"
    };
    
    return (
        <span className={`px-2 py-0.5 rounded text-xs font-mono border ${variants[variant]}`}>
            {children}
        </span>
    );
};

export const Input = ({ value, onChange, placeholder, className = '' }) => (
    <input 
        type="text" 
        value={value} 
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-cyber-900 border border-cyber-500 rounded p-3 text-white focus:border-cyber-accent focus:outline-none focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-colors font-mono ${className}`}
    />
);

export const TextArea = ({ value, onChange, placeholder, className = '' }) => (
    <textarea 
        value={value} 
        onChange={onChange}
        placeholder={placeholder}
        rows={3}
        className={`w-full bg-cyber-900 border border-cyber-500 rounded p-3 text-white focus:border-cyber-accent focus:outline-none focus:shadow-[0_0_10px_rgba(0,240,255,0.1)] transition-colors font-mono resize-none ${className}`}
    />
);

export const CodeBlock = ({ label, content, truncated = false }) => (
    <div className="bg-black/50 rounded border border-cyber-700 overflow-hidden">
        {label && <div className="px-3 py-1 bg-cyber-800 text-xs text-gray-400 border-b border-cyber-700">{label}</div>}
        <div className={`p-3 font-mono text-xs text-gray-300 break-all ${truncated ? 'truncate' : ''}`}>
            {content}
        </div>
    </div>
);