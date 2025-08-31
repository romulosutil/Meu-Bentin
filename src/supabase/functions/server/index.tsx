import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Health check endpoint
app.get("/make-server-f57293e2/health", (c) => {
  return c.json({ status: "ok" });
});

// Initialize default user endpoint
app.post("/make-server-f57293e2/init-user", async (c) => {
  try {
    // Check if user already exists
    const { data: existingUsers, error: fetchError } = await supabase.auth.admin.listUsers();
    
    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return c.json({ error: 'Failed to check existing users' }, 500);
    }

    const existingUser = existingUsers.users.find(u => u.email === 'nailanabernardo93@gmail.com');
    
    if (existingUser) {
      return c.json({ 
        success: true, 
        message: 'User already exists',
        userId: existingUser.id 
      });
    }

    // Create the default user
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'nailanabernardo93@gmail.com',
      password: '09082013#P',
      user_metadata: { 
        name: 'Naila Nabernardo',
        role: 'admin' 
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.error('Error creating user:', error);
      return c.json({ 
        error: 'Failed to create user',
        details: error.message 
      }, 500);
    }

    console.log('Default user created successfully:', data.user?.email);
    
    return c.json({ 
      success: true, 
      message: 'Default user created successfully',
      userId: data.user?.id 
    });

  } catch (error) {
    console.error('Server error while initializing user:', error);
    return c.json({ 
      error: 'Server error while initializing user',
      details: error.toString()
    }, 500);
  }
});

// Authentication endpoint
app.post("/make-server-f57293e2/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Authentication error:', error);
      return c.json({ 
        error: 'Authentication failed',
        details: error.message 
      }, 401);
    }

    return c.json({
      success: true,
      user: data.user,
      session: data.session
    });

  } catch (error) {
    console.error('Server error during authentication:', error);
    return c.json({ 
      error: 'Server error during authentication',
      details: error.toString()
    }, 500);
  }
});

Deno.serve(app.fetch);