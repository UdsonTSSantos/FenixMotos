-- Remove insecure public policies
DROP POLICY IF EXISTS "Public profiles" ON public.profiles;
DROP POLICY IF EXISTS "Public empresa" ON public.empresa;
DROP POLICY IF EXISTS "Public clientes" ON public.clientes;
DROP POLICY IF EXISTS "Public motos" ON public.motos;
DROP POLICY IF EXISTS "Public financiamentos" ON public.financiamentos;
DROP POLICY IF EXISTS "Public parcelas" ON public.parcelas;
DROP POLICY IF EXISTS "Public pecas" ON public.pecas;
DROP POLICY IF EXISTS "Public servicos" ON public.servicos;
DROP POLICY IF EXISTS "Public orcamentos" ON public.orcamentos;
DROP POLICY IF EXISTS "Public orcamento_itens" ON public.orcamento_itens;
DROP POLICY IF EXISTS "Public aquisicoes_moto" ON public.aquisicoes_moto;

-- Create policies restricting access to authenticated users only
CREATE POLICY "Authenticated profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated empresa" ON public.empresa FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated clientes" ON public.clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated motos" ON public.motos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated financiamentos" ON public.financiamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated parcelas" ON public.parcelas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated pecas" ON public.pecas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated servicos" ON public.servicos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated orcamentos" ON public.orcamentos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated orcamento_itens" ON public.orcamento_itens FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated aquisicoes_moto" ON public.aquisicoes_moto FOR ALL TO authenticated USING (true) WITH CHECK (true);
