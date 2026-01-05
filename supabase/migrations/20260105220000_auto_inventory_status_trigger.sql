-- Function to update moto status to 'estoque' if a new acquisition is newer than the last financing contract
CREATE OR REPLACE FUNCTION update_moto_status_on_acquisition()
RETURNS TRIGGER AS $$
DECLARE
    last_sale_date TIMESTAMP;
BEGIN
    -- Get the latest financing contract date for this moto (if any)
    SELECT MAX(data_contrato::TIMESTAMP) INTO last_sale_date
    FROM financiamentos
    WHERE moto_id = NEW.moto_id;

    -- If there is no previous sale, OR the new acquisition date is more recent than the last sale
    -- We consider the moto as back in stock (e.g. trade-in, buy-back, or initial stock)
    -- We cast NEW.data to TIMESTAMP to ensure comparison works if it's stored as ISO string
    IF last_sale_date IS NULL OR NEW.data::TIMESTAMP > last_sale_date THEN
        UPDATE motos
        SET status = 'estoque'
        WHERE id = NEW.moto_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function after insertion into aquisicoes_moto
DROP TRIGGER IF EXISTS trg_check_moto_availability ON aquisicoes_moto;

CREATE TRIGGER trg_check_moto_availability
AFTER INSERT ON aquisicoes_moto
FOR EACH ROW
EXECUTE FUNCTION update_moto_status_on_acquisition();
