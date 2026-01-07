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
-- First drop the existing constraint if it exists (it might be named differently, so we try generic approach or specific known name)
-- The known name from types.ts seems to be "ordens_servico_vendedor_id_fkey"
ALTER TABLE public.ordens_servico DROP CONSTRAINT IF EXISTS ordens_servico_vendedor_id_fkey;

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
