-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow public read access to avatars
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Policy to allow authenticated users to upload avatars
CREATE POLICY "Anyone can upload an avatar."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND auth.role() = 'authenticated' );

-- 1. Profiles (Linked to auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'Vendedor', -- 'Administrador', 'Vendedor', etc.
  ativo BOOLEAN DEFAULT true,
  foto TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Empresa (Company Settings)
CREATE TABLE public.empresa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cnpj TEXT,
  endereco TEXT,
  telefone TEXT,
  telefone2 TEXT,
  telefone3 TEXT,
  email TEXT,
  logo TEXT,
  instagram TEXT,
  facebook TEXT,
  x TEXT,
  tiktok TEXT,
  website TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed initial company data
INSERT INTO public.empresa (nome, cnpj, endereco, telefone, email)
VALUES ('Fenix Moto', '00.000.000/0000-00', 'Endereço da Loja', '(00) 0000-0000', 'contato@fenixmoto.com.br');

-- 3. Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  complemento TEXT,
  bairro TEXT,
  rg TEXT,
  data_nascimento DATE,
  genero TEXT,
  cnh TEXT,
  cnh_validade DATE,
  prof_empresa TEXT,
  prof_endereco TEXT,
  prof_telefone TEXT,
  prof_email TEXT,
  prof_cnpj TEXT,
  prof_cargo TEXT,
  prof_tempo TEXT,
  prof_salario NUMERIC(10,2),
  prof_supervisor TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Motos
CREATE TABLE public.motos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modelo TEXT NOT NULL,
  fabricante TEXT NOT NULL,
  ano INTEGER NOT NULL,
  cor TEXT NOT NULL,
  placa TEXT,
  chassis TEXT,
  data_licenciamento DATE,
  valor NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'estoque',
  imagem TEXT,
  km_atual INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Historico Aquisições Moto
CREATE TABLE public.aquisicoes_moto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moto_id UUID REFERENCES public.motos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  vendedor TEXT,
  km INTEGER,
  consignacao BOOLEAN DEFAULT false
);

-- 6. Financiamentos
CREATE TABLE public.financiamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id),
  moto_id UUID REFERENCES public.motos(id),
  data_contrato DATE NOT NULL,
  valor_total NUMERIC(10,2) NOT NULL,
  valor_entrada NUMERIC(10,2) NOT NULL,
  valor_financiado NUMERIC(10,2) NOT NULL,
  quantidade_parcelas INTEGER NOT NULL,
  taxa_juros_atraso NUMERIC(5,2) DEFAULT 0,
  valor_multa_atraso NUMERIC(10,2) DEFAULT 0,
  taxa_financiamento NUMERIC(5,2) DEFAULT 0,
  observacao TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Parcelas
CREATE TABLE public.parcelas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  financiamento_id UUID REFERENCES public.financiamentos(id) ON DELETE CASCADE,
  numero INTEGER NOT NULL,
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  valor_original NUMERIC(10,2) NOT NULL,
  valor_juros NUMERIC(10,2) DEFAULT 0,
  valor_multa NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pendente'
);

-- 8. Pecas
CREATE TABLE public.pecas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo TEXT,
  nome TEXT NOT NULL,
  descricao TEXT,
  quantidade INTEGER DEFAULT 0,
  preco_custo NUMERIC(10,2) DEFAULT 0,
  preco_venda NUMERIC(10,2) DEFAULT 0,
  localizacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. Servicos
