import { useState } from 'react';
import { BarChart, Info, Mail } from 'lucide-react';

// Placeholder components for each tab
const About = () => <div className="p-4">About content goes here</div>;

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

const tabs = [
  { name: 'Dashboard', icon: BarChart, component: Dashboard },
  { name: 'About', icon: Info, component: About },
  { name: 'Contact', icon: Mail, component: Contact },
];

function App() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">seven7s</h1>
        </div>
      </header>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-4">
              {tabs.map((tab) => (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center px-3 py-2 text-sm font-medium ${
                    activeTab === tab.name
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="mr-2 h-5 w-5" />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {tabs.find((tab) => tab.name === activeTab)?.component()}
        </div>
      </main>
    </div>
  );
}

export default App;
