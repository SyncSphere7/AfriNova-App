/*
  # Project Templates System

  1. New Tables
    - `project_templates`
      - `id` (uuid, primary key)
      - `name` (text) - Template name
      - `slug` (text, unique) - URL-friendly identifier
      - `description` (text) - Brief description
      - `category` (text) - Template category (e.g., "E-commerce", "SaaS")
      - `icon` (text) - Icon identifier
      - `preview_image_url` (text) - Preview screenshot
      - `tech_stack` (jsonb) - Predefined tech stack
      - `features` (text[]) - List of features
      - `complexity` (text) - "beginner", "intermediate", "advanced"
      - `estimated_time` (integer) - Generation time estimate in minutes
      - `default_prompt` (text) - Pre-filled prompt template
      - `is_popular` (boolean)
      - `is_featured` (boolean)
      - `usage_count` (integer) - Track template usage
      - `tags` (text[]) - Searchable tags
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `project_templates` table
    - Allow anyone to read templates (public catalog)
    - Only authenticated users can use templates
*/

CREATE TABLE IF NOT EXISTS project_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  category text NOT NULL,
  icon text,
  preview_image_url text,
  tech_stack jsonb NOT NULL DEFAULT '{}'::jsonb,
  features text[] DEFAULT '{}',
  complexity text NOT NULL DEFAULT 'intermediate',
  estimated_time integer DEFAULT 5,
  default_prompt text NOT NULL,
  is_popular boolean DEFAULT false,
  is_featured boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE project_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view project templates"
  ON project_templates
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_project_templates_category ON project_templates(category);
CREATE INDEX IF NOT EXISTS idx_project_templates_slug ON project_templates(slug);
CREATE INDEX IF NOT EXISTS idx_project_templates_is_popular ON project_templates(is_popular) WHERE is_popular = true;
CREATE INDEX IF NOT EXISTS idx_project_templates_is_featured ON project_templates(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_project_templates_tags ON project_templates USING gin(tags);

ALTER TABLE projects ADD COLUMN IF NOT EXISTS template_id uuid REFERENCES project_templates(id);
CREATE INDEX IF NOT EXISTS idx_projects_template_id ON projects(template_id);
