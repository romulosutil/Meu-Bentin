{
  "version": "1.0.0",
  "name": "meu-bentin-edge-functions",
  "description": "Edge Functions para o sistema Meu Bentin",
  "imports": {
    "hono": "https://deno.land/x/hono@v4.2.7/mod.ts",
    "hono/cors": "https://deno.land/x/hono@v4.2.7/middleware/cors/index.ts",
    "hono/logger": "https://deno.land/x/hono@v4.2.7/middleware/logger/index.ts",
    "@supabase/supabase-js": "https://esm.sh/@supabase/supabase-js@2.39.3"
  },
  "compilerOptions": {
    "allowJs": true,
    "strict": true,
    "lib": ["deno.window", "dom"]
  },
  "tasks": {
    "start": "deno run --allow-net --allow-env --allow-read server/index.tsx"
  }
}