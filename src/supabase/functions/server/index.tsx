import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
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

// Health check endpoint
app.get("/make-server-f57293e2/health", (c) => {
  return c.json({ status: "ok", message: "Meu Bentin server is running" });
});

// Simple authentication endpoint for local testing
app.post("/make-server-f57293e2/login", async (c) => {
  try {
    const { email, password } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }

    // Simple local authentication check
    if (email === 'nailanabernardo93@gmail.com' && password === '09082013#P') {
      return c.json({
        success: true,
        user: {
          id: '1',
          email: email,
          name: 'Naila Nabernardo',
          role: 'admin'
        }
      });
    }

    return c.json({ 
      error: 'Invalid credentials',
      message: 'Email or password incorrect' 
    }, 401);

  } catch (error) {
    console.error('Server error during authentication:', error);
    return c.json({ 
      error: 'Server error during authentication',
      details: error.toString()
    }, 500);
  }
});

Deno.serve(app.fetch);