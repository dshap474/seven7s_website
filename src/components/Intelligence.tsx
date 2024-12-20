import React, { useState, useEffect } from 'react';

const Intelligence: React.FC = () => {
  const [metaSummary, setMetaSummary] = useState<string>('');
  const [newsletterSummary, setNewsletterSummary] = useState<string>('');
  const [youtubeSummary, setYoutubeSummary] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'meta' | 'newsletter' | 'youtube'>('meta');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string[]>([]);

  const addDebugMessage = (message: string) => {
    setDebug(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        addDebugMessage('Starting fetchSummaries');
        
        const [meta, newsletter, youtube] = await Promise.all([
          fetch('/intelligence_data/2024-12-19_meta_summary.txt').then(res => res.text()),
          fetch('/intelligence_data/2024-12-19_newsletters_daily_summary.txt').then(res => res.text()),
          fetch('/intelligence_data/2024-12-19_youtube_transcripts_daily_summary.txt').then(res => res.text())
        ]);

        setMetaSummary(meta);
        setNewsletterSummary(newsletter);
        setYoutubeSummary(youtube);
        addDebugMessage('Successfully loaded all content');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        addDebugMessage(`Error in fetchSummaries: ${errorMessage}`);
        console.error('Error fetching summaries:', error);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  const formatContent = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('<')) {
        const cleanLine = line.replace(/<|>/g, '').trim();
        if (cleanLine === 'key_insight' || cleanLine === '/key_insight' ||
            cleanLine === 'crypto_market_insights' || cleanLine === '/crypto_market_insights' ||
            cleanLine === 'macroeconomic_and_stock_market_insights' || cleanLine === '/macroeconomic_and_stock_market_insights' ||
            cleanLine === 'overarching_themes_and_trends' || cleanLine === '/overarching_themes_and_trends' ||
            cleanLine === 'sentiment' || cleanLine === '/sentiment') {
          return null;
        }
        return (
          <h3 key={index} className="text-[#FF6A00] text-xl font-semibold mt-6 mb-3">
            {cleanLine.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
          </h3>
        );
      }
      if (line.startsWith('-')) {
        return <li key={index} className="ml-4 mb-2">{line.substring(1).trim()}</li>;
      }
      if (line.startsWith('=')) return null;
      if (line.trim() === '') return <br key={index} />;
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  if (loading) {
    return <div className="text-white text-center p-8">Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-white text-center p-8">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#00ffff] text-black rounded hover:bg-[#00cccc]"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-black">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8 flex space-x-4">
          <button
            onClick={() => setActiveTab('meta')}
            className={`px-4 py-2 rounded ${
              activeTab === 'meta'
                ? 'bg-[#00ffff] text-black'
                : 'bg-[#131722] text-white'
            }`}
          >
            Meta Summary
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`px-4 py-2 rounded ${
              activeTab === 'newsletter'
                ? 'bg-[#00ffff] text-black'
                : 'bg-[#131722] text-white'
            }`}
          >
            Newsletter Summary
          </button>
          <button
            onClick={() => setActiveTab('youtube')}
            className={`px-4 py-2 rounded ${
              activeTab === 'youtube'
                ? 'bg-[#00ffff] text-black'
                : 'bg-[#131722] text-white'
            }`}
          >
            YouTube Summary
          </button>
        </div>

        <div className="bg-[#131722] p-8 rounded-lg border border-gray-800">
          <div className="text-white">
            {activeTab === 'meta' && formatContent(metaSummary)}
            {activeTab === 'newsletter' && formatContent(newsletterSummary)}
            {activeTab === 'youtube' && formatContent(youtubeSummary)}
          </div>
        </div>

        {/* Debug Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-900 rounded-lg border border-gray-700">
            <h4 className="text-white font-bold mb-2">Debug Messages:</h4>
            <pre className="text-xs text-gray-400 whitespace-pre-wrap">
              {debug.join('\n')}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default Intelligence; 