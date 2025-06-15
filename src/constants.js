// Pre-defined HTML for standard components
export const componentHTML = {
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
export const templateHTML = {
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