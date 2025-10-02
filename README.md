# NeedOne

**NeedOne** is a Progressive Web App (PWA) designed to help pickleball players find active courts and connect with the community in real-time.

## Demo Video

Watch the full demo of NeedOne in action:

[![Watch NeedOne Demo](https://img.youtube.com/vi/hVhwoUfbuDY/maxresdefault.jpg)](https://youtu.be/hVhwoUfbuDY)

**[▶️ Click here to watch the demo on YouTube](https://youtu.be/hVhwoUfbuDY)**

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

## Screenshots

### My Parks Dashboard - User Checked In

<img src="https://github.com/user-attachments/assets/ac0c0e41-603e-474b-8ce1-c71e1160a179" alt="My Parks Dashboard - Checked In" width="300"/>

The main dashboard showing park activity when a user is checked in. As a **Progressive Web App (PWA)**, NeedOne can be installed directly to your home screen for an app-like experience with full notification support.

### My Parks Dashboard - User Checked Out

<img src="https://github.com/user-attachments/assets/b12c1916-d924-49c8-8495-244ff250e7d2" alt="My Parks Dashboard - Checked Out" width="300"/>

Dashboard view when the user is not currently checked in to any park. The PWA architecture allows instant access without app store downloads.

### Moderator Capacity Update

<img src="https://github.com/user-attachments/assets/2edbdc51-1fca-422c-ba59-a466e791e423" alt="Moderator Update Feature" width="300"/>

Verified moderators can update the reported capacity at parks to ensure accurate player counts. The moderator badge (shield icon) identifies trusted community members.

### People at the Park

<img src="https://github.com/user-attachments/assets/43a41a95-f402-4dd6-8971-c29ca44b20b0" alt="People at Park View" width="300"/>

View who's currently at the park, with friends highlighted separately from other players. Send friend requests directly from this view to grow your pickleball network.

### Add Parks to Your List

<img src="https://github.com/user-attachments/assets/f610683d-ba02-4361-b44d-e5f613b7d038" alt="Add Parks Feature" width="300"/>

Browse and add existing parks to your personal list. Each park displays detailed information including number of courts, net type, environment (indoor/outdoor), and privacy status.

### Create New Park (Moderator Feature)

<img src="https://github.com/user-attachments/assets/e8dbaf62-3ea2-4fbc-afd5-6e9088a30972" alt="Create Park Form" width="300"/>

Moderators can add new pickleball locations to the system with comprehensive details including park name, location, description, court count, max players, and facility tags.

### Friends & Friend Requests

<img src="https://github.com/user-attachments/assets/79276ff6-00a5-4647-a16d-5cb50dc25bf6" alt="Friends Panel" width="300"/>

Manage your friend network with real-time online status. See which friends are currently at parks, accept or decline friend requests, and receive push notifications when friends check in.

### Share Feedback

<img src="https://github.com/user-attachments/assets/b42a2e8b-5f7c-44c5-a22b-dfcab0b30100" alt="Feedback Form" width="300"/>

Built-in feedback system allows users to rate their experience and submit bug reports, feature requests, or general feedback to help improve the app.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js 18+** and npm
- **Docker Desktop** (for running Supabase locally)
- **Supabase CLI** - Install via: `npm install -g supabase`
- **Git** (for cloning the repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/danielvu1023/NeedOne.git
   cd NeedOne
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory with the following variables:

   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   SUPABASE_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres

   # Database URLs (for migrations and seeding)
   DATABASE_URL=your_database_url_here
   DIRECT_URL=your_direct_url_here

   # Google OAuth (for authentication)
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret

   # PWA Push Notifications
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
   VAPID_PRIVATE_KEY=your_vapid_private_key

   # Webhook Configuration (for notifications)
   NGROK_URL=your_ngrok_url_here

   # Encryption
   ENCRYPTION_KEY=your_32_byte_hex_encryption_key
   EMAIL=your_email@example.com
   ```

4. **Start Supabase locally**

   Make sure Docker Desktop is running, then:
   ```bash
   supabase start
   ```

   This will start all Supabase services locally. Note the `anon key` and `service_role key` from the output and add them to your `.env` file.

5. **Run database migrations**

   The migrations will be automatically applied when you start Supabase. You can verify by running:
   ```bash
   supabase db reset
   ```

   This command will:
   - Apply all migrations from `supabase/migrations/`
   - Run the seed file `supabase/seed.sql`

6. **Seed the database with sample data**

   Run the TypeScript seed file to create test users and parks:
   ```bash
   npx tsx seed.ts
   ```

   This creates sample users, parks, and relationships for testing.

7. **Configure webhooks (for push notifications)**

   To enable friend check-in notifications, you need to set up a webhook:

   a. **Install ngrok** (if not already installed):
      ```bash
      npm install -g ngrok
      ```

   b. **Start ngrok** to create a public URL:
      ```bash
      ngrok http 3000
      ```

   c. **Update your `.env`** with the ngrok URL:
      ```env
      NGROK_URL=https://your-ngrok-url.ngrok-free.app
      ```

   d. **Configure the webhook in Supabase**:
      - The webhook is configured via migration `20250915000000_add_webhook_configuration.sql`
      - It triggers on `check_ins` table INSERT events
      - Sends POST requests to `${NGROK_URL}/api/webhook`

8. **Set up automatic checkout cron job**

   The app includes a scheduled job to automatically check out users after a certain time:

   - Configure this in your Supabase Dashboard under **Database → Cron Jobs**
   - Or add a cron job via SQL migration to call a cleanup function periodically
   - Example: Check out users who haven't updated their status in 4+ hours

9. **Generate VAPID keys for PWA push notifications** (if not using provided keys)

   ```bash
   npx web-push generate-vapid-keys
   ```

   Add the generated keys to your `.env` file.

10. **Start the development server**
    ```bash
    npm run dev
    ```

    The app will be available at [http://localhost:3000](http://localhost:3000)

### Available Commands

- `npm run dev` - Start development server with Turbopack (hot reload enabled)
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality
- `npx tsx seed.ts` - Seed database with sample data
- `supabase start` - Start local Supabase instance
- `supabase stop` - Stop local Supabase instance
- `supabase db reset` - Reset database and rerun migrations
- `supabase status` - Check status of local Supabase services

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the consent screen
6. Set authorized redirect URIs:
   - `http://localhost:54321/auth/v1/callback` (for local Supabase)
   - `http://localhost:3000` (for your app)
7. Copy the **Client ID** and **Client Secret** to your `.env` file

### Troubleshooting

**Issue: Supabase won't start**
- Ensure Docker Desktop is running
- Check if ports 54321, 54322, 54323 are available
- Try `supabase stop` then `supabase start`

**Issue: Migrations failing**
- Run `supabase db reset` to reapply all migrations
- Check migration files in `supabase/migrations/` for errors

**Issue: Push notifications not working**
- Verify ngrok is running and URL is updated in `.env`
- Check webhook configuration in Supabase Dashboard
- Ensure VAPID keys are correctly set in `.env`

**Issue: Google OAuth not working**
- Verify redirect URIs match in Google Console and Supabase
- Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set
- Ensure Google OAuth is enabled in `supabase/config.toml`

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
