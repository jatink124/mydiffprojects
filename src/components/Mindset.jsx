import { useState, useEffect } from 'react';

const Mindset = () => {
  const [mindsetData, setMindsetData] = useState({
    name: 'Daily Mindset',
    affirmations: [
      "I follow my trading plan with discipline",
      "I accept losses as part of the process",
      "I focus on the process, not just outcomes"
    ],
    quotes: [
      {
        text: "The stock market is a device for transferring money from the impatient to the patient.",
        author: "Warren Buffett"
      }
    ],
    notes: "Review my trading journal daily to identify patterns and improve"
  });

  const [mindsetEntries, setMindsetEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState('affirmations');

  // Load mindset entries from localStorage
  useEffect(() => {
    const savedEntries = localStorage.getItem('mindsetEntries');
    if (savedEntries) {
      setMindsetEntries(JSON.parse(savedEntries));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMindsetData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAffirmationChange = (index, value) => {
    const newAffirmations = [...mindsetData.affirmations];
    newAffirmations[index] = value;
    setMindsetData(prev => ({
      ...prev,
      affirmations: newAffirmations
    }));
  };

  const handleQuoteChange = (index, field, value) => {
    const newQuotes = [...mindsetData.quotes];
    newQuotes[index] = {
      ...newQuotes[index],
      [field]: value
    };
    setMindsetData(prev => ({
      ...prev,
      quotes: newQuotes
    }));
  };

  const addAffirmation = () => {
    setMindsetData(prev => ({
      ...prev,
      affirmations: [...prev.affirmations, ""]
    }));
  };

  const removeAffirmation = (index) => {
    if (mindsetData.affirmations.length > 1) {
      const newAffirmations = mindsetData.affirmations.filter((_, i) => i !== index);
      setMindsetData(prev => ({
        ...prev,
        affirmations: newAffirmations
      }));
    }
  };

  const addQuote = () => {
    setMindsetData(prev => ({
      ...prev,
      quotes: [...prev.quotes, { text: "", author: "" }]
    }));
  };

  const removeQuote = (index) => {
    if (mindsetData.quotes.length > 1) {
      const newQuotes = mindsetData.quotes.filter((_, i) => i !== index);
      setMindsetData(prev => ({
        ...prev,
        quotes: newQuotes
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const entry = {
      ...mindsetData,
      id: editingId || Date.now().toString(),
      createdAt: new Date().toISOString()
    };

    let updatedEntries;
    if (editingId) {
      updatedEntries = mindsetEntries.map(e => e.id === editingId ? entry : e);
      setEditingId(null);
    } else {
      updatedEntries = [entry, ...mindsetEntries];
    }

    setMindsetEntries(updatedEntries);
    localStorage.setItem('mindsetEntries', JSON.stringify(updatedEntries));

    // Reset form
    setMindsetData({
      name: 'Daily Mindset',
      affirmations: [
        "I follow my trading plan with discipline",
        "I accept losses as part of the process",
        "I focus on the process, not just outcomes"
      ],
      quotes: [
        {
          text: "The stock market is a device for transferring money from the impatient to the patient.",
          author: "Warren Buffett"
        }
      ],
      notes: "Review my trading journal daily to identify patterns and improve"
    });

    alert(`Mindset entry ${editingId ? 'updated' : 'saved'} successfully!`);
  };

  const handleEdit = (entry) => {
    setMindsetData(entry);
    setEditingId(entry.id);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this mindset entry?')) {
      const updatedEntries = mindsetEntries.filter(entry => entry.id !== id);
      setMindsetEntries(updatedEntries);
      localStorage.setItem('mindsetEntries', JSON.stringify(updatedEntries));
    }
  };

  const handleReset = () => {
    setEditingId(null);
    setMindsetData({
      name: 'Daily Mindset',
      affirmations: [
        "I follow my trading plan with discipline",
        "I accept losses as part of the process",
        "I focus on the process, not just outcomes"
      ],
      quotes: [
        {
          text: "The stock market is a device for transferring money from the impatient to the patient.",
          author: "Warren Buffett"
        }
      ],
      notes: "Review my trading journal daily to identify patterns and improve"
    });
  };

  return (
    <div className="card bg-gray-800 rounded-lg overflow-hidden mb-6">
      <div className="card-header p-5 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">Trader Mindset</h2>
        <p className="text-sm text-gray-400">Develop a disciplined trading psychology</p>
      </div>

      <div className="card-content p-5">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Entry Name</label>
            <input
              type="text"
              name="name"
              value={mindsetData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              required
            />
          </div>

          <div className="tabs mb-4">
            <div className="flex border-b border-gray-700">
              <button
                type="button"
                className={`px-4 py-2 ${activeTab === 'affirmations' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('affirmations')}
              >
                Affirmations
              </button>
              <button
                type="button"
                className={`px-4 py-2 ${activeTab === 'quotes' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('quotes')}
              >
                Quotes
              </button>
              <button
                type="button"
                className={`px-4 py-2 ${activeTab === 'notes' ? 'text-purple-400 border-b-2 border-purple-400' : 'text-gray-400'}`}
                onClick={() => setActiveTab('notes')}
              >
                Notes
              </button>
            </div>
          </div>

          <div className="mb-6">
            {activeTab === 'affirmations' && (
              <div className="space-y-3">
                {mindsetData.affirmations.map((affirmation, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={affirmation}
                      onChange={(e) => handleAffirmationChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeAffirmation(index)}
                      className="text-red-500 hover:text-red-400"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAffirmation}
                  className="mt-2 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
                >
                  + Add Affirmation
                </button>
              </div>
            )}

            {activeTab === 'quotes' && (
              <div className="space-y-4">
                {mindsetData.quotes.map((quote, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <textarea
                        value={quote.text}
                        onChange={(e) => handleQuoteChange(index, 'text', e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        rows="2"
                        placeholder="Quote text"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => removeQuote(index)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ×
                      </button>
                    </div>
                    <input
                      type="text"
                      value={quote.author}
                      onChange={(e) => handleQuoteChange(index, 'author', e.target.value)}
                      className="w-full px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      placeholder="Author"
                      required
                    />
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addQuote}
                  className="mt-2 px-3 py-1 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 text-sm"
                >
                  + Add Quote
                </button>
              </div>
            )}

            {activeTab === 'notes' && (
              <textarea
                name="notes"
                value={mindsetData.notes}
                onChange={handleChange}
                rows="5"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
              />
            )}
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
              {editingId ? 'Update Entry' : 'Save Entry'}
            </button>
          </div>
        </form>

        {mindsetEntries.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-medium text-white mb-4">Saved Mindset Entries</h3>
            <div className="space-y-4">
              {mindsetEntries.map(entry => (
                <div key={entry.id} className="bg-gray-700 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-lg font-medium text-white">{entry.name}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(entry)}
                        className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-800/50 p-3 rounded">
                      <h5 className="text-sm text-purple-400 mb-2">Affirmations</h5>
                      <ul className="space-y-2">
                        {entry.affirmations.map((affirmation, i) => (
                          <li key={i} className="text-sm text-white">• {affirmation}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-gray-800/50 p-3 rounded">
                      <h5 className="text-sm text-purple-400 mb-2">Quotes</h5>
                      <div className="space-y-3">
                        {entry.quotes.map((quote, i) => (
                          <div key={i}>
                            <p className="text-sm text-white italic">"{quote.text}"</p>
                            <p className="text-xs text-gray-400 text-right">— {quote.author}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 p-3 rounded">
                      <h5 className="text-sm text-purple-400 mb-2">Notes</h5>
                      <p className="text-sm text-white whitespace-pre-line">{entry.notes}</p>
                    </div>
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

export default Mindset;