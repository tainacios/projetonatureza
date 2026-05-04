-- Drop the recursive SELECT policy on user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;

-- Recreate without recursive has_role() call
CREATE POLICY "Users can view own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Ensure has_role is SECURITY DEFINER with stable search_path (idempotent redefine)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;