# Supabase Patterns

description: Supabase patterns — auth, RLS, realtime, storage, and database operations

## When to use
- Building apps with Supabase backend
- Implementing authentication
- Setting up RLS policies
- Using realtime subscriptions

## Key Concepts
- PostgREST: Auto REST API
- Realtime: Live subscriptions
- Storage: File management
- Auth: User management
- RLS: Row-level security

## Common Patterns
\`\`\`typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(url, anonKey);
const { data } = await supabase.from("users").select("*");
\`\`\`
