-- Ensure clientes table exists
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    cpf_cnpj TEXT,
    rg_ie TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    observacao TEXT
);

-- Ensure pecas table exists
CREATE TABLE IF NOT EXISTS public.pecas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    codigo TEXT,
    nome TEXT NOT NULL,
    descricao TEXT,
    quantidade NUMERIC DEFAULT 0,
    preco_custo NUMERIC DEFAULT 0,
    preco_venda NUMERIC DEFAULT 0
);

-- Ensure servicos table exists
CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    nome TEXT NOT NULL,
    descricao TEXT,
    valor NUMERIC DEFAULT 0,
    comissao NUMERIC DEFAULT 0
);

-- Enable RLS
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pecas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;

-- Create policies safely
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'clientes' AND policyname = 'Enable all for authenticated users on clientes'
    ) THEN
        CREATE POLICY "Enable all for authenticated users on clientes" ON public.clientes
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'pecas' AND policyname = 'Enable all for authenticated users on pecas'
    ) THEN
        CREATE POLICY "Enable all for authenticated users on pecas" ON public.pecas
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'servicos' AND policyname = 'Enable all for authenticated users on servicos'
    ) THEN
        CREATE POLICY "Enable all for authenticated users on servicos" ON public.servicos
            FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clientes_nome ON public.clientes(nome);
CREATE INDEX IF NOT EXISTS idx_pecas_nome ON public.pecas(nome);
CREATE INDEX IF NOT EXISTS idx_servicos_nome ON public.servicos(nome);
