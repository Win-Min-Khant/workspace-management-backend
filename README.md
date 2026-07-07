# Jira Clone — REST API

A full-featured project management REST API built with Node.js, Express, TypeScript, and MongoDB. Implements workspace-based multi-tenancy with role-based access control (RBAC), file uploads via Cloudinary, JWT authentication, and real-time activity logging.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Language | TypeScript |
| Database | MongoDB + Mongoose |
| Authentication | JWT (Access + Refresh Token) |
| File Storage | Cloudinary |
| File Parsing | Multer (memory storage) |
| Validation | express-validator |
| Email | Nodemailer |
| Password Hashing | bcryptjs |

---

## Project Structure

```
server/
├── src/
│   ├── controllers/        # HTTP layer — extracts req data, calls service, sends res
│   │   ├── auth.controller.ts
│   │   ├── workspace.controller.ts
│   │   ├── project.controller.ts
│   │   ├── task.controller.ts
│   │   ├── comment.controller.ts
│   │   ├── invitation.controller.ts
│   │   ├── dashboard.controller.ts
│   │   ├── activity.controller.ts
│   │   └── notification.controller.ts
│   │
│   ├── services/           # Business logic — DB queries, validation, external APIs
│   │   ├── auth.service.ts
│   │   ├── workspace.service.ts
│   │   ├── project.service.ts
│   │   ├── task.service.ts
│   │   ├── comment.service.ts
│   │   ├── invitation.service.ts
│   │   ├── dashboard.service.ts
│   │   ├── activity.service.ts
│   │   └── notification.service.ts
│   │
│   ├── models/             # Mongoose schemas
│   │   ├── user.model.ts
│   │   ├── workspace.model.ts
│   │   ├── user_workspace.model.ts
│   │   ├── project.model.ts
│   │   ├── project_member.model.ts
│   │   ├── task.model.ts
│   │   ├── comment.model.ts
│   │   ├── invitation.model.ts
│   │   ├── activity.model.ts
│   │   └── notification.model.ts
│   │
│   ├── routes/             # Express routers
│   │   ├── auth.routes.ts
│   │   ├── workspace.routes.ts
│   │   ├── project.routes.ts
│   │   ├── task.routes.ts
│   │   ├── comment.routes.ts
│   │   ├── invitation.routes.ts
│   │   ├── dashboard.routes.ts
│   │   ├── activity.routes.ts
│   │   └── notification.routes.ts
│   │
│   ├── middlewares/
│   │   ├── protect.middleware.ts       # JWT auth + requireRole factory
│   │   ├── multer.middleware.ts        # File upload config
│   │   ├── validation.middleware.ts    # Request body validation
│   │   └── error.middleware.ts         # Centralized error handler
│   │
│   ├── utils/
│   │   ├── appError.ts                 # Custom error class
│   │   ├── asyncHandler.ts             # Async error wrapper
│   │   ├── uploadToCloudinary.ts       # Cloudinary stream upload
│   │   ├── generateRandomToken.ts      # Invitation token generator
│   │   ├── sendEmail.ts                # Email sender
│   │   └── inviteEmailTemplate.ts      # HTML email template
│   │
│   ├── validations/        # Express-validator schemas
│   │   ├── auth.validation.ts
│   │   ├── workspace.validation.ts
│   │   ├── project.validation.ts
│   │   ├── task.validation.ts
│   │   ├── invitation.validation.ts
│   │   └── comment.validation.ts
│   │
│   ├── types/
│   │   └── auth.types.ts               # Shared TypeScript interfaces
│   │
│   ├── app.ts              # Express app setup + middleware registration
│   └── server.ts           # Server entry point
│
├── .env
├── .env.example
├── tsconfig.json
└── package.json
```

---

## Data Model Relationships

```
User ──────────── UserWorkspace ──────────── Workspace
                  (role, status)
                       │
                       │
              ┌────────┴────────┐
              │                 │
           Project           Invitation
              │
       ┌──────┴──────┐
       │             │
  ProjectMember     Task
                     │
              ┌──────┴──────┐
              │             │
           Comment     Notification
              │
          ActivityLog
```

### Models Overview

| Model | Key Fields |
|---|---|
| User | name, email, password, avatar, refreshToken, lastAccessedWorkspaceId |
| Workspace | name, logo, ownerId |
| UserWorkspace | userId, workspaceId, role (owner/admin/member), status |
| Project | name, description, status, startDate, endDate, workspaceId, createdBy |
| ProjectMember | projectId, userId |
| Task | title, description, status, priority, projectId, workspaceId, assigneeId, assignedBy |
| Comment | content, authorId, taskId, workspaceId |
| Invitation | email, role, workspaceId, invitedBy, status, inviteToken, inviteTokenExpiresAt |
| ActivityLog | workspaceId, userId, action, targetId, targetType, details |
| Notification | userId, workspaceId, taskId, message, isRead |

---

## Request Lifecycle

