
-- Fix templates RLS: drop restrictive policy and create permissive one
DROP POLICY IF EXISTS "Anyone can view templates" ON public.templates;
CREATE POLICY "Anyone can view templates" ON public.templates FOR SELECT USING (true);

-- Seed some starter templates
INSERT INTO public.templates (name, description, category, type, width, height) VALUES
  ('Instagram Post', 'Square post for Instagram feed', 'social', 'image', 1080, 1080),
  ('Instagram Story', 'Vertical story format', 'social', 'image', 1080, 1920),
  ('Facebook Cover', 'Cover photo for Facebook pages', 'social', 'image', 1640, 924),
  ('YouTube Thumbnail', 'Eye-catching video thumbnail', 'social', 'image', 1280, 720),
  ('Twitter/X Banner', 'Header image for Twitter profile', 'social', 'image', 1500, 500),
  ('Logo Design', 'Square logo canvas', 'creative', 'image', 1000, 1000),
  ('Poster', 'A3 poster layout', 'print', 'image', 2480, 3508),
  ('Business Card', 'Standard business card size', 'print', 'image', 1050, 600),
  ('Presentation', 'Widescreen presentation slide', 'general', 'image', 1920, 1080),
  ('Flyer', 'A5 promotional flyer', 'print', 'image', 1748, 2480),
  ('Photo Collage', 'Creative photo arrangement', 'creative', 'image', 1920, 1080),
  ('Video Intro', 'Short intro sequence', 'video', 'video', 1920, 1080),
  ('Social Reel', 'Vertical short-form video', 'video', 'video', 1080, 1920),
  ('Banner Ad', 'Web banner advertisement', 'general', 'image', 728, 90),
  ('Album Art', 'Music album cover', 'creative', 'image', 3000, 3000);
