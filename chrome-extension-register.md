# Chrome Extension Registration Copy

## Title
KeyVid

## Summary
Control video with keyboard shortcuts

## Description
KeyVid lets you control HTML5 videos on registered websites with keyboard shortcuts.

- `→` / `←`: seek 5 seconds
- `↑` / `↓`: adjust volume
- `Space`: play / pause
- `F`: fullscreen
- `M`: mute

Only registered sites are enabled, so the extension stays focused and does not run everywhere. Site settings are stored locally in your browser.

## Category
Accessibility

## Language
English

## Single Purpose Description
KeyVid has one narrow purpose: it lets users control HTML5 video playback on registered websites with keyboard shortcuts.

## Permission Justification

### activeTab justification
KeyVid uses `activeTab` to read the current tab URL in the popup so the user can register or remove the site they are viewing. It does not access tabs for unrelated purposes.

### scripting justification
KeyVid uses `scripting` to inject the content script behavior needed for keyboard controls on video pages. The script only runs its video-control logic on registered sites.

### storage justification
KeyVid uses `storage` to save the user’s list of registered websites locally in the browser so the extension only works on approved sites.

### host permission justification
KeyVid needs host permission to run its video-control logic on registered websites and to inject the content script only on the sites the user has approved. It does not use host access for unrelated tracking or browsing data.

## Privacy Policy Form Copy

```json
{
  "id": "keyvid",
  "name": "KeyVid",
  "slug": "keyvid",
  "category": "Accessibility",
  "status": "Published",
  "platform": "Chrome Extension",
  "version": "1.0.0",
  "language": "English",
  "description": "Controls HTML5 video playback with keyboard shortcuts on registered websites.",
  "longDescription": "KeyVid is a lightweight browser extension that lets users control HTML5 video playback with keyboard shortcuts on websites they register. It runs locally in the browser, stores only the approved site list in local storage, and does not send user data to external servers.",
  "github": "https://github.com/tono/KeyVid",
  "chromeStore": "https://chromewebstore.google.com/detail/keyvid/",
  "privacyPath": "/extensions/keyvid/privacy",
  "privacyPolicy": {
    "productName": "KeyVid",
    "lastUpdated": "2026-04-29",
    "summary": "KeyVid does not collect, store, transmit, or share personal or technical data. The extension stores only the user’s registered website list locally in the browser so it can enable video shortcuts on approved sites.",
    "contactEmail": "whltn8282@gmail.com",
    "sections": [
      {
        "title": "1. Overview",
        "body": "KeyVid is a Chrome extension that adds keyboard shortcuts for video playback on websites the user registers. It operates locally in the browser and does not communicate with external servers."
      },
      {
        "title": "2. Data Collection",
        "body": "KeyVid does not collect personal information, browsing history, analytics, technical identifiers, or usage logs. It stores only the list of websites the user chooses to register, and that list stays in the browser's local storage."
      },
      {
        "title": "3. Data Use",
        "body": "The locally stored site list is used only to decide where KeyVid should activate. No data is used for advertising, profiling, analytics, or any purpose unrelated to video control on registered sites."
      },
      {
        "title": "4. Data Sharing",
        "body": "KeyVid does not sell, share, or transmit user data to third parties, advertisers, analytics providers, or external services."
      },
      {
        "title": "5. Permissions",
        "body": "KeyVid uses minimum browser permissions needed to read the current tab URL in the popup, inject its content script on approved sites, and store the user's registered website list locally."
      },
      {
        "title": "6. Children's Privacy",
        "body": "KeyVid is not designed for children and does not knowingly collect personal information from users of any age."
      },
      {
        "title": "7. Changes to This Policy",
        "body": "If this policy changes, the last updated date will be revised to match the current version. The policy will continue to reflect how the extension actually behaves."
      },
      {
        "title": "8. Contact",
        "body": "If you have questions about this privacy policy, contact whltn8282@gmail.com."
      }
    ],
    "dataPractices": [
      {
        "category": "personal",
        "title": "Personal data (name, email, identifiers)",
        "collects": false,
        "description": "KeyVid does not collect or transmit personal information.",
        "sharedWithThirdParties": false
      },
      {
        "category": "usage",
        "title": "Usage data or analytics",
        "collects": false,
        "description": "KeyVid does not collect analytics, behavioral tracking, or usage logs.",
        "sharedWithThirdParties": false
      },
      {
        "category": "technical",
        "title": "Technical information",
        "collects": false,
        "description": "KeyVid does not collect device, browser, system, or network information.",
        "sharedWithThirdParties": false
      },
      {
        "category": "none",
        "title": "Local site registration only",
        "collects": false,
        "description": "The extension stores only the user's registered website list locally in the browser and does not send that list to any external server.",
        "sharedWithThirdParties": false
      }
    ],
    "thirdPartiesDescription": "KeyVid does not send user data to external APIs, analytics tools, advertising platforms, or third-party services."
  }
}
```
