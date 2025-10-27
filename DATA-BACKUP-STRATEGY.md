# SetKit V1 Data Backup & Migration Strategy

## Overview

This guide explains how to export your data from SetKit V1 (vanilla version) and prepare it for migration to V2 (Next.js version).

---

## What Data is Stored?

### V1 Storage Structure

SetKit V1 uses browser localStorage to store user data:

#### **1. Equipment Templates**
- **Key**: `equipmentTemplates`
- **Format**: JSON array
- **Contains**: Saved equipment lists with project info
- **Persistent**: Yes (survives browser close)

#### **2. Current Project Information**
- **Key**: `currentProjectInfo`
- **Format**: JSON object
- **Contains**: Project name, dates, contacts
- **Persistent**: Yes

#### **3. Current Package** (⚠️ Important)
- **Storage**: In-memory only (not localStorage)
- **Contains**: Items currently in "Your List"
- **Persistent**: **NO** - Lost on page refresh!

### Data Structure Examples

#### Equipment Template
```json
{
  "id": "abc123",
  "name": "Documentary Kit",
  "category": "single-cam",
  "createdAt": "2025-10-27T12:00:00.000Z",
  "itemCount": 5,
  "projectInfo": {
    "projectName": "Mountain Climbing Doc",
    "pickupDate": "2025-11-01",
    "shootDate": "2025-11-05",
    "returnDate": "2025-11-10",
    "contacts": [
      {
        "id": "contact1",
        "name": "John Doe",
        "role": "DP",
        "email": "john@example.com",
        "phone": "555-1234"
      }
    ]
  },
  "items": [
    {
      "id": "C-ARRI-A35",
      "itemType": "camera",
      "brand": "ARRI",
      "model": "ALEXA 35",
      "quantity": 1,
      "notes": "Primary camera"
    },
    {
      "itemType": "lens",
      "manufacturer": "Zeiss",
      "name": "CP.3 25mm T2.1",
      "mount": "PL",
      "quantity": 1
    }
  ]
}
```

#### Current Project Info
```json
{
  "projectName": "Music Video Shoot",
  "pickupDate": "2025-11-15",
  "shootDate": "2025-11-20",
  "returnDate": "2025-11-22",
  "contacts": [
    {
      "id": "contact1",
      "name": "Jane Smith",
      "role": "Producer",
      "email": "jane@example.com",
      "phone": "555-5678"
    }
  ]
}
```

---

## Export Methods

### Method 1: Browser Console (Recommended)

This is the most reliable way to export your data.

#### **Step 1: Open Browser Console**
1. Right-click anywhere on the SetKit page
2. Select "Inspect" or "Inspect Element"
3. Click the "Console" tab

#### **Step 2: Export Templates**
Copy and paste this command into the console:

```javascript
// Export templates
const templates = JSON.parse(localStorage.getItem('equipmentTemplates') || '[]');
console.log('Templates:', templates);
const templatesJson = JSON.stringify(templates, null, 2);
const templatesBlob = new Blob([templatesJson], { type: 'application/json' });
const templatesUrl = URL.createObjectURL(templatesBlob);
const templatesLink = document.createElement('a');
templatesLink.href = templatesUrl;
templatesLink.download = 'setkit-templates-backup-' + new Date().toISOString().split('T')[0] + '.json';
templatesLink.click();
```

This will download a file named `setkit-templates-backup-2025-10-27.json`.

#### **Step 3: Export Project Info**
```javascript
// Export current project info
const projectInfo = JSON.parse(localStorage.getItem('currentProjectInfo') || '{}');
console.log('Project Info:', projectInfo);
const projectJson = JSON.stringify(projectInfo, null, 2);
const projectBlob = new Blob([projectJson], { type: 'application/json' });
const projectUrl = URL.createObjectURL(projectBlob);
const projectLink = document.createElement('a');
projectLink.href = projectUrl;
projectLink.download = 'setkit-project-info-backup-' + new Date().toISOString().split('T')[0] + '.json';
projectLink.click();
```

This will download `setkit-project-info-backup-2025-10-27.json`.

#### **Step 4: Export Current Package (If Any)**
⚠️ **Important**: This only works if you have items in "Your List" right now!

```javascript
// Export current package (in-memory only)
// Note: This will be empty if you refreshed the page
if (typeof currentPackage !== 'undefined' && currentPackage.length > 0) {
    const packageJson = JSON.stringify(currentPackage, null, 2);
    const packageBlob = new Blob([packageJson], { type: 'application/json' });
    const packageUrl = URL.createObjectURL(packageBlob);
    const packageLink = document.createElement('a');
    packageLink.href = packageUrl;
    packageLink.download = 'setkit-current-package-backup-' + new Date().toISOString().split('T')[0] + '.json';
    packageLink.click();
    console.log('Current package exported!');
} else {
    console.log('No items in current package or page was refreshed.');
}
```

---

### Method 2: Manual Export (Backup)

If the console method doesn't work:

#### **Export Templates Manually**
1. Open Browser Console (F12)
2. Type: `localStorage.getItem('equipmentTemplates')`
3. Copy the entire output
4. Paste into a text editor
5. Save as `templates-backup.json`

#### **Export Project Info Manually**
1. Type: `localStorage.getItem('currentProjectInfo')`
2. Copy the output
3. Save as `project-info-backup.json`

---

## Backup Checklist

Before migrating or clearing browser data:

- [ ] Export all templates (`equipmentTemplates`)
- [ ] Export current project info (`currentProjectInfo`)
- [ ] Export current package (if you have unsaved work)
- [ ] Save files to a safe location (Dropbox, Google Drive, etc.)
- [ ] Verify JSON files are valid (open in text editor, check format)

