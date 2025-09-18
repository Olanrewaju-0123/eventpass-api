# EventPass Frontend (Vite)

A modern, fast React frontend for the EventPass event management system, built with Vite for optimal performance.

## 🚀 Features

- **Lightning Fast Development** - Vite provides instant hot reload and fast startup
- **TypeScript** - Full type safety and better developer experience
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **React Router** - Client-side routing with protected routes
- **TanStack Query** - Powerful data fetching and caching
- **React Hook Form** - Performant forms with validation
- **Mobile-First Design** - Responsive design optimized for all devices

## 🛠️ Tech Stack

- **Vite** - Build tool and dev server
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React Router DOM** - Routing
- **TanStack Query** - Data fetching
- **React Hook Form** - Form handling
- **Yup** - Validation
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **Axios** - HTTP client

## 📦 Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🔧 Environment Variables

Create a `.env` file in the root directory:

```env
# API Configuration
VITE_API_URL=http://localhost:4000/api/v1

# App Configuration
VITE_APP_NAME=EventPass
VITE_APP_VERSION=1.0.0
```

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Footer component
│   └── ...
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── pages/              # Page components
│   ├── HomePage.tsx    # Landing page
│   ├── EventsPage.tsx  # Events listing
│   ├── LoginPage.tsx   # User login
│   └── ...
├── services/           # API services
│   ├── api.ts         # Axios configuration
│   ├── authService.ts # Authentication API
│   ├── eventService.ts# Events API
│   └── ...
├── types/              # TypeScript type definitions
│   └── index.ts       # All type definitions
├── utils/              # Utility functions
├── App.tsx            # Main app component
└── main.tsx           # App entry point
```

## 🎨 Design System

The project uses a custom design system built on Tailwind CSS:

- **Primary Colors** - Blue-based color palette
- **Typography** - Inter font family
- **Spacing** - Consistent spacing scale
- **Components** - Pre-built component classes
- **Mobile-First** - Responsive design utilities

## 🔐 Authentication

The app includes a complete authentication system:

- User registration with email verification
- Secure login/logout
- Protected routes based on user roles
- JWT token management
- Automatic token refresh

## 📱 Mobile Optimization

- Touch-friendly interface
- Optimized for mobile devices
- Responsive navigation
- Mobile-specific utilities
- Performance optimizations

## 🚀 Performance

Vite provides excellent performance benefits:

- **Fast Startup** - Development server starts in seconds
- **Hot Reload** - Instant updates during development
- **Optimized Builds** - Efficient production bundles
- **Tree Shaking** - Automatic dead code elimination
- **Code Splitting** - Automatic route-based splitting

## 🔄 Migration from Create React App

This project was migrated from Create React App to Vite for better performance:

- **Faster Development** - 10x faster startup times
- **Better DX** - Improved developer experience
- **Modern Tooling** - Latest build tools and optimizations
- **Smaller Bundles** - More efficient production builds

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new code
3. Write responsive, mobile-first components
4. Test on multiple devices and browsers
5. Follow the established project structure

## 📄 License

This project is part of the EventPass system.
