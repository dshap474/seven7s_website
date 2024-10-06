import { useState } from 'react';
import { BarChart, Info, Mail, Home } from 'lucide-react';

// Placeholder components for each tab
const About = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">About</h2>
    <p>
      seven7s is an investment collective where participants believe together they can reach financial freedom faster than separately
    </p>
  </div>
);

const Contact = () => (
  <div className="p-4">
    <h2 className="text-xl font-bold mb-4">Contact</h2>
    <p>
      Connect with us on{' '}
      <a
        href="https://x.com/_______seven7s"
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        X
      </a>
    </p>
  </div>
);

const Dashboard = () => <div className="p-4">Dashboard content goes here</div>;

const LaunchPage = () => (
  <div className="bg-black flex items-center justify-center h-full">
    <h1 className="text-6xl font-bold text-white">seven7s</h1>
  </div>
);

const tabs = [
  { name: 'Launch', icon: Home, component: LaunchPage },
  { name: 'Dashboard', icon: BarChart, component: Dashboard },
  { name: 'About', icon: Info, component: About },
  { name: 'Contact', icon: Mail, component: Contact },
];

function App() {
  const [activeTab, setActiveTab] = useState('Launch');

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-gray-300 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between items-center">
          <button
            onClick={() => setActiveTab('Launch')}
            className="text-2xl font-bold text-gray-900 hover:text-gray-700"
          >
            seven7s
          </button>
          <nav>
            <div className="flex space-x-4">
              {tabs.slice(1).map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center px-3 py-2 text-sm font-medium ${
                    activeTab === tab.name
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-700 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="mr-2 h-5 w-5" />
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
