I'll help you understand how to customize and extend Flowway TV OS. First, let's center the boot animation.

Center boot animation and add customization guide

src/css/boot.css
npm run dev
Now let me explain how to customize and extend the OS:

Adding New Apps:
Create a new app file in src/js/apps/ (e.g., calculator.js)
Add app template in index.html inside <!-- App Templates -->
Add app styles in src/css/apps/ (e.g., calculator.css)
Link CSS in index.html
Add app icon to dock in index.html
Example structure for a new app:


// src/js/apps/calculator.js
const FlowCalculator = {
  appId: 'calculator',
  
  init() {
    // Initialize app
  },
  
  open() {
    // Check if window exists
    if (FlowWindows.exists(this.appId)) {
      FlowWindows.bringToFront(this.appId);
      return;
    }
    
    // Create window from template
    const template = document.getElementById('calculator-app-template');
    const content = template.content.cloneNode(true);
    
    const window = FlowWindows.create(this.appId, 'Calculator', content, {
      width: 300,
      height: 400
    });
    
    // Set up events
    this.setupEvents(window);
  }
};
Customizing the OS:
Change colors: Edit CSS variables in src/css/main.css
Modify animations: Update transitions in respective CSS files
Add wallpapers: Add URLs to wallpaper options in src/js/utils/ui.js
Change dock behavior: Modify src/js/core/dock.js
Customize windows: Edit src/css/windows.css
Key Files to Know:
src/js/core/os.js: Main OS functionality
src/js/core/windows.js: Window management
src/js/utils/ui.js: UI utilities
src/css/main.css: Global styles
index.html: App templates and structure
Data Storage:
Use FlowStorage utility for persistent storage:

// Save data
FlowStorage.set('myAppData', { key: 'value' });

// Load data
const data = FlowStorage.get('myAppData', defaultValue);
Notifications:
Show notifications using FlowUI:

FlowUI.showNotification('Message', 'success', 3000);
Remember to initialize new apps in src/js/core/os.js by adding them to the initApps() method and register them in the openApp() method.