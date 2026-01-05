-- Create sequence for financing contract numbers
CREATE SEQUENCE IF NOT EXISTS financiamentos_numero_contrato_seq;

-- Add numero_contrato column to financiamentos table
ALTER TABLE public.financiamentos 
ADD COLUMN IF NOT EXISTS numero_contrato INTEGER DEFAULT nextval('financiamentos_numero_contrato_seq');

-- Update existing rows with sequence values if they are null (for existing data)
UPDATE public.financiamentos 
SET numero_contrato = nextval('financiamentos_numero_contrato_seq') 
WHERE numero_contrato IS NULL;

-- Ensure indexes for performance
CREATE INDEX IF NOT EXISTS idx_orcamentos_vendedor_id ON public.orcamentos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_orcamentos_data ON public.orcamentos(data);
CREATE INDEX IF NOT EXISTS idx_orcamentos_status ON public.orcamentos(status);
CREATE INDEX IF NOT EXISTS idx_orcamento_itens_orcamento_id ON public.orcamento_itens(orcamento_id);
CREATE INDEX IF NOT EXISTS idx_financiamentos_numero_contrato ON public.financiamentos(numero_contrato);

-- Add comment to columns for clarity
COMMENT ON COLUMN public.financiamentos.numero_contrato IS 'Auto-incrementing contract number for display';
