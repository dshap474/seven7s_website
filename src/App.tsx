import { useState } from 'react'
import { BarChart, BookOpen, Info, Mail, PieChart } from 'lucide-react'

// Placeholder components for each tab
const Blog = () => <div className="p-4">Blog content goes here</div>
const Research = () => <div className="p-4">Research content goes here</div>
const Analytics = () => <div className="p-4">Analytics content goes here</div>
const About = () => <div className="p-4">About content goes here</div>
const Contact = () => <div className="p-4">Contact content goes here</div>

const tabs = [
  { name: 'Blog', icon: BookOpen, component: Blog },
  { name: 'Research', icon: PieChart, component: Research },
  { name: 'Analytics', icon: BarChart, component: Analytics },
  { name: 'About', icon: Info, component: About },
  { name: 'Contact', icon: Mail, component: Contact },
]

function App() {
  const [activeTab, setActiveTab] = useState('Blog')

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
          {tabs.find(tab => tab.name === activeTab)?.component()}
        </div>
      </main>
    </div>
  )
}

export default App
