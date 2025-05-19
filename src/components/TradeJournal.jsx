import { useState, useEffect } from 'react';

const TradeJournal = () => {
  const [trades, setTrades] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [tradeData, setTradeData] = useState({
    date: new Date().toISOString().split('T')[0],
    index: 'nifty',
    entry: '',
    exit: '',
    stopLoss: '',
    target: '',
    quantity: 1,
    riskedAmount: '',
    reason: ''
  });
  const [importedTrades, setImportedTrades] = useState([]);

  // Load trades from localStorage
  useEffect(() => {
    try {
      const savedTrades = localStorage.getItem('tradeJournal');
      if (savedTrades) {
        const parsedTrades = JSON.parse(savedTrades);
        setTrades(Array.isArray(parsedTrades) ? parsedTrades : []);
      }
    } catch (error) {
      console.error('Error loading trades:', error);
      setTrades([]);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTradeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateTradeResult = (trade) => {
    if (trade.entry && trade.exit && trade.quantity) {
      const entryPrice = parseFloat(trade.entry);
      const exitPrice = parseFloat(trade.exit);
      const qty = parseInt(trade.quantity);
      
      // Simplified P&L calculation (exit - entry)
      const pnl = (exitPrice - entryPrice) * qty * 75 - 42; // 42 INR brokerage cost
      const result = pnl >= 0 ? 'win' : 'loss';
      return { pnl, result };
    }
    return { pnl: 0, result: 'breakeven' };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trade = {
      ...tradeData,
      id: editingId || Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    const updatedTrades = editingId
      ? trades.map(t => t.id === editingId ? trade : t)
      : [trade, ...trades];

    setTrades(updatedTrades.filter(t => t != null));
    localStorage.setItem('tradeJournal', JSON.stringify(updatedTrades));

    // Reset form
    setTradeData({
      date: new Date().toISOString().split('T')[0],
      index: 'nifty',
      entry: '',
      exit: '',
      stopLoss: '',
      target: '',
      quantity: 1,
      riskedAmount: '',
      reason: ''
    });

    setEditingId(null);
    alert(`Trade ${editingId ? 'updated' : 'added'} successfully!`);
  };

  const handleEdit = (trade) => {
    setTradeData(trade);
    setEditingId(trade.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this trade?')) {
      const updatedTrades = trades.filter(trade => trade.id !== id);
      setTrades(updatedTrades);
      localStorage.setItem('tradeJournal', JSON.stringify(updatedTrades));
    }
  };

  const handleImport = (importData) => {
    const processedTrades = [];
    const tradesByOption = {};
    
    importData.forEach(trade => {
      if (!tradesByOption[trade.Name]) {
        tradesByOption[trade.Name] = [];
      }
      tradesByOption[trade.Name].push(trade);
    });
    
    Object.values(tradesByOption).forEach(optionTrades => {
      optionTrades.sort((a, b) => new Date(`${a.Date} ${a.Time}`) - new Date(`${b.Date} ${b.Time}`));
      
      let i = 0;
      while (i < optionTrades.length - 1) {
        const current = optionTrades[i];
        const next = optionTrades[i + 1];
        
        if ((current['Buy/Sell'] === 'BUY' && next['Buy/Sell'] === 'SELL') ||
            (current['Buy/Sell'] === 'SELL' && next['Buy/Sell'] === 'BUY')) {
          
          const entry = current['Buy/Sell'] === 'BUY' ? current['Trade Price'] : next['Trade Price'];
          const exit = current['Buy/Sell'] === 'BUY' ? next['Trade Price'] : current['Trade Price'];
          
          let index = 'nifty';
          if (current.Name.includes('BANK')) index = 'banknifty';
          else if (current.Name.includes('FIN')) index = 'finnifty';
          
          const quantity = parseInt(current['Quantity/Lot']) / 75;
          const { pnl, result } = calculateTradeResult({
            entry,
            exit,
            quantity
          });
          
          processedTrades.push({
            date: current.Date,
            index,
            entry: parseFloat(entry).toFixed(2),
            exit: parseFloat(exit).toFixed(2),
            quantity,
            result,
            reason: 'Imported trade',
            pnl,
            id: `${current.Date}-${current.Name}-${i}`.replace(/\s+/g, '-'),
            createdAt: new Date().toISOString()
          });
          
          i += 2;
        } else {
          i += 1;
        }
      }
    });
    
    setImportedTrades(processedTrades);
  };

  const confirmImport = () => {
    const updatedTrades = [...importedTrades, ...trades];
    setTrades(updatedTrades);
    setImportedTrades([]);
    localStorage.setItem('tradeJournal', JSON.stringify(updatedTrades));
    alert(`${importedTrades.length} trades added to your journal!`);
  };

  const resetImport = () => {
    setImportedTrades([]);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        let data;
        if (file.name.endsWith('.csv')) {
          const csv = event.target.result;
          const lines = csv.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          data = lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, i) => {
              obj[header] = values[i]?.trim();
              return obj;
            }, {});
          });
        } else {
          data = JSON.parse(event.target.result);
        }
        handleImport(data);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the format.');
      }
    };
    reader.readAsText(file);
  };

  const stats = trades.reduce((acc, trade) => {
    const { pnl, result } = calculateTradeResult(trade);
    acc.totalTrades++;
    if (result === 'win') acc.wins++;
    if (result === 'loss') acc.losses++;
    acc.totalPnl += pnl;
    return acc;
  }, { totalTrades: 0, wins: 0, losses: 0, totalPnl: 0 });

  const winRate = stats.totalTrades > 0 ? (stats.wins / stats.totalTrades * 100).toFixed(1) : 0;

  return (
    <div className="card bg-gray-800 rounded-lg overflow-hidden mb-6">
      <div className="card-header p-5 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Trade Journal</h2>
        <p className="text-sm text-gray-400">Record and analyze your trades</p>
      </div>

      <div className="card-content p-5">
        <div className="stats-grid grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="stat-card bg-gray-700 p-4 rounded text-center">
            <div className="text-sm text-gray-400">Total Trades</div>
            <div className="text-xl font-bold text-white">{stats.totalTrades}</div>
          </div>
          <div className="stat-card bg-gray-700 p-4 rounded text-center">
            <div className="text-sm text-gray-400">Win Rate</div>
            <div className="text-xl font-bold text-white">{winRate}%</div>
          </div>
          <div className="stat-card bg-gray-700 p-4 rounded text-center">
            <div className="text-sm text-gray-400">Wins/Losses</div>
            <div className="text-xl font-bold text-white">{stats.wins}W / {stats.losses}L</div>
          </div>
          <div className="stat-card bg-gray-700 p-4 rounded text-center">
            <div className="text-sm text-gray-400">Net P&L</div>
            <div className={`text-xl font-bold ${stats.totalPnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              ₹{stats.totalPnl.toLocaleString()}
            </div>
          </div>
        </div>

        {importedTrades.length > 0 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-4xl max-h-[80vh] overflow-auto">
              <h3 className="text-xl font-bold text-white mb-4">
                Review Imported Trades ({importedTrades.length})
              </h3>
              <div className="overflow-x-auto mb-4">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-700 text-left">
                      <th className="p-3 text-sm text-gray-400">Date</th>
                      <th className="p-3 text-sm text-gray-400">Index</th>
                      <th className="p-3 text-sm text-gray-400">Entry</th>
                      <th className="p-3 text-sm text-gray-400">Exit</th>
                      <th className="p-3 text-sm text-gray-400">P&L</th>
                      <th className="p-3 text-sm text-gray-400">Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {importedTrades.map((trade, index) => {
                      const { pnl, result } = calculateTradeResult(trade);
                      return (
                        <tr key={index} className="border-b border-gray-700 hover:bg-gray-700/50">
                          <td className="p-3 text-white">{trade.date}</td>
                          <td className="p-3 text-white capitalize">
                            {trade.index === 'nifty' ? 'Nifty 50' : 
                             trade.index === 'banknifty' ? 'Bank Nifty' : 
                             trade.index === 'finnifty' ? 'Fin Nifty' : 'Midcap Nifty'}
                          </td>
                          <td className="p-3 text-white">{trade.entry}</td>
                          <td className="p-3 text-white">{trade.exit || '-'}</td>
                          <td className={`p-3 font-medium ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                            ₹{pnl?.toLocaleString() || '0'}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-xs ${
                              result === 'win' ? 'bg-green-500' : 'bg-red-500'
                            }`}>
                              {result.charAt(0).toUpperCase() + result.slice(1)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={resetImport}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Reset Import
                </button>
                <button
                  onClick={confirmImport}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Confirm Import
                </button>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Date</label>
              <input
                type="date"
                name="date"
                value={tradeData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Index</label>
              <select
                name="index"
                value={tradeData.index}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                required
              >
                <option value="nifty">Nifty 50</option>
                <option value="banknifty">Bank Nifty</option>
                <option value="finnifty">Fin Nifty</option>
                <option value="midcapnifty">Midcap Nifty</option>
              </select>
            </div>

            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Entry Price</label>
              <input
                type="number"
                name="entry"
                value={tradeData.entry}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                required
              />
            </div>

            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Exit Price</label>
              <input
                type="number"
                name="exit"
                value={tradeData.exit}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Stop Loss</label>
              <input
                type="number"
                name="stopLoss"
                value={tradeData.stopLoss}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Target</label>
              <input
                type="number"
                name="target"
                value={tradeData.target}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Quantity (Lots)</label>
              <input
                type="number"
                name="quantity"
                value={tradeData.quantity}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>

            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Risked Amount (₹)</label>
              <input
                type="number"
                name="riskedAmount"
                value={tradeData.riskedAmount}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="block text-sm text-gray-400 mb-1">Trade Reasoning</label>
              <textarea
                name="reason"
                value={tradeData.reason}
                onChange={handleChange}
                rows="2"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <div>
              <input
                type="file"
                id="trade-import"
                accept=".csv,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <label
                htmlFor="trade-import"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition cursor-pointer"
              >
                Import Trades
              </label>
            </div>
            
            <div className="flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setTradeData({
                      date: new Date().toISOString().split('T')[0],
                      index: 'nifty',
                      entry: '',
                      exit: '',
                      stopLoss: '',
                      target: '',
                      quantity: 1,
                      riskedAmount: '',
                      reason: ''
                    });
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              >
                {editingId ? 'Update Trade' : 'Add Trade'}
              </button>
            </div>
          </div>
        </form>

        {trades.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Recent Trades</h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-700 text-left">
                    <th className="p-3 text-sm text-gray-400">Date</th>
                    <th className="p-3 text-sm text-gray-400">Index</th>
                    <th className="p-3 text-sm text-gray-400">Entry</th>
                    <th className="p-3 text-sm text-gray-400">Exit</th>
                    <th className="p-3 text-sm text-gray-400">P&L</th>
                    <th className="p-3 text-sm text-gray-400">Result</th>
                    <th className="p-3 text-sm text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map(trade => {
                    const { pnl, result } = calculateTradeResult(trade);
                    return (
                      <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="p-3 text-white">{trade.date}</td>
                        <td className="p-3 text-white capitalize">
                          {trade.index === 'nifty' ? 'Nifty 50' : 
                           trade.index === 'banknifty' ? 'Bank Nifty' : 
                           trade.index === 'finnifty' ? 'Fin Nifty' : 'Midcap Nifty'}
                        </td>
                        <td className="p-3 text-white">{trade.entry}</td>
                        <td className="p-3 text-white">{trade.exit || '-'}</td>
                        <td className={`p-3 font-medium ${pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          ₹{pnl?.toLocaleString() || '0'}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs ${
                            result === 'win' ? 'bg-green-500' : 'bg-red-500'
                          }`}>
                            {result.charAt(0).toUpperCase() + result.slice(1)}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(trade)}
                              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(trade.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeJournal;