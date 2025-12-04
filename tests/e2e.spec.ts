import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000');
  // Check for heading
  await expect(page.locator('h1')).toContainText('Mini CyberChef');
});

test('can encode base64', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Input
  await page.fill('textarea[placeholder*="Paste"]', 'Hello');
  
  // Select Category Encoding (default)
  // Select Tool Base64 Encode (default?)
  // We might need to select if it's not first.
  // "base64_encode" is first in encoding.
  
  // Click Run
  await page.click('button:has-text("Run Operation")');
  
  // Check Output
  await expect(page.locator('textarea[readOnly]')).toHaveValue('SGVsbG8=');
});

test('can switch tool', async ({ page }) => {
  await page.goto('http://localhost:3000');
  await page.fill('textarea[placeholder*="Paste"]', 'SGVsbG8=');
  
  // Select base64_decode
  await page.selectOption('select', { label: 'base64_decode' });
  
  await page.click('button:has-text("Run Operation")');
  await expect(page.locator('textarea[readOnly]')).toHaveValue('Hello');
});


