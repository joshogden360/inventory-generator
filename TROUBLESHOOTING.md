# Troubleshooting Guide - Google SDK Spatial Understanding

This guide helps you quickly identify and resolve common issues with the AI-powered household item cataloging app.

## Table of Contents
- [Quick Diagnostics](#quick-diagnostics)
- [Common Issues](#common-issues)
- [Environment Setup](#environment-setup)
- [API Issues](#api-issues)
- [Build Issues](#build-issues)
- [Runtime Errors](#runtime-errors)

## Quick Diagnostics

### Check Console Logs
Open the browser console (F12) and look for these diagnostic messages:
```
Gemini API Key present: true/false
API Key length: <number>
GoogleGenerativeAI initialized successfully
```

If you see `false` or missing API key, see [Environment Setup](#environment-setup).

### Verify Dependencies
```bash
# Check if correct package is installed
npm list @google/generative-ai

# Should NOT have @google/genai (wrong package)
npm list @google/genai
```

## Common Issues

### 1. Blank/White Screen
**Symptoms:** App doesn't render, shows white screen

**Solutions:**
1. Check browser console for errors
2. Ensure `npm run dev` is running
3. Clear browser cache and refresh
4. Check if index.html has proper structure

### 2. "Error analyzing image" When Clicking Find Items
**Symptoms:** Error message appears after clicking "Find Items"

**Check these in order:**
1. **API Key Issues**
   - Console shows "API Key present: false"
   - Console shows "API Key length: 0"
   - See [Environment Setup](#environment-setup)

2. **JSON Parsing Errors**
   - Console shows "JSON Parse error"
   - Console shows "Raw response text" with malformed JSON
   - The AI model sometimes returns explanatory text instead of pure JSON

3. **Model Issues**
   - Check if using correct model name: `gemini-1.5-flash`
   - Try `gemini-1.5-pro` for more accurate results

### 3. Package Import Errors
**Error:** `Failed to resolve import "@google/generative-ai"`

**Solution:**
```bash
# Uninstall wrong package if installed
npm uninstall @google/genai

# Install correct package
npm install @google/generative-ai
```

## Environment Setup

### Setting Up API Key

1. **Create .env.local file** (NOT .env)
   ```bash
   touch .env.local
   ```

2. **Add your API key**
   ```
   VITE_GEMINI_API_KEY=your-actual-api-key-here
   ```

3. **Get API Key**
   - Visit: https://makersuite.google.com/app/apikey
   - Create new API key
   - Copy the entire key (should be 39 characters)

4. **Verify Setup**
   - Restart dev server: `npm run dev`
   - Check console for "API Key present: true"

### Common Mistakes
- Using `.env` instead of `.env.local`
- Missing `VITE_` prefix (Vite requires this)
- Extra spaces or quotes around the API key
- Not restarting the dev server after adding the key

## API Issues

### Rate Limiting / Quota Exceeded
**Symptoms:** Worked before, suddenly stops working

**Solutions:**
1. Check Google Cloud Console for quota usage
2. Wait a few minutes and try again
3. Consider upgrading to paid tier if needed

### Invalid API Key
**Symptoms:** Console shows API key present but still errors

**Debug Steps:**
1. Verify key in Google Cloud Console
2. Check if key has proper permissions for Generative AI
3. Try generating a new key

### Network Issues
**Symptoms:** Timeout errors, network failures

**Solutions:**
1. Check internet connection
2. Try VPN if in restricted region
3. Check if Google services are accessible

## Build Issues

### PostCSS/Tailwind Error
**Error:** `It looks like you're trying to use tailwindcss directly as a PostCSS plugin`

**Solution:**
```javascript
// postcss.config.cjs
module.exports = {
  plugins: {
    autoprefixer: {},
    // Remove tailwindcss from here
  },
};
```

### CSS Import Order Error
**Error:** `@import must precede all other statements`

**Solution:** Move @import statements to the top of your CSS file, before @tailwind directives.

## Runtime Errors

### Image Processing Errors
**Symptoms:** Error when preparing image

**Common Causes:**
1. Image too large (resized to 768px max)
2. Unsupported image format
3. Canvas context failure

### JSON Response Issues

**Debug Process:**
1. Check console for "Raw response text"
2. Look for these patterns:
   - Response wrapped in ```json blocks
   - Extra text before/after JSON
   - Syntax errors (trailing commas, wrong quotes)

**The code handles these automatically by:**
- Removing markdown code blocks
- Extracting JSON arrays with regex
- Trimming whitespace

### State Management Issues
**Symptoms:** UI not updating after scan

**Solutions:**
1. Check if Jotai atoms are properly connected
2. Verify setBoundingBoxes2D is called with valid data
3. Check React Developer Tools for state updates

## Debug Checklist

When encountering issues, check in this order:

1. ✅ Browser console for errors
2. ✅ API key present and correct length (39 chars)
3. ✅ Correct package installed (@google/generative-ai)
4. ✅ Network tab for failed requests
5. ✅ Console logs showing raw AI response
6. ✅ Valid JSON structure in response
7. ✅ Image uploaded successfully (progress bar reaches 100%)

## Getting Help

If issues persist:

1. **Collect Debug Info:**
   - Browser console logs
   - Network request/response
   - Package versions (`npm list`)

2. **Check Logs For:**
   - API key status
   - Raw response text
   - Error details object

3. **Common Fixes:**
   - Clear browser cache
   - Delete node_modules and reinstall
   - Restart dev server
   - Try different browser

## Prevention Tips

1. **Always use .env.local** for environment variables
2. **Import from correct package:** `@google/generative-ai`
3. **Be specific in prompts** to get valid JSON responses
4. **Add error boundaries** in React for better error handling
5. **Test with small images first** to verify setup
6. **Monitor API quotas** in Google Cloud Console

Remember: Most issues are related to environment setup or API configuration. The enhanced logging in the code will help identify the exact problem quickly. 