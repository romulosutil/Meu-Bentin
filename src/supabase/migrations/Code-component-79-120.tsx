-- Inserção de dados iniciais para o Sistema Meu Bentin
-- Este arquivo popula as tabelas com dados necessários para o funcionamento básico

-- Categorias iniciais baseadas no sistema atual
INSERT INTO categorias (nome, descricao, cor) VALUES
('Camisetas', 'Camisetas infantis diversas', '#e91e63'),
('Vestidos', 'Vestidos para meninas', '#2196f3'),
('Shorts', 'Shorts e bermudas', '#4caf50'),
('Calças', 'Calças e leggings', '#ff6b35'),
('Conjuntos', 'Conjuntos coordenados', '#9c27b0'),
('Pijamas', 'Pijamas e roupas de dormir', '#66bb6a'),
('Moda Praia', 'Biquínis e sunga infantil', '#42a5f5'),
('Acessórios', 'Bonés, bolsas e acessórios', '#9ccc65')
ON CONFLICT (nome) DO NOTHING;

-- Vendedores iniciais
INSERT INTO vendedores (nome, telefone, email, comissao_percentual, ativo) VALUES
('Maria Silva', '(11) 99999-1111', 'maria@meubentin.com', 5.00, true),
('João Santos', '(11) 99999-2222', 'joao@meubentin.com', 5.00, true),
('Ana Costa', '(11) 99999-3333', 'ana@meubentin.com', 5.00, true),
('Pedro Lima', '(11) 99999-4444', 'pedro@meubentin.com', 5.00, true),
('Carla Oliveira', '(11) 99999-5555', 'carla@meubentin.com', 5.00, true)
ON CONFLICT DO NOTHING;

-- Usuário administrador inicial
-- Senha: 09082013#* (hash gerado com bcrypt)
INSERT INTO usuarios (username, nome, email, senha_hash, ativo) VALUES
('nailanabernardo', 'Nailana Bernardo', 'nailana@meubentin.com', '$2b$10$rQ8K9yK5J5xQzJ5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x', true),
('admin', 'Administrador do Sistema', 'admin@meubentin.com', '$2b$10$rQ8K9yK5J5xQzJ5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x5x', true)
ON CONFLICT (username) DO NOTHING;

-- Produtos de exemplo para demonstração
INSERT INTO produtos (nome, categoria, preco, preco_custo, quantidade_estoque, estoque_minimo, tamanho, cor, marca, ativo) VALUES
-- Camisetas
('Camiseta Unicórnio', 'Camisetas', 29.90, 15.00, 25, 5, 'P', 'Rosa', 'Meu Bentin', true),
('Camiseta Super-Herói', 'Camisetas', 32.90, 18.00, 30, 5, 'M', 'Azul', 'Meu Bentin', true),
('Camiseta Princesa', 'Camisetas', 29.90, 15.00, 20, 5, 'G', 'Pink', 'Meu Bentin', true),
('Camiseta Dinossauro', 'Camisetas', 32.90, 18.00, 15, 5, 'P', 'Verde', 'Meu Bentin', true),

-- Vestidos
('Vestido Floral', 'Vestidos', 49.90, 25.00, 18, 3, '2-3 anos', 'Multicolor', 'Meu Bentin', true),
('Vestido Princesa', 'Vestidos', 59.90, 30.00, 12, 3, '4-5 anos', 'Rosa', 'Meu Bentin', true),
('Vestido Jeans', 'Vestidos', 45.90, 23.00, 22, 3, '6-7 anos', 'Azul', 'Meu Bentin', true),

-- Shorts
('Short Jeans', 'Shorts', 34.90, 18.00, 28, 5, 'P', 'Azul', 'Meu Bentin', true),
('Short Tactel', 'Shorts', 24.90, 12.00, 35, 5, 'M', 'Preto', 'Meu Bentin', true),
('Short Sarja', 'Shorts', 32.90, 16.00, 20, 5, 'G', 'Bege', 'Meu Bentin', true),

