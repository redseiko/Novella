import React, { useState, useEffect, useMemo } from 'react';

interface DocInfo {
    id: string;
    title: string;
}

interface DocsViewerProps {
    onClose: () => void;
}

// --- Markdown Parser & Renderer ---

/**
 * Renders inline markdown formatting like **bold**, *italic*, and `code`.
 * @param text The string to format.
 * @returns A React node with formatted text.
 */
const renderInlineFormatting = (text: string): React.ReactNode => {
    // Split by bold, italic, or code markers, but keep them for parsing
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\`.*?\`)/g).filter(Boolean);
    return parts.map((part, index) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={index}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={index}>{part.slice(1, -1)}</em>;
        }
        if (part.startsWith('`') && part.endsWith('`')) {
            return <code key={index} className="bg-gray-900 text-rose-300 font-mono py-0.5 px-1.5 rounded-md text-sm">{part.slice(1, -1)}</code>;
        }
        return part;
    });
};

/**
 * Renders a block of markdown list items, correctly handling nested lists.
 * @param listBlock The string block representing a list.
 * @param key The React key for the top-level container.
 * @returns A React element representing the list.
 */
const renderListBlock = (listBlock: string, key: React.Key): React.ReactElement => {
    // Parse each line into an object with depth, type, and content
    const lines = listBlock.split('\n').map(line => {
        const match = line.match(/^(\s*)(\*|-|\d+\.)\s+(.*)/);
        if (!match) return null;
        const indent = match[1].length;
        const depth = Math.floor(indent / 2); // Assuming 2 spaces for indentation
        const type = /^\d+\./.test(match[2].trim()) ? 'ol' : 'ul';
        const content = match[3];
        return { depth, type, content };
    }).filter((line): line is { depth: number; type: 'ul' | 'ol'; content: string } => line !== null);

    /**
     * Recursively builds the JSX for a list from the parsed lines.
     * @param startIndex The index in the lines array to start processing from.
     * @param depth The current indentation level to process.
     * @returns An object containing the generated JSX and the index of the next line to process.
     */
    const buildListJsx = (startIndex = 0, depth = 0): { jsx: React.ReactElement | null; nextIndex: number } => {
        if (startIndex >= lines.length || lines[startIndex].depth < depth) {
            return { jsx: null, nextIndex: startIndex };
        }

        const listType = lines[startIndex].type;
        const items = [];
        let currentIndex = startIndex;

        while (currentIndex < lines.length && lines[currentIndex].depth === depth) {
            const line = lines[currentIndex];
            
            // Recursively build nested lists for the current item
            const { jsx: nestedListJsx, nextIndex: nextItemIndex } = buildListJsx(currentIndex + 1, depth + 1);
            
            items.push(
                <li key={currentIndex} className="mb-1">
                    {renderInlineFormatting(line.content)}
                    {nestedListJsx}
                </li>
            );
            
            currentIndex = nextItemIndex;
        }

        const ListTag = listType as ('ul' | 'ol');
        const listStyle = listType === 'ul' ? 'list-disc' : 'list-decimal';
        const listElement = (
            <ListTag className={`${listStyle} pl-6 my-2`}>
                {items}
            </ListTag>
        );

        return { jsx: listElement, nextIndex: currentIndex };
    };

    const { jsx } = buildListJsx();
    return <div key={key}>{jsx}</div>;
};


/**
 * A component that parses and renders a string of markdown text into React elements.
 */
const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const renderedContent = useMemo(() => {
        if (!content) return null;
    
        // Pre-process to ensure headings are always separate blocks by adding a newline.
        let processedText = content.replace(/(^#+.+)\n(?!$|\n)/gm, '$1\n\n');

        const blocks = processedText.split('\n\n').filter(block => block.trim() !== '');

        return blocks.map((block, i) => {
            const trimmedBlock = block.trim();
            if (trimmedBlock.startsWith('# ')) {
                return <h1 key={i} className="text-3xl font-serif font-bold mt-6 mb-3 border-b border-gray-600 pb-2">{renderInlineFormatting(trimmedBlock.substring(2))}</h1>;
            }
            if (trimmedBlock.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-serif font-bold mt-4 mb-2">{renderInlineFormatting(trimmedBlock.substring(3))}</h2>;
            }
            if (trimmedBlock.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-serif font-semibold mt-4 mb-2">{renderInlineFormatting(trimmedBlock.substring(4))}</h3>;
            }
            if (trimmedBlock.startsWith('```')) {
                const code = trimmedBlock.replace(/```/g, '').replace(/^\s*\w+\s*\n/, '').trim();
                return <pre key={i} className="bg-gray-900 p-4 rounded-md my-4 font-mono text-sm overflow-x-auto"><code>{code}</code></pre>;
            }
            if (trimmedBlock.startsWith('* ') || trimmedBlock.startsWith('- ') || /^\d+\. /.test(trimmedBlock)) {
                return renderListBlock(trimmedBlock, i);
            }
            if (trimmedBlock === '---') {
                return <hr key={i} className="my-6 border-gray-700" />;
            }
            
            return <p key={i} className="my-4 leading-relaxed font-sans">{renderInlineFormatting(trimmedBlock)}</p>;
        });
    }, [content]);

     return <article className="prose prose-invert max-w-none text-gray-200">{renderedContent}</article>;
};


// --- Documentation Viewer Component ---

const DocsViewer: React.FC<DocsViewerProps> = ({ onClose }) => {
    const [docs, setDocs] = useState<DocInfo[]>([]);
    const [activeDocId, setActiveDocId] = useState<string | null>(null);
    const [content, setContent] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchDocsIndex = async () => {
            try {
                const response = await fetch('./docs/index.json');
                const data: DocInfo[] = await response.json();
                setDocs(data);
                if (data.length > 0) {
                    setActiveDocId(data[0].id);
                }
            } catch (error) {
                console.error("Failed to load docs index:", error);
                setContent("# Error\n\nCould not load `docs/index.json`.");
            }
        };
        fetchDocsIndex();
    }, []);

    useEffect(() => {
        if (!activeDocId) return;

        const fetchDocContent = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`./docs/${activeDocId}.md`);
                const text = await response.text();
                setContent(text);
            } catch (error) {
                console.error(`Failed to load doc "${activeDocId}.md":`, error);
                setContent(`# Error\n\nCould not load document.`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDocContent();
    }, [activeDocId]);
    
    const activeDocTitle = useMemo(() => {
        if (!activeDocId || docs.length === 0) return 'Loading...';
        return docs.find(doc => doc.id === activeDocId)?.title || 'Document';
    }, [docs, activeDocId]);

    return (
        <div 
            className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center animate-fade-in p-4 sm:p-8"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="docs-viewer-title"
        >
            <div 
                className="bg-gray-800/90 border border-gray-700 rounded-lg shadow-xl w-full h-full flex flex-col sm:flex-row overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Sidebar */}
                <aside className="w-full sm:w-1/4 md:w-1/5 bg-gray-900/50 p-4 border-b sm:border-b-0 sm:border-r border-gray-700 flex-shrink-0 overflow-y-auto">
                     <div className="flex justify-between items-center mb-4">
                        <h2 id="docs-viewer-title" className="text-xl font-bold text-white font-sans">Documentation</h2>
                         <button 
                            onClick={onClose} 
                            className="text-gray-400 hover:text-white text-3xl leading-none sm:hidden"
                            aria-label="Close"
                          >
                            &times;
                          </button>
                    </div>
                    <nav>
                        <ul>
                            {docs.map(doc => {
                                const isActive = doc.id === activeDocId;
                                return (
                                    <li key={doc.id}>
                                        <button 
                                            onClick={() => setActiveDocId(doc.id)}
                                            className={`w-full text-left p-2 rounded-md font-sans transition-colors text-sm ${isActive ? 'bg-indigo-600 text-white font-semibold' : 'text-gray-300 hover:bg-gray-700'}`}
                                        >
                                            {doc.title}
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </nav>
                </aside>
                
                {/* Content */}
                <main className="flex-grow flex flex-col overflow-hidden">
                    <header className="flex-shrink-0 bg-gray-900/70 p-4 border-b border-gray-700 flex justify-between items-center">
                         <h3 className="text-lg font-bold text-white font-sans truncate pr-4">{activeDocTitle}</h3>
                         <button 
                            onClick={onClose} 
                            className="px-4 py-2 text-sm font-sans text-gray-300 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors flex-shrink-0"
                          >
                            Close
                          </button>
                    </header>
                    <div className="flex-grow p-6 md:p-8 overflow-y-auto">
                        {isLoading ? (
                            <div className="text-gray-400">Loading document...</div>
                        ) : (
                            <MarkdownRenderer content={content} />
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DocsViewer;