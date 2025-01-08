import { useState, useEffect } from 'react';

interface MetaSummary {
  class: string;
  sentiment: string;
  analysis: string;
  portfolio: string;
  'portfolio-analysis': string;
}

interface Manifest {
  files: string[];
  lastUpdated: string;
}

const getSentimentColor = (sentiment: string): string => {
  switch (sentiment) {
    case 'Bullish':
      return 'text-blue-400';
    case 'Euphoric':
      return 'text-green-400';
    case 'Neutral':
      return 'text-gray-400';
    case 'Bearish':
      return 'text-amber-500';
    case 'Depression':
      return 'text-red-500';
    default:
      return 'text-gray-300';
  }
};

const formatFileName = (filename: string, sentiment?: string): JSX.Element => {
  // Extract date from filename format like "2025-01-05_..."
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})_/);
  if (!match) return <span>{filename.replace('.json', '')}</span>;
  
  const [_, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  const formattedDate = date.toLocaleDateString('en-US', { 
    month: 'long',
    day: 'numeric', 
    year: 'numeric'
  });

  return sentiment ? (
    <span>
      {formattedDate} | <span className={getSentimentColor(sentiment)}>{sentiment}</span>
    </span>
  ) : (
    <span>{formattedDate}</span>
  );
};

const AIAgent = () => {
  const [summaries, setSummaries] = useState<{ [key: string]: MetaSummary }>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      console.log('Starting to fetch AI files...');
      try {
        const manifestUrl = '/intelligence_data/ai-manifest.json';
        console.log('Fetching AI manifest from:', manifestUrl);
        
        const manifestResponse = await fetch(manifestUrl);
        
        if (!manifestResponse.ok) {
          throw new Error(`Failed to fetch AI manifest (${manifestResponse.status}): ${manifestResponse.statusText}`);
        }

        const contentType = manifestResponse.headers.get('content-type');
        console.log('AI Manifest content type:', contentType);

        const manifest: Manifest = await manifestResponse.json();
        console.log('Parsed AI manifest data:', manifest);

        if (!Array.isArray(manifest.files)) {
          throw new Error('Invalid AI manifest format: files property should be an array');
        }

        const summariesData: { [key: string]: MetaSummary } = {};
        
        for (const fileName of manifest.files) {
          const fileUrl = `/intelligence_data/${fileName}`;
          console.log(`Fetching AI file: ${fileUrl}`);
          
          try {
            const contentResponse = await fetch(fileUrl);
            if (!contentResponse.ok) {
              console.error(`Failed to fetch ${fileName}: ${contentResponse.status}`);
              continue;
            }
            
            const contentType = contentResponse.headers.get('content-type');
            console.log(`Content type for ${fileName}:`, contentType);
            
            const content = await contentResponse.json();
            summariesData[fileName] = content;
          } catch (fileError) {
            console.error(`Error processing ${fileName}:`, fileError);
          }
        }

        if (Object.keys(summariesData).length === 0) {
          throw new Error('No AI files could be loaded');
        }

        setSummaries(summariesData);
        setLoading(false);

        // Set the most recent file as default
        const sortedFiles = Object.keys(summariesData).sort().reverse();
        if (sortedFiles.length > 0) {
          setSelectedFile(sortedFiles[0]);
        }

      } catch (error) {
        console.error('Error in fetchFiles:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setLoading(false);
      }
    };

    fetchFiles();
  }, []);

  const selectedSummary = selectedFile ? summaries[selectedFile] : null;

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

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full bg-black p-8 max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Left sidebar with file list */}
          <div className="w-64 shrink-0 rounded-lg border border-gray-700">
            <h2 className="text-white text-xl p-4 text-center">Agent Analysis</h2>
            <div className="border-t border-gray-700">
              <div className="p-4 space-y-2">
                {Object.keys(summaries)
                  .sort((a, b) => b.localeCompare(a))
                  .map((filename) => (
                    <button
                      key={filename}
                      onClick={() => setSelectedFile(filename)}
                      className={`w-full text-center px-4 py-2 rounded ${
                        selectedFile === filename
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {formatFileName(filename, summaries[filename].sentiment)}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Right content area */}
          <div className="flex-1 space-y-4">
            {selectedSummary ? (
              <>
                {/* Analysis box - full width */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-white text-xl mb-2">Analysis</h3>
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedSummary.analysis}</p>
                </div>

                {/* Portfolio Analysis and Portfolio side by side */}
                <div className="flex gap-4">
                  {/* Portfolio Analysis box */}
                  <div className="flex-1 bg-gray-900 rounded-lg p-6">
                    <h3 className="text-white text-xl mb-2">Portfolio Analysis</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedSummary['portfolio-analysis']}</p>
                  </div>

                  {/* Portfolio box */}
                  <div className="w-64 shrink-0 bg-gray-900 rounded-lg p-6">
                    <h3 className="text-white text-xl mb-4">Portfolio</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{selectedSummary.portfolio}</p>
                  </div>
                </div>

                {/* Sentiment Timeline */}
                <div className="bg-gray-900 rounded-lg p-6">
                  <h3 className="text-white text-xl mb-4">Sentiment Timeline</h3>
                  <div className="relative h-32">
                    {/* Sentiment levels */}
                    <div className="absolute left-0 top-0 bottom-0 w-24 flex flex-col justify-between text-gray-300 text-sm">
                      {['Euphoric', 'Bullish', 'Neutral', 'Bearish', 'Depression'].map((level) => (
                        <div key={level} className="h-5 flex items-center text-xs">
                          {level}
                        </div>
                      ))}
                    </div>

                    {/* Timeline area */}
                    <div className="ml-24 h-full relative">
                      {/* Grid lines */}
                      <div className="absolute inset-0">
                        {/* Horizontal grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          {[0, 1, 2, 3, 4].map((i) => (
                            <div key={`h-${i}`} className="border-b border-gray-800" />
                          ))}
                        </div>
                        
                        {/* Vertical grid lines - one per week */}
                        <div className="absolute inset-0 flex justify-between">
                          {[...Array(6)].map((_, i) => (
                            <div 
                              key={`v-${i}`} 
                              className={`border-l ${i === 5 ? 'border-gray-600' : 'border-gray-800'} h-full`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Sentiment markers for available dates */}
                      {Object.entries(summaries).map(([filename, summary]) => {
                        const date = new Date(filename.split('_')[0]);
                        const mostRecentDate = new Date(
                          Object.keys(summaries)
                            .sort((a, b) => b.localeCompare(a))[0]
                            .split('_')[0]
                        );
                        
                        const diffDays = Math.floor(
                          (mostRecentDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
                        );
                        const position = 100 - ((diffDays / 35) * 100); // Position from right
                        
                        const bgColorClass = {
                          'Bullish': 'bg-blue-400',
                          'Euphoric': 'bg-green-400',
                          'Neutral': 'bg-gray-400',
                          'Bearish': 'bg-amber-500',
                          'Depression': 'bg-red-500'
                        }[summary.sentiment] || 'bg-gray-300';
                        
                        return (
                          <div 
                            key={filename}
                            className={`absolute w-3 h-3 ${bgColorClass} rounded-full`}
                            style={{
                              right: `${100 - position}%`,
                              top: `${
                                ['Euphoric', 'Bullish', 'Neutral', 'Bearish', 'Depression']
                                  .indexOf(summary.sentiment) * 25
                              }%`,
                              transform: 'translate(50%, -50%)'
                            }}
                          />
                        );
                      })}

                      {/* Date labels */}
                      <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-gray-400 text-xs">
                        {(() => {
                          // Get the most recent date from the available summaries
                          const sortedFiles = Object.keys(summaries).sort((a, b) => b.localeCompare(a));
                          if (sortedFiles.length === 0) return null;

                          const mostRecentFile = sortedFiles[0];
                          const mostRecentDate = new Date(mostRecentFile.split('_')[0]);

                          return [...Array(6)].map((_, i) => {
                            const date = new Date(mostRecentDate);
                            date.setDate(date.getDate() - ((5-i) * 7)); // Work backwards in 7-day increments
                            
                            return (
                              <div 
                                key={`date-${i}`} 
                                className="text-center whitespace-nowrap"
                                style={{ 
                                  position: 'absolute',
                                  right: `${((5-i) * 20)}%`,
                                  transform: 'translateX(50%)'
                                }}
                              >
                                {date.toLocaleDateString('en-US', { 
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </div>
                            );
                          });
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-white text-center p-8">No file selected</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgent; 