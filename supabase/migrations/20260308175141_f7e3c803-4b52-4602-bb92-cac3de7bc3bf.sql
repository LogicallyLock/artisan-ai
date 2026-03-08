
-- Project collaborators table for sharing
CREATE TABLE public.project_collaborators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'editor',
  invited_email text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;

-- Owner can manage collaborators
CREATE POLICY "Project owners can manage collaborators"
ON public.project_collaborators FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND user_id = auth.uid())
);

-- Collaborators can view their own entries
CREATE POLICY "Collaborators can view their entries"
ON public.project_collaborators FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow collaborators to view shared projects
CREATE POLICY "Collaborators can view shared projects"
ON public.projects FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.project_collaborators WHERE project_id = id AND user_id = auth.uid())
);

-- Allow collaborators to update shared projects
CREATE POLICY "Collaborators can update shared projects"
ON public.projects FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.project_collaborators WHERE project_id = id AND user_id = auth.uid())
);

-- Templates table
CREATE TABLE public.templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  thumbnail_url text,
  canvas_data jsonb DEFAULT '{}'::jsonb,
  layers_data jsonb DEFAULT '[]'::jsonb,
  type text NOT NULL DEFAULT 'image',
  width integer DEFAULT 1920,
  height integer DEFAULT 1080,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.templates ENABLE ROW LEVEL SECURITY;

-- Everyone can view templates
CREATE POLICY "Anyone can view templates"
ON public.templates FOR SELECT
TO authenticated
USING (true);

-- Enable realtime on projects for collaboration
ALTER PUBLICATION supabase_realtime ADD TABLE public.projects;

-- Seed some templates
INSERT INTO public.templates (name, description, category, type, width, height, canvas_data) VALUES
('Blank Canvas', 'Start from scratch with a clean 1920x1080 canvas', 'general', 'image', 1920, 1080, '{}'),
('Instagram Post', 'Square format optimized for Instagram', 'social', 'image', 1080, 1080, '{}'),
('YouTube Thumbnail', 'Widescreen format for YouTube thumbnails', 'social', 'image', 1280, 720, '{}'),
('Story Format', 'Vertical 9:16 for Instagram/TikTok stories', 'social', 'image', 1080, 1920, '{}'),
('Facebook Cover', 'Wide banner for Facebook cover photos', 'social', 'image', 820, 312, '{}'),
('Twitter Header', 'Wide banner for Twitter/X profile header', 'social', 'image', 1500, 500, '{}'),
('4K Wallpaper', 'Ultra-high resolution desktop wallpaper', 'creative', 'image', 3840, 2160, '{}'),
('Poster A3', 'Print-ready A3 poster at 300dpi equivalent', 'print', 'image', 3508, 4961, '{}'),
('Business Card', 'Standard business card dimensions', 'print', 'image', 1050, 600, '{}'),
('Short Video', 'HD video project for short clips', 'video', 'video', 1920, 1080, '{}'),
('Vertical Video', 'Vertical video for Reels/Shorts/TikTok', 'video', 'video', 1080, 1920, '{}'),
('Cinematic', 'Cinematic 21:9 ultra-wide format', 'creative', 'image', 2560, 1080, '{}');
