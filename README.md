# Showroom Mobil Bekas - Car Showroom Management System

A modern web application for managing used car showrooms, built with Next.js 13+ and Supabase.

## 🚀 Features

- **Authentication System**
  - Google OAuth integration
  - Role-based access control (Admin & Sales)
  - User approval workflow
  - Secure session management

- **Dashboard**
  - Role-specific views
  - Sales performance metrics
  - Quick access to key functions

- **Car Management**
  - Add and manage car listings
  - Upload and manage car images
  - Detailed car information management
  - Search and filter capabilities

- **Sales Management**
  - Track sales transactions
  - Manage customer information
  - Sales history and reports

## 🛠️ Tech Stack

- **Frontend**
  - Next.js 13+ (App Router)
  - TypeScript
  - Tailwind CSS
  - Framer Motion (Animations)
  - DaisyUI (UI Components)

- **Backend**
  - Supabase (Authentication & Database)
  - Next.js API Routes
  - Server-side Middleware

- **Deployment**
  - Vercel (Hosting)
  - Environment Variables Management

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Google OAuth credentials

## 🔧 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/showroommobilbekas-nextjs.git
   cd showroommobilbekas-nextjs
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Authentication Flow

1. Users sign in using Google OAuth
2. New users require admin approval
3. Approved users are assigned roles (Admin/Sales)
4. Role-based access control restricts features based on user level

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication related pages
│   ├── dashboard/         # Dashboard pages
│   └── login/             # Login page
├── components/            # Reusable components
├── lib/                   # Utility functions and configurations
└── middleware.ts          # Authentication middleware
```

## 🔒 Security Features

- Server-side authentication checks
- Protected API routes
- Role-based access control
- Secure session management
- Environment variable protection

## 🚀 Deployment

The application is configured for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy!

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Supabase for the backend services
- All contributors who have helped shape this project
