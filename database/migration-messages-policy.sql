-- Allow authenticated users to read all messages
CREATE POLICY "Authenticated can read messages"
  ON public.messages
  FOR SELECT
  USING (auth.role() = 'authenticated');

GRANT SELECT ON public.messages TO authenticated;
