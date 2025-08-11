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
        this.gradientSelect = document.getElementById('gradientSelect');
        this.gradientGroup = document.getElementById('gradientGroup');
        this.paddingSlider = document.getElementById('paddingSlider');
        this.paddingValue = document.getElementById('paddingValue');
        this.preview = document.getElementById('preview');
        this.captureBtn = document.getElementById('captureBtn');
        this.status = document.getElementById('status');
        this.screenshotPreview = document.getElementById('screenshotPreview');
        this.solidGroup = document.getElementById('solidGroup');
        this.colorPalette = document.getElementById('colorPalette');

        // Initialize selected solid color
        this.selectedSolidColor = '#ffffff';

        // Check if all elements are found
        if (!this.backgroundType || !this.gradientSelect || !this.gradientGroup ||
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

        this.gradientSelect.addEventListener('change', () => {
            this.updatePreview();
            this.saveSettings();
            this.generatePreview(); // Live update
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

    updatePreview() {
        const backgroundType = this.backgroundType.value;
        let background;

        switch (backgroundType) {
            case 'gradient':
                background = this.gradientSelect.value;
                break;
            case 'solid':
                background = this.selectedSolidColor;
                break;
            case 'transparent':
                background = 'transparent';
                break;
            default:
                background = this.gradientSelect.value;
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
            gradient: this.gradientSelect.value,
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
                    this.gradientSelect.value = settings.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    this.selectedSolidColor = settings.solidColor || '#ffffff';
                    this.paddingSlider.value = settings.padding || 50;
                    this.paddingValue.textContent = `${this.paddingSlider.value}px`;

                    // Update color selection in palette
                    this.updateColorSelection();
                }
            } else {
                // Set default values if Chrome APIs not available
                this.backgroundType.value = 'gradient';
                this.gradientSelect.value = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                this.paddingSlider.value = 50;
                this.paddingValue.textContent = '50px';
            }

            this.toggleGradientGroup();
            this.updatePreview();
        } catch (error) {
            console.error('Error loading settings:', error);
            // Set default values on error
            this.backgroundType.value = 'gradient';
            this.gradientSelect.value = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            this.paddingSlider.value = 50;
            this.paddingValue.textContent = '50px';
            this.toggleGradientGroup();
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
                        gradient: this.gradientSelect.value,
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

            console.log('Chrome APIs available');

            // Get current settings
            const settings = {
                backgroundType: this.backgroundType.value,
                gradient: this.gradientSelect.value,
                solidColor: this.selectedSolidColor,
                padding: parseInt(this.paddingSlider.value)
            };

            console.log('Settings:', settings);

            // Get active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log('Active tab:', tab);

            if (!tab) {
                throw new Error('No active tab found');
            }

            if (!tab.id) {
                throw new Error('Invalid tab ID');
            }

            this.showStatus('Capturing screenshot...', 'success');

            // Capture the visible tab
            const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
                format: 'png',
                quality: 100
            });

            if (!dataUrl) {
                throw new Error('Failed to capture screenshot');
            }

            console.log('Screenshot captured, data URL length:', dataUrl.length);
            this.showStatus('Processing screenshot...', 'success');

            // Test if content script is available
            try {
                const testResponse = await chrome.tabs.sendMessage(tab.id, { action: 'ping' });
                console.log('Content script ping response:', testResponse);
            } catch (pingError) {
                console.warn('Content script not responding to ping:', pingError);
                // Try to inject content script manually
                try {
                    await chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['content.js']
                    });
                    console.log('Content script injected manually');
                } catch (injectError) {
                    console.error('Failed to inject content script:', injectError);
                    throw new Error('Content script not available. Try reloading the page.');
                }
            }

            // Send to content script for processing
            const response = await chrome.tabs.sendMessage(tab.id, {
                action: 'processScreenshot',
                dataUrl: dataUrl,
                settings: settings
            });

            console.log('Content script response:', response);

            if (response && response.success === false) {
                throw new Error(response.error || 'Content script processing failed');
            }

            this.showStatus('Screenshot captured and processed!', 'success');

        } catch (error) {
            console.error('Error capturing screenshot:', error);
            let errorMessage = error.message;

            // Provide more user-friendly error messages
            if (errorMessage.includes('Cannot access')) {
                errorMessage = 'Cannot capture this page. Try a regular webpage.';
            } else if (errorMessage.includes('No active tab')) {
                errorMessage = 'Please make sure you have an active tab open.';
            } else if (errorMessage.includes('Could not establish connection')) {
                errorMessage = 'Content script not loaded. Try reloading the page.';
            } else if (errorMessage.includes('Extension context invalidated')) {
                errorMessage = 'Extension needs to be reloaded. Go to chrome://extensions/ and reload.';
            }

            this.showStatus('Error: ' + errorMessage, 'error');
        } finally {
            this.captureBtn.disabled = false;
            this.captureBtn.textContent = 'Capture Screenshot';
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ScreenshotPopup();
});