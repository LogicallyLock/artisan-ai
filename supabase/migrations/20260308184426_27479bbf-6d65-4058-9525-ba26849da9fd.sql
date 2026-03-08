
-- Drop the recursive collaborator policies on projects
DROP POLICY IF EXISTS "Collaborators can view shared projects" ON public.projects;
DROP POLICY IF EXISTS "Collaborators can update shared projects" ON public.projects;

-- Create a security definer function to check collaboration
CREATE OR REPLACE FUNCTION public.is_project_collaborator(_user_id uuid, _project_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.project_collaborators
    WHERE user_id = _user_id AND project_id = _project_id
  )
$$;

-- Recreate policies using the function
CREATE POLICY "Collaborators can view shared projects"
ON public.projects FOR SELECT
TO authenticated
USING (public.is_project_collaborator(auth.uid(), id));

CREATE POLICY "Collaborators can update shared projects"
ON public.projects FOR UPDATE
TO authenticated
USING (public.is_project_collaborator(auth.uid(), id));
