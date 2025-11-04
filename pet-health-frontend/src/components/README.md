# Component Structure

This directory contains all the modular components for the Pet Health App.

## Layout Components (`layout/`)
- **Layout.jsx**: Main layout wrapper that combines sidebar and header
- **Sidebar.jsx**: Collapsible navigation sidebar with role switching
- **Header.jsx**: Top header with user info and notifications

## Page Components (`pages/`)
- **DashboardPage.jsx**: Main dashboard with stats and recent activity
- **PetsPage.jsx**: Pet management and listing
- **RecordsPage.jsx**: Medical records management
- **SharingPage.jsx**: Vet access sharing functionality
- **SettingsPage.jsx**: User profile and preferences

## Shared Components
- **PageRouter.jsx**: Routes between different pages based on current page state

## Hooks (`hooks/`)
- **useNavigation.js**: Manages sidebar state, user role, and navigation
- **useMockData.js**: Provides mock data for pets and records

## Benefits of This Structure
1. **Separation of Concerns**: Each component has a single responsibility
2. **Reusability**: Components can be easily reused across the app
3. **Maintainability**: Easier to find and modify specific functionality
4. **Testing**: Individual components can be tested in isolation
5. **Scalability**: Easy to add new pages and features
