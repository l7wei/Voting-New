# NTHU Voting System v2.0

Modern anonymous voting system for National Tsing Hua University Student Association. Built with Next.js 15, TypeScript, and MongoDB.

## Architecture

- **Framework**: Next.js 15 App Router
- **Language**: TypeScript
- **Database**: MongoDB 6 + Mongoose 8
- **Authentication**: JWT + OAuth (CCXP OAuth / Mock OAuth)
- **Styling**: Tailwind CSS
- **Testing**: Jest + React Testing Library
- **Deployment**: Docker + Docker Compose

## Core Features

### Anonymous Voting
- UUID-based vote tokens ensure complete anonymity
- Vote records are cryptographically separated from voter identity
- System only tracks whether a student voted, not their choices
- Even with full database access, votes cannot be traced to individuals

### Authentication
- OAuth integration with CCXP (production)
- Mock OAuth with customizable test data (development)
- JWT session management
- Admin role-based access control

### Voting Methods
- **choose_all**: Rate each option (support/oppose/neutral)
- **choose_one**: Single choice selection

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 6+
- npm 9+

### Development

```bash
# Clone and install
git clone https://github.com/l7wei/Voting-New.git
cd Voting-New
npm install

# Configure environment
cp .env.example .env

# Start MongoDB (Docker)
docker-compose -f docker-compose.dev.yml up -d

# Run development server
npm run dev
```

Access at http://localhost:3000

### Docker Deployment

```bash
# Full stack
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Environment Variables

```env
# Database
MONGO_HOST=127.0.0.1
MONGO_USERNAME=root
MONGO_PASSWORD=password
MONGO_NAME=voting_sa

# Authentication
TOKEN_SECRET=your-secret-key

# OAuth (Production)
OAUTH_CLIENT_ID=your-client-id
OAUTH_CLIENT_SECRET=your-client-secret
OAUTH_AUTHORIZE=https://oauth.ccxp.nthu.edu.tw/v1.1/authorize.php
OAUTH_TOKEN_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/token.php
OAUTH_RESOURCE_URL=https://oauth.ccxp.nthu.edu.tw/v1.1/resource.php
OAUTH_CALLBACK_URL=https://your-domain.com/api/auth/callback
```

## System Design

### Anonymity Model

**Vote Record (votes collection)**
```typescript
{
  activity_id: ObjectId,
  rule: 'choose_all' | 'choose_one',
  choose_all?: Array<{
    option_id: ObjectId,
    remark: '我要投給他' | '我不投給他' | '我沒有意見'
  }>,
  choose_one?: ObjectId,
  token: string,  // UUID - voter identity decoupled
  created_at: Date
}
```

**Activity Record (activities collection)**
```typescript
{
  name: string,
  type: string,
  rule: 'choose_all' | 'choose_one',
  users: string[],  // Student IDs who voted (no vote content)
  options: ObjectId[],
  open_from: Date,
  open_to: Date
}
```

### Authentication Flow

1. User requests protected resource → Redirected to `/login`
2. Login page → Redirects to `/api/auth/login`
3. Auth endpoint → Redirects to OAuth provider
4. OAuth provider → User authorizes → Redirects to `/api/auth/callback` with code
5. Callback → Exchanges code for token → Retrieves user info → Generates JWT → Sets cookie → Redirects to `/vote`

**JWT Payload (minimal)**
```typescript
{
  _id: string,        // Student ID
  student_id: string, // Student ID
  name: string        // Display name
}
```

### Voting Flow

1. **Eligibility Check**
   - Student ID in `data/voterList.csv`
   - Activity time window valid
   - Not already voted (not in `activity.users`)

2. **Vote Submission**
   - Generate UUID token
   - Store vote record with token (no student ID)
   - Add student ID to `activity.users`
   - Return UUID token to voter

3. **Vote Verification**
   - Voters can verify their vote using UUID token
   - Cannot identify other votes or voters

### Admin Management

Admins are defined in `config/admins.json` (file-based, not database):
```json
{
  "admins": ["108060001", "110000114"]
}
```

**Admin privileges** (server-side validation via `lib/adminConfig.ts`):
- Create/modify/delete activities
- Add/remove options
- View anonymized vote statistics
- Export results

## API Reference

### Authentication
- `GET /api/auth/login` - Initiate OAuth flow
- `GET /api/auth/callback` - OAuth callback handler
- `GET /api/auth/check` - Check authentication status
- `GET /api/auth/logout` - Logout and clear session

### Activities
- `GET /api/activities` - List activities (public)
- `GET /api/activities/:id` - Get activity details
- `POST /api/activities` - Create activity (admin)
- `PUT /api/activities/:id` - Update activity (admin)
- `DELETE /api/activities/:id` - Delete activity (admin)

### Voting
- `POST /api/votes` - Submit vote (authenticated, eligible)
- `GET /api/votes` - List votes (admin, anonymized)

### Statistics
- `GET /api/stats?activity_id=:id` - Get activity statistics (admin)

### Mock OAuth (Development)
- `GET /api/mock/auth` - Mock OAuth authorization page
- `POST /api/mock/token` - Mock token endpoint
- `POST /api/mock/resource` - Mock resource endpoint

## Development

### Project Structure
```
├── app/
│   ├── api/          # API routes
│   │   ├── auth/     # Authentication
│   │   ├── mock/     # Mock OAuth
│   │   ├── activities/
│   │   ├── votes/
│   │   └── stats/
│   ├── admin/        # Admin pages
│   ├── vote/         # Voting pages
│   └── login/        # Login page
├── lib/              # Shared libraries
│   ├── models/       # Mongoose schemas
│   ├── auth.ts       # JWT utilities
│   ├── oauth.ts      # OAuth client
│   ├── db.ts         # Database connection
│   ├── adminConfig.ts # Admin verification
│   └── voterList.ts  # Voter eligibility
├── components/       # React components
├── types/            # TypeScript definitions
├── data/             # Static data files
│   └── voterList.csv # Eligible voters
├── config/           # Configuration files
│   └── admins.json   # Admin list
└── middleware.ts     # Auth middleware
```

### Testing
```bash
# Run tests
npm test