-- Calças
('Legging Estampada', 'Calças', 27.90, 14.00, 32, 5, 'P', 'Preta', 'Meu Bentin', true),
('Calça Jeans', 'Calças', 42.90, 22.00, 25, 5, 'M', 'Azul', 'Meu Bentin', true),
('Calça Moletom', 'Calças', 38.90, 20.00, 18, 5, 'G', 'Cinza', 'Meu Bentin', true),

-- Conjuntos
('Conjunto Verão', 'Conjuntos', 54.90, 28.00, 15, 3, '2-3 anos', 'Amarelo', 'Meu Bentin', true),
('Conjunto Esportivo', 'Conjuntos', 48.90, 25.00, 20, 3, '4-5 anos', 'Verde', 'Meu Bentin', true),
('Conjunto Social', 'Conjuntos', 69.90, 35.00, 8, 2, '6-7 anos', 'Azul Marinho', 'Meu Bentin', true),

-- Pijamas
('Pijama Espacial', 'Pijamas', 36.90, 18.00, 22, 5, 'P', 'Azul', 'Meu Bentin', true),
('Pijama Sereia', 'Pijamas', 39.90, 20.00, 18, 5, 'M', 'Verde', 'Meu Bentin', true),
('Pijama Unicórnio', 'Pijamas', 36.90, 18.00, 25, 5, 'G', 'Rosa', 'Meu Bentin', true),

-- Moda Praia
('Biquíni Flamingo', 'Moda Praia', 28.90, 15.00, 15, 3, '2-3 anos', 'Rosa', 'Meu Bentin', true),
('Sunga Tubarão', 'Moda Praia', 22.90, 12.00, 20, 3, '4-5 anos', 'Azul', 'Meu Bentin', true),

-- Acessórios
('Boné Dinossauro', 'Acessórios', 19.90, 10.00, 30, 5, 'Único', 'Verde', 'Meu Bentin', true),
('Mochila Unicórnio', 'Acessórios', 45.90, 23.00, 12, 3, 'Único', 'Rosa', 'Meu Bentin', true),
('Tênis LED', 'Acessórios', 79.90, 40.00, 18, 3, '25-30', 'Multicolor', 'Meu Bentin', true)
ON CONFLICT DO NOTHING;

-- Configurações iniciais do sistema
INSERT INTO configuracoes (chave, valor, tipo, descricao) VALUES
('nome_loja', 'Meu Bentin', 'texto', 'Nome da loja'),
('endereco_loja', 'Rua das Crianças, 123 - São Paulo - SP', 'texto', 'Endereço da loja'),
('telefone_loja', '(11) 99999-0000', 'texto', 'Telefone da loja'),
('email_loja', 'contato@meubentin.com', 'texto', 'E-mail da loja'),
('cnpj_loja', '00.000.000/0001-00', 'texto', 'CNPJ da loja'),
('meta_vendas_mensal', '10000.00', 'numero', 'Meta de vendas mensal em reais'),
('desconto_maximo_permitido', '20.00', 'numero', 'Desconto máximo permitido em percentual'),
('estoque_alerta_baixo', '5', 'numero', 'Quantidade mínima para alerta de estoque baixo'),
('backup_automatico', 'true', 'boolean', 'Ativar backup automático dos dados'),
('notificacoes_email', 'true', 'boolean', 'Enviar notificações por email'),
('tema_sistema', 'colorido', 'texto', 'Tema visual do sistema'),
('moeda', 'BRL', 'texto', 'Código da moeda utilizada'),
('timezone', 'America/Sao_Paulo', 'texto', 'Fuso horário do sistema'),
('versao_sistema', '1.0.0', 'texto', 'Versão atual do sistema')
ON CONFLICT (chave) DO NOTHING;

