# SetKit V1 → V2 Migration Guide

## Overview

SetKit is migrating from a vanilla JavaScript application (V1) to a modern Next.js 15 application (V2). This document explains why we're migrating, what's changing, and how you can prepare.

---

## Why Migrate?

### Current Limitations (V1)

The vanilla JavaScript version has served us well for rapid prototyping, but we've hit scaling limits:

#### **1. Performance Issues**
- ❌ All 1500+ lenses loaded at once (no lazy loading)
- ❌ No code splitting (entire app loads on first visit)
- ❌ Manual DOM manipulation becomes slow with large lists
- ❌ No virtual scrolling for equipment grids

#### **2. Developer Experience**
- ❌ 2500+ line single file (`app.js`) is hard to maintain
- ❌ No type safety (runtime errors instead of compile-time)
- ❌ No component reusability
- ❌ Manual refresh required for every change
- ❌ No testing framework

#### **3. User Experience**
- ❌ No SEO (can't rank in Google for "ARRI Alexa 35 compatible lenses")
- ❌ No shareable links (can't share specific templates)
- ❌ localStorage only (can't sync across devices)
- ❌ 5-10MB storage limit
- ❌ No user accounts or authentication

#### **4. Scalability**
- ❌ Can't add user accounts/profiles
- ❌ Can't integrate with rental house APIs
- ❌ Can't add real-time collaboration
- ❌ Can't build mobile app

### Benefits of V2 (Next.js 15)

#### **✅ Performance**
- Server Components reduce bundle size by 60-80%
- Automatic code splitting and lazy loading
- Streaming SSR (show content as it loads)
- Image optimization built-in
- Route prefetching

#### **✅ Developer Experience**
- TypeScript catches bugs at compile time
- Component-based architecture (reusable, testable)
- Hot module replacement (instant updates)
- Testing framework (Vitest + Playwright)
- Better code organization

#### **✅ User Experience**
- SEO: Rank in Google searches
- Shareable links: `setkit.com/lenses/zeiss-cp3-25mm`
- Cloud sync: Access from any device
- Unlimited storage (PostgreSQL database)
- User accounts and saved preferences
- Faster initial load times

#### **✅ Scalability**
- Real database (Supabase PostgreSQL)
- User authentication (NextAuth or Supabase Auth)
- API endpoints for rental house integration
- Real-time updates
- Foundation for mobile app

---

## What's Changing?

### Architecture Comparison

| Feature | V1 (Vanilla) | V2 (Next.js 15) |
|---------|--------------|-----------------|
| **Framework** | None | Next.js 15 + React |
| **Language** | JavaScript | TypeScript |
| **Rendering** | Client-only | SSR + Client |
| **Styling** | CSS | Tailwind CSS + shadcn/ui |
| **State** | Global variables | Zustand + Server Components |
| **Data** | localStorage + JSON | Supabase (PostgreSQL) |
| **Auth** | None | Supabase Auth |
| **Routing** | Manual tabs | File-based routing |
| **Testing** | None | Vitest + Playwright |
| **Deployment** | Static hosting | Vercel (SSR) |

### What Stays the Same

✅ **Core functionality**
- All features from V1 remain
- Compatibility engine logic preserved
- UI/UX remains familiar

✅ **Data structure**
- Camera/lens/accessory data structure unchanged
- Compatibility matrix format preserved
- Easy data migration

✅ **User workflows**
- Browse → Select → Build Package → Export
- Templates system works the same way
- No learning curve for existing users

### What's New in V2

#### **Phase 1 (MVP - Match V1 features)**
- ✅ All V1 features in Next.js
- ✅ TypeScript for type safety
- ✅ Better performance
- ✅ SEO-friendly pages

#### **Phase 2 (Enhanced Features)**
- 🔒 User accounts and authentication
- ☁️ Cloud-synced packages and templates
- 🔗 Shareable package links
- 📱 Responsive mobile experience
- 🔍 Advanced search with filters

#### **Phase 3 (Professional Features)**
- 💰 Rental house API integration
- 💵 Pricing data and cost estimates
- 👥 Team collaboration (share packages)
- 📊 Analytics and usage tracking
- 🌐 Multi-language support

#### **Phase 4 (Advanced)**
- 📱 Mobile app (React Native)
- 🔌 Offline mode (PWA)
- 🤖 AI-powered recommendations
- 🎨 Custom branding for rental houses
- 📈 Business dashboard

---

## Migration Timeline

### **Month 1: Foundation**
- ✅ Archive V1 (create tag, documentation)
- 🏗️ Set up Next.js 15 + TypeScript
- 🏗️ Migrate compatibility engine to TypeScript
- 🏗️ Create component structure
- 🏗️ Set up Supabase

### **Month 2: Core Features**
- 🚧 Migrate all pages (Cameras, Lenses, Accessories, etc.)
- 🚧 Implement package builder
- 🚧 Templates system
- 🚧 Search and filters
- 🚧 Export functionality

### **Month 3: Polish & Launch**
- 🚧 User authentication
- 🚧 Cloud data sync
- 🚧 Testing and bug fixes
- 🚧 Performance optimization
- 🚧 Deploy to production

### **Month 4+: Enhanced Features**
- 📋 Rental house integration
- 📋 Team features
- 📋 Mobile app
- 📋 Advanced analytics

---

## User Migration Path

### For Current Users

#### **Option 1: Continue with V1**
- V1 will remain available at the current URL
- Maintenance mode: Critical bugs fixed
- No new features
- Local storage only

#### **Option 2: Migrate to V2 (Recommended)**
1. **Export your data from V1** (see DATA-BACKUP-STRATEGY.md)
2. **Create V2 account** (free)
3. **Import your templates and packages**
4. **Enjoy new features** (cloud sync, shareable links, etc.)

### Data Migration Process

See [DATA-BACKUP-STRATEGY.md](DATA-BACKUP-STRATEGY.md) for detailed instructions.

**Summary:**
1. V1: Export packages and templates (JSON format)
2. V2: Import via UI or API
3. Automatic compatibility check
4. Manual review recommended

---

## Technical Migration Details

### For Developers/Contributors

#### **New Tech Stack**

```javascript
// V1
HTML + CSS + Vanilla JavaScript
├── No dependencies
├── No build process
└── localStorage for data

// V2
Next.js 15 (App Router)
├── React 19
├── TypeScript 5.3+
├── Tailwind CSS + shadcn/ui
├── Zustand (state management)
├── Supabase (PostgreSQL + Auth)
├── TanStack Table (equipment grids)
├── React Hook Form + Zod (forms)
├── Vitest (unit tests)
└── Playwright (e2e tests)
```

#### **Project Structure**

```
setkit-v2/
├── app/
│   ├── (marketing)/          # Public pages (homepage, about)
│   ├── (app)/                # Authenticated pages
│   │   ├── cameras/
│   │   ├── lenses/
│   │   ├── accessories/
│   │   ├── package/
│   │   └── templates/
│   └── api/                  # API routes
│
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── camera-card.tsx
│   ├── lens-grid.tsx
│   └── package-builder.tsx
│
├── lib/
│   ├── compatibility/        # Compatibility engine (migrated from V1)
│   ├── db/                   # Supabase client
│   └── utils/
│
├── stores/
│   └── package-store.ts      # Zustand stores
│
└── supabase/
    ├── migrations/           # Database schema
    └── seed.sql              # Equipment data
```

#### **Compatibility Engine Migration**

The core compatibility logic from V1 will be migrated to TypeScript with minimal changes:

```typescript
// V1 (JavaScript)
function checkLensCompatibility(lens, camera) {
  // ... logic ...
}

// V2 (TypeScript)
function checkLensCompatibility(
  lens: Lens,
  camera: Camera
): CompatibilityResult {
  // ... same logic, now with type safety ...
}
```

**Benefits:**
- Same logic, better type safety
- Autocomplete for data structures
- Catch typos at compile time
- Self-documenting code

#### **Database Schema**

V1 localStorage → V2 Supabase PostgreSQL

```sql
-- Cameras
CREATE TABLE cameras (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  brand TEXT NOT NULL,
  native_mount TEXT NOT NULL,
  sensor_size TEXT,
  adapter_rules JSONB,
  -- ... other fields ...
);

-- Lenses
CREATE TABLE lenses (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  manufacturer TEXT NOT NULL,
  mount TEXT NOT NULL,
  focal_length INTEGER,
  -- ... other fields ...
);

-- User packages
CREATE TABLE packages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Templates
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  category TEXT,
  items JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE
);
```

---

## Development Workflow

### V1 (Current)
```bash
# Start local server
python -m http.server 8000

# Edit files directly
# Refresh browser to see changes
# No build, no dependencies
```

### V2 (New)
```bash
# Install dependencies
npm install

# Start dev server (with hot reload)
npm run dev

# Run type checker
npm run type-check

# Run tests
npm run test

# Build for production
npm run build

# Deploy to Vercel
git push origin main  # Auto-deploys
```

---

## FAQ

### **Will V1 be shut down?**
No immediate plans. V1 will remain available in maintenance mode. Critical bugs will be fixed, but new features will only be added to V2.

### **Can I use V2 without an account?**
Yes! V2 will have a "guest mode" that works like V1 (local storage). But you'll need an account for cloud sync, shareable links, and advanced features.

### **Will my V1 data be lost?**
No. Follow the data migration guide to export and import your data.

### **Is V2 free?**
Yes! V2 will have a generous free tier. Advanced features (team collaboration, unlimited storage) may have a paid tier in the future.

### **Can I contribute to V2?**
Yes! V2 is open source. See CONTRIBUTING.md (coming soon) for guidelines.

### **When will V2 launch?**
Target: 3 months from start of development. MVP will match V1 features, then we'll add enhancements.

### **What if I find bugs in V2?**
Report them on GitHub Issues. During beta, we'll prioritize bug fixes.

---

## Getting Involved

### For Users
- 📋 **Test V2 beta** (coming soon)
- 💬 **Provide feedback** on GitHub Discussions
- 📝 **Report bugs** on GitHub Issues

### For Developers
- 🔨 **Contribute code** (see CONTRIBUTING.md)
- 📖 **Improve documentation**
- 🧪 **Write tests**
- 🎨 **Design UI components**

---

## Resources

- **V1 Documentation**: [README.md](README.md)
- **Data Migration**: [DATA-BACKUP-STRATEGY.md](DATA-BACKUP-STRATEGY.md)
- **V1 Compatibility System**: [COMPATIBILITY-SYSTEM.md](COMPATIBILITY-SYSTEM.md)
- **V2 Repository**: [github.com/midjordan23/setkit-v2](https://github.com/midjordan23/setkit-v2) (coming soon)

---

## Contact

Questions? Feedback? Open a GitHub Issue or Discussion.

---

**Last Updated**: October 2025
**Status**: V1 Archived, V2 In Development
