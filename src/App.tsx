import React, { useState } from 'react'
import { BarChart, BookOpen, Info, Mail, PieChart } from 'lucide-react'

// Placeholder components for each tab
const Blog = () => <div className="p-4">Blog content goes here</div>
const Research = () => <div className="p-4">Research content goes here</div>
const Analytics = () => <div className="p-4">Analytics content goes here</div>
const About = () => <div className="p-4">About content goes here</div>
const Contacts = () => <div className="p-4">Contacts content goes here</div>

const tabs = [
  { name: 'Blog', icon: BookOpen, component: Blog },
  { name: 'Research', icon: PieChart, component: Research },
  { name: 'Analytics', icon: BarChart, component: Analytics },
  { name: 'About', icon: Info, component: About },
  { name: 'Contacts', icon: Mail, component: Contacts },
]

function App() {
  const [activeTab, setActiveTab] = useState('Blog')

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between">
            <div className="flex space-x-7">
              <div>
                <a href="#" className="flex items-center py-4 px-2">
                  <span className="font-semibold text-gray-500 text-lg">Seven7s Dashboard</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white h-screen shadow-lg">
          <ul className="py-4">
            {tabs.map((tab) => (
              <li key={tab.name} className="px-5 py-2">
                <button
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center w-full text-left px-4 py-2 rounded-lg ${
                    activeTab === tab.name ? 'bg-blue-500 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="mr-3 h-5 w-5" />
                  {tab.name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Main content */}
        <div className="flex-1 p-10">
          <h1 className="text-3xl font-semibold mb-5">{activeTab}</h1>
          {tabs.find(tab => tab.name === activeTab)?.component()}
        </div>
      </div>
    </div>
  )
}

export default App
