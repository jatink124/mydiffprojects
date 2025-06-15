import React from 'react';

const EditorToolbar = ({
    editorToolbarRef,
    activeComponentStyles,
    onStyleChange,
    onRemoveComponent,
    isForm,
    onTestSubmitForm,
    onViewSubmissions
}) => {
    return (
        <div
            id="editor-toolbar"
            ref={editorToolbarRef}
            className="absolute top-4 right-4 bg-slate-700 text-white p-3 rounded-lg shadow-xl flex flex-col gap-2 z-10"
        >
            <span className="font-bold mb-2">Edit Element</span>

            {/* Background Color */}
            <div className="flex items-center gap-2">
                <label htmlFor="background-color-picker" className="text-sm w-20">Bg Color:</label>
                <input
                    type="color"
                    id="background-color-picker"
                    title="Background Color"
                    className="w-8 h-8 cursor-pointer rounded-md overflow-hidden p-0 border-none bg-transparent"
                    onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
                    value={activeComponentStyles.backgroundColor || '#ffffff'} // Default white
                />
            </div>

            {/* Padding */}
            <div className="flex items-center gap-2">
                <label htmlFor="padding-input" className="text-sm w-20">Padding (px):</label>
                <input
                    type="number"
                    id="padding-input"
                    className="w-20 p-1 rounded-md text-gray-800"
                    onChange={(e) => onStyleChange('padding', e.target.value)}
                    value={activeComponentStyles.padding ? parseFloat(activeComponentStyles.padding) : ''}
                />
            </div>

            {/* Margin */}
            <div className="flex items-center gap-2">
                <label htmlFor="margin-input" className="text-sm w-20">Margin (px):</label>
                <input
                    type="number"
                    id="margin-input"
                    className="w-20 p-1 rounded-md text-gray-800"
                    onChange={(e) => onStyleChange('margin', e.target.value)}
                    value={activeComponentStyles.margin ? parseFloat(activeComponentStyles.margin) : ''}
                />
            </div>

            {/* Display Type */}
            <div className="flex items-center gap-2">
                <label htmlFor="display-select" className="text-sm w-20">Display:</label>
                <select
                    id="display-select"
                    className="w-24 p-1 rounded-md text-gray-800"
                    onChange={(e) => onStyleChange('display', e.target.value)}
                    value={activeComponentStyles.display || 'block'}
                >
                    <option value="block">Block</option>
                    <option value="flex">Flex</option>
                </select>
            </div>

            {/* Flexbox Controls (conditionally rendered) */}
            {activeComponentStyles.display === 'flex' && (
                <>
                    {/* Flex Direction */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="flex-direction-select" className="text-sm w-20">Flex Dir:</label>
                        <select
                            id="flex-direction-select"
                            className="w-24 p-1 rounded-md text-gray-800"
                            onChange={(e) => onStyleChange('flexDirection', e.target.value)}
                            value={activeComponentStyles.flexDirection || 'row'}
                        >
                            <option value="row">Row</option>
                            <option value="column">Column</option>
                        </select>
                    </div>

                    {/* Justify Content */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="justify-content-select" className="text-sm w-20">Justify:</label>
                        <select
                            id="justify-content-select"
                            className="w-24 p-1 rounded-md text-gray-800"
                            onChange={(e) => onStyleChange('justifyContent', e.target.value)}
                            value={activeComponentStyles.justifyContent || 'flex-start'}
                        >
                            <option value="flex-start">Start</option>
                            <option value="center">Center</option>
                            <option value="flex-end">End</option>
                            <option value="space-between">Space Between</option>
                            <option value="space-around">Space Around</option>
                        </select>
                    </div>

                    {/* Align Items */}
                    <div className="flex items-center gap-2">
                        <label htmlFor="align-items-select" className="text-sm w-20">Align:</label>
                        <select
                            id="align-items-select"
                            className="w-24 p-1 rounded-md text-gray-800"
                            onChange={(e) => onStyleChange('alignItems', e.target.value)}
                            value={activeComponentStyles.alignItems || 'stretch'}
                        >
                            <option value="stretch">Stretch</option>
                            <option value="flex-start">Start</option>
                            <option value="center">Center</option>
                            <option value="flex-end">End</option>
                            <option value="baseline">Baseline</option>
                        </select>
                    </div>
                </>
            )}

            <button
                id="remove-component-btn"
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition duration-200 mt-2"
                onClick={onRemoveComponent}
            >
                Remove
            </button>

            {/* New form-specific buttons */}
            {isForm && (
                <>
                    <button
                        className="bg-sky-500 hover:bg-sky-600 text-white py-2 px-4 rounded-md transition duration-200 mt-2"
                        onClick={onTestSubmitForm}
                    >
                        Test Submit Form
                    </button>
                    <button
                        className="bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-md transition duration-200"
                        onClick={onViewSubmissions}
                    >
                        View Submissions
                    </button>
                </>
            )}
        </div>
    );
};

export default EditorToolbar;