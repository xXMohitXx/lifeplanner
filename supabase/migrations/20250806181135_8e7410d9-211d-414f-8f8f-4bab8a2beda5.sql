-- Fix function search path security warnings

-- Fix the update_goal_progress function
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_steps integer;
  completed_steps integer;
  new_progress integer;
BEGIN
  SELECT COUNT(*) INTO total_steps
  FROM goal_steps 
  WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  SELECT COUNT(*) INTO completed_steps
  FROM goal_steps 
  WHERE goal_id = COALESCE(NEW.goal_id, OLD.goal_id) AND is_completed = true;
  
  IF total_steps > 0 THEN
    new_progress := (completed_steps * 100) / total_steps;
  ELSE
    new_progress := 0;
  END IF;
  
  UPDATE goals 
  SET progress = new_progress 
  WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix the update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;