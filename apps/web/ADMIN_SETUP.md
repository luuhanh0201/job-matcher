# Admin Panel Documentation

## Overview
The admin panel is located at `/admin/**` and is built using Next.js with Shadcn UI components. It provides role-based access control to ensure only users with the "ADMIN" role can access the admin pages.

## Features

### Access Control
- **Role-Based Protection**: Only users with `role === "ADMIN"` can access admin pages
- **Automatic Redirect**: Non-admin users are automatically redirected to `/not-found` page
- **Session Management**: Integrates with existing authentication system

### Pages

#### 1. Dashboard (`/admin`)
- Overview of system statistics
- Key metrics display (total users, open jobs, views, conversion rate)
- Recent activity feed
- System status monitoring
- Quick statistics

#### 2. Users Management (`/admin/users`)
- View all registered users
- Search users by name or email
- Filter by role (CANDIDATE, RECRUITER, ADMIN)
- View user status (Active/Inactive)
- Delete users (placeholder action)

#### 3. Jobs Management (`/admin/jobs`)
- Manage all job postings
- View job details and applications count
- Edit or delete jobs
- Track job status (Active/Inactive)

#### 4. Analytics (`/admin/analytics`)
- Track key metrics (views, favorites, applications, active users)
- Daily views chart
- Role distribution pie chart
- Growth trends

#### 5. Reports (`/admin/reports`)
- Download generated reports (PDF, Excel)
- View report templates
- Create new reports
- View report history

#### 6. Settings (`/admin/settings`)
- General system settings (name, URL, support email)
- Security settings (2FA, login limits)
- Notification preferences
- Database backup options

## File Structure

```
apps/web/
├── app/(admin)/
│   ├── layout.tsx              # Admin layout with AuthProvider
│   ├── admin-shell.tsx         # Shell component with role check
│   ├── page.tsx               # Dashboard
│   ├── users/
│   │   └── page.tsx           # Users management
│   ├── jobs/
│   │   └── page.tsx           # Jobs management
│   ├── analytics/
│   │   └── page.tsx           # Analytics
│   ├── reports/
│   │   └── page.tsx           # Reports
│   └── settings/
│       └── page.tsx           # Settings
└── src/
    ├── components/layouts/
    │   ├── admin-header.tsx    # Admin header with user menu
    │   └── admin-sidebar.tsx   # Admin sidebar navigation
    └── lib/
        └── role-check.ts       # Role checking utilities
```

## Components

### AdminShell
- Checks user authentication and authorization
- Renders header and sidebar
- Handles redirects for non-admin users

### AdminHeader
- Displays admin logo/icon
- Settings button
- User avatar with dropdown menu
- Logout button

### AdminSidebar
- Navigation menu for admin pages
- Only visible on large screens (lg+)
- Active page highlighting
- Logout option at bottom

## How It Works

1. **Route Protection**: When accessing `/admin/**`, the `AdminShell` component checks if the user has an ADMIN role
2. **Redirect Logic**: If user is not admin, they're redirected to `/not-found`
3. **Layout Structure**: 
   - On mobile: Full-width layout
   - On desktop (lg+): Two-column layout with sidebar

## Usage

### Accessing Admin Pages
1. Login with an admin account
2. Navigate to `/admin`
3. Use sidebar to access different admin pages

### Adding New Admin Pages
1. Create a new folder under `app/(admin)/[page-name]/`
2. Add `page.tsx` file
3. Update `AdminSidebar` navigation items if needed

### Styling
All pages use:
- Tailwind CSS for styling
- Shadcn UI components (Button, Card, Input, Label, etc.)
- Lucide React for icons
- Custom CSS variables for colors (--primary-blue, --gray-100, etc.)

## Security Considerations

1. **Client-side Role Check**: The `isAdmin()` function checks user role
2. **Server-side Protection**: API endpoints should also verify admin role
3. **Session Expiry**: Users are automatically logged out on session expiry
4. **Token Storage**: Auth tokens are stored in localStorage

## Future Enhancements

- [ ] Add pagination to user/job lists
- [ ] Add data export functionality
- [ ] Implement real-time analytics dashboard
- [ ] Add audit logging for admin actions
- [ ] Implement advanced filtering and search
- [ ] Add data visualization charts
- [ ] Implement admin user activity logs
