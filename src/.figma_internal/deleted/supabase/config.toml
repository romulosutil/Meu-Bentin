# Configuração do Supabase para o projeto Meu Bentin
# Este arquivo configura apenas as funcionalidades necessárias

[api]
enabled = true
port = 54321
schemas = ["public", "storage", "graphql_public"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["https://localhost:3000"]
jwt_expiry = 3600
enable_signup = true
enable_anonymous_sign_ins = false

[auth.email]
enable_signup = true
double_confirm_changes = true
enable_confirmations = false

[database]
major_version = 15

[studio]
enabled = true
port = 54323
api_url = "http://127.0.0.1:54321"

# Edge Functions desabilitadas para evitar erro 403
[edge_runtime]
enabled = false

[functions]
# Sem funções edge para este projeto