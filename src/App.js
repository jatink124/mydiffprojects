import React, { useState, useCallback, useRef, useEffect } from 'react';

// Helper function to convert RGB to Hex
const rgbToHex = (rgb) => {
    const rgbMatch = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (!rgbMatch) return "#ffffff"; // Default to white if not an RGB string

    const toHex = (c) => {
        const hex = parseInt(c).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    };

    return "#" + toHex(rgbMatch[1]) + toHex(rgbMatch[2]) + toHex(rgbMatch[3]);
};

// Pre-defined HTML for standard components
const componentHTML = {
    navbar: `
        <nav class="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 flex justify-between items-center rounded-lg shadow-lg">
            <div class="text-2xl font-bold rounded-md px-2 py-1" contenteditable="true">MyBrand</div>
            <ul class="flex space-x-6">
                <li><a href="#" class="hover:text-blue-200 transition duration-200 rounded-md px-2 py-1" contenteditable="true">Home</a></li>
                <li><a href="#" class="hover:text-blue-200 transition duration-200 rounded-md px-2 py-1" contenteditable="true">About</a></li>
                <li><a href="#" class="hover:text-blue-200 transition duration-200 rounded-md px-2 py-1" contenteditable="true">Services</a></li>
                <li><a href="#" class="hover:text-blue-200 transition duration-200 rounded-md px-2 py-1" contenteditable="true">Contact</a></li>
            </ul>
        </nav>
    `,
    hero: `
        <section class="w-full bg-gray-900 text-white py-20 px-8 text-center rounded-lg shadow-lg">
            <h1 class="text-5xl font-extrabold mb-4 rounded-md px-2 py-1" contenteditable="true">Welcome to Our Amazing Website!</h1>
            <p class="text-xl mb-8 text-gray-300 rounded-md px-2 py-1" contenteditable="true">Discover innovative solutions for your business needs.</p>
            <button class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300">
                <span contenteditable="true">Learn More</span>
            </button>
        </section>
    `,
    services: `
        <section class="w-full bg-white py-16 px-8 text-center rounded-lg shadow-lg">
            <h2 class="text-4xl font-bold text-gray-800 mb-12 rounded-md px-2 py-1" contenteditable="true">Our Services</h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div class="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-4 rounded-md px-2 py-1" contenteditable="true">Web Development</h3>
                    <p class="text-gray-600 rounded-md px-2 py-1" contenteditable="true">Crafting responsive and high-performance websites for your business.</p>
                </div>
                <div class="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-4 rounded-md px-2 py-1" contenteditable="true">Digital Marketing</h3>
                    <p class="text-gray-600 rounded-md px-2 py-1" contenteditable="true">Boost your online presence with our comprehensive marketing strategies.</p>
                </div>
                <div class="p-6 bg-gray-100 rounded-lg shadow-md hover:shadow-xl transition duration-300">
                    <h3 class="text-2xl font-semibold text-gray-800 mb-4 rounded-md px-2 py-1" contenteditable="true">UI/UX Design</h3>
                    <p class="text-gray-600 rounded-md px-2 py-1" contenteditable="true">Creating intuitive and aesthetically pleasing user interfaces.</p>
                </div>
            </div>
        </section>
    `,
    testimonials: `
        <section class="w-full bg-gray-100 py-16 px-8 text-center rounded-lg shadow-lg">
            <h2 class="text-4xl font-bold text-gray-800 mb-12 rounded-md px-2 py-1" contenteditable="true">What Our Clients Say</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="bg-white p-8 rounded-lg shadow-md border-t-4 border-blue-500">
                    <p class="text-gray-700 italic mb-4 rounded-md px-2 py-1" contenteditable="true">"Outstanding service! Our website has never looked better and traffic has doubled."</p>
                    <p class="font-semibold text-gray-900 rounded-md px-2 py-1" contenteditable="true">- Jane Doe, CEO of Tech Innovations</p>
                </div>
                <div class="bg-white p-8 rounded-lg shadow-md border-t-4 border-purple-500">
                    <p class="text-gray-700 italic mb-4 rounded-md px-2 py-1" contenteditable="true">"Professional and highly skilled team. They delivered beyond our expectations."</p>
                    <p class="font-semibold text-gray-900 rounded-md px-2 py-1" contenteditable="true"> - John Smith, Founder of Creative Solutions</p>
                </div>
            </div>
        </section>
    `,
    footer: `
        <footer class="w-full bg-gray-800 text-white py-10 px-8 text-center rounded-lg shadow-lg">
            <div class="flex flex-col md:flex-row justify-center items-center gap-6 mb-6">
                <a href="#" class="hover:text-gray-300 transition duration-200 rounded-md px-2 py-1" contenteditable="true">Privacy Policy</a>
                <span class="hidden md:inline-block">|</span>
                <a href="#" class="hover:text-gray-300 transition duration-200 rounded-md px-2 py-1" contenteditable="true">Terms of Service</a>
                <span class="hidden md:inline-block">|</span>
                <a href="#" class="hover:text-gray-300 transition duration-200 rounded-md px-2 py-1" contenteditable="true">Sitemap</a>
            </div>
            <p class="text-gray-400 text-sm rounded-md px-2 py-1" contenteditable="true">&copy; 2025 My Website. All rights reserved.</p>
        </footer>
    `,
    // New Form Components
    form: `
        <form class="w-full bg-white p-8 rounded-lg shadow-lg border border-gray-200 flex flex-col gap-4" onsubmit="event.preventDefault();">
            <h3 class="text-3xl font-bold text-gray-800 mb-4 rounded-md px-2 py-1" contenteditable="true">Contact Us</h3>
            <p class="text-gray-600 mb-6 rounded-md px-2 py-1" contenteditable="true">Fill out the form below and we'll get back to you shortly.</p>
            <!-- Form fields will be dropped here -->
            <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition duration-300 mt-4">
                <span contenteditable="true">Submit Inquiry</span>
            </button>
        </form>
    `,
    'form-input': `
        <div class="flex flex-col">
            <label for="text-input" class="text-gray-700 font-medium mb-1 rounded-md px-2 py-1" contenteditable="true">Text Input Label</label>
            <input type="text" id="text-input" name="textInput" placeholder="Enter text here..." class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800" data-form-field="true">
        </div>
    `,
    'form-email-input': `
        <div class="flex flex-col">
            <label for="email-input" class="text-gray-700 font-medium mb-1 rounded-md px-2 py-1" contenteditable="true">Email Label</label>
            <input type="email" id="email-input" name="emailInput" placeholder="Your Email Address" class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800" data-form-field="true">
        </div>
    `,
    'form-textarea': `
        <div class="flex flex-col">
            <label for="textarea-input" class="text-gray-700 font-medium mb-1 rounded-md px-2 py-1" contenteditable="true">Message Label</label>
            <textarea id="textarea-input" name="message" placeholder="Type your message here..." rows="4" class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 resize-y" data-form-field="true"></textarea>
        </div>
    `,
    'form-checkbox': `
        <div class="flex items-center gap-2">
            <input type="checkbox" id="checkbox-input" name="agreeTerms" class="form-checkbox h-5 w-5 text-blue-600 rounded" data-form-field="true">
            <label for="checkbox-input" class="text-gray-700 rounded-md px-2 py-1" contenteditable="true">I agree to the terms and conditions</label>
        </div>
    `,
    'form-select': `
        <div class="flex flex-col">
            <label for="select-input" class="text-gray-700 font-medium mb-1 rounded-md px-2 py-1" contenteditable="true">Choose an Option</label>
            <select id="select-input" name="options" class="p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800" data-form-field="true">
                <option value="option1" contenteditable="true">Option 1</option>
                <option value="option2" contenteditable="true">Option 2</option>
                <option value="option3" contenteditable="true">Option 3</option>
            </select>
        </div>
    `
};