CREATE TABLE public.servicos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  valor NUMERIC(10,2) DEFAULT 0,
  comissao NUMERIC(5,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Orcamentos
CREATE TABLE public.orcamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes(id),
  cliente_nome TEXT,
  cliente_telefone TEXT,
  moto_placa TEXT,
  moto_modelo TEXT,
  moto_ano INTEGER,
  vendedor_id UUID REFERENCES public.profiles(id),
  data DATE DEFAULT CURRENT_DATE,
  garantia_pecas TEXT,
  garantia_servicos TEXT,
  forma_pagamento TEXT,
  valor_total_pecas NUMERIC(10,2) DEFAULT 0,
  valor_total_servicos NUMERIC(10,2) DEFAULT 0,
  valor_total NUMERIC(10,2) DEFAULT 0,
  comissao_vendedor NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'aberto',
  observacao TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. Orcamento Itens
CREATE TABLE public.orcamento_itens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  orcamento_id UUID REFERENCES public.orcamentos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- 'peca' or 'servico'
  referencia_id UUID, -- References pecas(id) or servicos(id) but loosely
  nome TEXT NOT NULL,
  quantidade INTEGER DEFAULT 1,
  valor_unitario NUMERIC(10,2) NOT NULL,
  desconto NUMERIC(5,2) DEFAULT 0,
  valor_total NUMERIC(10,2) NOT NULL,
  comissao_unitario NUMERIC(5,2) DEFAULT 0
);

-- Trigger Function to Update Stock
CREATE OR REPLACE FUNCTION public.handle_orcamento_stock()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- If status changed to 'aprovado'
    IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
        FOR item IN SELECT * FROM public.orcamento_itens WHERE orcamento_id = NEW.id AND tipo = 'peca' LOOP
            -- Check if reference_id is valid uuid before update
            IF item.referencia_id IS NOT NULL THEN
                UPDATE public.pecas
                SET quantidade = quantidade - item.quantidade
                WHERE id = item.referencia_id;
            END IF;
        END LOOP;
    
    -- If status changed from 'aprovado' to something else
    ELSIF OLD.status = 'aprovado' AND NEW.status != 'aprovado' THEN
        FOR item IN SELECT * FROM public.orcamento_itens WHERE orcamento_id = NEW.id AND tipo = 'peca' LOOP
             IF item.referencia_id IS NOT NULL THEN
                UPDATE public.pecas
                SET quantidade = quantidade + item.quantidade
                WHERE id = item.referencia_id;
            END IF;
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_orcamento_status_change
    AFTER UPDATE ON public.orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_orcamento_stock();

-- Trigger for Deletion
CREATE OR REPLACE FUNCTION public.handle_orcamento_delete_stock()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    IF OLD.status = 'aprovado' THEN
        FOR item IN SELECT * FROM public.orcamento_itens WHERE orcamento_id = OLD.id AND tipo = 'peca' LOOP
            IF item.referencia_id IS NOT NULL THEN
                UPDATE public.pecas
                SET quantidade = quantidade + item.quantidade
                WHERE id = item.referencia_id;
            END IF;
        END LOOP;
    END IF;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_orcamento_delete
    BEFORE DELETE ON public.orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_orcamento_delete_stock();

-- Enable RLS (Simplified: Allow all authenticated users to read/write for now, or use public)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles" ON public.profiles FOR ALL USING (true);

ALTER TABLE public.empresa ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public empresa" ON public.empresa FOR ALL USING (true);

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public clientes" ON public.clientes FOR ALL USING (true);

ALTER TABLE public.motos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public motos" ON public.motos FOR ALL USING (true);

ALTER TABLE public.financiamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public financiamentos" ON public.financiamentos FOR ALL USING (true);

ALTER TABLE public.parcelas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public parcelas" ON public.parcelas FOR ALL USING (true);

ALTER TABLE public.pecas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public pecas" ON public.pecas FOR ALL USING (true);

ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public servicos" ON public.servicos FOR ALL USING (true);

ALTER TABLE public.orcamentos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public orcamentos" ON public.orcamentos FOR ALL USING (true);

ALTER TABLE public.orcamento_itens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public orcamento_itens" ON public.orcamento_itens FOR ALL USING (true);

ALTER TABLE public.aquisicoes_moto ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public aquisicoes_moto" ON public.aquisicoes_moto FOR ALL USING (true);
