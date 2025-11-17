# Migration Guide: Express.js to Next.js

This document outlines the migration from the legacy Express.js application to the modern Next.js stack.

## Overview

The voting system has been completely refactored using modern web technologies while maintaining backward compatibility with the existing database schema.

## Architecture Changes

### Before (Legacy)
- **Framework**: Express.js
- **Frontend**: jQuery + Static HTML
- **Styling**: Custom CSS with Bootstrap CDN
- **Database**: MongoDB with Mongoose
- **Auth**: Custom JWT implementation
- **Deployment**: Basic Docker setup

### After (Modern)
- **Framework**: Next.js 14+ (App Router)
- **Frontend**: React with Server Components
- **Styling**: Tailwind CSS v4
- **Database**: MongoDB with Mongoose (improved TypeScript types)
- **Auth**: JWT + Mock OAuth for development
- **Deployment**: Docker with optimized production build

## File Mapping

### Backend Routes

| Legacy (Express) | Modern (Next.js) | Status |
|------------------|------------------|--------|
| `router.js` | `app/api/*/route.ts` | ✅ Migrated |
| `controllers/authController.js` | `app/api/auth/*/route.ts` | ✅ Enhanced |
| `controllers/activities.js` | `app/api/activities/route.ts` | ✅ Migrated |
| `controllers/votes.js` | `app/api/votes/route.ts` | ✅ Migrated |
| `controllers/options.js` | `app/api/options/route.ts` | ✅ Migrated |
| `controllers/users.js` | `app/api/users/route.ts` | ✅ Migrated |
| `controllers/voter.js` | - | ⏳ Pending |
| `controllers/files.js` | - | ⏳ Pending |
| `controllers/mock.js` | `app/api/auth/mock-login/route.ts` | ✅ Enhanced |

### Frontend Pages

| Legacy | Modern | Status |
|--------|--------|--------|
| `public/index.html` | `app/page.tsx` | ✅ Rewritten |
| `public/voting.html` | `app/voting/page.tsx` | ✅ Rewritten |
| `public/activity.html` | `app/admin/page.tsx` | ✅ Enhanced |
| `public/admin.html` | `app/admin/page.tsx` | ✅ Enhanced |
| `public/addActivity.html` | Admin Dashboard | ✅ Integrated |
| `public/voter.html` | - | ⏳ Pending |

### Models

| Legacy | Modern | Status |
|--------|--------|--------|
| `models/users.js` | `lib/db/models/User.ts` | ✅ Migrated with types |
| `models/activities.js` | `lib/db/models/Activity.ts` | ✅ Migrated with types |
| `models/votes.js` | `lib/db/models/Vote.ts` | ✅ Migrated with types |
| `models/options.js` | `lib/db/models/Option.ts` | ✅ Migrated with types |

### Middleware

| Legacy | Modern | Status |
|--------|--------|--------|
| `middlewares/authentication.js` | `lib/auth/middleware.ts` | ✅ Enhanced |
| `middlewares/adminAuthorization.js` | `lib/auth/middleware.ts` | ✅ Integrated |

## Database Schema

**No changes required!** The new system maintains 100% compatibility with the existing MongoDB schema.

## API Endpoints

### Authentication
- `GET /auth_url` → `GET /api/auth/login`
- `GET /callback` → `GET /api/auth/callback` (pending OAuth setup)
- `GET /auth/logout` → `GET /api/auth/logout`
- **NEW**: `GET /api/auth/mock-login?student_id=<ID>` (development only)

### Activities
- `POST /activities/addActivity` → `POST /api/activities`
- `POST /activities/getActivity` → `GET /api/activities/[id]`
- `POST /activities/getActivities` → `GET /api/activities`
- `POST /activities/getAvailableActivities` → `GET /api/activities?available=true`
- `POST /activities/modifyActivity` → `PUT /api/activities/[id]`
- `POST /activities/removeActivity` → `DELETE /api/activities/[id]`

### Votes
- `POST /votes/addVote` → `POST /api/votes`
- `POST /votes/getVote` → `GET /api/votes?activity_id=<ID>` (admin)
- `POST /votes/getVotes` → `GET /api/votes` (admin)

### Options/Candidates
- `POST /options/addOption` → `POST /api/options`
- `POST /options/getOption` → `GET /api/options?activity_id=<ID>`
- `POST /options/getOptions` → `GET /api/options?activity_id=<ID>`

### Users
- `POST /users/addUser` → `POST /api/users`
- `POST /users/getUsers` → `GET /api/users`

## Migration Steps for Developers

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration.

### 3. Start MongoDB
```bash
npm run docker:dev
```

### 4. Seed Database
```bash
npm run seed
```

### 5. Run Development Server
```bash
npm run dev
```

### 6. Access Application
- Frontend: http://localhost:3000
- Mock Login: http://localhost:3000/api/auth/mock-login?student_id=108000000

## Breaking Changes

### API Response Format
Legacy format (inconsistent):
```json
{
  "status": true,
  "data": { ... }
}
```

Modern format (consistent):
```json
{
  "success": true,
  "activity": { ... }
}
```

### Authentication Header
Legacy:
```
Authentication: Bearer <token>
```

Modern (Cookie-based - more secure):
```
Cookie: service_token=<token>
```

## Deprecations

The following files are deprecated and will be removed in a future release:

- `app.js` - Use `npm run dev` instead
- `router.js`
- `controllers/*`
- `middlewares/*`
- `public/*.html`
- `public/js/*.js`
- `public/css/*.css`

To run the legacy version (not recommended):
```bash
npm run legacy:dev
```

## Testing

### Run All Tests
```bash
npm test
```

### Type Check
```bash
npm run type-check
```

### Lint Code
```bash
npm run lint
```

### Build Production
```bash
npm run build
```

## Deployment

### Using Docker
```bash
npm run docker:prod
```

### Manual Deployment
```bash
npm run build
npm start
```

## Rollback Plan

If you need to rollback to the legacy version:

1. Stop the Next.js server
2. Run the legacy server:
   ```bash
   npm run legacy:start
   ```

## Support

For issues or questions about the migration, please:
1. Check the [README_NEW.md](./README_NEW.md) documentation
2. Review existing GitHub Issues
3. Create a new Issue with the `migration` label

## Timeline

- **Phase 1** (✅ Complete): Infrastructure and API migration
- **Phase 2** (✅ Complete): Frontend basics
- **Phase 3** (🚧 In Progress): Full feature parity
- **Phase 4** (⏳ Planned): Legacy code removal
- **Phase 5** (⏳ Planned): Enhanced features (data viz, testing)

## Checklist for Complete Migration

- [x] Next.js setup with TypeScript
- [x] All API endpoints migrated
- [x] Authentication system updated
- [x] Mock OAuth for development
- [x] Database models with TypeScript
- [x] Basic admin dashboard
- [x] Basic voting interface
- [x] Docker configuration
- [x] CI/CD pipeline
- [x] Database seeding script
- [x] Documentation
- [ ] Complete voting flow
- [ ] Data visualization
- [ ] Complete CRUD in admin
- [ ] Automated tests
- [ ] Production deployment
- [ ] Legacy code removal

Last Updated: November 17, 2025
