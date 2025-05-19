import { useState, useEffect } from 'react';

const MorningPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [plannerData, setPlannerData] = useState({
    date: new Date().toISOString().split('T')[0],
    sentiment: 'neutral',
    supportLevel: '',
    resistanceLevel: '',
    niftyLevels: '',
    bias: 'both',
    riskRewardRatio: '2',
    maxCapitalRisk: '',
    maxTrades: '',
    previousDayJournal: ''
  });

  // Load plans from localStorage on component mount
  useEffect(() => {
    const savedPlans = localStorage.getItem('morningPlans');
    if (savedPlans) {
      setPlans(JSON.parse(savedPlans));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlannerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingId) {
      // Update existing plan
      const updatedPlans = plans.map(plan => 
        plan.id === editingId ? { ...plannerData, id: editingId } : plan
      );
      setPlans(updatedPlans);
      localStorage.setItem('morningPlans', JSON.stringify(updatedPlans));
      setEditingId(null);
    } else {
      // Create new plan
      const newPlan = {
        ...plannerData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString()
      };
      const updatedPlans = [newPlan, ...plans];
      setPlans(updatedPlans);
      localStorage.setItem('morningPlans', JSON.stringify(updatedPlans));
    }
    
    // Reset form
    setPlannerData({
      date: new Date().toISOString().split('T')[0],
      sentiment: 'neutral',
      supportLevel: '',
      resistanceLevel: '',
      niftyLevels: '',
      bias: 'both',
      riskRewardRatio: '2',
      maxCapitalRisk: '',
      maxTrades: '',
      previousDayJournal: ''
    });
    
    alert(`Plan ${editingId ? 'updated' : 'saved'} successfully!`);
  };

  const handleEdit = (plan) => {
    setPlannerData(plan);
    setEditingId(plan.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      const updatedPlans = plans.filter(plan => plan.id !== id);
      setPlans(updatedPlans);
      localStorage.setItem('morningPlans', JSON.stringify(updatedPlans));
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setPlannerData({
      date: new Date().toISOString().split('T')[0],
      sentiment: 'neutral',
      supportLevel: '',
      resistanceLevel: '',
      niftyLevels: '',
      bias: 'both',
      riskRewardRatio: '2',
      maxCapitalRisk: '',
      maxTrades: '',
      previousDayJournal: ''
    });
  };

  return (
    <div className="card bg-gray-800 rounded-lg overflow-hidden mb-6">
      <div className="card-header p-5 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Morning Trading Plan</h2>
        <p className="text-sm text-gray-400">Set your intentions and parameters for today's trading session</p>
      </div>
      
      <div className="card-content p-5">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={plannerData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                required
              />
            </div>
            
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Market Sentiment</label>
              <select
                name="sentiment"
                value={plannerData.sentiment}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="bullish">Bullish</option>
                <option value="bearish">Bearish</option>
                <option value="neutral">Neutral</option>
                <option value="volatile">Volatile</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Support Level</label>
              <input
                type="number"
                name="supportLevel"
                value={plannerData.supportLevel}
                onChange={handleChange}
                placeholder="e.g., 21500"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Resistance Level</label>
              <input
                type="number"
                name="resistanceLevel"
                value={plannerData.resistanceLevel}
                onChange={handleChange}
                placeholder="e.g., 22000"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            
            <div className="form-group md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Important Nifty Levels</label>
              <textarea
                name="niftyLevels"
                value={plannerData.niftyLevels}
                onChange={handleChange}
                rows="2"
                placeholder="List key price levels you're watching..."
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Trading Bias</label>
              <select
                name="bias"
                value={plannerData.bias}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="long-only">Long Only</option>
                <option value="short-only">Short Only</option>
                <option value="both">Both Long & Short</option>
                <option value="neutral">Neutral (No Bias)</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Min Risk:Reward Ratio</label>
              <select
                name="riskRewardRatio"
                value={plannerData.riskRewardRatio}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="1">1:1</option>
                <option value="1.5">1:1.5</option>
                <option value="2">1:2</option>
                <option value="2.5">1:2.5</option>
                <option value="3">1:3</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Max Capital Risk (%)</label>
              <input
                type="number"
                name="maxCapitalRisk"
                value={plannerData.maxCapitalRisk}
                onChange={handleChange}
                placeholder="e.g., 2"
                min="0"
                max="100"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Max # of Trades</label>
              <input
                type="number"
                name="maxTrades"
                value={plannerData.maxTrades}
                onChange={handleChange}
                placeholder="e.g., 3"
                min="1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
            
            <div className="form-group md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Previous Day Journal</label>
              <textarea
                name="previousDayJournal"
                value={plannerData.previousDayJournal}
                onChange={handleChange}
                rows="3"
                placeholder="What did you learn yesterday that you can apply today?"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>
          
          <div className="mt-6 flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              {editingId ? 'Update Plan' : 'Save Plan'}
            </button>
          </div>
        </form>

        {plans.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Saved Plans</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th className="p-3 text-sm text-gray-400">Date</th>
                    <th className="p-3 text-sm text-gray-400">Sentiment</th>
                    <th className="p-3 text-sm text-gray-400">Support</th>
                    <th className="p-3 text-sm text-gray-400">Resistance</th>
                    <th className="p-3 text-sm text-gray-400">Nifty Levels</th>
                    <th className="p-3 text-sm text-gray-400">Bias</th>
                    <th className="p-3 text-sm text-gray-400">R:R Ratio</th>
                    <th className="p-3 text-sm text-gray-400">Max Risk %</th>
                    <th className="p-3 text-sm text-gray-400">Max Trades</th>
                    <th className="p-3 text-sm text-gray-400">Journal</th>
                    <th className="p-3 text-sm text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="p-3 text-white">{plan.date}</td>
                      <td className="p-3 text-white capitalize">{plan.sentiment}</td>
                      <td className="p-3 text-white">{plan.supportLevel || '-'}</td>
                      <td className="p-3 text-white">{plan.resistanceLevel || '-'}</td>
                      <td className="p-3 text-white max-w-xs truncate" title={plan.niftyLevels}>
                        {plan.niftyLevels || '-'}
                      </td>
                      <td className="p-3 text-white capitalize">
                        {plan.bias.replace('-', ' ')}
                      </td>
                      <td className="p-3 text-white">1:{plan.riskRewardRatio}</td>
                      <td className="p-3 text-white">{plan.maxCapitalRisk || '-'}%</td>
                      <td className="p-3 text-white">{plan.maxTrades || '-'}</td>
                      <td className="p-3 text-white max-w-xs truncate" title={plan.previousDayJournal}>
                        {plan.previousDayJournal || '-'}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(plan)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
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

export default MorningPlanner;