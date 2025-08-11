// Background script for Chrome Extension
class ScreenshotBackground {
    constructor() {
      this.setupInstallListener();
      this.setupMessageListener();
    }
  
    setupInstallListener() {
      chrome.runtime.onInstalled.addListener((details) => {
        if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
          console.log('Screenshot extension installed successfully');
          this.setDefaultSettings();
        }
      });
    }
  
    setupMessageListener() {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.action === 'captureTab') {
          this.captureVisibleTab(sender.tab.windowId)
            .then(dataUrl => sendResponse({ success: true, dataUrl }))
            .catch(error => sendResponse({ success: false, error: error.message }));
          return true; // Keep message channel open for async response
        }
      });
    }
  
    async captureVisibleTab(windowId) {
      try {
        const dataUrl = await chrome.tabs.captureVisibleTab(windowId, {
          format: 'png',
          quality: 100
        });
        return dataUrl;
      } catch (error) {
        throw new Error(`Failed to capture tab: ${error.message}`);
      }
    }
  
    async setDefaultSettings() {
      const defaultSettings = {
        backgroundType: 'gradient',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 50
      };
  
      try {
        await chrome.storage.local.set({ screenshotSettings: defaultSettings });
        console.log('Default settings saved');
      } catch (error) {
        console.error('Error saving default settings:', error);
      }
    }
  }
  
  // Initialize background script
  new ScreenshotBackground();