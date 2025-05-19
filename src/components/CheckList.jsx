import { useState, useEffect } from 'react';

const Checklist = () => {
  const [checklists, setChecklists] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [checklistData, setChecklistData] = useState({
    name: '',
    items: [
      { id: 1, text: 'Check overall market sentiment', checked: false },
      { id: 2, text: 'Identify key support/resistance levels', checked: false },
      { id: 3, text: 'Review economic calendar', checked: false },
      { id: 4, text: 'Set risk management parameters', checked: false },
      { id: 5, text: 'Check trading plan alignment', checked: false }
    ]
  });

  // Load checklists from localStorage
  useEffect(() => {
    const savedChecklists = localStorage.getItem('tradingChecklists');
    if (savedChecklists) {
      setChecklists(JSON.parse(savedChecklists));
    }
  }, []);

  const handleCheckboxChange = (itemId) => {
    setChecklistData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, checked: !item.checked } : item
      )
    }));
  };

  const handleItemTextChange = (itemId, newText) => {
    setChecklistData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, text: newText } : item
      )
    }));
  };

  const addNewItem = () => {
    const newId = checklistData.items.length > 0 ? 
      Math.max(...checklistData.items.map(item => item.id)) + 1 : 1;
    
    setChecklistData(prev => ({
      ...prev,
      items: [...prev.items, { id: newId, text: '', checked: false }]
    }));
  };

  const removeItem = (itemId) => {
    if (checklistData.items.length > 1) {
      setChecklistData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!checklistData.name.trim()) {
      alert('Please enter a checklist name');
      return;
    }

    const checklist = {
      ...checklistData,
      id: editingId || Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    let updatedChecklists;
    if (editingId) {
      updatedChecklists = checklists.map(c => c.id === editingId ? checklist : c);
      setEditingId(null);
    } else {
      updatedChecklists = [checklist, ...checklists];
    }

    setChecklists(updatedChecklists);
    localStorage.setItem('tradingChecklists', JSON.stringify(updatedChecklists));

    // Reset form
    setChecklistData({
      name: '',
      items: [
        { id: 1, text: 'Check overall market sentiment', checked: false },
        { id: 2, text: 'Identify key support/resistance levels', checked: false },
        { id: 3, text: 'Review economic calendar', checked: false },
        { id: 4, text: 'Set risk management parameters', checked: false },
        { id: 5, text: 'Check trading plan alignment', checked: false }
      ]
    });

    alert(`Checklist ${editingId ? 'updated' : 'saved'} successfully!`);
  };

  const handleEdit = (checklist) => {
    setChecklistData(checklist);
    setEditingId(checklist.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this checklist?')) {
      const updatedChecklists = checklists.filter(checklist => checklist.id !== id);
      setChecklists(updatedChecklists);
      localStorage.setItem('tradingChecklists', JSON.stringify(updatedChecklists));
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setChecklistData({
      name: '',
      items: [
        { id: 1, text: 'Check overall market sentiment', checked: false },
        { id: 2, text: 'Identify key support/resistance levels', checked: false },
        { id: 3, text: 'Review economic calendar', checked: false },
        { id: 4, text: 'Set risk management parameters', checked: false },
        { id: 5, text: 'Check trading plan alignment', checked: false }
      ]
    });
  };

  const allChecked = (items) => items.every(item => item.checked);

  return (
    <div className="card bg-gray-800 rounded-lg overflow-hidden mb-6">
      <div className="card-header p-5 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Trading Checklist</h2>
        <p className="text-sm text-gray-400">Create and manage your pre-trade checklists</p>
      </div>

      <div className="card-content p-5">
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="form-group mb-4">
            <label className="block text-sm text-gray-400 mb-1">Checklist Name</label>
            <input
              type="text"
              value={checklistData.name}
              onChange={(e) => setChecklistData({...checklistData, name: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              placeholder="e.g., Daily Trading Checklist"
              required
            />
          </div>

          <div className="checklist-items mb-4">
            <label className="block text-sm text-gray-400 mb-2">Checklist Items</label>
            {checklistData.items.map(item => (
              <div key={item.id} className="flex items-center gap-2 mb-2">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleCheckboxChange(item.id)}
                  className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                  className="flex-1 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-400"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addNewItem}
              className="mt-2 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
            >
              + Add Item
            </button>
          </div>

          <div className="mt-6 flex justify-end gap-2">
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
              {editingId ? 'Update Checklist' : 'Save Checklist'}
            </button>
          </div>
        </form>

        {checklists.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Saved Checklists</h3>
            <div className="space-y-6">
              {checklists.map(checklist => (
                <div key={checklist.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-medium text-white">{checklist.name}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(checklist)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(checklist.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  
                  <div className={`status-card p-3 rounded mb-3 ${
                    allChecked(checklist.items) ? 'bg-green-900/30' : 'bg-yellow-900/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${
                        allChecked(checklist.items) ? 'bg-green-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="text-sm">
                        {allChecked(checklist.items) ? 'Complete' : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="checklist-items">
                    {checklist.items.map(item => (
                      <div key={item.id} className="flex items-center gap-2 mb-2">
                        <input
                          type="checkbox"
                          checked={item.checked}
                          readOnly
                          className="h-4 w-4 text-purple-600 rounded"
                        />
                        <span className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-white'}`}>
                          {item.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checklist;