import React, { useState, useEffect } from 'react';

interface FileData {
  name: string;
  content: string;
  displayName: string | { date: string };
  category: 'crypto' | 'macro' | 'trading' | 'daily-summaries';
  sentiment?: string;
}

const CATEGORIES = [
  { id: 'daily-summaries', label: 'Daily Summaries' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'macro', label: 'Macro' },
  { id: 'trading', label: 'Trading' }
] as const;

const extractSentiment = (content: string): string => {
  // Try different patterns
  const patterns = [
    /Sentiment:\s*(\w+)/i,
    /Sentiment\n(\w+)/i,
    /\nSentiment\s*(\w+)/i
  ];
  
  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  console.log('No sentiment found in content:', content.slice(-200)); // Log the last 200 chars to debug
  return '';
};

const formatDisplayName = (fileName: string): string | { date: string } => {
  // Special handling for daily summaries
  if (fileName.includes('daily-summary')) {
    const dateMatch = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
    if (dateMatch) {
      const [_, year, month, day] = dateMatch;
      const date = new Date(Number(year), Number(month) - 1, Number(day));
      const formattedDate = date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      return {
        date: formattedDate
      };
    }
  }
  
  // Shared handling for crypto, macro, and trading files
  if (fileName.includes('crypto') || fileName.includes('macro') || fileName.includes('trading')) {
    const parts = fileName.split('_');
    if (parts.length >= 4) {
      const channel = parts[2]; // Get the channel name
      // Join the remaining parts (except the last '_summary.txt') to form the title
      const title = parts.slice(3, -1).join(' ').replace(/-/g, ' ');
      
      // Capitalize channel name and title words
      const formattedChannel = channel
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      const formattedTitle = title
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      return `${formattedChannel}\n${formattedTitle}`;
    }
  }
  
  // Fallback handling for any other files
  const nameWithoutDate = fileName.replace(/^\d{4}-\d{2}-\d{2}_/, '');
  const nameWithoutExt = nameWithoutDate.replace('_summary.txt', '');
  
  const formattedName = nameWithoutExt
    .replace(/_/g, ' ')
    .replace(/-/g, ' ');

  return formattedName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const categorizeFile = (fileName: string): FileData['category'] => {
  if (fileName.includes('daily-summary')) return 'daily-summaries';
  if (fileName.includes('macro')) return 'macro';
  if (fileName.includes('trading')) return 'trading';
  return 'crypto'; // default category
};

// Add a helper function to extract and format the date
const extractDate = (fileName: string): string => {
  const dateMatch = fileName.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (dateMatch) {
    const [_, year, month, day] = dateMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return date.toLocaleDateString('en-US', { 
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
  return '';
};

const ITEMS_PER_PAGE = 25;

const Intelligence: React.FC = () => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<FileData['category']>('daily-summaries');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchFiles = async () => {
      console.log('Starting to fetch files...');
      try {
        const manifestUrl = '/intelligence_data/manifest.json';
        const manifestResponse = await fetch(manifestUrl);
        
        if (!manifestResponse.ok) {
          const contentType = manifestResponse.headers.get('content-type');
          console.error('Manifest response status:', manifestResponse.status);
          console.error('Content-Type:', contentType);
          
          const text = await manifestResponse.text();
          console.error('Response text:', text.substring(0, 200)); // Log first 200 chars
          
          throw new Error(`Failed to fetch manifest (${manifestResponse.status}): Invalid response`);
        }

        let fileList: string[];
        try {
          fileList = await manifestResponse.json();
        } catch (jsonError) {
          console.error('JSON Parse Error:', jsonError);
          throw new Error('Failed to parse manifest.json - invalid JSON format');
        }
        
        if (!Array.isArray(fileList)) {
          console.error('Unexpected manifest format:', fileList);
          throw new Error('Manifest data is not an array');
        }

        if (fileList.length === 0) {
          console.warn('Manifest is empty');
          setFiles([]);
          setLoading(false);
          return;
        }

        const filePromises = fileList.map(async (fileName) => {
          const fileUrl = `/intelligence_data/${fileName}`;
          try {
            const contentResponse = await fetch(fileUrl);
            
            if (!contentResponse.ok) {
              console.error(`Failed to fetch ${fileName}:`, contentResponse.status);
              throw new Error(`Failed to fetch ${fileName}`);
            }
            
            const content = await contentResponse.text();
            const sentiment = extractSentiment(content);
            
            return {
              name: fileName,
              content,
              displayName: formatDisplayName(fileName),
              category: categorizeFile(fileName),
              sentiment
            };
          } catch (fileError) {
            console.error(`Error fetching ${fileName}:`, fileError);
            // Skip failed files instead of failing completely
            return null;
          }
        });

        const fileData = (await Promise.all(filePromises))
          .filter((file): file is NonNullable<typeof file> => file !== null);

        if (fileData.length === 0) {
          throw new Error('No files could be loaded');
        }

        setFiles(fileData);
        
        // Set first file of selected category as default
        const categoryFiles = fileData.filter(f => f.category === selectedCategory);
        if (categoryFiles.length > 0) {
          setSelectedFile(categoryFiles[0]);
        }
      } catch (error) {
        console.error('Error in fetchFiles:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [selectedCategory]);

  const handleFileSelect = (file: FileData) => {
    setSelectedFile(file);
  };

  const handleCategorySelect = (category: FileData['category']) => {
    setSelectedCategory(category);
    // Reset selected file when changing categories
    const categoryFiles = files.filter(f => f.category === category);
    setSelectedFile(categoryFiles.length > 0 ? categoryFiles[0] : null);
  };

  if (loading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 text-center p-8">
        <h2 className="text-xl font-bold mb-2">Error Loading Files</h2>
        <p>{error}</p>
      </div>
    );
  }

  const filteredFiles = files.filter(f => f.category === selectedCategory);

  // Calculate pagination
  const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentFiles = filteredFiles.slice(startIndex, endIndex);

  // Handle page changes
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll back to top of list when changing pages
    const fileListElement = document.getElementById('file-list');
    if (fileListElement) {
      fileListElement.scrollTop = 0;
    }
  };

  // Pagination Controls Component
  const PaginationControls = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-end space-x-2 p-4 border-t border-gray-700 bg-black">
        <button
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="text-gray-400 hover:text-white disabled:text-gray-600"
        >
          {'<'}
        </button>
        
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-2 py-1 rounded ${
              currentPage === page
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="text-gray-400 hover:text-white disabled:text-gray-600"
        >
          {'>'}
        </button>
      </div>
    );
  };

  return (
    <div className="h-full flex bg-black">
      {/* File List - Left Side */}
      <div className="w-1/4 min-w-[250px] border-r border-gray-700 bg-black h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Fixed header container */}
        <div className="sticky top-14 bg-black z-40 flex-shrink-0">
          <div className="p-4 border-b border-gray-700">
            {/* Intelligence box */}
            <div className="w-full">
              <div className="border border-gray-700 rounded-md">
                {/* Intelligence header */}
                <div className="py-2 border-b border-gray-700">
                  <h2 className="text-white text-xl font-bold text-center">Intelligence</h2>
                </div>
                
                {/* Category Selector */}
                <div className="grid grid-cols-4 gap-2 p-2 w-full">
                  {CATEGORIES.map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => handleCategorySelect(id as FileData['category'])}
                      className={`
                        h-12 
                        flex items-center justify-center
                        rounded-md transition-colors
                        text-xs font-medium
                        px-2 py-1
                        w-full
                        ${
                          selectedCategory === id
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-300 hover:bg-gray-800'
                        }
                      `}
                    >
                      {label.split(' ').map((word, i) => (
                        <React.Fragment key={i}>
                          {i > 0 && <br />}
                          {word}
                        </React.Fragment>
                      ))}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable File List with pagination */}
        <div className="flex-1 flex flex-col min-h-0">
          <div 
            id="file-list"
            className="flex-1 overflow-y-auto scrollbar scrollbar-thumb-gray-800 scrollbar-track-gray-950 hover:scrollbar-thumb-gray-700 bg-black"
          >
            <div className="p-4 pt-0 space-y-2">
              {currentFiles.map((file) => (
                <button
                  key={file.name}
                  onClick={() => handleFileSelect(file)}
                  className={`w-full text-left px-4 py-2 rounded transition-colors relative ${
                    selectedFile?.name === file.name
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      {typeof file.displayName === 'string' ? (
                        // Regular file display
                        file.displayName.split('\n').map((line, i) => (
                          <React.Fragment key={i}>
                            {i > 0 && (
                              <>
                                <br />
                                <span className="text-sm text-gray-400">{line}</span>
                              </>
                            )}
                            {i === 0 && <span className="font-medium">{line}</span>}
                          </React.Fragment>
                        ))
                      ) : (
                        // Daily summary display - simplified to just show date
                        <div className="text-center">
                          {file.displayName.date}
                        </div>
                      )}
                    </div>
                    {!file.name.includes('daily-summary') && (
                      <span className={`text-xs ml-2 ${
                        selectedFile?.name === file.name
                          ? 'text-gray-200'
                          : 'text-gray-500'
                      }`}>
                        {extractDate(file.name)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
          
          {/* Pagination Controls - Fixed at bottom */}
          <div className="flex-shrink-0">
            <PaginationControls />
          </div>
        </div>
      </div>

      {/* Content Viewer - Right Side */}
      <div className="flex-1 h-[calc(100vh-3.5rem)] overflow-y-auto bg-black scrollbar scrollbar-thumb-gray-800 scrollbar-track-gray-950 hover:scrollbar-thumb-gray-700">
        <div className="p-6">
          {selectedFile ? (
            <div className="max-w-4xl mx-auto">
              <h2 className="text-white text-2xl font-bold mb-4">
                {typeof selectedFile.displayName === 'string' 
                  ? selectedFile.displayName
                  : selectedFile.displayName.date}
              </h2>
              <div className="bg-gray-900 rounded-lg p-6 text-gray-300 font-mono [&>p]:mb-4 bullet-list">
                {selectedFile.content.split('\n').map((line, index) => (
                  <p key={index} className={`
                    whitespace-pre-wrap
                    ${line.trim().startsWith('-') ? 'bullet-point' : 'continuation-line'}
                  `}>
                    {line}
                  </p>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-center">
              Select a file to view its contents
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Intelligence; 