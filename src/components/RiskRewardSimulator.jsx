import { useState, useEffect } from 'react';

const RiskRewardSimulator = () => {
  const [simulations, setSimulations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [simulationData, setSimulationData] = useState({
    winRate: 50,
    riskPerTrade: 1000,
    rewardRatio: 2,
    numTrades: 20
  });
  const [results, setResults] = useState(null);

  // Load simulations from localStorage
  useEffect(() => {
    const savedSimulations = localStorage.getItem('riskRewardSimulations');
    if (savedSimulations) {
      setSimulations(JSON.parse(savedSimulations));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSimulationData(prev => ({
      ...prev,
      [name]: parseFloat(value)
    }));
  };

  const simulateTrades = () => {
    const { winRate, riskPerTrade, rewardRatio, numTrades } = simulationData;
    
    if (isNaN(riskPerTrade)) {
      alert('Please enter a valid risk per trade amount');
      return;
    }
    
    if (isNaN(numTrades)) {
      alert('Please enter a valid number of trades');
      return;
    }
    
    const trades = [];
    let winCount = 0;
    let lossCount = 0;
    let netPnL = 0;
    
    for (let i = 0; i < numTrades; i++) {
      const isWin = Math.random() * 100 < winRate;
      
      if (isWin) {
        winCount++;
        const profit = riskPerTrade * rewardRatio;
        netPnL += profit;
        trades.push({ win: true, amount: profit });
      } else {
        lossCount++;
        netPnL -= riskPerTrade;
        trades.push({ win: false, amount: -riskPerTrade });
      }
    }
    
    const result = {
      netPnL,
      trades,
      winCount,
      lossCount,
      actualWinRate: (winCount / numTrades) * 100
    };
    
    setResults(result);

    if (editingId) {
      // Update existing simulation
      const updatedSimulations = simulations.map(sim => 
        sim.id === editingId ? { ...simulationData, id: editingId, result } : sim
      );
      setSimulations(updatedSimulations);
      localStorage.setItem('riskRewardSimulations', JSON.stringify(updatedSimulations));
      setEditingId(null);
    } else {
      // Create new simulation
      const newSimulation = {
        ...simulationData,
        id: Date.now().toString(),
        result,
        createdAt: new Date().toISOString()
      };
      const updatedSimulations = [newSimulation, ...simulations];
      setSimulations(updatedSimulations);
      localStorage.setItem('riskRewardSimulations', JSON.stringify(updatedSimulations));
    }
  };

  const handleEdit = (simulation) => {
    setSimulationData({
      winRate: simulation.winRate,
      riskPerTrade: simulation.riskPerTrade,
      rewardRatio: simulation.rewardRatio,
      numTrades: simulation.numTrades
    });
    setResults(simulation.result);
    setEditingId(simulation.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this simulation?')) {
      const updatedSimulations = simulations.filter(sim => sim.id !== id);
      setSimulations(updatedSimulations);
      localStorage.setItem('riskRewardSimulations', JSON.stringify(updatedSimulations));
      
      if (editingId === id) {
        setEditingId(null);
        setSimulationData({
          winRate: 50,
          riskPerTrade: 1000,
          rewardRatio: 2,
          numTrades: 20
        });
        setResults(null);
      }
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setSimulationData({
      winRate: 50,
      riskPerTrade: 1000,
      rewardRatio: 2,
      numTrades: 20
    });
    setResults(null);
  };

  return (
    <div className="card bg-gray-800 rounded-lg overflow-hidden mb-6">
      <div className="card-header p-5 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Risk:Reward Simulator</h2>
        <p className="text-sm text-gray-400">Calculate expected outcomes based on your win rate and risk:reward ratio</p>
      </div>
      
      <div className="card-content p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group md:col-span-2">
            <label className="block text-sm text-gray-400 mb-1">
              Win Rate: {simulationData.winRate}%
            </label>
            <input
              type="range"
              name="winRate"
              min="30"
              max="80"
              value={simulationData.winRate}
              onChange={handleChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="form-group">
            <label className="block text-sm text-gray-400 mb-1">Risk Per Trade (₹)</label>
            <input
              type="number"
              name="riskPerTrade"
              value={simulationData.riskPerTrade}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
          
          <div className="form-group">
            <label className="block text-sm text-gray-400 mb-1">
              Reward:Risk Ratio: {simulationData.rewardRatio}
            </label>
            <input
              type="range"
              name="rewardRatio"
              min="1"
              max="5"
              step="0.5"
              value={simulationData.rewardRatio}
              onChange={handleChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="form-group">
            <label className="block text-sm text-gray-400 mb-1">Number of Trades</label>
            <input
              type="number"
              name="numTrades"
              value={simulationData.numTrades}
              onChange={handleChange}
              min="10"
              max="100"
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end gap-2">
          {editingId && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
            >
              Cancel
            </button>
          )}
          <button
            onClick={simulateTrades}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            {editingId ? 'Update Simulation' : 'Run Simulation'}
          </button>
        </div>
        
        {results && (
          <div className="mt-6">
            <h3 className="text-lg font-medium text-white mb-4">Simulation Results</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="stat-card bg-gray-700 p-4 rounded text-center">
                <div className="text-sm text-gray-400">Net P&L</div>
                <div className={`text-xl font-bold ${results.netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ₹{results.netPnL.toLocaleString()}
                </div>
              </div>
              
              <div className="stat-card bg-gray-700 p-4 rounded text-center">
                <div className="text-sm text-gray-400">Expected Win Rate</div>
                <div className="text-white">
                  {results.actualWinRate.toFixed(1)}%
                </div>
              </div>
              
              <div className="stat-card bg-gray-700 p-4 rounded text-center">
                <div className="text-sm text-gray-400">Win/Loss Ratio</div>
                <div className="text-white">
                  {results.winCount}W / {results.lossCount}L
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h4 className="text-white mb-2">Trade Sequence</h4>
              <div className="flex flex-wrap gap-2">
                {results.trades.map((trade, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-xs ${
                      trade.win ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={`Trade ${i+1}: ${trade.win ? 'Win' : 'Loss'} (₹${Math.abs(trade.amount)})`}
                  >
                    {i+1}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="analysis-section bg-gray-700 p-4 rounded">
              <p className="text-sm text-gray-400">
                With a {simulationData.winRate}% win rate and a 1:{simulationData.rewardRatio} risk-reward ratio:
              </p>
              <p className="text-white mt-2">
                {results.netPnL >= 0 
                  ? `This system is profitable. Expected outcome is positive at approximately ₹${results.netPnL.toLocaleString()} per ${simulationData.numTrades} trades.` 
                  : `This system is not profitable. Expected outcome is negative at approximately ₹${Math.abs(results.netPnL).toLocaleString()} per ${simulationData.numTrades} trades.`
                }
              </p>
              <p className="text-purple-400 mt-2">
                {simulationData.winRate < 50 && simulationData.rewardRatio >= 2
                  ? "Even with a win rate below 50%, you can be profitable with this R:R ratio!"
                  : simulationData.winRate >= 50 && simulationData.rewardRatio < 2
                  ? "Consider increasing your R:R ratio to maximize your edge."
                  : "Your win rate and R:R ratio make a good combination."
                }
              </p>
            </div>
          </div>
        )}

        {simulations.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Saved Simulations</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th className="p-3 text-sm text-gray-400">Date</th>
                    <th className="p-3 text-sm text-gray-400">Win Rate</th>
                    <th className="p-3 text-sm text-gray-400">R:R Ratio</th>
                    <th className="p-3 text-sm text-gray-400">Result</th>
                    <th className="p-3 text-sm text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {simulations.map(sim => (
                    <tr key={sim.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="p-3 text-white">
                        {new Date(sim.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3 text-white">{sim.winRate}%</td>
                      <td className="p-3 text-white">1:{sim.rewardRatio}</td>
                      <td className="p-3">
                        <span className={`px-2 py-1 rounded text-xs ${
                          sim.result.netPnL >= 0 ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          ₹{sim.result.netPnL.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(sim)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(sim.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RiskRewardSimulator;