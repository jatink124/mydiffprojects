import React from 'react';
import DroppedComponent from './DroppedComponent';
import EditorToolbar from './EditorToolbar';

const RightPanel = ({
    onSaveProject,
    onExportProject,
    canvasView,
    setCanvasView,
    activeDroppedComponentId,
    editorToolbarRef,
    onStyleChange,
    onRemoveComponent,
    onTestSubmitForm,
    onViewSubmissions,
    droppedComponents,
    onComponentClick,
    onContentEdit,
    canvasWrapperRef
}) => {
    // Determine the active component's styles for the toolbar
    const activeComponent = droppedComponents.find(comp => comp.id === activeDroppedComponentId);
    const activeComponentStyles = activeComponent ? activeComponent.styles : {};
    const isForm = activeComponent ? activeComponent.html.includes('<form') : false;

    return (
        <div id="right-panel" className="flex flex-col bg-gray-200 flex-grow rounded-tl-lg rounded-bl-lg overflow-hidden">
            <div className="p-4 bg-gray-800 text-white text-center text-lg font-bold rounded-tl-lg flex flex-col sm:flex-row justify-between items-center gap-2">
                <span>Website Canvas</span>
                <div className="flex gap-2">
                    <button
                        className="bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition duration-200 shadow-md text-sm"
                        onClick={onSaveProject}
                    >
                        Save Project
                    </button>
                    <button
                        className="bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition duration-200 shadow-md text-sm"
                        onClick={onExportProject}
                    >
                        Export HTML
                    </button>
                </div>
            </div>

            {/* Canvas Viewport Controls */}
            <div className="flex justify-center gap-4 p-4 bg-gray-700 text-white rounded-b-lg">
                <button
                    className={`py-2 px-4 rounded-md font-semibold text-sm transition duration-200 ${canvasView === 'desktop' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                    onClick={() => setCanvasView('desktop')}
                >
                    Desktop View
                </button>
                <button
                    className={`py-2 px-4 rounded-md font-semibold text-sm transition duration-200 ${canvasView === 'tablet' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                    onClick={() => setCanvasView('tablet')}
                >
                    Tablet View
                </button>
                <button
                    className={`py-2 px-4 rounded-md font-semibold text-sm transition duration-200 ${canvasView === 'mobile' ? 'bg-blue-600' : 'bg-gray-600 hover:bg-gray-500'}`}
                    onClick={() => setCanvasView('mobile')}
                >
                    Mobile View
                </button>
            </div>

            {/* Editor Toolbar (conditionally rendered) */}
            {activeDroppedComponentId && (
                <EditorToolbar
                    editorToolbarRef={editorToolbarRef}
                    activeComponentStyles={activeComponentStyles}
                    onStyleChange={onStyleChange}
                    onRemoveComponent={onRemoveComponent}
                    isForm={isForm}
                    onTestSubmitForm={onTestSubmitForm}
                    onViewSubmissions={onViewSubmissions}
                />
            )}

            <div
                id="canvas-wrapper"
                ref={canvasWrapperRef}
                className={`relative flex-grow bg-white m-4 rounded-lg shadow-inner overflow-y-auto transition-all duration-300 ${canvasView === 'mobile' ? 'max-w-[375px]' : canvasView === 'tablet' ? 'max-w-[768px]' : 'max-w-full'}`}
                style={{
                    marginLeft: canvasView !== 'desktop' ? 'auto' : '1rem',
                    marginRight: canvasView !== 'desktop' ? 'auto' : '1rem',
                }}
                onDragOver={(e) => e.preventDefault()} // Allow dropping
                onDrop={(e) => {
                    e.preventDefault();
                    // This logic will be handled by the App.js to set draggedComponentHTML
                    // and then RightPanel's onDrop will use that
                    // However, we pass handleDrop from App.js
                    // This component receives onDrop as a prop.
                    const data = e.dataTransfer.getData('text/plain'); // Get data if needed for filtering
                    // Since App.js already prepares draggedComponentHTML, just call its onDrop.
                    // This needs to be passed explicitly.
                    // Let's assume onDrop from App.js is passed here.
                }}
                onClick={() => activeDroppedComponentId && onComponentClick(null)} // Click on canvas background to deselect active component
            >
                <div id="canvas" className="min-h-full w-full flex flex-col items-center gap-4 p-4">
                    {droppedComponents.length === 0 ? (
                        <div className="text-gray-400 text-xl font-medium p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                            Drag and drop components or templates here!
                        </div>
                    ) : (
                        droppedComponents.map((component) => (
                            <DroppedComponent
                                key={component.id}
                                component={component}
                                isActive={activeDroppedComponentId === component.id}
                                onClick={onComponentClick}
                                onContentEdit={onContentEdit}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RightPanel;