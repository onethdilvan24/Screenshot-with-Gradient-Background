class ScreenshotPopup {
    constructor() {
        this.initElements();
        this.loadSettings();
        this.attachEventListeners();
        this.updatePreview();
        this.generateInitialPreview();
    }

    initElements() {
        this.backgroundType = document.getElementById('backgroundType');
        this.gradientGroup = document.getElementById('gradientGroup');
        this.gradientPalette = document.getElementById('gradientPalette');
        this.paddingSlider = document.getElementById('paddingSlider');
        this.paddingValue = document.getElementById('paddingValue');
        this.preview = document.getElementById('preview');
        this.captureBtn = document.getElementById('captureBtn');
        this.status = document.getElementById('status');
        this.screenshotPreview = document.getElementById('screenshotPreview');
        this.solidGroup = document.getElementById('solidGroup');
        this.colorPalette = document.getElementById('colorPalette');

        // Initialize selected colors
        this.selectedSolidColor = '#ffffff';
        this.selectedGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';

        // Check if all elements are found
        if (!this.backgroundType || !this.gradientPalette || !this.gradientGroup ||
            !this.paddingSlider || !this.paddingValue || !this.preview ||
            !this.captureBtn || !this.status || !this.screenshotPreview ||
            !this.solidGroup || !this.colorPalette) {
            console.error('Some DOM elements not found');
            return;
        }
    }

    attachEventListeners() {
        this.backgroundType.addEventListener('change', () => {
            this.toggleGradientGroup();
            this.updatePreview();
            this.saveSettings();
            this.generatePreview(); // Live update
        });

        // Gradient palette event listeners
        this.gradientPalette.addEventListener('click', (e) => {
            if (e.target.classList.contains('gradient-option')) {
                this.selectGradient(e.target);
            }
        });

        this.paddingSlider.addEventListener('input', () => {
            this.paddingValue.textContent = `${this.paddingSlider.value}px`;
            this.updatePreview();
            this.saveSettings();
            this.generatePreview(); // Live update
        });

        this.captureBtn.addEventListener('click', () => {
            this.captureScreenshot();
        });

        // Color palette event listeners
        this.colorPalette.addEventListener('click', (e) => {
            if (e.target.classList.contains('color-option')) {
                this.selectColor(e.target);
            }
        });
    }

    toggleGradientGroup() {
        if (this.backgroundType.value === 'gradient') {
            this.gradientGroup.classList.remove('hidden');
            this.solidGroup.classList.add('hidden');
        } else if (this.backgroundType.value === 'solid') {
            this.gradientGroup.classList.add('hidden');
            this.solidGroup.classList.remove('hidden');
        } else {
            this.gradientGroup.classList.add('hidden');
            this.solidGroup.classList.add('hidden');
        }
    }

    selectColor(colorElement) {
        // Remove previous selection
        this.colorPalette.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selection to clicked color
        colorElement.classList.add('selected');

        // Update selected color
        this.selectedSolidColor = colorElement.getAttribute('data-color');

        // Update preview and save settings
        this.updatePreview();
        this.saveSettings();
        this.generatePreview();
    }

    selectGradient(gradientElement) {
        // Remove previous selection
        this.gradientPalette.querySelectorAll('.gradient-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selection to clicked gradient
        gradientElement.classList.add('selected');

        // Update selected gradient
        this.selectedGradient = gradientElement.getAttribute('data-gradient');

        // Update preview and save settings
        this.updatePreview();
        this.saveSettings();
        this.generatePreview();
    }

    updateColorSelection() {
        // Remove all selections
        this.colorPalette.querySelectorAll('.color-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selection to current color
        const selectedOption = this.colorPalette.querySelector(`[data-color="${this.selectedSolidColor}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
    }

    updateGradientSelection() {
        if (!this.gradientPalette) return;

        // Remove all selections
        this.gradientPalette.querySelectorAll('.gradient-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Add selection to current gradient
        const selectedOption = this.gradientPalette.querySelector(`[data-gradient="${this.selectedGradient}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
        }
    }

    updatePreview() {
        const backgroundType = this.backgroundType.value;
        let background;

        switch (backgroundType) {
            case 'gradient':
                background = this.selectedGradient;
                break;
            case 'solid':
                background = this.selectedSolidColor;
                break;
            case 'transparent':
                background = 'transparent';
                break;
            default:
                background = this.selectedGradient;
        }

        this.preview.style.background = background;
        if (backgroundType === 'transparent') {
            this.preview.style.backgroundImage =
                'linear-gradient(45deg, #ccc 25%, transparent 25%), ' +
                'linear-gradient(-45deg, #ccc 25%, transparent 25%), ' +
                'linear-gradient(45deg, transparent 75%, #ccc 75%), ' +
                'linear-gradient(-45deg, transparent 75%, #ccc 75%)';
            this.preview.style.backgroundSize = '10px 10px';
            this.preview.style.backgroundPosition = '0 0, 0 5px, 5px -5px, -5px 0px';
        } else {
            this.preview.style.backgroundImage = 'none';
        }
    }

    async saveSettings() {
        const settings = {
            backgroundType: this.backgroundType.value,
            gradient: this.selectedGradient,
            solidColor: this.selectedSolidColor,
            padding: parseInt(this.paddingSlider.value)
        };

        try {
            if (chrome && chrome.storage && chrome.storage.local) {
                await chrome.storage.local.set({ screenshotSettings: settings });
            }
        } catch (error) {
            console.error('Error saving settings:', error);
        }
    }

    async loadSettings() {
        try {
            if (chrome && chrome.storage && chrome.storage.local) {
                const result = await chrome.storage.local.get('screenshotSettings');
                const settings = result.screenshotSettings;

                if (settings) {
                    this.backgroundType.value = settings.backgroundType || 'gradient';
                    this.selectedGradient = settings.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    this.selectedSolidColor = settings.solidColor || '#ffffff';
                    this.paddingSlider.value = settings.padding || 50;
                    this.paddingValue.textContent = `${this.paddingSlider.value}px`;

                    // Update selections in palettes
                    this.updateColorSelection();
                    this.updateGradientSelection();
                }
            } else {
                // Set default values if Chrome APIs not available
                this.backgroundType.value = 'gradient';
                this.selectedGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                this.paddingSlider.value = 50;
                this.paddingValue.textContent = '50px';
            }

            this.toggleGradientGroup();
            this.updateGradientSelection();
            this.updatePreview();
        } catch (error) {
            console.error('Error loading settings:', error);
            // Set default values on error
            this.backgroundType.value = 'gradient';
            this.selectedGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            this.paddingSlider.value = 50;
            this.paddingValue.textContent = '50px';
            this.toggleGradientGroup();
            this.updateGradientSelection();
            this.updatePreview();
        }
    }

    showStatus(message, type = 'success') {
        this.status.textContent = message;
        this.status.className = `status ${type}`;
        this.status.classList.remove('hidden');

        setTimeout(() => {
            this.status.classList.add('hidden');
        }, 3000);
    }

    async generateInitialPreview() {
        // Generate preview when extension first opens
        setTimeout(() => {
            // Make sure gradient selection is properly initialized
            this.updateGradientSelection();
            this.generatePreview();
        }, 500); // Small delay to let the popup fully load
    }

    async generatePreview() {
        try {
            // Throttle rapid updates
            if (this.previewTimeout) {
                clearTimeout(this.previewTimeout);
            }

            this.previewTimeout = setTimeout(async () => {
                await this.doGeneratePreview();
            }, 300); // 300ms delay to avoid too many rapid updates

        } catch (error) {
            console.error('Error generating preview:', error);
        }
    }

    async doGeneratePreview() {
        try {
            // Check if Chrome APIs are available
            if (!chrome || !chrome.tabs) {
                this.showPreviewPlaceholder('Chrome APIs not available');
                return;
            }

            // Get active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                this.showPreviewPlaceholder('No active tab found');
                return;
            }

            // Capture the visible tab
            const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
                format: 'png',
                quality: 90 // Slightly lower quality for faster preview
            });

            if (!dataUrl) {
                this.showPreviewPlaceholder('Failed to capture screenshot');
                return;
            }

            // Create preview
            await this.createPreviewCanvas(dataUrl);

        } catch (error) {
            console.error('Error generating preview:', error);
            this.showPreviewPlaceholder('Error: ' + error.message);
        }
    }

    showPreviewPlaceholder(message) {
        this.screenshotPreview.innerHTML = `<div class="preview-placeholder">${message}</div>`;
    }

    async createPreviewCanvas(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // Get current settings
                    const settings = {
                        backgroundType: this.backgroundType.value,
                        gradient: this.selectedGradient,
                        solidColor: this.selectedSolidColor,
                        padding: parseInt(this.paddingSlider.value)
                    };

                    // Calculate preview dimensions (scaled down)
                    const maxPreviewWidth = 250;
                    const maxPreviewHeight = 120;

                    let scale = Math.min(
                        maxPreviewWidth / (img.width + settings.padding * 2),
                        maxPreviewHeight / (img.height + settings.padding * 2)
                    );

                    const previewWidth = (img.width + settings.padding * 2) * scale;
                    const previewHeight = (img.height + settings.padding * 2) * scale;
                    const scaledPadding = settings.padding * scale;

                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = previewWidth;
                    canvas.height = previewHeight;
                    const ctx = canvas.getContext('2d');

                    // Apply background
                    this.applyBackgroundToCanvas(ctx, previewWidth, previewHeight, settings);

                    // Draw scaled screenshot
                    ctx.drawImage(
                        img,
                        scaledPadding,
                        scaledPadding,
                        img.width * scale,
                        img.height * scale
                    );

                    // Clear previous preview and add new canvas
                    this.screenshotPreview.innerHTML = '';
                    this.screenshotPreview.appendChild(canvas);

                    resolve();
                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        });
    }

    applyBackgroundToCanvas(ctx, width, height, settings) {
        const { backgroundType, gradient } = settings;

        switch (backgroundType) {
            case 'gradient':
                this.applyGradientToCanvas(ctx, width, height, gradient);
                break;
            case 'solid':
                ctx.fillStyle = settings.solidColor || this.selectedSolidColor;
                ctx.fillRect(0, 0, width, height);
                break;
            case 'transparent':
                // Create checkerboard pattern for transparency
                this.drawTransparencyPattern(ctx, width, height);
                break;
        }
    }

    applyGradientToCanvas(ctx, width, height, gradientCSS) {
        // Simple gradient parser
        const match = gradientCSS.match(/linear-gradient\((.+)\)/);
        if (!match) return;

        const parts = match[1].split(',').map(part => part.trim());
        let angle = 135;
        let colorParts = parts;

        if (parts[0].includes('deg')) {
            angle = parseInt(parts[0].replace('deg', ''));
            colorParts = parts.slice(1);
        }

        // Create gradient
        const radians = (angle - 90) * (Math.PI / 180);
        const centerX = width / 2;
        const centerY = height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        const x0 = centerX - Math.cos(radians) * maxDistance;
        const y0 = centerY - Math.sin(radians) * maxDistance;
        const x1 = centerX + Math.cos(radians) * maxDistance;
        const y1 = centerY + Math.sin(radians) * maxDistance;

        const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

        // Add color stops
        colorParts.forEach((part, index) => {
            const colorMatch = part.match(/(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3})/);
            if (colorMatch) {
                const color = colorMatch[1];
                const position = index / (colorParts.length - 1);
                gradient.addColorStop(position, color);
            }
        });

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    drawTransparencyPattern(ctx, width, height) {
        const size = 8;
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, width, height);

        ctx.fillStyle = '#e0e0e0';
        for (let x = 0; x < width; x += size) {
            for (let y = 0; y < height; y += size) {
                if ((x / size + y / size) % 2 === 0) {
                    ctx.fillRect(x, y, size, size);
                }
            }
        }
    }

    async captureScreenshot() {
        try {
            this.captureBtn.disabled = true;
            this.captureBtn.textContent = 'Capturing...';
            this.showStatus('Starting capture...', 'success');

            // Check if Chrome APIs are available
            if (!chrome || !chrome.tabs) {
                throw new Error('Chrome extension APIs not available');
            }

            // Get active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab) {
                throw new Error('No active tab found');
            }

            if (!tab.id) {
                throw new Error('Invalid tab ID');
            }

            // Check if this is a restricted page (but don't block, just log)
            const isRestricted = this.isRestrictedUrl(tab.url);
            if (isRestricted) {
                console.log('Note: This appears to be a browser internal page, capture may not work');
            }

            console.log('Capturing tab:', tab.url);

            // Get current settings
            const settings = {
                backgroundType: this.backgroundType.value,
                gradient: this.selectedGradient,
                solidColor: this.selectedSolidColor,
                padding: parseInt(this.paddingSlider.value)
            };

            this.showStatus('Capturing screenshot...', 'success');

            // Capture the visible tab - let Chrome handle restrictions
            let dataUrl;
            try {
                dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
                    format: 'png',
                    quality: 100
                });
            } catch (captureError) {
                // Handle specific capture errors
                if (captureError.message.includes('Cannot access')) {
                    throw new Error('Cannot capture this page. This might be a browser internal page or a page with restricted access.');
                } else if (captureError.message.includes('active tab')) {
                    throw new Error('Cannot capture inactive tab. Please make sure the tab is active and visible.');
                } else {
                    throw new Error(`Screenshot capture failed: ${captureError.message}`);
                }
            }

            if (!dataUrl) {
                throw new Error('Screenshot capture returned empty data');
            }

            console.log('Screenshot captured successfully');
            this.showStatus('Processing screenshot...', 'success');

            // Try to process with content script first, with graceful fallback
            let processed = false;

            // Only try content script on regular web pages
            if (!isRestricted) {
                try {
                    // Check if content script is available
                    await this.ensureContentScriptLoaded(tab.id);

                    // Send to content script for processing
                    const response = await chrome.tabs.sendMessage(tab.id, {
                        action: 'processScreenshot',
                        dataUrl: dataUrl,
                        settings: settings
                    });

                    if (response && response.success !== false) {
                        processed = true;
                        console.log('Content script processing successful');
                    }
                } catch (contentScriptError) {
                    // Silently fall back - this is expected on some pages
                    console.log('Using fallback processing (content script unavailable)');
                }
            }

            // Fallback: process in popup if content script failed or page is restricted
            if (!processed) {
                await this.processScreenshotInPopup(dataUrl, settings);
            }

            this.showStatus('Screenshot captured and processed!', 'success');

        } catch (error) {
            console.error('Error capturing screenshot:', error);
            this.showStatus('Error: ' + this.getErrorMessage(error), 'error');
        } finally {
            this.captureBtn.disabled = false;
            this.captureBtn.textContent = 'Capture Screenshot';
        }
    }

    isRestrictedUrl(url) {
        if (!url) return true;

        // Only block the most restrictive browser internal pages
        const restrictedPrefixes = [
            'chrome://',
            'chrome-extension://',
            'moz-extension://',
            'edge://',
            'about:',
            'javascript:'
        ];

        // Allow file:// and data: URLs as they might be capturable
        // Allow most web content including HTTPS, HTTP, local servers, etc.
        return restrictedPrefixes.some(prefix => url.startsWith(prefix));
    }

    async ensureContentScriptLoaded(tabId) {
        try {
            // Test if content script is available
            const testResponse = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
            if (testResponse && testResponse.success) {
                return; // Content script is available
            }
        } catch (pingError) {
            // Content script not loaded, try to inject
        }

        // Try to inject content script manually
        try {
            await chrome.scripting.executeScript({
                target: { tabId: tabId },
                files: ['content.js']
            });

            // Wait a bit for the script to initialize
            await new Promise(resolve => setTimeout(resolve, 150));

            // Test again
            const testResponse = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
            if (!testResponse || !testResponse.success) {
                throw new Error('Content script failed to initialize');
            }

        } catch (injectError) {
            // This is expected on some pages, throw to trigger fallback
            throw new Error('Content script injection failed');
        }
    }

    async processScreenshotInPopup(dataUrl, settings) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                try {
                    // Calculate dimensions with padding
                    const padding = settings.padding;
                    const canvasWidth = img.width + (padding * 2);
                    const canvasHeight = img.height + (padding * 2);

                    // Create canvas
                    const canvas = document.createElement('canvas');
                    canvas.width = canvasWidth;
                    canvas.height = canvasHeight;
                    const ctx = canvas.getContext('2d');

                    // Apply background
                    this.applyBackgroundToCanvas(ctx, canvasWidth, canvasHeight, settings);

                    // Draw screenshot centered with padding
                    ctx.drawImage(img, padding, padding, img.width, img.height);

                    // Convert to blob and download
                    canvas.toBlob((blob) => {
                        if (blob) {
                            this.downloadImage(blob);
                            resolve();
                        } else {
                            reject(new Error('Failed to create image blob'));
                        }
                    }, 'image/png', 1.0);

                } catch (error) {
                    reject(error);
                }
            };
            img.onerror = () => reject(new Error('Failed to load screenshot image'));
            img.src = dataUrl;
        });
    }

    downloadImage(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        a.href = url;
        a.download = `screenshot-${timestamp}.png`;
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    getErrorMessage(error) {
        const message = error.message || error.toString();

        // Provide more user-friendly error messages
        if (message.includes('Cannot access') || message.includes('access denied')) {
            return 'Cannot capture this page. Some pages like browser settings, extensions page, or certain secure sites cannot be captured for security reasons.';
        } else if (message.includes('Cannot capture this page. This might be a browser internal page')) {
            return 'Cannot capture this page. Browser internal pages and some secure sites restrict screenshot access.';
        } else if (message.includes('No active tab')) {
            return 'Please make sure you have an active tab open.';
        } else if (message.includes('Could not establish connection')) {
            return 'Unable to connect to the page. Try reloading the page and try again.';
        } else if (message.includes('Extension context invalidated')) {
            return 'Extension needs to be reloaded. Go to chrome://extensions/ and reload this extension.';
        } else if (message.includes('Content script not available')) {
            return 'Processing in fallback mode. Screenshot will still be captured.';
        } else if (message.includes('Screenshot capture failed')) {
            return message; // Use the detailed capture error message
        } else {
            return message;
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScreenshotPopup();
});