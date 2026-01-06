-- Function to handle stock reduction when budget is approved
CREATE OR REPLACE FUNCTION public.handle_orcamento_approval()
RETURNS TRIGGER AS $$
DECLARE
    item RECORD;
BEGIN
    -- If status changed to 'aprovado' from something else
    IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
        -- Loop through items that are parts (peca) linked to this budget
        FOR item IN SELECT * FROM public.orcamento_itens WHERE orcamento_id = NEW.id AND tipo = 'peca' LOOP
            -- Update stock in pecas table
            UPDATE public.pecas 
            SET quantidade = quantidade - item.quantidade
            WHERE id = item.referencia_id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger definition
DROP TRIGGER IF EXISTS on_orcamento_approval ON public.orcamentos;
CREATE TRIGGER on_orcamento_approval
    AFTER UPDATE ON public.orcamentos
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_orcamento_approval();
