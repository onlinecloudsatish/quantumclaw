# Clerk Authentication

description: Clerk auth patterns — user management, sessions, and Next.js integration

## When to use
- Adding authentication to Next.js apps
- Need user management
- Social login integration

## Key Concepts
- <SignIn />, <SignUp /> components
- useUser hook for state
- Middleware for protection
- Session management

## Common Patterns
\`\`\`typescript
import { useUser } from "@clerk/nextjs";

export default function Profile() {
  const { user, isLoaded } = useUser();
  if (!isLoaded) return null;
  return <div>Hello {user?.fullName}</div>;
}
\`\`\`
