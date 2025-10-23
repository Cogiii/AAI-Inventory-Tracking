# Frontend Architecture Guide

## 🏗️ **Architecture Overview**

This frontend application follows a modern, scalable architecture using the specified tech stack:

- **React 19** + **TypeScript** - Component-based UI with strong typing
- **Zustand** - Lightweight state management
- **React Query (@tanstack/react-query)** - Server state management & caching
- **React Hook Form** + **Zod** - Form validation and management
- **React Router Dom** - Client-side routing
- **ShadCN/UI** - Reusable component library
- **TailwindCSS** - Utility-first styling

## 📁 **Folder Structure**

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # ShadCN components
│   ├── auth/           # Authentication-specific components
│   └── layout/         # Layout components
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hooks with React Query
│   └── useForm.ts      # Form hooks with Zod validation
├── pages/              # Page components (routes)
│   ├── Login/
│   ├── Dashboard/
│   └── ...
├── providers/          # Context providers
│   └── QueryProvider.tsx
├── schemas/            # Zod validation schemas
│   └── index.ts
├── services/           # API services
│   ├── api.ts          # Axios configuration
│   └── auth.ts         # Auth API calls
├── stores/             # Zustand stores
│   ├── authStore.ts    # Authentication state
│   ├── uiStore.ts      # UI state (theme, notifications, etc.)
│   └── index.ts        # Store exports
├── types/              # TypeScript type definitions
│   └── index.ts
├── lib/                # Utilities
│   ├── api.ts          # API utilities (legacy - migrate to services/)
│   └── utils.ts        # General utilities
└── router.tsx          # Route configuration
```

## 🔧 **Key Architecture Principles**

### 1. **Separation of Concerns**
- **Components**: Only handle UI rendering and user interactions
- **Hooks**: Contain business logic and state management
- **Services**: Handle API communication
- **Stores**: Manage global application state
- **Schemas**: Define data validation rules

### 2. **Type Safety**
- Comprehensive TypeScript interfaces in `types/`
- Zod schemas for runtime validation
- Strongly typed API responses and form data

### 3. **Performance Optimization**
- React.memo for preventing unnecessary re-renders
- React Query for efficient data fetching and caching
- Lazy loading for routes (implement as needed)
- Optimized bundle splitting with Vite

### 4. **Error Handling**
- Global error boundaries
- Centralized error notification system
- Graceful error recovery

## 🚀 **State Management Strategy**

### Zustand Stores

#### **Auth Store** (`authStore.ts`)
```typescript
// Global authentication state
const { user, isAuthenticated, login, logout } = useAuthStore();
```

#### **UI Store** (`uiStore.ts`)
```typescript
// Global UI state
const { theme, toggleTheme, addNotification } = useUIStore();
```

### React Query Integration

#### **Server State Management**
- All API calls go through React Query
- Automatic caching, refetching, and synchronization
- Optimistic updates for better UX

```typescript
// Example usage
const { data: user, isLoading, error } = useAuthValidation();
const loginMutation = useLogin();
```

## 📝 **Form Management**

### React Hook Form + Zod Pattern

```typescript
// 1. Define schema
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// 2. Use typed hook
const form = useLoginForm();

// 3. Handle submission
const onSubmit = form.handleSubmit(async (data) => {
  await loginMutation.mutateAsync(data);
});
```

## 🎨 **Styling Guidelines**

### TailwindCSS + Dark Mode Support
- Use utility classes for consistent spacing and colors
- Dark mode variants: `dark:bg-gray-800`
- Component-level styling in className strings
- Custom component library with ShadCN/UI

### Responsive Design
- Mobile-first approach
- Breakpoint prefixes: `sm:`, `md:`, `lg:`, `xl:`

## 🔐 **Authentication Flow**

1. **Login Process**:
   ```typescript
   User Input → Form Validation → API Call → Store Update → Route Navigation
   ```

2. **Auth Persistence**:
   - Token stored in localStorage
   - Zustand persist middleware for state hydration
   - Automatic token validation on app initialization

3. **Protected Routes**:
   - Route guards check authentication status
   - Automatic redirect to login for unauthenticated users

## 🛠️ **Development Guidelines**

### Component Creation
```typescript
// Use memo for performance
const MyComponent = memo(({ prop1, prop2 }: Props) => {
  // Component logic
  return <div>...</div>;
});

MyComponent.displayName = 'MyComponent';
```

### Hook Creation
```typescript
// Custom hooks for reusable logic
export const useCustomHook = () => {
  const [state, setState] = useState();
  
  return { state, setState };
};
```

### API Integration
```typescript
// Use React Query mutations for API calls
const mutation = useMutation({
  mutationFn: apiService.createItem,
  onSuccess: (data) => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  }
});
```

## 🧪 **Testing Strategy**

### Recommended Testing Approach
1. **Unit Tests**: Components, hooks, and utilities
2. **Integration Tests**: API services and store integration
3. **E2E Tests**: Critical user flows

### Testing Tools (to be implemented)
- **Vitest** - Fast unit testing
- **React Testing Library** - Component testing
- **MSW** - API mocking
- **Playwright** - E2E testing

## 🚀 **Performance Optimizations**

### Current Optimizations
1. **React Query** caching reduces API calls
2. **React.memo** prevents unnecessary re-renders
3. **Zustand** lightweight state management
4. **Vite** for fast development and optimized builds

### Future Optimizations
1. **React.lazy** for code splitting
2. **Intersection Observer** for lazy loading
3. **Service Worker** for offline support
4. **Bundle analysis** and optimization

## 📦 **Build and Deployment**

### Scripts
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
npm run lint     # ESLint checking
```

### Environment Configuration
- `.env` files for environment variables
- Vite configuration in `vite.config.ts`

## 🔄 **Migration Path**

### From Current Architecture
1. **Components**: Refactor to use new hooks and stores
2. **Context**: Replace with Zustand stores
3. **Forms**: Migrate to React Hook Form + Zod
4. **API**: Integrate with React Query

### Step-by-Step Migration
1. Install new dependencies ✅
2. Set up folder structure ✅
3. Create stores and hooks ✅
4. Update components one by one
5. Add error boundaries ✅
6. Test and optimize

## 📚 **Learning Resources**

- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)
- [TailwindCSS](https://tailwindcss.com/)

---

This architecture provides a solid foundation for building a maintainable, scalable, and performant React application. Each layer has a clear responsibility, making the codebase easier to understand, test, and extend.