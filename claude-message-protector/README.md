# Claude Message Protector

Prevents the message disappearing bug on claude.ai during heavy agentic tool use.

## The Problem

When using Claude with heavy tool/file creation (artifacts, code execution, etc.), messages can randomly disappear mid-conversation. This is caused by:

1. Claude creates files in a temporary "Wiggle" filesystem
2. Files expire/become unavailable after some time
3. The UI keeps polling for these files
4. When Wiggle endpoints return 404, React Query's error handler incorrectly clears the conversation state
5. Your messages vanish 💀

Console shows: `QueryClient error: Wiggle artifact not found`

## The Fix

This extension intercepts fetch requests and converts Wiggle 404 responses to empty 200 responses, preventing the error handler from triggering.

```javascript
if (urlStr.includes('wiggle') && response.status === 404) {
  return new Response('{}', { status: 200 });
}
```

Simple, effective, no side effects.

## Installation

### From Store
- [Edge Add-ons](https://microsoftedge.microsoft.com/addons/) (pending)
- [Chrome Web Store](https://chrome.google.com/webstore/) (pending)

### Manual Installation
1. Download or clone this repo
2. Go to `chrome://extensions` or `edge://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the extension folder

## Usage

Just install and forget. The extension automatically protects all claude.ai conversations.

Console will show:
```
[Claude Message Protector] Active - your messages are protected!
```

When a 404 is caught:
```
[Claude Message Protector] Caught Wiggle 404, returning success
```

## Console-Only Version

If you don't want to install an extension, paste this in F12 Console:

```javascript
(function(){
  const f=window.fetch;
  window.fetch=async function(u){
    const r=await f.apply(this,arguments);
    if(u&&u.toString().includes('wiggle')&&r.status===404){
      console.warn('🛡️ CAUGHT WIGGLE 404');
      return new Response('{}',{status:200});
    }
    return r;
  };
  console.log('🛡️ PROTECTED');
})();
```

Note: You'll need to re-paste this every page refresh.

## Privacy

This extension:
- ✅ Only runs on claude.ai
- ✅ No data collection
- ✅ No external requests
- ✅ No tracking
- ✅ Fully open source

## License

MIT - do whatever you want with it.

## Credits

Bug discovered and fixed by [OpenTransformers](https://github.com/OpenTransformer) while debugging message loss during heavy Claude tool use sessions.

Fuck Wiggle 🖕
