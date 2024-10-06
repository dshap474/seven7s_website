import { useState } from 'react';
import { Home } from 'lucide-react';

// Placeholder components for each tab
const About = () => (
  <div className="bg-black text-white h-full flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">About</h2>
      <p className="max-w-2xl">
        seven7s is an investment collective where participants believe together they can reach financial freedom faster than separately
      </p>
    </div>
  </div>
);

const Contact = () => (
  <div className="bg-black text-white h-full flex items-center justify-center">
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
  <div className="bg-black text-white h-full flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-3xl font-bold mb-4">Analytics</h2>
      <p>Analytics content goes here</p>
    </div>
  </div>
);

const LaunchPage = () => (
  <div className="bg-black flex items-center justify-center h-full">
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

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-[#8E8E93] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
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

      <main className="flex-grow">
        {tabs.find((tab) => tab.name === activeTab)?.component()}
      </main>
    </div>
  );
}

export default App;
