-- Ensure profiles has role column (Fix for missing column error)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'Vendedor';
    END IF;
END $$;

-- Create Sellers table
CREATE TABLE IF NOT EXISTS public.vendedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Populate vendedores from existing profiles that are potential sellers
-- This preserves historical data relationships if we use the same IDs
INSERT INTO public.vendedores (id, nome, ativo)
SELECT id, nome, COALESCE(ativo, true)
FROM public.profiles
WHERE role IN ('Vendedor', 'Gerente', 'Administrador', 'Diretor', 'Supervisor')
ON CONFLICT (id) DO NOTHING;

-- Update ordens_servico to reference vendedores instead of profiles
-- First drop the existing constraint if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ordens_servico_vendedor_id_fkey') THEN
        ALTER TABLE public.ordens_servico DROP CONSTRAINT ordens_servico_vendedor_id_fkey;
    END IF;
END $$;

-- Safety check: ensure all referenced vendors in ordens_servico exist in vendedores table
-- If a profile was used as vendor but didn't have the correct role, it wouldn't be in vendedores yet.
INSERT INTO public.vendedores (id, nome, ativo)
SELECT p.id, p.nome, COALESCE(p.ativo, true)
FROM public.profiles p
WHERE p.id IN (SELECT DISTINCT vendedor_id FROM public.ordens_servico WHERE vendedor_id IS NOT NULL)
AND NOT EXISTS (SELECT 1 FROM public.vendedores v WHERE v.id = p.id)
ON CONFLICT (id) DO NOTHING;

-- Add the new constraint
ALTER TABLE public.ordens_servico ADD CONSTRAINT ordens_servico_vendedor_id_fkey 
    FOREIGN KEY (vendedor_id) REFERENCES public.vendedores(id);

-- Update existing commissions in ordens_servico based on the new logic (3% of parts)
-- This ensures historical data is consistent with the new reporting requirement
UPDATE public.ordens_servico os
SET comissao_vendedor = (
    SELECT COALESCE(SUM(osi.valor_total * 0.03), 0)
    FROM public.ordem_servico_itens osi
    WHERE osi.os_id = os.id AND osi.tipo = 'peca'
);
