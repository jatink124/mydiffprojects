import React, { useState, useEffect } from 'react';

const UpcomingPlans = () => {
  const [tradingPlans, setTradingPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Retrieve saved plans from localStorage when component mounts
  useEffect(() => {
    const storedPlans = localStorage.getItem('morningPlans');
    if (storedPlans) {
      setTradingPlans(JSON.parse(storedPlans));
    }
    setIsLoading(false);
  }, []);

  // Prepare dates for filtering
  const currentDate = new Date().toISOString().split('T')[0];
  const nextDay = new Date();
  nextDay.setDate(nextDay.getDate() + 1);
  const nextDayFormatted = nextDay.toISOString().split('T')[0];

  // Filter and sort plans for display
  const visiblePlans = tradingPlans
    .filter(plan => plan.date === currentDate || plan.date === nextDayFormatted)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  // Loading state display
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Empty state display
  if (visiblePlans.length === 0) {
    return (
      <div className="mt-8 text-center py-12 bg-gray-800/50 rounded-lg border border-gray-700">
        <p className="text-gray-400 text-lg">No trading plans scheduled</p>
        <p className="text-sm text-gray-500 mt-2">Add a new plan to begin</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white mb-6">Upcoming Trading Strategies</h2>
      
      {visiblePlans.map(plan => (
        <div key={plan.id} className="bg-gray-800 rounded-lg overflow-hidden shadow-lg border border-gray-700">
          {/* Plan Header Section */}
          <div className="p-5 border-b border-gray-700 bg-gray-900">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">
                  {plan.date === currentDate ? "Today's Strategy" : "Tomorrow's Strategy"} - {plan.date}
                </h3>
                <div className="flex items-center mt-1 space-x-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    plan.sentiment === 'bullish' ? 'bg-green-900 text-green-300' :
                    plan.sentiment === 'bearish' ? 'bg-red-900 text-red-300' :
                    plan.sentiment === 'volatile' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-gray-700 text-gray-300'
                  }`}>
                    {plan.sentiment.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-purple-900 text-purple-300 rounded-full text-xs font-medium">
                    TRADING BIAS: {plan.bias.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Details Section */}
          <div className="p-5 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Technical Levels Card */}
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-3">TECHNICAL LEVELS</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Primary Support</p>
                    <p className="text-white font-medium text-lg">{plan.supportLevel || 'Not defined'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Primary Resistance</p>
                    <p className="text-white font-medium text-lg">{plan.resistanceLevel || 'Not defined'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Nifty Key Levels</p>
                    <p className="text-white mt-1">{plan.niftyLevels || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              {/* Risk Parameters Card */}
              <div className="bg-gray-700/50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-3">RISK PARAMETERS</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-500">Risk-Reward Ratio</p>
                    <p className="text-white font-medium text-lg">1:{plan.riskRewardRatio}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Maximum Risk Per Trade</p>
                    <p className="text-white font-medium text-lg">{plan.maxCapitalRisk || 'Not set'}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Daily Trade Limit</p>
                    <p className="text-white font-medium text-lg">{plan.maxTrades || 'Not set'}</p>
                  </div>
                </div>
              </div>

              {/* Trading Journal Card */}
              <div className="lg:col-span-1">
                <div className="group bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-4 rounded-lg border border-purple-800/50 h-full transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-900/20">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-purple-200 tracking-wider group-hover:text-base transition-all">
                      TRADING JOURNAL
                    </h4>
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="h-5 w-5 text-purple-300 group-hover:h-6 group-hover:w-6 transition-all" 
                      viewBox="0 0 20 20" 
                      fill="currentColor"
                    >
                      <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                    </svg>
                  </div>
                  <div className="bg-gray-900/30 p-4 rounded-lg">
                    {plan.previousDayJournal ? (
                      <div className="font-sans text-gray-100 leading-relaxed tracking-normal text-base whitespace-pre-line group-hover:text-[1.05rem] transition-all">
                        {plan.previousDayJournal}
                      </div>
                    ) : (
                      <p className="text-gray-400 italic font-light group-hover:text-base transition-all">
                        No journal entries available
                      </p>
                    )}
                  </div>
                  {plan.previousDayJournal && (
                    <div className="mt-3 text-xs text-purple-300 font-medium tracking-wide group-hover:text-sm transition-all">
                      KEY LESSONS FROM PREVIOUS SESSION
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UpcomingPlans;