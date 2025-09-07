-- Migração para criar tabela capital_giro
-- Esta tabela armazena o capital de giro da loja

-- Criar tabela capital_giro
CREATE TABLE IF NOT EXISTS public.capital_giro (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    valor_inicial DECIMAL(10,2) NOT NULL,
    data_configuracao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    historico JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE public.capital_giro IS 'Armazena informações sobre o capital de giro da loja';
COMMENT ON COLUMN public.capital_giro.id IS 'Identificador único do registro';
COMMENT ON COLUMN public.capital_giro.valor_inicial IS 'Valor inicial do capital de giro em reais';
COMMENT ON COLUMN public.capital_giro.data_configuracao IS 'Data de configuração do capital';
COMMENT ON COLUMN public.capital_giro.historico IS 'Histórico de movimentações do capital (JSON)';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_capital_giro_data_configuracao 
    ON public.capital_giro(data_configuracao DESC);

-- RLS (Row Level Security)
ALTER TABLE public.capital_giro ENABLE ROW LEVEL SECURITY;

-- Policy para permitir todas as operações (ajustar conforme necessário)
CREATE POLICY "Permitir todas operações em capital_giro" 
    ON public.capital_giro 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_capital_giro_updated_at 
    BEFORE UPDATE ON public.capital_giro 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();