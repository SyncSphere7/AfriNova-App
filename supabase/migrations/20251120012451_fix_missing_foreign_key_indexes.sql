/*
  # Fix Missing Foreign Key Indexes

  1. Performance Optimization
    - Add indexes on ALL foreign key columns for optimal query performance
    - Prevents full table scans on JOIN operations
    - Critical for production-scale performance
  
  2. Affected Tables
    - generations (project_id, user_id)
    - integration_webhooks (user_integration_id)
    - projects (user_id)
    - subscriptions (user_id)
    - uploaded_files (project_id, user_id)
  
  3. Impact
    - Dramatically improves JOIN query performance
    - Reduces database load
    - Enables efficient foreign key constraint checks
*/

CREATE INDEX IF NOT EXISTS idx_generations_project_id 
  ON public.generations(project_id);

CREATE INDEX IF NOT EXISTS idx_generations_user_id 
  ON public.generations(user_id);

CREATE INDEX IF NOT EXISTS idx_integration_webhooks_user_integration_id 
  ON public.integration_webhooks(user_integration_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_id 
  ON public.projects(user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id 
  ON public.subscriptions(user_id);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_project_id 
  ON public.uploaded_files(project_id);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_user_id 
  ON public.uploaded_files(user_id);

COMMENT ON INDEX idx_generations_project_id IS 'Optimizes queries filtering/joining generations by project';
COMMENT ON INDEX idx_generations_user_id IS 'Optimizes queries filtering/joining generations by user';
COMMENT ON INDEX idx_integration_webhooks_user_integration_id IS 'Optimizes webhook lookups by integration';
COMMENT ON INDEX idx_projects_user_id IS 'Optimizes queries filtering/joining projects by user';
COMMENT ON INDEX idx_subscriptions_user_id IS 'Optimizes subscription lookups by user';
COMMENT ON INDEX idx_uploaded_files_project_id IS 'Optimizes file lookups by project';
COMMENT ON INDEX idx_uploaded_files_user_id IS 'Optimizes file lookups by user';
