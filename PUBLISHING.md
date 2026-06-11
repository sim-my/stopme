# How to publish stopme to the Chrome Web Store

A checklist for submitting the extension. The code is ready; these are the
account and listing steps.

## 1. Register a developer account (one time)

- Go to https://chrome.google.com/webstore/devconsole
- Sign in with the Google account you want to own the extension
- Pay the one-time $5 registration fee
- Fill in the account contact details it asks for and verify your email

## 2. Host the privacy policy

The store requires a public privacy policy URL because the extension runs on all
sites and reads tab URLs. Easiest free option:

- In your GitHub repo, go to Settings > Pages and enable Pages for the main branch
- The PRIVACY.md file will be served at a public URL, or
- Paste the contents of PRIVACY.md into a public GitHub Gist and use that link

Keep the final URL; you paste it into the listing.

## 3. Take at least one screenshot

- Required size: 1280x800 or 640x400 (PNG or JPG)
- Load the extension locally (chrome://extensions > Developer mode > Load unpacked)
- Open a site and capture the cat reacting in the corner
- One screenshot is the minimum; up to five is allowed

## 4. Upload and fill in the listing

- In the dashboard click "New item" and upload stopme-v1.0.zip
- Copy the text from STORE_LISTING.md into the matching fields:
  - Name, summary, description, category, language
  - Single purpose description
  - A justification for each permission (tabs, storage, host access)
  - Privacy practices: tick the data types and certifications listed
  - Paste the privacy policy URL from step 2
- Upload the 128x128 store icon (icons/icon128.png) and your screenshot

## 5. Submit for review

- Click "Submit for review"
- First reviews usually take a few days. They can take longer for extensions
  that request access to all sites, which this one does.
- You get an email when it is approved or if they need changes

## Rebuilding the ZIP later

If you change the code, rebuild the upload package with:

    rm -f stopme-v1.0.zip
    zip -r stopme-v1.0.zip . -x "*.git*" -x "*.DS_Store" -x "stopme-*.zip" -x "*.md"

Bump the "version" in manifest.json before each new upload (the store rejects a
re-upload with the same version number).

## Optional cleanups before launch

- The cat PNGs in cats/ are about 2.5 MB each (15 MB total). They will work as
  is, but compressing them would make the extension download faster.
- The manifest name is lowercase "stopme". The store listing name can be longer
  and nicer (see STORE_LISTING.md).
