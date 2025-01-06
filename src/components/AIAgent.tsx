import React, { useState, useEffect } from 'react';

interface Summary {
  id: string;
  title: string;
  content: string;
}

const AIAgent: React.FC = () => {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      try {
        const response = await fetch('/dashboard_data/meta_summaries.json');
        if (!response.ok) {
          throw new Error('Failed to fetch summaries');
        }
        const data = await response.json();
        setSummaries(data);
        if (data.length > 0) {
          setSelectedSummary(data[0]);
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

  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-full bg-black p-8 max-w-7xl mx-auto">
        <div className="flex gap-8">
          {/* Left sidebar with summary list */}
          <div className="w-64 shrink-0 bg-gray-900 rounded-lg p-4">
            <h2 className="text-white text-xl mb-4">Meta Summaries</h2>
            <div className="space-y-2">
              {summaries.map((summary) => (
                <button
                  key={summary.id}
                  onClick={() => setSelectedSummary(summary)}
                  className={`w-full text-left px-4 py-2 rounded ${
                    selectedSummary?.id === summary.id
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {summary.title}
                </button>
              ))}
            </div>
          </div>

          {/* Right content area */}
          <div className="flex-1 bg-gray-900 rounded-lg p-6">
            {selectedSummary ? (
              <div>
                <h2 className="text-white text-2xl mb-4">{selectedSummary.title}</h2>
                <div className="text-gray-300 whitespace-pre-wrap">
                  {selectedSummary.content}
                </div>
              </div>
            ) : (
              <div className="text-gray-300">Select a summary to view its content</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgent; 