# NeedOne

**NeedOne** is a Progressive Web App (PWA) designed to help pickleball players find active courts and connect with the community in real-time.

## Overview

NeedOne solves a common problem for pickleball enthusiasts: knowing which courts are active right now. By allowing players to check in and check out of parks, the app provides live activity status for all registered pickleball locations.

## Key Features

### Core Functionality

- **Real-time Court Activity Tracking**: See how many players are currently checked in at any park
- **Check-in/Check-out System**: Players check in when they arrive and check out when they leave
- **Capacity Indicators**: Visual progress bars show current capacity vs. reported capacity

### Social Features

- **Friend Networking**: Add friends you meet at parks
- **Real-time Notifications**: Get notified when friends check in to parks (PWA push notifications)
- **Online Status**: See which friends are currently at parks and which are offline

### Moderator Features

- **Verified Moderators**: Special shield icon for verified moderators
- **Capacity Reporting**: Moderators can update the actual capacity count at parks to help maintain accuracy
- **Community Trust**: Encourages accurate reporting through a verified moderator system

### Park Management

- **Create New Parks**: Add new pickleball locations to the system
- **Add Parks to Your List**: Browse and add existing parks to your personal list
- **Park Details**: View comprehensive information including:
  - Number of courts
  - Net type (Permanent/Bring Own)
  - Environment (Indoor/Outdoor)
  - Privacy status (Public/Private)
  - Address and location details

### Additional Features

- **User Feedback System**: Built-in feedback form with star ratings and categorization (Bug Report, Feature Request, General Feedback)
- **Authentication**: Secure login via Google OAuth or email/password
- **Progressive Web App**: Install on mobile devices for app-like experience with notification support

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Supabase Auth
- **UI**: React 19, TailwindCSS, shadcn/ui components
- **Real-time**: Supabase subscriptions
- **PWA**: Service worker and manifest for offline capabilities and push notifications

## Demo Video

Watch the full demo of NeedOne in action:

[![NeedOne Demo](https://img.youtube.com/vi/hVhwoUfbuDY/maxresdefault.jpg)](https://youtu.be/hVhwoUfbuDY)

[Click here to watch on YouTube](https://youtu.be/hVhwoUfbuDY)

## Screenshots

### My Parks Dashboard - User Checked In

<img src="https://github.com/user-attachments/assets/your-image-id-2" alt="My Parks Dashboard - Checked In" width="300"/>

The main dashboard showing park activity when a user is checked in. As a **Progressive Web App (PWA)**, NeedOne can be installed directly to your home screen for an app-like experience with full notification support.

### My Parks Dashboard - User Checked Out

<img src="https://github.com/user-attachments/assets/your-image-id-3" alt="My Parks Dashboard - Checked Out" width="300"/>

Dashboard view when the user is not currently checked in to any park. The PWA architecture allows instant access without app store downloads.

### Moderator Capacity Update

<img src="https://github.com/user-attachments/assets/your-image-id-1" alt="Moderator Update Feature" width="300"/>

Verified moderators can update the reported capacity at parks to ensure accurate player counts. The moderator badge (shield icon) identifies trusted community members.

### People at the Park

<img src="https://github.com/user-attachments/assets/your-image-id-4" alt="People at Park View" width="300"/>

View who's currently at the park, with friends highlighted separately from other players. Send friend requests directly from this view to grow your pickleball network.

### Add Parks to Your List

<img src="https://github.com/user-attachments/assets/your-image-id-5" alt="Add Parks Feature" width="300"/>

Browse and add existing parks to your personal list. Each park displays detailed information including number of courts, net type, environment (indoor/outdoor), and privacy status.

### Create New Park (Moderator Feature)

<img src="https://github.com/user-attachments/assets/your-image-id-6" alt="Create Park Form" width="300"/>

Moderators can add new pickleball locations to the system with comprehensive details including park name, location, description, court count, max players, and facility tags.

### Friends & Friend Requests

<img src="https://github.com/user-attachments/assets/your-image-id-9" alt="Friends Panel" width="300"/>

Manage your friend network with real-time online status. See which friends are currently at parks, accept or decline friend requests, and receive push notifications when friends check in.

### Feedback System

<img src="https://github.com/user-attachments/assets/your-image-id-7" alt="Feedback Form" width="300"/>

Built-in feedback system allows users to rate their experience and submit bug reports, feature requests, or general feedback to help improve the app.

---

**Note:** To display screenshots in your GitHub README, you'll need to:

1. Upload the screenshots by dragging them into a GitHub issue or pull request comment
2. Copy the generated URL (format: `https://github.com/user-attachments/assets/...`)
3. Replace the placeholder URLs above with your actual image URLs

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Supabase account

### Installation

/// Documentation will be added soon.

### Available Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npx prisma db seed` - Seed database
- `npx prisma generate` - Generate Prisma client
- `npx prisma db push` - Push schema changes to database

## Why Progressive Web App (PWA)?

NeedOne was built as a PWA for several strategic reasons:

1. **Rapid Development**: Faster iteration cycles compared to native mobile apps
2. **Cross-Platform**: Single codebase works on iOS, Android, and desktop
3. **No App Store Friction**: Users can access immediately via web browser
4. **Push Notifications**: Full notification support when installed to home screen
5. **Easy Updates**: Changes deploy instantly without app store approval
6. **Lower Barrier to Entry**: Users can try before "installing" to home screen

## Project Structure

```
needone/
├── app/                    # Next.js App Router pages and API routes
├── components/            # Reusable React components
│   ├── park/             # Park-specific components
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities and shared types
├── prisma/              # Database schema and migrations
├── public/              # Static assets and PWA files
└── utils/               # Helper functions and Supabase clients
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

## Contact

For questions or feedback, please use the in-app feedback system or open an issue on GitHub.

---

Built with ❤️ for the pickleball community
