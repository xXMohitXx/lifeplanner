-- Create complete database schema for LifePlanner

-- Profiles (extended from Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  due_date date,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  status text check (status in ('not_started', 'in_progress', 'completed')) default 'not_started',
  tags text[],
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habits
CREATE TABLE IF NOT EXISTS public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  description text,
  frequency text check (frequency in ('daily', 'weekly', 'custom')) default 'daily',
  streak integer default 0,
  last_completed date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Habit Completions
CREATE TABLE IF NOT EXISTS public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  completed_on date not null,
  unique(habit_id, completed_on)
);

-- Goals
CREATE TABLE IF NOT EXISTS public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  deadline date,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Goal Steps
CREATE TABLE IF NOT EXISTS public.goal_steps (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references goals(id) on delete cascade,
  title text not null,
  is_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Notes / Journals
CREATE TABLE IF NOT EXISTS public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  title text,
  content text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Vision Board Items
CREATE TABLE IF NOT EXISTS public.vision_board (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  image_url text,
  quote text,
  position_x integer default 0,
  position_y integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vision_board ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for tasks
CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for habits
CREATE POLICY "Users can view their own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for habit_completions
CREATE POLICY "Users can view their own habit completions" ON public.habit_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own habit completions" ON public.habit_completions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habit completions" ON public.habit_completions FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for goals
CREATE POLICY "Users can view their own goals" ON public.goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own goals" ON public.goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own goals" ON public.goals FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for goal_steps
CREATE POLICY "Users can view goal steps" ON public.goal_steps FOR SELECT USING (
  EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_steps.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "Users can create goal steps" ON public.goal_steps FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_steps.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "Users can update goal steps" ON public.goal_steps FOR UPDATE USING (
  EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_steps.goal_id AND goals.user_id = auth.uid())
);
CREATE POLICY "Users can delete goal steps" ON public.goal_steps FOR DELETE USING (
  EXISTS (SELECT 1 FROM goals WHERE goals.id = goal_steps.goal_id AND goals.user_id = auth.uid())
);

-- RLS Policies for notes
CREATE POLICY "Users can view their own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for vision_board
CREATE POLICY "Users can view their own vision board items" ON public.vision_board FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own vision board items" ON public.vision_board FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own vision board items" ON public.vision_board FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own vision board items" ON public.vision_board FOR DELETE USING (auth.uid() = user_id);

-- Trigger function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data ->> 'full_name');
  RETURN new;
END;
$$;

-- Trigger to create profile on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update goal progress based on completed steps
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS trigger
LANGUAGE plpgsql
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

-- Trigger to update goal progress when steps change
CREATE TRIGGER update_goal_progress_trigger
  AFTER INSERT OR UPDATE OR DELETE ON goal_steps
  FOR EACH ROW EXECUTE FUNCTION update_goal_progress();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;