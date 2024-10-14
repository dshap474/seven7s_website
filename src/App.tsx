import React, { useState, useEffect } from 'react';
import DataChart from './components/DataChart';

// Updated Objective Function component
const ObjectiveFunction = () => (
  <div className="text-white flex items-center justify-center h-full">
    <div className="text-center">
      <p className="max-w-2xl">
        AI is set to dramatically change our lives. Irrespective of whether we reach superintelligence, this technology will irreversibly alter the fabric of our reality—reshaping industries, economies, and even the way we understand human potential. As we enter the 4th Industrial Revolution, the scale of transformation ahead is staggering, yet with it comes opportunity. Those with the foresight to act and the situational awareness to leverage the intelligence explosion will find themselves in positions of unparalleled advantage, accumulating resources at a pace never before seen. But those who fail to act, lulled by the comforts of predictability, risk being left behind in this rapidly shifting landscape.

        Together, as a collective intelligence, we can navigate this change and maximize our chances of success. This is not a zero-sum game—collaboration amplifies our potential and ensures that we are not merely spectators but active participants in the coming shift. Seven7s is a collective of individuals dedicated to open-source collaboration, united by a shared vision of reaching financial escape velocity.
      </p>
    </div>
  </div>
);

const Contact = () => (
  <div className="text-white flex items-center justify-center h-full">
    <div className="text-center">
      <p className="text-2xl mb-4">Twitter:</p>
      <a
        href="https://x.com/_______seven7s"
        target="_blank"
        rel="noopener noreferrer"
        className="text-6xl font-bold text-blue-300 hover:text-blue-400 transition-colors"
      >
        X
      </a>
    </div>
  </div>
);

const Strategies = () => (
  <div className="text-white flex items-center justify-center h-full">
    <h2 className="text-3xl font-bold">Trading strategies</h2>
  </div>
);

const LaunchPage = () => (
  <div className="relative flex flex-col items-center justify-center h-full overflow-hidden">
    <div className="absolute inset-0 flex items-center justify-center">
      <img 
        src="/god_particle.png" 
        alt="God Particle" 
        className="w-[70%] h-[70%] object-contain"
      />
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      <h1 className="text-white text-7xl font-bold"></h1>
    </div>
  </div>
);

interface ChartData {
  index: string;
  [key: string]: string | number;
  btc_price: number;
}

interface DashboardData {
  [key: string]: ChartData[];
}

const Analytics: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const files = [
          'total_oi.json',
          'total_oi_normalized.json',
          'altcoin_oi.json',
          'altcoin_oi_normalized.json',
          'altcoin_speculation_index.json',
          'crypto_breadth_50D.json',
          'crypto_breadth_20W.json',
          'crypto_breadth_1Y.json',
          'fear_greed_index.json',
          'fear_greed_index_90D.json'
        ];

        const fetchedData: DashboardData = {};

        for (const file of files) {
          const response = await fetch(`/dashboard_data/${file}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch ${file}`);
          }
          const jsonData: ChartData[] = await response.json();
          fetchedData[file.replace('.json', '')] = jsonData;
        }

        setData(fetchedData);
      } catch (err) {
        setError(`Failed to load data: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="text-white">Loading...</div>;
  if (error) return <div className="text-white">Error: {error}</div>;
  if (!data) return <div className="text-white">No data available</div>;

  return (
    <div className="text-white p-4 overflow-y-auto h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="bg-[#131722] p-4 rounded-lg h-[600px] border border-gray-800">
            <div className="h-full">
              <DataChart data={value} title={key.replace(/_/g, ' ')} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const tabs = [
  { name: 'Launch', component: LaunchPage },
  { name: 'Objective Function', component: ObjectiveFunction },
  { name: 'Analytics', component: Analytics },
  { name: 'Strategies', component: Strategies },
  { name: 'Contact', component: Contact },
];

function App() {
  const [activeTab, setActiveTab] = useState('Launch');

  useEffect(() => {
    document.title = "seven7s";
    
    // Add favicon with rounded corners
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = '/7s_gradient_rounded.png';

    // Add apple touch icon with rounded corners
    let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = '/7s_gradient_rounded.png';

    // Add web manifest
    let manifestLink = document.querySelector("link[rel='manifest']") as HTMLLinkElement;
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      document.head.appendChild(manifestLink);
    }
    manifestLink.href = '/site.webmanifest';
  }, []);

  return (
    <div className="flex flex-col h-screen bg-black">
      <header className="bg-black text-white p-4 h-14 border-b border-gray-400">
        <div className="max-w-7xl w-full mx-auto px-4 flex justify-between items-center h-full">
          <button
            onClick={() => setActiveTab('Launch')}
            className="text-2xl font-bold text-white hover:text-gray-200"
          >
            seven<span style={{ color: 'rgb(0, 255, 255)' }}>7</span>s
          </button>
          <nav>
            <div className="flex space-x-4">
              {tabs.slice(1).map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === tab.name
                      ? 'text-blue-300 border-b-4 border-blue-300'
                      : 'text-white hover:text-gray-200 hover:border-gray-200'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </nav>
        </div>
      </header>
      <main className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto">
          {React.createElement(tabs.find((tab) => tab.name === activeTab)?.component || (() => null))}
        </div>
      </main>
    </div>
  );
}

export default App;
