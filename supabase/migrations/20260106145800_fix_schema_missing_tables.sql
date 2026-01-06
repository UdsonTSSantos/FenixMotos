-- Fix schema by creating missing tables ensuring they exist before security updates

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    nome TEXT,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nome)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'nome');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') THEN
        CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    END IF;
END
$$;

-- Create empresa table
CREATE TABLE IF NOT EXISTS public.empresa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    cnpj TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    logo TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;

-- Create clientes table
CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    cpf TEXT,
    rg TEXT,
    data_nascimento DATE,
    genero TEXT,
    telefone TEXT,
    email TEXT,
    endereco TEXT,
    complemento TEXT,
    bairro TEXT,
    cidade TEXT,
    estado TEXT,
    cep TEXT,
    cnh TEXT,
    cnh_validade DATE,
    prof_empresa TEXT,
    prof_endereco TEXT,
    prof_telefone TEXT,
    prof_email TEXT,
    prof_cnpj TEXT,
    prof_cargo TEXT,
    prof_tempo TEXT,
    prof_salario NUMERIC,
    prof_supervisor TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Create motos table
CREATE TABLE IF NOT EXISTS public.motos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    marca TEXT,
    modelo TEXT,
    ano INTEGER,
    cor TEXT,
    placa TEXT,
    chassi TEXT,
    renavam TEXT,
    preco_compra NUMERIC,
    preco_venda NUMERIC,
    status TEXT DEFAULT 'estoque',
    fotos TEXT[],
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.motos ENABLE ROW LEVEL SECURITY;

-- Create aquisicoes_moto table
CREATE TABLE IF NOT EXISTS public.aquisicoes_moto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    moto_id UUID REFERENCES public.motos(id) ON DELETE CASCADE,
    data DATE,
    valor NUMERIC,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.aquisicoes_moto ENABLE ROW LEVEL SECURITY;

-- Create financiamentos table
CREATE TABLE IF NOT EXISTS public.financiamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cliente_id UUID REFERENCES public.clientes(id),
    moto_id UUID REFERENCES public.motos(id),
    data_contrato DATE,
    valor_total NUMERIC,
    valor_entrada NUMERIC,
    valor_financiado NUMERIC,
    quantidade_parcelas INTEGER,
    taxa_juros_atraso NUMERIC,
    valor_multa_atraso NUMERIC,
    taxa_financiamento NUMERIC,
    observacao TEXT,
    status TEXT DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.financiamentos ENABLE ROW LEVEL SECURITY;

-- Create parcelas table
CREATE TABLE IF NOT EXISTS public.parcelas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    financiamento_id UUID REFERENCES public.financiamentos(id) ON DELETE CASCADE,
    numero INTEGER,
    data_vencimento DATE,
    valor_original NUMERIC,
    valor_juros NUMERIC,
    valor_multa NUMERIC,
    valor_total NUMERIC,
    data_pagamento DATE,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;

-- Create pecas table
CREATE TABLE IF NOT EXISTS public.pecas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo TEXT,
    nome TEXT,
    descricao TEXT,
    quantidade INTEGER DEFAULT 0,
    preco_custo NUMERIC,
    preco_venda NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.pecas ENABLE ROW LEVEL SECURITY;

-- Create servicos table
CREATE TABLE IF NOT EXISTS public.servicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT,
    descricao TEXT,
    preco NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