// Pre-defined HTML for full templates
const templateHTML = {
    'full-page-1': `
        <div class="w-full flex flex-col gap-4">
            ${componentHTML.navbar}
            ${componentHTML.hero}
            ${componentHTML.footer}
        </div>
    `,
    'full-page-2': `
        <div class="w-full flex flex-col gap-4">
            ${componentHTML.hero}
            ${componentHTML.services}
            ${componentHTML.testimonials}
        </div>
    `
};

const App = () => {
    const [draggedComponentHTML, setDraggedComponentHTML] = useState(null);
    const [droppedComponents, setDroppedComponents] = useState([]);
    const [activeDroppedComponentId, setActiveDroppedComponentId] = useState(null);
    const [customComponents, setCustomComponents] = useState([]);
    const [showRemovalModal, setShowRemovalModal] = useState(false);
    const [formSubmissions, setFormSubmissions] = useState({});
    const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
    const [canvasView, setCanvasView] = useState('desktop');
    const [feedbackMessage, setFeedbackMessage] = useState({ text: '', type: '' });

    // NEW: State to track the index of the component being dragged for reordering within the canvas
    const [draggedItemIndex, setDraggedItemIndex] = useState(null);


    const customCodeInputRef = useRef(null);
    const customFileInputRef = useRef(null); // Ref for the file input
    const canvasWrapperRef = useRef(null);
    const editorToolbarRef = useRef(null);

    // Function to display feedback messages
    const showFeedback = useCallback((text, type = 'success') => {
        setFeedbackMessage({ text, type });
        setTimeout(() => setFeedbackMessage({ text: '', type: '' }), 3000);
    }, []);

    // Effect to load saved data from localStorage on initial render
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const savedDroppedComponents = localStorage.getItem('droppedComponents');
                const savedCustomComponents = localStorage.getItem('customComponents');
                const savedFormSubmissions = localStorage.getItem('formSubmissions');

                if (savedDroppedComponents) {
                    setDroppedComponents(JSON.parse(savedDroppedComponents));
                }

                let initialCustomComponents = [];
                if (savedCustomComponents) {
                    // Attempt to parse existing custom components from localStorage
                    initialCustomComponents = JSON.parse(savedCustomComponents);
                }

                // If no custom components were loaded from localStorage (either not present or an empty array),
                // then attempt to load predefined components from the 'public/customcomponents' folder.
                if (initialCustomComponents.length === 0) {
                    // --- IMPORTANT: Browser security restrictions prevent direct listing of files in a directory. ---
                    // To "automatically" load components from a folder like `public/customcomponents`,
                    // you would typically need a backend API to send a list of filenames or their content.
                    //
                    // For this client-side application, you must manually specify the names of the files
                    // you wish to load from the 'public/customcomponents' directory.
                    const predefinedCustomComponentFileNames = ['example-button.html', 'example-card.html', 'Custom-Component.html'];

                    const loadedComponents = [];
                    for (const fileName of predefinedCustomComponentFileNames) {
                        try {
                            const response = await fetch(`/customcomponents/${fileName}`);
                            if (response.ok) {
                                const preloadedHTML = await response.text();
                                // Generate a user-friendly name from the filename
                                const componentName = fileName
                                    .replace('.html', '')
                                    .replace(/-/g, ' ')
                                    .split(' ')
                                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                                    .join(' ');
                                loadedComponents.push({ id: `custom-preloaded-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`, name: componentName, html: preloadedHTML });
                            } else {
                                console.warn(`Failed to fetch /customcomponents/${fileName}: ${response.statusText}`);
                            }
                        } catch (fetchError) {
                            console.error(`Error fetching /customcomponents/${fileName}:`, fetchError);
                        }
                    }
                    if (loadedComponents.length > 0) {
                        setCustomComponents(loadedComponents);
                        showFeedback(`Loaded ${loadedComponents.length} preloaded custom component(s)!`, 'info');
                    } else {
                        showFeedback('No preloaded custom components found or failed to load.', 'info');
                    }
                } else {
                    // If custom components were loaded from localStorage, set them
                    setCustomComponents(initialCustomComponents);
                }


                if (savedFormSubmissions) {
                    setFormSubmissions(JSON.parse(savedFormSubmissions));
                }
                showFeedback('Loaded saved project!', 'info');
            } catch (error) {
                console.error("Failed to load data from localStorage:", error);
                showFeedback('Failed to load saved project.', 'error');
            }
        };

        loadInitialData();
    }, [showFeedback]);

    // Effect to save data to localStorage whenever core data states change
    useEffect(() => {
        try {
            localStorage.setItem('droppedComponents', JSON.stringify(droppedComponents));
            localStorage.setItem('customComponents', JSON.stringify(customComponents));
            localStorage.setItem('formSubmissions', JSON.stringify(formSubmissions));
        } catch (error) {
            console.error("Failed to save data to localStorage:", error);
            showFeedback('Failed to save project.', 'error');
        }
    }, [droppedComponents, customComponents, formSubmissions, showFeedback]);

    // Handler for when a draggable component starts being dragged from the left panel
    const handleDragStart = (e, type, htmlContent) => {
        setDraggedComponentHTML(htmlContent);
        // Clear any internal drag state if starting a drag from the left panel
        setDraggedItemIndex(null);
        e.dataTransfer.setData('text/plain', type); // Store type if needed for specific drop logic
        e.dataTransfer.effectAllowed = 'copy';
    };

    // Handler for when a new component is dropped onto the canvas from the left panel
    const handleDrop = (e) => {
        e.preventDefault();
        // Only handle new component drops if draggedComponentHTML is set
        if (draggedComponentHTML) {
            const newComponentId = `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            setDroppedComponents(prev => [
                ...prev,
                // Initialize all possible styles, even if empty
                { id: newComponentId, html: draggedComponentHTML, styles: { padding: '', margin: '', display: 'block', flexDirection: '', justifyContent: '', alignItems: '', backgroundColor: '' } }
            ]);
            setDraggedComponentHTML(null);
            showFeedback('Component added to canvas!', 'success');
        }
        // If draggedItemIndex is not null, it means an internal reorder is in progress,
        // and handleDragOverInternal already handles the position update.
    };

    // Handler for dragging an existing component on the canvas
    const handleDragStartInternal = useCallback((e, index) => {
        setDraggedItemIndex(index);
        e.dataTransfer.effectAllowed = 'move';
        // Hide the original element while dragging to avoid double display
        // e.target.classList.add('dragging-invisible'); // This is handled by DroppedComponent component
    }, []);

    // Handler for dragging over another existing component on the canvas
    const handleDragOverInternal = useCallback((e, targetIndex) => {
        e.preventDefault(); // Necessary to allow drop
        if (draggedItemIndex === null || draggedItemIndex === targetIndex) {
            return; // Don't reorder if dragging self or nothing is dragged
        }

        // Perform the reordering
        setDroppedComponents(prevComponents => {
            const newComponents = [...prevComponents];
            const [movedItem] = newComponents.splice(draggedItemIndex, 1);
            newComponents.splice(targetIndex, 0, movedItem);
            // Update draggedItemIndex to reflect the new position of the dragged item
            // This is crucial for continuous reordering as the mouse moves
            setDraggedItemIndex(targetIndex);
            return newComponents;
        });
    }, [draggedItemIndex, setDroppedComponents]);

    // Handler for ending the drag of an existing component on the canvas
    const handleDragEndInternal = useCallback((e) => {
        setDraggedItemIndex(null);
        // Remove the temporary class added at drag start by DroppedComponent
        // e.target.classList.remove('dragging-invisible');
    }, []);


    // Handler for clicking on a dropped component on the canvas
    const handleComponentClick = useCallback((e, componentId) => {
        e.stopPropagation(); // Stop propagation to prevent canvasWrapperRef's click listener from firing immediately
        setActiveDroppedComponentId(componentId);
    }, []);

    // Handle changes to contenteditable elements within a dropped component
    const handleContentEdit = useCallback((componentId, e) => {
        const currentDOMElement = document.getElementById(componentId);
        if (currentDOMElement) {
            setDroppedComponents(prev => prev.map(comp => {
                if (comp.id === componentId) {
                    return { ...comp, html: currentDOMElement.innerHTML };
                }
                return comp;
            }));
        }
    }, []);

    // Handle changes for layout/spacing/color properties
    const handleStyleChange = useCallback((styleName, value) => {
        setDroppedComponents(prev => prev.map(comp =>
            comp.id === activeDroppedComponentId
                ? { ...comp, styles: { ...comp.styles, [styleName]: value } }
                : comp
        ));
    }, [activeDroppedComponentId]);

    // Remove component handler
    const handleRemoveComponent = useCallback(() => {
        setShowRemovalModal(true);
    }, []);

    const confirmRemove = useCallback(() => {
        setDroppedComponents(prev => prev.filter(comp => comp.id !== activeDroppedComponentId));
        setFormSubmissions(prev => {
            const newSubmissions = { ...prev };
            delete newSubmissions[activeDroppedComponentId];
            return newSubmissions;
        });
        setActiveDroppedComponentId(null);
        setShowRemovalModal(false);
        showFeedback('Component removed!', 'success');
    }, [activeDroppedComponentId, showFeedback]);

    const cancelRemove = useCallback(() => {
        setShowRemovalModal(false);
    }, []);

    // Add custom component handler
    const handleAddCustomComponent = useCallback(() => {
        const customHTML = customCodeInputRef.current.value.trim();
        if (customHTML) {
            const newCustomComponentId = `custom-${Date.now()}`;
            setCustomComponents(prev => [...prev, { id: newCustomComponentId, name: 'Custom Component', html: customHTML }]);
            customCodeInputRef.current.value = '';
            showFeedback('Custom component added!', 'success');
        } else {
            showFeedback('Please paste some HTML code first.', 'error');
        }
    }, [showFeedback]);

    // Handler to export a specific custom component to a local file
    const handleExportCustomComponentToFile = useCallback((componentToExport) => {
        const blob = new Blob([componentToExport.html], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${componentToExport.name.replace(/\s+/g, '-') || 'custom-component'}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        showFeedback(`'${componentToExport.name}' exported!`, 'success');
    }, [showFeedback]);

    // Handler to import a custom component from a local file (requires user interaction)
    const handleImportCustomComponentFromFile = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const importedHTML = e.target.result;
                const newComponentId = `custom-imported-${Date.now()}`;
                const componentName = file.name.replace(/\.[^/.]+$/, "") || 'Imported Component'; // Remove file extension for name
                setCustomComponents(prev => [...prev, { id: newComponentId, name: componentName, html: importedHTML }]);
                showFeedback(`'${componentName}' imported successfully!`, 'success');
                event.target.value = ''; // Clear the input field
            };
            reader.onerror = () => {
                showFeedback('Failed to read file.', 'error');
            };
            reader.readAsText(file);
        }
    }, [showFeedback]);


    // Save project handler
    const handleSaveProject = useCallback(() => {
        try {
            localStorage.setItem('droppedComponents', JSON.stringify(droppedComponents));
            localStorage.setItem('customComponents', JSON.stringify(customComponents));
            localStorage.setItem('formSubmissions', JSON.stringify(formSubmissions));
            showFeedback('Project saved successfully!', 'success');
        } catch (error) {
            console.error("Error saving project:", error);
            showFeedback('Failed to save project.', 'error');
        }
    }, [droppedComponents, customComponents, formSubmissions, showFeedback]);

    // Export project handler
    const handleExportProject = useCallback(() => {
        let fullHtmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Exported Website</title>
    <!-- Tailwind CSS CDN for styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; overflow-x: hidden; }
        section, form, div { margin-bottom: 1rem; }
        [contenteditable="true"] { outline: none; }
        /* Style for the element being dragged */
        .dragging-invisible {
            opacity: 0.001; /* Nearly invisible, but still occupies space */
            border: 2px dashed #ccc;
        }
    </style>
</head>
<body class="bg-gray-100 p-4">
`;

        droppedComponents.forEach(component => {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = component.html;

            const rootElement = tempDiv.firstElementChild;
            if (rootElement) {
                rootElement.querySelectorAll('[contenteditable="true"]').forEach(el => {
                    el.removeAttribute('contenteditable');
                });

                if (rootElement.id && rootElement.id.startsWith('comp-')) {
                    rootElement.removeAttribute('id');
                }
                rootElement.classList.remove('dropped-component', 'active-component', 'shadow-md', 'hover:shadow-lg', 'transition-all', 'duration-300', 'rounded-lg', 'overflow-hidden');

                for (const styleKey in component.styles) {
                    if (component.styles[styleKey]) {
                        if (['padding', 'margin'].includes(styleKey) && !isNaN(parseFloat(component.styles[styleKey]))) {
                            rootElement.style[styleKey] = `${parseFloat(component.styles[styleKey])}px`;
                        } else {
                            rootElement.style[styleKey] = component.styles[styleKey];
                        }
                    }
                }

                if (rootElement.tagName === 'FORM' && rootElement.hasAttribute('onsubmit')) {
                    rootElement.removeAttribute('onsubmit');
                    const formName = `form_${component.id.replace('comp-', '')}`;
                    rootElement.setAttribute('id', formName);
                    rootElement.setAttribute('action', '#');
                    rootElement.setAttribute('method', 'POST');

                    const script = document.createElement('script');
                    script.textContent = `
                        document.getElementById('${formName}').addEventListener('submit', function(e) {
                            e.preventDefault();
                            const formData = new FormData(this);
                            const data = {};
                            for (let [key, value] of formData.entries()) {
                                if (key.endsWith('[]')) {
                                    const fieldName = key.slice(0, -2);
                                    if (!data[fieldName]) {
                                        data[fieldName] = [];
                                    }
                                    data[fieldName].push(value);
                                } else if (this.querySelector('input[name="' + key + '"][type="checkbox"]')) {
                                     data[key] = this.querySelector('input[name="' + key + '"]').checked;
                                } else {
                                    data[key] = value;
                                }
                            }
                            console.log('Form Submitted (exported HTML):', data);
                            alert('Form submitted successfully! Check console for data.');
                        });
                    `;
                    fullHtmlContent += `<script>${script.textContent}</script>\n`;
                }
            }
            fullHtmlContent += tempDiv.innerHTML + '\n';
        });

        fullHtmlContent += `
</body>
</html>
        `;

        const blob = new Blob([fullHtmlContent], { type: 'text/html' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'my-website.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        showFeedback('Website exported as HTML!', 'success');
    }, [droppedComponents, showFeedback]);

    // Form submission simulation handler
    const handleTestSubmitForm = useCallback(() => {
        if (!activeDroppedComponentId) {
            showFeedback('No form selected!', 'error');
            return;
        }

        const activeFormElement = document.getElementById(activeDroppedComponentId);
        if (!activeFormElement || activeFormElement.tagName !== 'FORM') {
            showFeedback('Selected component is not a form!', 'error');
            return;
        }

        const formData = {};
        activeFormElement.querySelectorAll('[data-form-field="true"]').forEach(field => {
            const fieldName = field.name || field.id;
            if (!fieldName) {
                console.warn('Form field missing name or id:', field);
                return;
            }

            if (field.type === 'checkbox') {
                formData[fieldName] = field.checked;
            } else if (field.tagName === 'SELECT') {
                formData[fieldName] = field.value;
            } else {
                formData[fieldName] = field.value;
            }
        });

        setFormSubmissions(prev => ({
            ...prev,
            [activeDroppedComponentId]: [...(prev[activeDroppedComponentId] || []), formData]
        }));

        showFeedback('Form data submitted (in builder)!', 'success');

        activeFormElement.querySelectorAll('input, textarea, select').forEach(field => {
            if (field.type === 'checkbox') {
                field.checked = false;
            } else if (field.tagName === 'SELECT') {
                field.selectedIndex = 0;
            } else {
                field.value = '';
            }
        });

    }, [activeDroppedComponentId, setFormSubmissions, showFeedback]);

    // View submissions handler
    const handleViewSubmissions = useCallback(() => {
        if (!activeDroppedComponentId) {
            showFeedback('No form selected to view submissions!', 'error');
            return;
        }
        const activeComponent = droppedComponents.find(comp => comp.id === activeDroppedComponentId);
        if (!activeComponent || !activeComponent.html.includes('<form')) {
            showFeedback('Selected component is not a form to view submissions!', 'error');
            return;
        }
        setShowSubmissionsModal(true);
    }, [activeDroppedComponentId, droppedComponents, showFeedback]);

    // Export submissions handler
    const handleExportSubmissions = useCallback(() => {
        if (!activeDroppedComponentId) {
            showFeedback('No form selected to export submissions!', 'error');
            return;
        }
        const submissions = formSubmissions[activeDroppedComponentId] || [];
        const dataStr = JSON.stringify(submissions, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `form_submissions_${activeDroppedComponentId}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        showFeedback('Submissions exported as JSON!', 'success');
    }, [activeDroppedComponentId, formSubmissions, showFeedback]);

    // Effect to handle clicks outside the active component or toolbar to hide the toolbar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDroppedComponentId) {
                const clickedElement = event.target;
                const activeComponentElement = document.getElementById(activeDroppedComponentId);

                const isClickOutsideComponent = activeComponentElement && !activeComponentElement.contains(clickedElement);
                const isClickOutsideToolbar = editorToolbarRef.current && !editorToolbarRef.current.contains(clickedElement);
                const isClickOutsideModal = showRemovalModal || showSubmissionsModal;

                if (isClickOutsideComponent && isClickOutsideToolbar && !isClickOutsideModal) {
                    setActiveDroppedComponentId(null);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [activeDroppedComponentId, showRemovalModal, showSubmissionsModal]);

    // LeftPanel Component: Manages draggable components and custom HTML input.
    const LeftPanel = ({ componentHTML, templateHTML, customComponents, onDragStart, onAddCustomComponent, customCodeInputRef, onExportCustomComponentToFile, onImportCustomComponentFromFile, customFileInputRef }) => {
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
                            className="custom-component-card p-4 bg-gray-200 rounded-lg shadow-sm text-gray-800 text-center text-sm font-medium hover:bg-gray-300 transition-transform duration-100 ease-in-out active:scale-98 hover:shadow-md flex flex-col items-center gap-2"
                        >
                            <span>{comp.name}</span>
                            <div className="flex gap-2 w-full">
                                <button
                                    className="bg-yellow-500 text-white py-1 px-3 rounded-md text-xs font-semibold hover:bg-yellow-600 transition-colors duration-200 flex-grow"
                                    draggable="true" // Make custom components draggable directly from here
                                    onDragStart={(e) => onDragStart(e, 'custom', comp.html)}
                                >
                                    Drag
                                </button>
                                <button
                                    className="bg-sky-500 text-white py-1 px-3 rounded-md text-xs font-semibold hover:bg-sky-600 transition-colors duration-200 flex-grow"
                                    onClick={() => onExportCustomComponentToFile(comp)}
                                >
                                    Export
                                </button>
                            </div>
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

                    <h3 className="text-lg font-semibold mt-6 mb-2 text-gray-800">Import from File</h3>
                    <input
                        type="file"
                        accept=".html,.txt"
                        ref={customFileInputRef}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                        onChange={onImportCustomComponentFromFile}
                    />
                </div>
            </div>
        );
    };

    // DroppedComponent: Renders an individual component on the canvas.
    const DroppedComponent = ({ component, isActive, onClick, onContentEdit, onDragStart, onDragOver, onDragEnd, isBeingDragged }) => {
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
                className={`w-full shadow-md hover:shadow-lg transition-all duration-300 rounded-lg overflow-hidden ${isActive ? 'active-component' : ''} ${isBeingDragged ? 'dragging-invisible' : ''}`}
                style={inlineStyles} // Apply dynamic styles
                dangerouslySetInnerHTML={{ __html: component.html }}
                onClick={(e) => onClick(e, component.id)}
                onInput={(e) => onContentEdit(component.id, e)} // Capture contenteditable changes
                draggable="true" // Make it draggable
                onDragStart={onDragStart} // Pass drag start handler from parent
                onDragOver={onDragOver}   // Pass drag over handler from parent
                onDragEnd={onDragEnd}     // Pass drag end handler from parent
            />
        );
    };

    // EditorToolbar: Provides controls for editing the active component's styles and actions.
    const EditorToolbar = ({
        editorToolbarRef,
        activeComponentStyles,
        onStyleChange,
        onRemoveComponent,
        isForm,
        onTestSubmitForm,
        onViewSubmissions
    }) => {
        const currentBgColor = activeComponentStyles.backgroundColor
            ? activeComponentStyles.backgroundColor.startsWith('#')
                ? activeComponentStyles.backgroundColor
                : rgbToHex(activeComponentStyles.backgroundColor)
            : '#ffffff'; // Default to white if not set or invalid

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
                        value={currentBgColor}
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

    // RightPanel Component: Contains the canvas, viewport controls, and save/export buttons.
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
        canvasWrapperRef,
        onDrop,
        draggedItemIndex, // Pass down the new state
        handleDragStartInternal, // Pass down internal drag handlers
        handleDragOverInternal,
        handleDragEndInternal
    }) => {
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
                    onDragOver={(e) => e.preventDefault()} // Allow drop on the canvas area
                    onDrop={onDrop} // Handle drop of new components from left panel
                >
                    <div id="canvas" className="min-h-full w-full flex flex-col items-center gap-4 p-4">
                        {droppedComponents.length === 0 ? (
                            <div className="text-gray-400 text-xl font-medium p-8 border border-dashed border-gray-300 rounded-lg bg-gray-50">
                                Drag and drop components or templates here!
                            </div>
                        ) : (
                            droppedComponents.map((component, index) => (
                                <DroppedComponent
                                    key={component.id}
                                    component={component}
                                    isActive={activeDroppedComponentId === component.id}
                                    onClick={onComponentClick}
                                    onContentEdit={onContentEdit}
                                    // Props for internal reordering
                                    onDragStart={(e) => handleDragStartInternal(e, index)}
                                    onDragOver={(e) => handleDragOverInternal(e, index)}
                                    onDragEnd={handleDragEndInternal}
                                    isBeingDragged={draggedItemIndex === index}
                                />
                            ))
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // RemovalConfirmationModal: Displays a confirmation dialog before removing a component.
    const RemovalConfirmationModal = ({ show, onConfirm, onCancel }) => {
        if (!show) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center">
                    <p className="text-lg font-semibold mb-6 text-gray-800">Are you sure you want to remove this component?</p>
                    <div className="flex space-x-4">
                        <button
                            id="confirm-remove"
                            className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition duration-200"
                            onClick={onConfirm}
                        >
                            Yes, Remove
                        </button>
                        <button
                            id="cancel-remove"
                            className="bg-gray-300 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-400 transition duration-200"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    // SubmissionsViewerModal: Displays collected form submissions in a table.
    const SubmissionsViewerModal = ({ show, submissions, onExport, onClose }) => {
        if (!show) return null;

        const headers = submissions.length > 0 ? Object.keys(submissions[0]) : [];

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">Form Submissions</h2>
                        <button
                            className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition duration-200"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                    <div className="overflow-auto flex-grow mb-6 border border-gray-200 rounded-lg">
                        {submissions.length > 0 ? (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr>
                                        {headers.map(key => (
                                            <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {submissions.map((submission, index) => (
                                        <tr key={index}>
                                            {headers.map((key, idx) => (
                                                <td key={idx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {typeof submission[key] === 'boolean' ? (submission[key] ? 'Yes' : 'No') : String(submission[key])}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="p-6 text-gray-500 text-center">No submissions yet for this form.</p>
                        )}
                    </div>
                    <button
                        className="bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 shadow-md"
                        onClick={onExport}
                    >
                        Export Submissions (JSON)
                    </button>
                </div>
            </div>
        );
    };

    // FeedbackMessage: Displays temporary messages to the user.
    const FeedbackMessage = ({ message, type }) => {
        if (!message) return null;

        const bgColorClass = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500',
        }[type] || 'bg-gray-500';

        return (
            <div className={`fixed bottom-4 right-4 p-3 rounded-lg shadow-lg text-white z-50 ${bgColorClass}`}>
                {message}
            </div>
        );
    };


    return (
        <div className="flex bg-gray-100 font-inter min-h-screen overflow-hidden">
            {/* Left Panel */}
            <LeftPanel
                componentHTML={componentHTML}
                templateHTML={templateHTML}
                customComponents={customComponents}
                onDragStart={handleDragStart}
                onAddCustomComponent={handleAddCustomComponent}
                customCodeInputRef={customCodeInputRef}
                onExportCustomComponentToFile={handleExportCustomComponentToFile}
                onImportCustomComponentFromFile={handleImportCustomComponentFromFile}
                customFileInputRef={customFileInputRef}
            />

            {/* Right Panel */}
            <RightPanel
                onSaveProject={handleSaveProject}
                onExportProject={handleExportProject}
                canvasView={canvasView}
                setCanvasView={setCanvasView}
                activeDroppedComponentId={activeDroppedComponentId}
                editorToolbarRef={editorToolbarRef}
                onStyleChange={handleStyleChange}
                onRemoveComponent={handleRemoveComponent}
                onTestSubmitForm={handleTestSubmitForm}
                onViewSubmissions={handleViewSubmissions}
                droppedComponents={droppedComponents}
                onComponentClick={handleComponentClick}
                onContentEdit={handleContentEdit}
                canvasWrapperRef={canvasWrapperRef}
                onDrop={handleDrop}
                draggedItemIndex={draggedItemIndex} // Pass to RightPanel
                handleDragStartInternal={handleDragStartInternal} // Pass to RightPanel
                handleDragOverInternal={handleDragOverInternal}   // Pass to RightPanel
                handleDragEndInternal={handleDragEndInternal}     // Pass to RightPanel
            />

            {/* Modals */}
            <RemovalConfirmationModal
                show={showRemovalModal}
                onConfirm={confirmRemove}
                onCancel={cancelRemove}
            />
            <SubmissionsViewerModal
                show={showSubmissionsModal}
                submissions={formSubmissions[activeDroppedComponentId] || []}
                onExport={handleExportSubmissions}
                onClose={() => setShowSubmissionsModal(false)}
            />

            {/* Feedback Message */}
            <FeedbackMessage
                message={feedbackMessage.text}
                type={feedbackMessage.type}
            />
        </div>
    );
};

export default App;
