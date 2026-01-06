-- Create orcamentos table
CREATE TABLE IF NOT EXISTS public.orcamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    cliente_id UUID REFERENCES public.clientes(id),
    cliente_nome TEXT NOT NULL,
    cliente_telefone TEXT,
    moto_placa TEXT,
    moto_modelo TEXT,
    moto_ano INTEGER,
    vendedor_id UUID NOT NULL, -- References profiles(id)
    data DATE NOT NULL,
    garantia_pecas TEXT,
    garantia_servicos TEXT,
    forma_pagamento TEXT,
    valor_total_pecas NUMERIC DEFAULT 0,
    valor_total_servicos NUMERIC DEFAULT 0,
    valor_total NUMERIC DEFAULT 0,
    comissao_vendedor NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'aberto' CHECK (status IN ('aberto', 'aprovado', 'rejeitado')),
    observacao TEXT
);

-- Create orcamento_itens table
CREATE TABLE IF NOT EXISTS public.orcamento_itens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('peca', 'servico')),
    referencia_id UUID NOT NULL,
    nome TEXT NOT NULL,
    quantidade NUMERIC NOT NULL DEFAULT 1,
    valor_unitario NUMERIC NOT NULL DEFAULT 0,
    desconto NUMERIC NOT NULL DEFAULT 0,
    valor_total NUMERIC NOT NULL DEFAULT 0,
    comissao_unitario NUMERIC NOT NULL DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Enable all for authenticated users on orcamentos" ON public.orcamentos
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users on orcamento_itens" ON public.orcamento_itens
    FOR ALL USING (auth.role() = 'authenticated');
    
-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_orcamentos_cliente_id ON public.orcamentos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_vendedor_id ON public.orcamentos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON public.orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orcamento_id ON public.orcamento_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_referencia_id ON public.orcamento_itens(referencia_id);