---

## Import to V2 (Coming Soon)

### Automatic Import (Recommended)

V2 will have an import tool:

1. **Login to SetKit V2**
2. **Go to Settings → Import from V1**
3. **Upload your backup files:**
   - `setkit-templates-backup.json`
   - `setkit-project-info-backup.json`
   - `setkit-current-package-backup.json`
4. **Review imported data**
5. **Confirm import**

### Manual Import (Advanced)

If automatic import fails, you can manually recreate your templates in V2:

1. Open your backup JSON files
2. For each template:
   - Create new template in V2
   - Add items manually
   - Copy project info
3. Save templates

---

## Data Migration Details

### What Changes in V2

#### **Storage**
- V1: Browser localStorage (5-10MB limit)
- V2: PostgreSQL database (unlimited)

#### **Data Structure**
- ✅ **Templates**: Same structure, direct migration
- ✅ **Project Info**: Same structure
- ✅ **Items**: Same structure
- ⚠️ **IDs**: May be regenerated in V2

#### **New Fields in V2**
- `user_id`: Link to your account
- `created_at`, `updated_at`: Timestamps
- `is_public`: Share templates publicly
- `shared_with`: Team collaboration

### Compatibility Notes

#### **Camera Data**
- All V1 cameras will be in V2
- New cameras may be added
- Specs may be updated

#### **Lens Data**
- All V1 lenses will be in V2
- Lens IDs may change
- Migration tool will match by name + manufacturer

#### **Accessory Data**
- All V1 accessories will be in V2
- Accessory IDs may change

#### **Compatibility Rules**
- All V1 compatibility logic preserved
- May be enhanced in V2

---

## Troubleshooting

### "My templates are empty after export"

**Cause**: No templates saved in V1.

**Solution**: Create templates in V1 before exporting, or start fresh in V2.

---

### "Current package export shows empty array"

**Cause**: `currentPackage` is in-memory only and cleared on page refresh.

**Solution**:
1. Don't refresh the page before exporting
2. Save as template first, then export templates
3. Or manually add items again in V2

---

### "Console commands don't work"

**Cause**: Browser security settings or console errors.

**Solution**:
1. Try Method 2 (manual export)
2. Use a different browser
3. Contact support with error message

---

### "JSON file won't open in V2"

**Cause**: Corrupted or invalid JSON.

**Solution**:
1. Open file in text editor
2. Validate JSON at jsonlint.com
3. Fix syntax errors (missing commas, brackets)
4. Re-export if necessary

---

## Storage Limits

### V1 (localStorage)
- **Limit**: ~5-10MB (browser dependent)
- **What happens when full**: Data may be lost or new saves fail
- **Check storage usage**:
  ```javascript
  const used = new Blob(Object.values(localStorage)).size;
  console.log('localStorage used:', (used / 1024 / 1024).toFixed(2), 'MB');
  ```

### V2 (PostgreSQL)
- **Limit**: Practically unlimited
- **Free tier**: 500MB database (Supabase)
- **Paid tier**: Unlimited storage

---

## Best Practices

### Regular Backups
1. **Export monthly**: Even if you don't plan to migrate soon
2. **Name files with dates**: `setkit-backup-2025-10-27.json`
3. **Store in cloud**: Google Drive, Dropbox, etc.
4. **Test restore**: Try importing to verify backups work

### Before Major Changes
- Export before updating browser
- Export before clearing cookies/cache
- Export before switching devices

### Template Management
- Delete unused templates to save space
- Keep template names descriptive
- Use categories effectively

---

## V2 Migration Timeline

| Date | Action |
|------|--------|
| **Now** | Export your V1 data (follow this guide) |
| **Month 1** | V2 development begins |
| **Month 2** | V2 beta testing (import tool available) |
| **Month 3** | V2 official launch |
| **Month 4+** | V1 remains available in maintenance mode |

---

## Support

### Need Help?
- 📝 Open a GitHub Issue
- 💬 Ask in GitHub Discussions
- 📧 Email: support@setkit.com (coming soon)

### Lost Data?
If you didn't backup and lost data:
- Check browser history (may still be cached)
- Check other devices (if you used SetKit there)
- V2 will have auto-save to prevent this

---

## Data Privacy

### V1 (Local Storage)
- ✅ Data never leaves your browser
- ✅ No tracking, no analytics
- ❌ No sync across devices
- ❌ Lost if browser data cleared

### V2 (Cloud Database)
- ✅ Syncs across devices
- ✅ Automatic backups
- ✅ Team sharing options
- ⚠️ Data stored on Supabase servers (SOC 2 compliant)
- ✅ You own your data (can export anytime)
- ✅ Delete account = data deleted

---

## Emergency Recovery

### Browser Crashed Before Export?

Try these recovery methods:

#### **Chrome/Edge**
1. Open: `chrome://settings/content/all`
2. Search for your SetKit URL
3. Check localStorage data

#### **Firefox**
1. Type: `about:config`
2. Search: `dom.storage`
3. Check localStorage database

#### **Safari**
1. Develop → Show Web Inspector
2. Storage → Local Storage
3. Copy data manually

---

## Questions?

**Q: Will V2 import tool be automatic?**
A: Yes! Upload JSON files, we'll handle the rest.

**Q: Can I use both V1 and V2?**
A: Yes! V1 will remain available.

**Q: What if I don't want to migrate?**
A: No problem! V1 will continue to work (maintenance mode).

**Q: Is my data safe in V2?**
A: Yes. Supabase is SOC 2 certified, data is encrypted, and you can export anytime.

---

**Last Updated**: October 2025
**Version**: 1.0
