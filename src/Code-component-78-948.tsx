# Configuração npm para garantir compatibilidade com Vercel
# Força uso apenas do registro oficial npm

registry=https://registry.npmjs.org/
strict-ssl=true
fund=false
audit=false

# Configurações para evitar conflitos com JSR/Deno
package-lock=true
save-exact=false

# Configurações de performance para CI/CD
prefer-offline=false
cache-min=0

# Configurações específicas para Vercel
engine-strict=true