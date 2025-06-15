import React from 'react';

const DroppedComponent = ({ component, isActive, onClick, onContentEdit }) => {
    // Collect all styles from the component.styles object
    const inlineStyles = {
        backgroundColor: component.styles.backgroundColor || '',
        padding: component.styles.padding || '',
        margin: component.styles.margin || '',
        display: component.styles.display || 'block',
        flexDirection: component.styles.flexDirection || '',
        justifyContent: component.styles.justifyContent || '',
        alignItems: component.styles.alignItems || '',
    };

    return (
        <div
            key={component.id}
            id={component.id} // Set ID for direct DOM access by ref
            className={`w-full shadow-md hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden ${isActive ? 'active-component' : ''}`}
            style={inlineStyles} // Apply dynamic styles
            dangerouslySetInnerHTML={{ __html: component.html }}
            onClick={(e) => onClick(e, component.id)}
            onInput={(e) => onContentEdit(component.id, e)} // Capture contenteditable changes
        />
    );
};

export default DroppedComponent;