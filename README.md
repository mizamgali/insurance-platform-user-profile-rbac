# Insurance Platform - User Profile Administration with RBAC

This repository completes the **User Profile Administration with Role-Based Access Control** assignment for the NorthStar Insurance Platform.

## Implemented Features

### Profile
- View own profile at `/profile`
- Edit own profile at `/profile/edit`
- Self-service account suspension for non-admin users
- Immediate logout after self-suspension
- Suspended and inactive users are blocked from login

### Admin User Management
- Admin-only user list at `/admin/users`
- Admin-only user creation at `/admin/users/create`
- Admin-only user update at `/admin/users/[id]`
- Admin-only account status management at `/admin/account-status`
- Admin-only role assignment and revocation at `/admin/rbac`

### RBAC Enforcement
- Backend route protection for `/admin/*`
- Frontend guard protection for admin pages
- Non-admin users cannot access admin pages
- Admin navigation hidden from non-admin users
- Admin cannot suspend their own account
- System prevents suspension or role removal of the last active admin account

## Backend APIs

### Profile APIs
- `GET /api/v1/profile/me`
- `PUT /api/v1/profile/me`
- `PUT /api/v1/profile/me/suspend`

### Admin APIs
- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users`
- `GET /api/v1/admin/users/:userId`
- `PUT /api/v1/admin/users/:userId`
- `PUT /api/v1/admin/users/:userId/status`
- `GET /api/v1/admin/rbac/roles`
- `PUT /api/v1/admin/rbac/users/:userId/roles`

## Setup Instructions

### Backend
```bash
cd backend-api
npm install
npm run seed
npm run dev
```

### Frontend
```bash
cd frontend-web
npm install
npm run dev
```

## Team Members 

# Group Members:
- Mirshod Gaybullaev  N01731141
- Malika Mizamgaliyeva N01737493
- Navjot Singh N01746125
- Kirtan Vaghela N01742662
- Gurpal Singh N01731742