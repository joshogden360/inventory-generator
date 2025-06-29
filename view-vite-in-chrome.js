import { chromium } from 'playwright';

async function setupDevEnvironment() {
  const browser = await chromium.launch({ 
    headless: false,
    args: ['--start-maximized']
  });
  
  const context = await browser.newContext({
    viewport: null,
    colorScheme: 'light'
  });
  
  const page = await context.newPage();
  await page.goto('http://localhost:5173');
  
  // Expose helper functions to the page
  await page.exposeFunction('reportToMCP', (data) => {
    console.log('MCP Context Update:', data);
  });
  
  // Monitor route changes
  page.on('framenavigated', () => {
    console.log('Navigation:', page.url());
  });
  
  // Keep alive and return page for further interaction
  return { browser, page };
}

// Run and keep the session active
const { page } = await setupDevEnvironment();

console.log('Playwright development environment is now active!');
console.log('Browser window should be open and connected to your Vite app.');
console.log('This session will remain active for continuous UI monitoring.'); 