```
Client Request
     │
     ▼
Express Router          matches URL + HTTP method
     │
     ▼
Middleware Chain
  ├── protect           verifies JWT, attaches req.user
  ├── requireRole       checks workspace membership role
  └── validate          validates request body schema
     │
     ▼
Controller              extracts data from req, calls service
     │
     ▼
Service                 business logic, DB queries, external APIs
     │
     ▼
Controller              sends res.json() to client
     │
     ↕ (on any error)
     ▼
ErrorHandler            catches all errors, returns clean JSON
```

---

## Role-Based Access Control (RBAC)

Three workspace roles with different permissions:

| Permission | Owner | Admin | Member |
|---|---|---|---|
| Create workspace | ✅ | ❌ | ❌ |
| Update workspace | ✅ | ❌ | ❌ |
| Delete workspace | ✅ | ❌ | ❌ |
| Invite as admin | ✅ | ❌ | ❌ |
| Invite as member | ✅ | ✅ | ❌ |
| Create project | ✅ | ✅ | ❌ |
| Update project | ✅ | ✅ | ❌ |
| Delete project | ✅ | ❌ | ❌ |
| View all projects | ✅ | ✅ | ❌ |
| View assigned projects | ✅ | ✅ | ✅ |
| Create task | ✅ | ✅ | ❌ |
| Update task | ✅ | ✅ | ❌ |
| Delete task | ✅ | ✅ | ❌ |
| Update own task status | ✅ | ✅ | ✅ |
| View all tasks | ✅ | ✅ | ❌ |
| View assigned tasks | ✅ | ✅ | ✅ |
| Comment on assigned tasks | ✅ | ✅ | ✅ |
| Delete any comment | ✅ | ✅ | ❌ |
| View activity logs | ✅ | ✅ | ❌ |
| View dashboard stats | ✅ | ✅ | ❌ |
| View own work summary | ✅ | ✅ | ✅ |

---

## API Reference

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register with workspace creation |
| POST | `/api/auth/login` | Public | Login and receive tokens |
| DELETE | `/api/auth/logout` | Private | Logout and invalidate refresh token |
| POST | `/api/auth/refresh` | Public | Regenerate access token |
| GET | `/api/auth/:workspaceId/profile` | Private | View profile with role and workspace |
| PATCH | `/api/auth/profile/update-profile` | Private | Update name |
| PATCH | `/api/auth/profile/update-avatar` | Private | Upload or replace avatar |

### Workspaces

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/workspaces` | Private | Create new workspace |
| GET | `/api/workspaces/:workspaceId` | Owner | View workspace details and stats |
| PATCH | `/api/workspaces/:workspaceId` | Owner | Update name or logo |
| DELETE | `/api/workspaces/:workspaceId` | Owner | Delete workspace and all related data |
| GET | `/api/workspaces/:workspaceId/members` | All | View workspace members |
| PATCH | `/api/workspaces/:workspaceId/members/:memberId` | Owner | Update member role |
| DELETE | `/api/workspaces/:workspaceId/members/:memberId` | Owner/Admin | Remove member |

### Invitations

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/workspaces/:workspaceId/invite` | Owner/Admin | Send invitation email |
| GET | `/api/invitations/verify/:token` | Public | Verify invitation token |
| POST | `/api/invitations/accept/:token` | Public | Accept invitation |

### Projects

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/workspaces/:workspaceId/projects` | All | List projects (filtered by role) |
| POST | `/api/workspaces/:workspaceId/projects` | Owner/Admin | Create project |
| GET | `/api/workspaces/:workspaceId/projects/:projectId` | All | View project details with members and tasks |
| PATCH | `/api/workspaces/:workspaceId/projects/:projectId` | Owner/Admin | Update project |
| DELETE | `/api/workspaces/:workspaceId/projects/:projectId` | Owner | Delete project and related data |
| POST | `/api/workspaces/:workspaceId/projects/:projectId/members` | Owner/Admin | Assign or remove project member |

### Tasks

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/workspaces/:workspaceId/tasks` | All | List all workspace tasks (filtered by role) |
| GET | `/api/workspaces/:workspaceId/projects/:projectId/tasks` | All | List project tasks |
| POST | `/api/workspaces/:workspaceId/projects/:projectId/tasks` | Owner/Admin | Create task |
| PATCH | `/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId` | Owner/Admin | Update task |
| PATCH | `/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId/status` | All | Update own task status |
| DELETE | `/api/workspaces/:workspaceId/projects/:projectId/tasks/:taskId` | Owner/Admin | Delete task |

### Comments

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/workspaces/:workspaceId/tasks/:taskId/comments` | All | Get task comments |
| POST | `/api/workspaces/:workspaceId/tasks/:taskId/comments` | All | Add comment |
| PATCH | `/api/workspaces/:workspaceId/tasks/:taskId/comments/:commentId` | Author | Edit own comment |
| DELETE | `/api/workspaces/:workspaceId/tasks/:taskId/comments/:commentId` | Author/Owner/Admin | Delete comment |

### Dashboard

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/workspaces/:workspaceId/dashboard` | All | View dashboard (content varies by role) |

