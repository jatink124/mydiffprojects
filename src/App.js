import { useState } from 'react';
import MorningPlanner from './components/MorningPlanner';
import RiskRewardSimulator from './components/RiskRewardSimulator';
import TradeJournal from './components/TradeJournal';
import Checklist from './components/CheckList';
import Dashboard from './components/Dashboard';
import Mindset from './components/Mindset';
import ShowMorningPlanner from './components/UpcomingPlans';
import UpcomingPlans from './components/UpcomingPlans';

const App = () => {
  const [activeTab, setActiveTab] = useState('planner');

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="sticky top-0 z-50 w-full bg-gray-900 border-b border-gray-800 py-2">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">Nifty Trader Compass</h1>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Welcome, Trader</span>
              </div>
            </div>
            
            <div className="tabs w-full">
              <div className="grid grid-cols-2 md:grid-cols-6 w-full bg-gray-800/50 rounded h-auto">
                <button
                  className={`tab-button flex items-center justify-center gap-1 p-2 rounded ${activeTab === 'planner' ? 'bg-purple-600' : ''}`}
                  onClick={() => setActiveTab('planner')}
                >
                  <span>Morning Planner</span>
                </button>
                     <button
                  className={`tab-button flex items-center justify-center gap-1 p-2 rounded ${activeTab === 'showplanner' ? 'bg-purple-600' : ''}`}
                  onClick={() => setActiveTab('showplanner')}
                >
                  <span>Show Morning Planner</span>
                </button>
                <button
                  className={`tab-button flex items-center justify-center gap-1 p-2 rounded ${activeTab === 'simulator' ? 'bg-purple-600' : ''}`}
                  onClick={() => setActiveTab('simulator')}
                >
                  <span>R:R Simulator</span>
                </button>
                <button
                  className={`tab-button flex items-center justify-center gap-1 p-2 rounded ${activeTab === 'tradejoural' ? 'bg-purple-600' : ''}`}
                  onClick={() => setActiveTab('tradejoural')}
                >
                  <span>Trade Journal</span>
                </button>
                <button
                  className={`tab-button flex items-center justify-center gap-1 p-2 rounded ${activeTab === 'checklist' ? 'bg-purple-600' : ''}`}
                  onClick={() => setActiveTab('checklist')}
                >
                  <span>Check List</span>
                </button>
                <button
                  className={`tab-button flex items-center justify-center gap-1 p-2 rounded ${activeTab === 'dashboard' ? 'bg-purple-600' : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <span>Dashboard</span>
                </button>
                <button
                  className={`tab-button flex items-center justify-center gap-1 p-2 rounded ${activeTab === 'mindset' ? 'bg-purple-600' : ''}`}
                  onClick={() => setActiveTab('mindset')}
                >
                  <span>Mindset</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-6">
        {activeTab === 'planner' && <MorningPlanner />}
        {activeTab === 'showplanner' && <UpcomingPlans/>}
        {activeTab === 'simulator' && <RiskRewardSimulator />}
        {activeTab === 'tradejoural' && <TradeJournal/>}
        {activeTab === 'checklist' && <Checklist/>}
        {activeTab === 'dashboard' && <Dashboard/>}
        {activeTab === 'checklist' && <Mindset/>}
      </main>
      
      <footer className="py-4 bg-gray-900 text-gray-400 text-center text-sm">
        <p>Nifty Trader Compass - Trade with discipline and confidence</p>
      </footer>
    </div>
  );
};

export default App;