# Watch mode
npm run test:watch

# Type checking
npm run type-check

# Lint
npm run lint
```

### Mock OAuth

In development, the system uses Mock OAuth by default. Users can input custom test data:

1. Navigate to protected route → Redirected to Mock OAuth form
2. Fill in custom test data:
   - **Userid** (學號): Student ID
   - **Name** (姓名): Display name
   - **Inschool**: In-school status (true/false)
   - **UUID**: Custom UUID (optional, auto-generated if empty)
3. Click "Authorize" → Redirected with custom identity

## Security

### Implemented Safeguards
- ✅ JWT token authentication
- ✅ UUID-based vote anonymization
- ✅ Admin role verification
- ✅ Voter eligibility validation
- ✅ Time-window enforcement
- ✅ Duplicate vote prevention
- ✅ HttpOnly secure cookies
- ✅ HTTPS enforced in production

### Privacy Guarantees
- No user database (users not persisted)
- OAuth data used only for authentication (not stored)
- Vote records contain no voter identification
- Activity records only track participation (not choices)
- UUID tokens are cryptographically random
- Database breach cannot reveal vote content → voter mapping

## Deployment Checklist

- [ ] Set strong `TOKEN_SECRET`
- [ ] Configure production OAuth credentials
- [ ] Set up HTTPS/SSL certificates
- [ ] Configure MongoDB authentication
- [ ] Set secure cookie flags (`secure: true`, `httpOnly: true`)
- [ ] Update `voterList.csv` with current student roster
- [ ] Update `config/admins.json` with admin student IDs
- [ ] Enable MongoDB backup automation
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging

## Troubleshooting

### Common Issues

**Login infinite loop**
- Ensure OAuth URLs are correctly configured
- Check that `OAUTH_CALLBACK_URL` matches registered redirect URI
- Verify middleware isn't blocking auth endpoints

**Database connection failed**
- Verify MongoDB is running: `docker-compose ps`
- Check credentials in `.env`
- Ensure MongoDB port (27017) isn't blocked

**Vote submission fails**
- Verify student is in `voterList.csv`
- Check activity time window is valid
- Confirm student hasn't already voted

**Mock OAuth not showing custom data**
- This is a known issue in development due to cookie propagation
- Data IS being stored correctly
- Will be fixed in next release

## Contributing

1. Fork repository
2. Create feature branch (`git checkout -b feature/name`)
3. Commit changes (`git commit -m 'Add feature'`)
4. Push branch (`git push origin feature/name`)
5. Open Pull Request

## License

ISC License

## Maintainers

National Tsing Hua University Student Association - Technology Department

---

**Security Notice**: This system handles sensitive voting data. Follow security best practices, keep dependencies updated, enable HTTPS in production, and regularly backup the database.
