class ScreenshotPopup {
    constructor() {
      this.initElements();
      this.loadSettings();
      this.attachEventListeners();
      this.updatePreview();
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
    }
  
    attachEventListeners() {
      this.backgroundType.addEventListener('change', () => {
        this.toggleGradientGroup();
        this.updatePreview();
        this.saveSettings();
      });
  
      this.gradientSelect.addEventListener('change', () => {
        this.updatePreview();
        this.saveSettings();
      });
  
      this.paddingSlider.addEventListener('input', () => {
        this.paddingValue.textContent = `${this.paddingSlider.value}px`;
        this.updatePreview();
        this.saveSettings();
      });
  
      this.captureBtn.addEventListener('click', () => {
        this.captureScreenshot();
      });
    }
  
    toggleGradientGroup() {
      if (this.backgroundType.value === 'gradient') {
        this.gradientGroup.classList.remove('hidden');
      } else {
        this.gradientGroup.classList.add('hidden');
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
          background = '#ffffff';
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
        padding: parseInt(this.paddingSlider.value)
      };
  
      try {
        await chrome.storage.local.set({ screenshotSettings: settings });
      } catch (error) {
        console.error('Error saving settings:', error);
      }
    }
  
    async loadSettings() {
      try {
        const result = await chrome.storage.local.get('screenshotSettings');
        const settings = result.screenshotSettings;
  
        if (settings) {
          this.backgroundType.value = settings.backgroundType || 'gradient';
          this.gradientSelect.value = settings.gradient || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
          this.paddingSlider.value = settings.padding || 50;
          this.paddingValue.textContent = `${this.paddingSlider.value}px`;
        }
  
        this.toggleGradientGroup();
        this.updatePreview();
      } catch (error) {
        console.error('Error loading settings:', error);
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
  
    async captureScreenshot() {
      try {
        this.captureBtn.disabled = true;
        this.captureBtn.textContent = 'Capturing...';
  
        // Get current settings
        const settings = {
          backgroundType: this.backgroundType.value,
          gradient: this.gradientSelect.value,
          padding: parseInt(this.paddingSlider.value)
        };
  
        // Get active tab
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        if (!tab) {
          throw new Error('No active tab found');
        }
  
        // Capture the visible tab
        const dataUrl = await chrome.tabs.captureVisibleTab(tab.windowId, {
          format: 'png',
          quality: 100
        });
  
        // Send to content script for processing
        await chrome.tabs.sendMessage(tab.id, {
          action: 'processScreenshot',
          dataUrl: dataUrl,
          settings: settings
        });
  
        this.showStatus('Screenshot captured and processed!', 'success');
        
      } catch (error) {
        console.error('Error capturing screenshot:', error);
        this.showStatus('Error capturing screenshot: ' + error.message, 'error');
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