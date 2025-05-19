import React from 'react';

const PlansList = ({ plans, onEdit, onDelete }) => {
  const formatText = (text, maxLength = 20) => {
    if (!text) return '-';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  // Filter plans to show only today and tomorrow
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  const filteredPlans = plans.filter(plan => 
    plan.date === today || plan.date === tomorrowStr
  );

  if (filteredPlans.length === 0) {
    return (
      <div className="mt-8 text-center py-8 bg-gray-700/30 rounded-lg">
        <p className="text-gray-400">No plans for today or tomorrow yet.</p>
        <p className="text-sm text-gray-500 mt-1">Create a plan to get started</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <h3 className="text-lg font-medium text-white mb-4">Upcoming Plans</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map(plan => (
          <div key={plan.id} className="bg-gray-700 rounded-lg overflow-hidden shadow-lg border border-gray-600 hover:border-purple-500 transition-all">
            <div className="p-4 border-b border-gray-600 bg-gray-800">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-white">{plan.date}</h4>
                  {plan.date === today && (
                    <span className="text-xs text-green-400">Today</span>
                  )}
                  {plan.date === tomorrowStr && (
                    <span className="text-xs text-blue-400">Tomorrow</span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs capitalize ${
                  plan.sentiment === 'bullish' ? 'bg-green-900 text-green-300' :
                  plan.sentiment === 'bearish' ? 'bg-red-900 text-red-300' :
                  plan.sentiment === 'volatile' ? 'bg-yellow-900 text-yellow-300' :
                  'bg-gray-600 text-gray-300'
                }`}>
                  {plan.sentiment}
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Bias: <span className="text-white capitalize">{plan.bias.replace('-', ' ')}</span>
              </p>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <p className="text-xs text-gray-400">Support</p>
                  <p className="text-white font-medium">{plan.supportLevel || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Resistance</p>
                  <p className="text-white font-medium">{plan.resistanceLevel || '-'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Risk:Reward</p>
                  <p className="text-white font-medium">1:{plan.riskRewardRatio}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Max Risk</p>
                  <p className="text-white font-medium">{plan.maxCapitalRisk || '-'}%</p>
                </div>
              </div>
              
              <div className="mb-3">
                <p className="text-xs text-gray-400">Nifty Levels</p>
                <p className="text-white text-sm">{formatText(plan.niftyLevels, 50)}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-xs text-gray-400">Journal Notes</p>
                <p className="text-white text-sm">{formatText(plan.previousDayJournal, 70)}</p>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => onEdit(plan)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition text-sm"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(plan.id)}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansList;