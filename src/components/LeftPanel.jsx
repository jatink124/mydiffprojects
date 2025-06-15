import React from 'react';

const LeftPanel = ({ componentHTML, templateHTML, customComponents, onDragStart, onAddCustomComponent, customCodeInputRef }) => {
    return (
        <div id="left-panel" className="flex flex-col bg-white p-4 shadow-lg rounded-tr-lg rounded-br-lg min-w-[300px] max-w-[300px] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Components</h2>
            <div id="components-library" className="grid grid-cols-1 gap-4 mb-6">
                {/* Standard Components */}
                {Object.entries(componentHTML).filter(([type]) => !type.startsWith('form')).map(([type, html]) => (
                    <div
                        key={type}
                        className="component-card p-4 bg-blue-100 rounded-lg shadow-sm text-blue-800 text-center text-sm font-medium hover:bg-blue-200 cursor-grab transition-transform duration-100 ease-in-out active:scale-98 hover:shadow-md"
                        draggable="true"
                        onDragStart={(e) => onDragStart(e, type, html)}
                    >
                        {type.charAt(0).toUpperCase() + type.slice(1).replace(/([A-Z])/g, ' $1')}
                    </div>
                ))}
                {/* New Form Components */}
                <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-800">Form Elements</h3>
                {Object.entries(componentHTML).filter(([type]) => type.startsWith('form')).map(([type, html]) => (
                    <div
                        key={type}
                        className="component-card p-4 bg-orange-100 rounded-lg shadow-sm text-orange-800 text-center text-sm font-medium hover:bg-orange-200 cursor-grab transition-transform duration-100 ease-in-out active:scale-98 hover:shadow-md"
                        draggable="true"
                        onDragStart={(e) => onDragStart(e, type, html)}
                    >
                        {type.replace('form-', '').split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </div>
                ))}

                {/* Custom Components */}
                {customComponents.map(comp => (
                    <div
                        key={comp.id}
                        className="custom-component-card p-4 bg-gray-200 rounded-lg shadow-sm text-gray-800 text-center text-sm font-medium hover:bg-gray-300 cursor-grab transition-transform duration-100 ease-in-out active:scale-98 hover:shadow-md"
                        draggable="true"
                        onDragStart={(e) => onDragStart(e, 'custom', comp.html)}
                    >
                        {comp.name}
                    </div>
                ))}
            </div>

            <h2 className="text-xl font-semibold mb-4 text-gray-800">Full Templates</h2>
            <div id="templates-library" className="grid grid-cols-1 gap-4 mb-6">
                {Object.entries(templateHTML).map(([type, html]) => (
                    <div
                        key={type}
                        className="template-card p-4 bg-indigo-100 rounded-lg shadow-sm text-indigo-800 text-center text-sm font-medium hover:bg-indigo-200 cursor-grab transition-transform duration-100 ease-in-out active:scale-98 hover:shadow-md"
                        draggable="true"
                        onDragStart={(e) => onDragStart(e, type, html)}
                    >
                        {type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </div>
                ))}
            </div>

            <div className="mt-auto pt-6 border-t border-gray-200">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Add Your Own Component/Template</h2>
                <textarea
                    id="custom-code-input"
                    ref={customCodeInputRef}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700 h-32 mb-3 resize-y"
                    placeholder="Paste your HTML code here..."
                ></textarea>
                <button
                    id="add-custom-component-btn"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md"
                    onClick={onAddCustomComponent}
                >
                    Add Custom Component
                </button>
            </div>
        </div>
    );
};

export default LeftPanel;