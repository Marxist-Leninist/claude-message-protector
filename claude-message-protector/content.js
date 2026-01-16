// Claude Message Protector v1.0.0
// Prevents message deletion bug on claude.ai
// 
// Bug: Heavy agentic tool use creates files that expire before the UI
// stops polling for them. When Wiggle endpoints return 404, React Query's
// error handler clears conversation state, causing messages to disappear.
//
// Fix: Intercept fetch requests and convert Wiggle 404s to empty 200s,
// preventing the error handler from triggering.
//
// Open source - https://github.com/OpenTransformer/claude-message-protector

(function() {
  'use strict';

  // Inject the protection script into page context
  const protectorCode = `
(function() {
  // Only run once
  if (window.__claudeMessageProtector) return;
  window.__claudeMessageProtector = true;

  console.log('[Claude Message Protector] Initializing...');

  // Store original fetch
  const originalFetch = window.fetch;

  // Override fetch to intercept Wiggle 404s
  window.fetch = async function(url) {
    const response = await originalFetch.apply(this, arguments);
    const urlStr = (url && url.toString) ? url.toString() : String(url || '');

    // If it's a Wiggle request that returned 404, convert to 200
    if (urlStr.includes('wiggle') && response.status === 404) {
      console.log('[Claude Message Protector] Caught Wiggle 404, returning success');
      return new Response('{}', {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return response;
  };

  // Also suppress QueryClient errors related to Wiggle
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args.join(' ');
    if (message.includes('Wiggle') && message.includes('not found')) {
      console.log('[Claude Message Protector] Suppressed Wiggle error');
      return;
    }
    return originalConsoleError.apply(this, args);
  };

  console.log('[Claude Message Protector] Active - your messages are protected!');
})();
`;

  // Inject into page context
  function inject() {
    try {
      const script = document.createElement('script');
      script.textContent = protectorCode;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
    } catch (e) {
      console.error('[Claude Message Protector] Failed to inject:', e);
    }
  }

  // Inject as early as possible
  if (document.head || document.documentElement) {
    inject();
  } else {
    document.addEventListener('DOMContentLoaded', inject);
  }
})();
