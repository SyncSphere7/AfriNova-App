/*
  # Optimize RLS Policies for Performance at Scale

  1. Problem
    - auth.uid() is re-evaluated for EVERY row, causing performance degradation
    - At scale, this creates unnecessary overhead
  
  2. Solution
    - Replace auth.uid() with (select auth.uid())
    - This evaluates the function once per query instead of per row
    - Massive performance improvement at scale
  
  3. Affected Tables
    - profiles
    - projects
    - generations
    - subscriptions
    - uploaded_files
    - transactions
    - user_integrations
    - integration_webhooks
    - integration_logs
    - integration_rate_limits
  
  4. Security Impact
    - No security downgrade
    - Same security guarantees
    - Better performance
*/

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (id = (select auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = (select auth.uid()))
  WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update own projects" ON public.projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON public.projects;

CREATE POLICY "Users can view own projects"
  ON public.projects FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create projects"
  ON public.projects FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own projects"
  ON public.projects FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own projects"
  ON public.projects FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own generations" ON public.generations;
DROP POLICY IF EXISTS "Users can create generations" ON public.generations;

CREATE POLICY "Users can view own generations"
  ON public.generations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can create generations"
  ON public.generations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own files" ON public.uploaded_files;
DROP POLICY IF EXISTS "Users can upload files" ON public.uploaded_files;
DROP POLICY IF EXISTS "Users can delete own files" ON public.uploaded_files;

CREATE POLICY "Users can view own files"
  ON public.uploaded_files FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can upload files"
  ON public.uploaded_files FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own files"
  ON public.uploaded_files FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions"
  ON public.transactions FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can view own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can insert own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can update own integrations" ON public.user_integrations;
DROP POLICY IF EXISTS "Users can delete own integrations" ON public.user_integrations;

CREATE POLICY "Users can view own integrations"
  ON public.user_integrations FOR SELECT
  TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "Users can insert own integrations"
  ON public.user_integrations FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can update own integrations"
  ON public.user_integrations FOR UPDATE
  TO authenticated
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

CREATE POLICY "Users can delete own integrations"
  ON public.user_integrations FOR DELETE
  TO authenticated
  USING (user_id = (select auth.uid()));

DROP POLICY IF EXISTS "Users can manage webhooks for their integrations" ON public.integration_webhooks;

CREATE POLICY "Users can manage webhooks for their integrations"
  ON public.integration_webhooks FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_integrations ui
      WHERE ui.id = user_integration_id
      AND ui.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can view logs for their integrations" ON public.integration_logs;

CREATE POLICY "Users can view logs for their integrations"
  ON public.integration_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_integrations ui
      WHERE ui.id = user_integration_id
      AND ui.user_id = (select auth.uid())
    )
  );

DROP POLICY IF EXISTS "Rate limits are system managed" ON public.integration_rate_limits;

CREATE POLICY "Rate limits are system managed"
  ON public.integration_rate_limits FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_integrations ui
      WHERE ui.id = user_integration_id
      AND ui.user_id = (select auth.uid())
    )
  );

COMMENT ON POLICY "Users can view own profile" ON public.profiles IS 'Optimized RLS: auth.uid() evaluated once per query';
COMMENT ON POLICY "Users can view own projects" ON public.projects IS 'Optimized RLS: auth.uid() evaluated once per query';
COMMENT ON POLICY "Users can view own generations" ON public.generations IS 'Optimized RLS: auth.uid() evaluated once per query';
COMMENT ON POLICY "Users can view own subscription" ON public.subscriptions IS 'Optimized RLS: auth.uid() evaluated once per query';
COMMENT ON POLICY "Users can view own files" ON public.uploaded_files IS 'Optimized RLS: auth.uid() evaluated once per query';
COMMENT ON POLICY "Users can view own transactions" ON public.transactions IS 'Optimized RLS: auth.uid() evaluated once per query';
COMMENT ON POLICY "Users can view own integrations" ON public.user_integrations IS 'Optimized RLS: auth.uid() evaluated once per query';
