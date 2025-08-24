import { createClient } from '@supabase/supabase-js'

// It's good practice to assert that the environment variables are not undefined.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// The '!' at the end tells TypeScript that we are certain these values will exist.
// This is safe here because the application would not work at all without them.

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