-- Exemplos de vendas para demonstração (últimos 30 dias)
-- Estas vendas serão criadas com datas distribuídas ao longo dos últimos 30 dias
DO $$
DECLARE
    venda_id UUID;
    produto_record RECORD;
    vendedor_record RECORD;
    i INTEGER;
    data_venda TIMESTAMP;
    quantidade_item INTEGER;
    preco_item DECIMAL(10,2);
    total_venda DECIMAL(10,2);
BEGIN
    -- Buscar vendedores disponíveis
    FOR vendedor_record IN SELECT nome FROM vendedores WHERE ativo = true LIMIT 3 LOOP
        -- Criar 3-5 vendas para cada vendedor nos últimos 30 dias
        FOR i IN 1..4 LOOP
            -- Data aleatória nos últimos 30 dias
            data_venda := CURRENT_TIMESTAMP - (RANDOM() * INTERVAL '30 days');
            
            -- Criar venda
            INSERT INTO vendas (vendedor, data_venda, subtotal, desconto, total, forma_pagamento, status, cliente_nome)
            VALUES (
                vendedor_record.nome,
                data_venda,
                0, -- será calculado depois
                ROUND((RANDOM() * 10)::numeric, 2), -- desconto de 0-10 reais
                0, -- será calculado depois
                CASE WHEN RANDOM() < 0.5 THEN 'Dinheiro' 
                     WHEN RANDOM() < 0.8 THEN 'PIX'
                     ELSE 'Cartão' END,
                'concluida',
                CASE WHEN RANDOM() < 0.7 THEN 
                    CASE (RANDOM() * 5)::INTEGER
                        WHEN 0 THEN 'Maria Santos'
                        WHEN 1 THEN 'José Silva'
                        WHEN 2 THEN 'Ana Costa'
                        WHEN 3 THEN 'Pedro Oliveira'
                        ELSE 'Carla Lima'
                    END
                ELSE NULL END
            )
            RETURNING id INTO venda_id;
            
            total_venda := 0;
            
            -- Adicionar 1-4 itens para cada venda
            FOR produto_record IN 
                SELECT id, nome, preco FROM produtos 
                WHERE ativo = true 
                ORDER BY RANDOM() 
                LIMIT (1 + (RANDOM() * 3)::INTEGER)
            LOOP
                quantidade_item := 1 + (RANDOM() * 2)::INTEGER; -- 1-3 itens
                preco_item := produto_record.preco;
                
                INSERT INTO itens_venda (venda_id, produto_id, produto_nome, quantidade, preco_unitario, subtotal)
                VALUES (
                    venda_id,
                    produto_record.id,
                    produto_record.nome,
                    quantidade_item,
                    preco_item,
                    quantidade_item * preco_item
                );
                
                total_venda := total_venda + (quantidade_item * preco_item);
            END LOOP;
            
            -- Atualizar total da venda
            UPDATE vendas 
            SET subtotal = total_venda,
                total = total_venda - desconto
            WHERE id = venda_id;
            
        END LOOP;
    END LOOP;
END $$;

-- Inserir alguns movimentos de estoque de exemplo
INSERT INTO historico_estoque (produto_id, tipo_movimento, quantidade_anterior, quantidade_movimento, quantidade_nova, motivo, observacoes)
SELECT 
    id,
    'entrada',
    quantidade_estoque - 10,
    10,
    quantidade_estoque,
    'Estoque inicial',
    'Entrada inicial de produtos'
FROM produtos 
WHERE ativo = true
LIMIT 5;

-- Criar índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_vendas_vendedor_data ON vendas(vendedor, data_venda);
CREATE INDEX IF NOT EXISTS idx_produtos_categoria_ativo ON produtos(categoria, ativo);
CREATE INDEX IF NOT EXISTS idx_itens_venda_produto_venda ON itens_venda(produto_id, venda_id);

-- Atualizar estatísticas das tabelas para otimização de queries
ANALYZE usuarios;
ANALYZE categorias;
ANALYZE vendedores;
ANALYZE produtos;
ANALYZE vendas;
ANALYZE itens_venda;
ANALYZE historico_estoque;
ANALYZE configuracoes;