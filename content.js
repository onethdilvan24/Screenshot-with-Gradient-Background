class ScreenshotProcessor {
    constructor() {
        this.setupMessageListener();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
            if (request.action === 'ping') {
                sendResponse({ success: true, message: 'Content script is active' });
                return;
            }

            if (request.action === 'processScreenshot') {
                this.processScreenshot(request.dataUrl, request.settings)
                    .then(() => sendResponse({ success: true }))
                    .catch((error) => {
                        sendResponse({ success: false, error: error.message });
                    });
                return true; // Keep message channel open for async response
            }
        });
    }

    async processScreenshot(dataUrl, settings) {
        try {
            // Create image from dataURL
            const img = await this.loadImage(dataUrl);

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
            await this.applyBackground(ctx, canvasWidth, canvasHeight, settings);

            // Draw screenshot centered with padding
            ctx.drawImage(img, padding, padding, img.width, img.height);

            // Convert to blob and download
            canvas.toBlob((blob) => {
                this.downloadImage(blob);
            }, 'image/png', 1.0);

        } catch (error) {
            throw new Error(`Failed to process screenshot: ${error.message}`);
        }
    }

    loadImage(dataUrl) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = dataUrl;
        });
    }

    async applyBackground(ctx, width, height, settings) {
        const { backgroundType, gradient } = settings;

        switch (backgroundType) {
            case 'gradient':
                await this.applyGradientBackground(ctx, width, height, gradient);
                break;
            case 'solid':
                ctx.fillStyle = settings.solidColor || '#ffffff';
                ctx.fillRect(0, 0, width, height);
                break;
            case 'transparent':
                // Do nothing - canvas is transparent by default
                break;
        }
    }

    async applyGradientBackground(ctx, width, height, gradientCSS) {
        // Parse CSS gradient to create canvas gradient
        const gradientData = this.parseGradientCSS(gradientCSS);

        let gradient;
        if (gradientData.type === 'linear') {
            // Create linear gradient
            const { angle, stops } = gradientData;
            const coords = this.calculateLinearGradientCoords(angle, width, height);
            gradient = ctx.createLinearGradient(coords.x0, coords.y0, coords.x1, coords.y1);

            // Add color stops
            stops.forEach(stop => {
                gradient.addColorStop(stop.position, stop.color);
            });
        } else {
            // Fallback to simple gradient
            gradient = ctx.createLinearGradient(0, 0, width, height);
            gradient.addColorStop(0, '#667eea');
            gradient.addColorStop(1, '#764ba2');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }

    parseGradientCSS(gradientCSS) {
        try {
            // Simple parser for linear gradients
            const match = gradientCSS.match(/linear-gradient\((.+)\)/);
            if (!match) throw new Error('Invalid gradient format');

            const parts = match[1].split(',').map(part => part.trim());
            let angle = 135; // default angle
            let colorParts = parts;

            // Check if first part is angle
            if (parts[0].includes('deg')) {
                angle = parseInt(parts[0].replace('deg', ''));
                colorParts = parts.slice(1);
            }

            // Parse color stops
            const stops = colorParts.map((part, index) => {
                const colorMatch = part.match(/(#[a-fA-F0-9]{6}|#[a-fA-F0-9]{3}|rgb\(.+\)|rgba\(.+\))/);
                const percentMatch = part.match(/(\d+)%/);

                return {
                    color: colorMatch ? colorMatch[1] : '#000000',
                    position: percentMatch ? parseInt(percentMatch[1]) / 100 : index / (colorParts.length - 1)
                };
            });

            return { type: 'linear', angle, stops };
        } catch (error) {
            // Fallback gradient
            return {
                type: 'linear',
                angle: 135,
                stops: [
                    { color: '#667eea', position: 0 },
                    { color: '#764ba2', position: 1 }
                ]
            };
        }
    }

    calculateLinearGradientCoords(angle, width, height) {
        // Convert angle to radians
        const radians = (angle - 90) * (Math.PI / 180);

        // Calculate gradient line endpoints
        const centerX = width / 2;
        const centerY = height / 2;

        // Calculate the maximum distance from center to corner
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        const x0 = centerX - Math.cos(radians) * maxDistance;
        const y0 = centerY - Math.sin(radians) * maxDistance;
        const x1 = centerX + Math.cos(radians) * maxDistance;
        const y1 = centerY + Math.sin(radians) * maxDistance;

        return { x0, y0, x1, y1 };
    }

    downloadImage(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        a.href = url;
        a.download = `screenshot-${timestamp}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }
}

// Initialize when content script loads
new ScreenshotProcessor();