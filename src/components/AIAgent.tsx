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
}

const formatFileName = (filename: string): string => {
  // Extract date from filename format like "2025-01-05_..."
  const match = filename.match(/^(\d{4})-(\d{2})-(\d{2})_/);
  if (!match) return filename.replace('.json', '');
  
  const [_, year, month, day] = match;
  const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  
  return date.toLocaleDateString('en-US', { 
    month: 'long',
    day: 'numeric', 
    year: 'numeric'
  });
};

// Add this new interface for the sentiment levels
type SentimentLevel = 'Euphoric' | 'Bullish' | 'Neutral' | 'Bearish' | 'Depression';

// Add this helper function to map sentiment text to our defined levels
const mapSentimentToLevel = (sentiment: string): SentimentLevel => {
  const lowercase = sentiment.toLowerCase();
  if (lowercase.includes('euphoric')) return 'Euphoric';
  if (lowercase.includes('bullish')) return 'Bullish';
  if (lowercase.includes('neutral')) return 'Neutral';
  if (lowercase.includes('bearish')) return 'Bearish';
  if (lowercase.includes('depression')) return 'Depression';
  return 'Neutral'; // default case
};

const AIAgent = () => {
  const [summaries, setSummaries] = useState<{ [key: string]: MetaSummary }>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const manifestResponse = await fetch('/intelligence_data/ai-manifest.json');
        if (!manifestResponse.ok) {
          throw new Error('Failed to fetch manifest');
        }
        const manifest: Manifest = await manifestResponse.json();
        
        const summariesData: { [key: string]: MetaSummary } = {};
        
        // Fetch each summary file listed in the manifest
        for (const file of manifest.files) {
          const summaryResponse = await fetch(`/intelligence_data/${file}`);
          if (summaryResponse.ok) {
            const data = await summaryResponse.json();
            summariesData[file] = data;
          }
        }

        setSummaries(summariesData);
        if (Object.keys(summariesData).length > 0) {
          setSelectedFile(Object.keys(summariesData)[0]);
        }
      } catch (error) {
        console.error('Error fetching summaries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  if (loading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  const selectedSummary = selectedFile ? summaries[selectedFile] : null;

  // Update the right content area JSX
  const rightContentArea = (
    <div className="flex-1 space-y-4">
      {/* Top analysis box */}
      <div className="bg-gray-900 rounded-lg p-6">
        <div>
          <h3 className="text-white text-xl mb-2">Analysis</h3>
          <p className="text-gray-300 whitespace-pre-wrap">{selectedSummary?.analysis}</p>
        </div>
      </div>

      {/* Bottom sentiment timeline box */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-white text-xl mb-4">Sentiment Timeline</h3>
        <div className="relative h-40">
          {/* Sentiment levels */}
          <div className="absolute left-0 top-0 bottom-0 w-24 flex flex-col justify-between text-gray-300 text-sm">
            {['Euphoric', 'Bullish', 'Neutral', 'Bearish', 'Depression'].map((level) => (
              <div key={level} className="h-6 flex items-center">
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
              
              {/* Vertical grid lines */}
              <div className="absolute inset-0 flex justify-between">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={`v-${i}`} 
                    className="border-l border-gray-800 h-full"
                  />
                ))}
              </div>
            </div>

            {/* Current sentiment marker */}
            {selectedSummary && (
              <div 
                className="absolute left-0 w-4 h-4 bg-blue-600 rounded"
                style={{
                  top: `${
                    ['Euphoric', 'Bullish', 'Neutral', 'Bearish', 'Depression']
                      .indexOf(mapSentimentToLevel(selectedSummary.sentiment)) * 25
                  }%`,
                  transform: 'translateY(-50%)'
                }}
              />
            )}

            {/* Date label */}
            <div className="absolute bottom-0 left-0 text-gray-300 text-sm -mb-6">
              {selectedFile && formatFileName(selectedFile)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full bg-black p-8 max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Left sidebar with file list */}
          <div className="w-64 shrink-0 rounded-lg border border-gray-700">
            <h2 className="text-white text-xl p-4 text-center">Agent Analysis</h2>
            <div className="border-t border-gray-700">
              <div className="p-4 space-y-2">
                {Object.keys(summaries).map((filename) => (
                  <button
                    key={filename}
                    onClick={() => setSelectedFile(filename)}
                    className={`w-full text-center px-4 py-2 rounded ${
                      selectedFile === filename
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    {formatFileName(filename)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {rightContentArea}
        </div>
      </div>
    </div>
  );
};

export default AIAgent; 