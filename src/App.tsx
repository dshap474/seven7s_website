import { useState, useEffect } from 'react';
import { Home } from 'lucide-react';

// Placeholder components for each tab
const About = () => (
  <div className="text-white flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">About</h2>
      <p className="max-w-2xl">
        seven7s is an investment collective dedicated to achieving financial freedom through open-source collaboration.
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

const Analytics = () => (
  <div className="text-white flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">Analytics</h2>
      <p>Analytics content goes here</p>
    </div>
  </div>
);

const LaunchPage = () => (
  <div className="flex items-center justify-center h-full">
    <h1 className="text-6xl font-bold text-white">
      seven<span style={{ color: '#00FF00' }}>7</span>s
    </h1>
  </div>
);

const tabs = [
  { name: 'Launch', icon: Home, component: LaunchPage },
  { name: 'About', component: About },
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
