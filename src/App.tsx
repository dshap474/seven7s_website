import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import Plot from 'react-plotly.js';

// Updated Objective Function component
const ObjectiveFunction = () => (
  <div className="text-white flex items-center justify-center h-full">
    <div className="text-center">
      <p className="max-w-2xl">
        seven7s is a collective of individuals participating in open-source collaboration with the objective of achieving escape velocity.
      </p>
    </div>
  </div>
);

const Contact = () => (
  <div className="text-white flex items-center justify-center h-full">
    <div className="text-center">
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

const Analytics = () => {
  return (
    <div className="text-white flex flex-col items-center justify-center h-full w-full">
      <h2 className="text-3xl font-bold mb-4">Analytics</h2>
      <div className="w-full h-[calc(100vh-120px)]"> {/* Adjust height as needed */}
        <iframe
          src="http://127.0.0.1:8050/"
          title="Dash Dashboard"
          width="100%"
          height="100%"
          style={{ border: 'none' }}
        />
      </div>
    </div>
  );
};

const LaunchPage = () => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-6xl font-bold text-white">
      seven<span style={{ color: '#00FF00' }}>7</span>s
    </h1>
  </div>
);

interface DataPoint {
  date: string;
  value: number;
}

const Dashboard = () => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/dashboard_data/total_open_interest.csv');
        if (!response.ok) {
          throw new Error('Failed to fetch data');
        }
        const text = await response.text();
        const rows = text.split('\n').slice(1);
        const parsedData = rows
          .filter(row => row.trim() !== '')
          .map(row => {
            const [date, value] = row.split(',');
            return { date, value: parseFloat(value) };
          });
        setData(parsedData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="text-white">Loading...</div>;
  }

  if (error) {
    return <div className="text-white">{error}</div>;
  }

  return (
    <div className="text-white flex flex-col items-center justify-center h-full w-full">
      <h2 className="text-3xl font-bold mb-4">Dashboard</h2>
      <div className="w-full h-[calc(100vh-120px)]">
        {data.length > 0 ? (
          <Plot
            data={[
              {
                x: data.map(item => item.date),
                y: data.map(item => item.value),
                type: 'scatter',
                mode: 'lines+markers',
                marker: {color: '#00FF00'},
              },
            ]}
            layout={{
              title: 'Total Open Interest',
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#FFFFFF' },
              xaxis: { title: 'Date' },
              yaxis: { title: 'Open Interest' },
            }}
            style={{ width: '100%', height: '100%' }}
          />
        ) : (
          <div className="text-white">No data available</div>
        )}
      </div>
    </div>
  );
};

const tabs = [
  { name: 'Launch', icon: Home, component: LaunchPage },
  { name: 'Objective Function', component: ObjectiveFunction },
  { name: 'Analytics', component: Analytics },
  { name: 'Dashboard', component: Dashboard },
  { name: 'Contact', component: Contact },
];

function App() {
  const [activeTab, setActiveTab] = useState('Launch');

  useEffect(() => {
    document.title = "seven7s";
    
    // Add favicon
    let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = '/7s_text.png';

    // Add apple touch icon
    let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
    if (!appleLink) {
      appleLink = document.createElement('link');
      appleLink.rel = 'apple-touch-icon';
      document.head.appendChild(appleLink);
    }
    appleLink.href = '/7s_text.png';

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
      <header className="bg-black h-16 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-4 flex justify-between items-center">
          <button
            onClick={() => setActiveTab('Launch')}
            className="text-2xl font-bold text-white hover:text-gray-200"
          >
            seven<span style={{ color: '#00FF00' }}>7</span>s
          </button>
          <nav>
            <div className="flex space-x-4">
              {tabs.slice(1).map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`px-3 py-2 text-sm font-medium ${
                    activeTab === tab.name
                      ? 'text-blue-300 border-b-2 border-blue-300'
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

      <div className="h-1 bg-[#8E8E93]"></div>

      <main className="flex-grow bg-black overflow-hidden">
        <div className="h-full">
          {tabs.find((tab) => tab.name === activeTab)?.component()}
        </div>
      </main>
    </div>
  );
}

export default App;