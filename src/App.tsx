import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

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
      <h2 className="text-3xl font-bold mb-4">Contact</h2>
      <p>
        Connect with us on{' '}
        <a
          href="https://x.com/_______seven7s"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-300 hover:underline"
        >
          X
        </a>
      </p>
    </div>
  </div>
);

const Analytics = () => {
  const [data, setData] = useState<Record<string, any>>({});

  useEffect(() => {
    fetch('/dashboard_json_data/data.json')
      .then(response => response.json())
      .then(jsonData => {
        setData(jsonData);
      })
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  const prepareChartData = (dataArray: any[]) => {
    const labels = dataArray.map((item: any) => item.date);
    const values = dataArray.map((item: any) => item.total_dollar_oi);
    return { labels, values };
  };

  return (
    <div className="text-white flex flex-col items-center justify-center h-full overflow-y-auto p-4">
      <h2 className="text-3xl font-bold mb-4">Analytics</h2>
      
      {Object.keys(data).length === 0 ? (
        <p>Loading data...</p>
      ) : (
        Object.entries(data).map(([key, value]) => {
          if (Array.isArray(value) && value.length > 0 && 'date' in value[0] && 'total_dollar_oi' in value[0]) {
            const { labels, values } = prepareChartData(value);
            return (
              <div key={key} className="w-full max-w-3xl mb-8">
                <h3 className="text-xl font-semibold mb-2">{key}</h3>
                <Line
                  data={{
                    labels: labels,
                    datasets: [
                      {
                        label: key,
                        data: values,
                        borderColor: 'rgb(75, 192, 192)',
                        tension: 0.1,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: {
                        position: 'top' as const,
                      },
                      title: {
                        display: true,
                        text: key,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: false,
                        ticks: {
                          callback: function(value: number | string) {
                            if (typeof value === 'number') {
                              return (value / 1e9).toFixed(2) + 'B';
                            }
                            return value;
                          }
                        }
                      }
                    }
                  }}
                />
              </div>
            );
          }
          return null;
        })
      )}
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

const tabs = [
  { name: 'Launch', icon: Home, component: LaunchPage },
  { name: 'Objective Function', component: ObjectiveFunction },
  { name: 'Analytics', component: Analytics },
  { name: 'Contact', component: Contact },
];

function App() {
  const [activeTab, setActiveTab] = useState('Launch');

  useEffect(() => {
    document.title = "seven7s";
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
