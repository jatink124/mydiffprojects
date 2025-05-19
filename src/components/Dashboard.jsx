import { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    name: 'My Trading Dashboard',
    timeframe: 'monthly',
    charts: [
      { id: 1, type: 'winRate', title: 'Win Rate Trend' },
      { id: 2, type: 'pnl', title: 'P&L Distribution' },
      { id: 3, type: 'strategy', title: 'Strategy Performance' },
      { id: 4, type: 'timeOfDay', title: 'Time of Day Analysis' }
    ]
  });

  const [dashboards, setDashboards] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const chartInstances = useRef({});

  // Load dashboards from localStorage
  useEffect(() => {
    const savedDashboards = localStorage.getItem('tradingDashboards');
    if (savedDashboards) {
      setDashboards(JSON.parse(savedDashboards));
    }
  }, []);

  // Initialize and cleanup charts
  useEffect(() => {
    renderCharts();

    return () => {
      // Clean up all chart instances on unmount
      Object.values(chartInstances.current).forEach(chart => {
        if (chart && typeof chart.destroy === 'function') {
          chart.destroy();
        }
      });
      chartInstances.current = {};
    };
  }, [dashboardData]);

  const renderCharts = () => {
    dashboardData.charts.forEach(chart => {
      const ctx = document.getElementById(`chart-${chart.id}`);
      if (!ctx) return;

      // Destroy previous chart instance if exists
      if (chartInstances.current[chart.id]) {
        chartInstances.current[chart.id].destroy();
      }

      // Sample data - in a real app you would use actual trading data
      let chartConfig;
      switch (chart.type) {
        case 'winRate':
          chartConfig = getWinRateChartConfig();
          break;
        case 'pnl':
          chartConfig = getPnlChartConfig();
          break;
        case 'strategy':
          chartConfig = getStrategyChartConfig();
          break;
        case 'timeOfDay':
          chartConfig = getTimeOfDayChartConfig();
          break;
        default:
          return;
      }

      chartInstances.current[chart.id] = new Chart(ctx, chartConfig);
    });
  };

  const getWinRateChartConfig = () => {
    return {
      type: 'line',
      data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [{
          label: 'Win Rate %',
          data: [55, 60, 45, 70],
          borderColor: '#8B5CF6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: { beginAtZero: true, max: 100 }
        }
      }
    };
  };

  const getPnlChartConfig = () => {
    return {
      type: 'bar',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        datasets: [{
          label: 'P&L',
          data: [2500, -1200, 3400, 1800, -900],
          backgroundColor: [
            '#22C55E', '#EF4444', '#22C55E', '#22C55E', '#EF4444'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        }
      }
    };
  };

  const getStrategyChartConfig = () => {
    return {
      type: 'doughnut',
      data: {
        labels: ['Breakout', 'Reversal', 'Trend', 'Range'],
        datasets: [{
          data: [35, 25, 20, 20],
          backgroundColor: [
            '#8B5CF6', '#7E69AB', '#6E59A5', '#5E4A90'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'right' }
        }
      }
    };
  };

  const getTimeOfDayChartConfig = () => {
    return {
      type: 'radar',
      data: {
        labels: ['9-10', '10-11', '11-12', '12-1', '1-2', '2-3'],
        datasets: [{
          label: 'Win Rate %',
          data: [60, 75, 50, 33, 25, 71],
          backgroundColor: 'rgba(139, 92, 246, 0.2)',
          borderColor: '#8B5CF6',
          pointBackgroundColor: '#8B5CF6'
        }]
      },
      options: {
        responsive: true,
        scales: {
          r: { angleLines: { display: false }, suggestedMin: 0, suggestedMax: 100 }
        }
      }
    };
  };

  const handleAddChart = () => {
    const newId = dashboardData.charts.length > 0 ? 
      Math.max(...dashboardData.charts.map(c => c.id)) + 1 : 1;
    
    setDashboardData(prev => ({
      ...prev,
      charts: [...prev.charts, { 
        id: newId, 
        type: 'winRate', 
        title: `New Chart ${newId}` 
      }]
    }));
  };

  const handleRemoveChart = (chartId) => {
    if (dashboardData.charts.length > 1) {
      // Destroy the chart instance before removing
      if (chartInstances.current[chartId]) {
        chartInstances.current[chartId].destroy();
        delete chartInstances.current[chartId];
      }
      
      setDashboardData(prev => ({
        ...prev,
        charts: prev.charts.filter(c => c.id !== chartId)
      }));
    }
  };

  const handleChartTypeChange = (chartId, newType) => {
    setDashboardData(prev => ({
      ...prev,
      charts: prev.charts.map(c => 
        c.id === chartId ? { ...c, type: newType } : c
      )
    }));
  };

  const handleChartTitleChange = (chartId, newTitle) => {
    setDashboardData(prev => ({
      ...prev,
      charts: prev.charts.map(c => 
        c.id === chartId ? { ...c, title: newTitle } : c
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const dashboard = {
      ...dashboardData,
      id: editingId || Date.now().toString(),
      updatedAt: new Date().toISOString()
    };

    let updatedDashboards;
    if (editingId) {
      updatedDashboards = dashboards.map(d => d.id === editingId ? dashboard : d);
      setEditingId(null);
    } else {
      updatedDashboards = [dashboard, ...dashboards];
    }

    setDashboards(updatedDashboards);
    localStorage.setItem('tradingDashboards', JSON.stringify(updatedDashboards));

    alert(`Dashboard ${editingId ? 'updated' : 'saved'} successfully!`);
  };

  const handleEdit = (dashboard) => {
    // Clean up existing charts before editing
    Object.values(chartInstances.current).forEach(chart => {
      if (chart) chart.destroy();
    });
    chartInstances.current = {};
    
    setDashboardData(dashboard);
    setEditingId(dashboard.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this dashboard?')) {
      const updatedDashboards = dashboards.filter(d => d.id !== id);
      setDashboards(updatedDashboards);
      localStorage.setItem('tradingDashboards', JSON.stringify(updatedDashboards));
    }
  };

  const handleReset = () => {
    // Clean up existing charts before resetting
    Object.values(chartInstances.current).forEach(chart => {
      if (chart) chart.destroy();
    });
    chartInstances.current = {};
    
    setEditingId(null);
    setDashboardData({
      name: 'My Trading Dashboard',
      timeframe: 'monthly',
      charts: [
        { id: 1, type: 'winRate', title: 'Win Rate Trend' },
        { id: 2, type: 'pnl', title: 'P&L Distribution' },
        { id: 3, type: 'strategy', title: 'Strategy Performance' },
        { id: 4, type: 'timeOfDay', title: 'Time of Day Analysis' }
      ]
    });
  };

  return (
    <div className="card bg-gray-800 rounded-lg overflow-hidden mb-6">
      <div className="card-header p-5 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Trading Dashboard</h2>
        <p className="text-sm text-gray-400">Visualize your trading performance</p>
      </div>

      <div className="card-content p-5">
        <form onSubmit={handleSubmit} className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Dashboard Name</label>
              <input
                type="text"
                value={dashboardData.name}
                onChange={(e) => setDashboardData({...dashboardData, name: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Timeframe</label>
              <select
                value={dashboardData.timeframe}
                onChange={(e) => setDashboardData({...dashboardData, timeframe: e.target.value})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-medium text-white">Charts</h3>
              <button
                type="button"
                onClick={handleAddChart}
                className="px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
              >
                + Add Chart
              </button>
            </div>

            <div className="space-y-4">
              {dashboardData.charts.map(chart => (
                <div key={chart.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <input
                      type="text"
                      value={chart.title}
                      onChange={(e) => handleChartTitleChange(chart.id, e.target.value)}
                      className="bg-gray-800 px-2 py-1 rounded text-white text-sm font-medium"
                    />
                    <div className="flex gap-2">
                      <select
                        value={chart.type}
                        onChange={(e) => handleChartTypeChange(chart.id, e.target.value)}
                        className="bg-gray-800 text-white text-sm rounded px-2 py-1"
                      >
                        <option value="winRate">Win Rate</option>
                        <option value="pnl">P&L</option>
                        <option value="strategy">Strategy</option>
                        <option value="timeOfDay">Time of Day</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleRemoveChart(chart.id)}
                        className="text-red-500 hover:text-red-400 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="chart-container h-64">
                    <canvas id={`chart-${chart.id}`}></canvas>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            {editingId && (
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
              {editingId ? 'Update Dashboard' : 'Save Dashboard'}
            </button>
          </div>
        </form>

        {dashboards.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Saved Dashboards</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th className="p-3 text-sm text-gray-400">Name</th>
                    <th className="p-3 text-sm text-gray-400">Timeframe</th>
                    <th className="p-3 text-sm text-gray-400">Charts</th>
                    <th className="p-3 text-sm text-gray-400">Last Updated</th>
                    <th className="p-3 text-sm text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboards.map(dashboard => (
                    <tr key={dashboard.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="p-3 text-white">{dashboard.name}</td>
                      <td className="p-3 text-white capitalize">{dashboard.timeframe}</td>
                      <td className="p-3 text-white">{dashboard.charts.length}</td>
                      <td className="p-3 text-white">
                        {new Date(dashboard.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(dashboard)}
                            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(dashboard.id)}
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

export default Dashboard;