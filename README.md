# Screenshot with Gradient Background - Chrome Extension

A Chrome extension that captures screenshots of web pages and adds customizable gradient backgrounds with padding, eliminating the need for external editing tools.

## Features

- **Instant Screenshot Capture**: One-click screenshot of the current tab
- **Customizable Backgrounds**: 
  - Multiple gradient presets (Blue to Purple, Pink to Red, etc.)
  - Solid color backgrounds
  - Transparent backgrounds
- **Adjustable Padding**: Slider control from 0-200px
- **Live Preview**: See your background choice before capturing
- **Auto Download**: Screenshots are automatically downloaded to your default folder

## Project Structure

```
screenshot-extension/
├── manifest.json          # Extension configuration
├── popup.html             # UI interface
├── popup.js              # Popup functionality
├── content.js            # Screenshot processing
├── background.js         # Background service worker
├── icons/               # Extension icons (you need to add these)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md            # This file
```

## Installation & Development Setup

### 1. Create Project Directory
```bash
mkdir screenshot-extension
cd screenshot-extension
```

### 2. Add Files
Copy all the provided code files into your project directory:
- `manifest.json`
- `popup.html`
- `popup.js`
- `content.js`
- `background.js`

### 3. Create Icons Directory
Create an `icons` folder and add PNG icons in these sizes:
- 16x16 pixels (icon16.png)
- 32x32 pixels (icon32.png)  
- 48x48 pixels (icon48.png)
- 128x128 pixels (icon128.png)

You can create simple icons or use online generators like [Chrome Extension Icon Generator](https://chrome-extension-icon-generator.vercel.app/).

### 4. Load Extension in Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked" button
4. Select your `screenshot-extension` folder
5. The extension should now appear in your extensions list

### 5. Test the Extension

1. Navigate to any webpage
2. Click the extension icon in the toolbar
3. Adjust settings (background type, gradient, padding)
4. Click "Capture Screenshot"
5. The processed image will download automatically

## Development with Cursor

### Recommended Cursor Setup

1. **Extensions**: Install these Cursor/VS Code extensions:
   - Web Extension Tools
   - JavaScript (ES6) code snippets
   - HTML CSS Support
   - Chrome Extension Development

2. **Project Configuration**: Create `.vscode/settings.json`:
```json
{
  "files.associations": {
    "*.json": "jsonc"
  },
  "html.suggest.html5": true,
  "javascript.suggest.autoImports": true
}
```

### Development Workflow

1. **Make Changes**: Edit files in Cursor
2. **Reload Extension**: Go to `chrome://extensions/` and click reload button on your extension
3. **Test**: Click extension icon and test new functionality
4. **Debug**: Use Chrome DevTools:
   - Right-click extension popup → "Inspect"
   - Check Console tab for errors
   - Use Network tab to monitor API calls

### Debugging Tips

- **Popup Issues**: Right-click the extension icon and select "Inspect popup"
- **Content Script Issues**: Open DevTools on the webpage and check Console
- **Background Script Issues**: Go to `chrome://extensions/`, find your extension, click "Inspect views: service worker"

## API Reference

### Storage
The extension uses `chrome.storage.local` to persist user preferences:

```javascript
// Save settings
await chrome.storage.local.set({ screenshotSettings: settings });

// Load settings  
const result = await chrome.storage.local.get('screenshotSettings');
```

### Screenshot Capture
Uses Chrome's `captureVisibleTab` API:

```javascript
const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
  format: 'png',
  quality: 100
});
```

### Message Passing
Communication between popup and content scripts:

```javascript
// From popup
await chrome.tabs.sendMessage(tabId, {
  action: 'processScreenshot',
  dataUrl: dataUrl,
  settings: settings
});

// In content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'processScreenshot') {
    // Process screenshot
  }
});
```

## Customization Options

### Adding New Gradients
Edit `popup.html` and add new options to the gradient select:

```html
<option value="linear-gradient(135deg, #ff6b6b 0%, #4ecdc4 100%)">Red to Teal</option>
```

### Modifying UI
The popup uses vanilla CSS. Key classes:
- `.container`: Main popup container
- `.control-group`: Form control wrapper
- `.preview`: Background preview area
- `.capture-btn`: Main action button

### Extending Functionality
Possible enhancements:
- Custom color picker for solid backgrounds
- Multiple screenshot formats (JPEG, WebP)
- Batch screenshot capture
- Cloud storage integration
- Social sharing features

## Browser Compatibility

- **Chrome**: Full support (Manifest V3)
- **Edge**: Full support (Chromium-based)
- **Firefox**: Requires manifest modifications (V2)
- **Safari**: Not supported (different extension system)

## Permissions Explained

- `activeTab`: Required to capture screenshots of current tab
- `tabs`: Needed to query active tab information  
- `storage`: Used to save/load user preferences

## Troubleshooting

### Common Issues

1. **Extension won't load**
   - Check manifest.json syntax
   - Ensure all referenced files exist
   - Verify permissions are correct

2. **Screenshot capture fails**
   - Check if tab is capturable (some system pages block capture)
   - Verify activeTab permission is granted
   - Check browser console for errors

3. **Popup doesn't open**
   - Check popup.html file path in manifest
   - Verify popup.js is loading without errors
   - Check extension permissions

### Debug Logs

Add console.log statements throughout your code:

```javascript
console.log('Extension loaded');
console.log('Settings:', settings);
console.log('Screenshot captured:', dataUrl);
```

## Performance Considerations

- Screenshots are processed in-memory to avoid storage issues
- Large images may take longer to process
- Canvas operations are synchronous and may block UI briefly
- Consider adding loading states for better UX

## Security Notes

- Extension only accesses active tab content
- No external API calls or data transmission
- All processing happens locally in browser
- Downloads use browser's built-in security

---

## Next Steps

1. Set up the project structure
2. Load the extension in Chrome
3. Test basic functionality
4. Customize gradients and styling
5. Add additional features as needed

Happy coding! 🚀
