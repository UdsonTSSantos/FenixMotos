-- Create Ordens de Servico table with sequential number
CREATE TABLE IF NOT EXISTS public.ordens_servico (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_os SERIAL NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id),
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT,
    moto_placa TEXT,
    moto_modelo TEXT,
    moto_ano INTEGER,
    vendedor_id UUID REFERENCES public.profiles(id),
    data_entrada TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    data_entrega TIMESTAMP WITH TIME ZONE,
    situacao TEXT DEFAULT 'Aberto',
    observacao TEXT,
    valor_total_pecas NUMERIC DEFAULT 0,
    valor_total_servicos NUMERIC DEFAULT 0,
    valor_total NUMERIC DEFAULT 0,
    comissao_vendedor NUMERIC DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create Items table for OS
CREATE TABLE IF NOT EXISTS public.ordem_servico_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    os_id UUID REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL, -- 'peca' or 'servico'
    referencia_id UUID, -- ID of peca or servico
    nome TEXT NOT NULL,
    quantidade NUMERIC DEFAULT 1,
    valor_unitario NUMERIC DEFAULT 0,
    desconto NUMERIC DEFAULT 0,
    valor_total NUMERIC DEFAULT 0,
    comissao_unitario NUMERIC DEFAULT 0
);

-- Drop old tables
DROP TABLE IF EXISTS public.orcamento_itens;
DROP TABLE IF EXISTS public.orcamentos;
DROP TABLE IF EXISTS public.orcamentos_duplicate;
