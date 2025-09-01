// Servidor básico para Meu Bentin - SEM DEPENDÊNCIAS EXTERNAS

console.log("🚀 Meu Bentin Server iniciado");

// Resposta simples para demonstrar que o servidor está funcionando
const handler = (request: Request): Response => {
  const url = new URL(request.url);
  
  // Headers CORS básicos
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  // Health check
  if (url.pathname === '/make-server-f57293e2/health') {
    return new Response(
      JSON.stringify({ 
        status: 'ok', 
        message: 'Meu Bentin server is running',
        timestamp: new Date().toISOString()
      }), 
      { status: 200, headers }
    );
  }

  // Simple login endpoint for local auth
  if (url.pathname === '/make-server-f57293e2/login' && request.method === 'POST') {
    return request.json().then(body => {
      const { email, password } = body;
      
      if (email === 'nailanabernardo93@gmail.com' && password === '09082013#P') {
        return new Response(
          JSON.stringify({
            success: true,
            user: {
              id: '1',
              email: email,
              name: 'Naila Nabernardo',
              role: 'admin'
            }
          }), 
          { status: 200, headers }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Invalid credentials' 
        }), 
        { status: 401, headers }
      );
    }).catch(() => {
      return new Response(
        JSON.stringify({ 
          error: 'Invalid request body' 
        }), 
        { status: 400, headers }
      );
    });
  }

  // Default response
  return new Response(
    JSON.stringify({ 
      message: 'Meu Bentin API', 
      version: '1.0.0' 
    }), 
    { status: 200, headers }
  );
};

// Iniciar servidor básico
if (typeof Deno !== 'undefined') {
  Deno.serve(handler);
} else {
  console.log("⚠️ Ambiente não é Deno - servidor não inicializado");
}