### Activity Logs

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/workspaces/:workspaceId/activity` | Owner/Admin | View paginated activity logs |

### Notifications

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/workspaces/:workspaceId/notifications` | All | Get own notifications |
| PATCH | `/api/workspaces/:workspaceId/notifications/:notificationId/read` | All | Mark as read |
| PATCH | `/api/workspaces/:workspaceId/notifications/read-all` | All | Mark all as read |

---

## Key Flows

### Registration Flow
```
POST /api/auth/register (multipart/form-data)
     │
     ├── Upload avatar + logo to Cloudinary concurrently
     │
     ├── Start MongoDB transaction
     │   ├── Create Workspace
     │   ├── Create User
     │   ├── Update Workspace.ownerId
     │   └── Create UserWorkspace (role: owner)
     │
     ├── Commit transaction
     │
     └── Return { user, workspace }

On failure: abort transaction + delete uploaded images from Cloudinary
```

### Invitation Flow
```
Owner/Admin sends invite
POST /api/workspaces/:workspaceId/invite
     │
     ├── Check inviter role (admin can only invite members)
     ├── Check for existing pending invitation
     ├── Check if user is already a member
     ├── Generate hashed token
     ├── Send email with invite link
     └── Create Invitation { status: pending }

Invited user clicks link → frontend opens /accept-invitation/:token
     │
     ├── GET /api/invitations/verify/:token
     │   └── Returns { email, role, workspace name }
     │
     └── POST /api/invitations/accept/:token
         ├── New user  → create account with name + password
         ├── Existing  → verify logged-in email matches invitation
         ├── Create UserWorkspace with invitation.role
         ├── Update User.lastAccessedWorkspaceId
         └── Mark Invitation { status: accepted }
```

### File Upload Flow
```
Client sends multipart/form-data
     │
     ▼
Multer (memoryStorage)
     ├── Validates mimetype (images only)
     ├── Validates file size (max 2MB)
     └── Stores file as Buffer in req.file
     │
     ▼
uploadToCloudinary(buffer, folder)
     ├── Creates upload_stream
     ├── Converts buffer → readable stream via streamifier
     ├── Pipes to Cloudinary
     └── Returns { secure_url, public_id }
     │
     ▼
Save { image_url, public_id } to MongoDB
     (public_id stored for future deletion)
```

### Validation Flow
```
Client sends request
     │
     ▼
express-validator schema runs
     ├── checks required fields
     ├── checks types and formats (email, mongoId, ISO date)
     ├── checks length constraints
     └── checks business rules (endDate after startDate)
     │
     ▼
validate middleware
     ├── errors found → next(new AppError(400, firstError.msg))
     └── no errors → req.body sanitized, next()
     │
     ▼
errorHandler returns clean JSON:
{ success: false, message: "Email is required." }
```

### Task Assignment Notification Flow
```
Owner/Admin creates or updates task with assigneeId
     │
     ├── Task saved to DB
     │
     └── Notification.create({
             userId: assigneeId,
             workspaceId,
             taskId,
             message: "You have been assigned to task..."
         })

Member checks notifications
GET /api/workspaces/:workspaceId/notifications
     └── Returns only notifications where userId = req.user.userId
         scoped to current workspace
```

---

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=8000

# Database
MONGO_LOCAL_URI=mongodb://localhost:27017/jira?replicaSet=rs0
MONGO_URI=mongodb+srv://...

# JWT
JWT_ACCESS_TOKEN_SECRET_KEY=
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_SECRET_KEY=
JWT_REFRESH_TOKEN_EXPIRES_IN=7d

# Cloudinary
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_API=

# Email
EMAIL_USER=
EMAIL_PASS=

# Client
CLIENT_URL=http://localhost:5173
```

---

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/jira-clone-api.git
cd jira-clone-api/server

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Fill in your values

# Start local MongoDB replica set (required for transactions)
mongod --replSet rs0 --dbpath /your/db/path
# In another terminal:
mongosh
rs.initiate()

# Run in development
npm run dev

# Build for production
npm run build
npm start
```

---

## Error Response Format

All errors return a consistent JSON shape:

```json
{
  "success": false,
  "message": "Descriptive error message",
  "stack": "..." // only in development
}
```

## Success Response Format

```json
{
  "success": true,
  "data": {},
  "message": "Optional success message"
}
```

---

## What I Learned

Building this project covered:

- **JWT authentication** with access + refresh token rotation
- **Role-based access control** using a factory middleware pattern
- **MongoDB transactions** for atomic multi-document operations
- **Multipart file uploads** using Multer memory storage + Cloudinary streams
- **Soft vs hard delete** tradeoffs for related data cleanup
- **Service layer pattern** separating business logic from HTTP concerns
- **Centralized error handling** with custom AppError class
- **Invitation system** with hashed tokens and email delivery
- **Aggregation pipelines** for dashboard statistics using `$facet`
- **Pagination** for activity logs
- **Data scoping** — ensuring workspace data never leaks across workspaces
- **Request validation** using express-validator with custom business rule checks
- **Centralized validation middleware** — single `validate` middleware funnels all errors through errorHandler

---

## Author

Built as a learning project to master Express.js, MongoDB, and TypeScript patterns for production-grade REST APIs.
