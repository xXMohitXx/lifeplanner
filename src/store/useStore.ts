import { create } from 'zustand'
import { supabase } from '@/integrations/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

export interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  due_date?: string
  priority: 'low' | 'medium' | 'high'
  status: 'not_started' | 'in_progress' | 'completed'
  tags?: string[]
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  description?: string
  frequency: 'daily' | 'weekly' | 'custom'
  streak: number
  last_completed?: string
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  title: string
  description?: string
  deadline?: string
  progress: number
  created_at: string
}

export interface GoalStep {
  id: string
  goal_id: string
  title: string
  is_completed: boolean
  created_at: string
}

export interface VisionBoardItem {
  id: string
  user_id: string
  image_url?: string
  quote?: string
  position_x: number
  position_y: number
  created_at: string
}

interface AppStore {
  // Auth
  user: User | null
  session: Session | null
  setUser: (user: User | null) => void
  setSession: (session: Session | null) => void
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error?: any }>
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  initializeAuth: () => void
  loadUserData: () => Promise<void>
  
  // Tasks
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  
  // Habits
  habits: Habit[]
  setHabits: (habits: Habit[]) => void
  addHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'streak'>) => Promise<void>
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  completeHabit: (id: string) => Promise<void>
  
  // Goals
  goals: Goal[]
  goalSteps: GoalStep[]
  setGoals: (goals: Goal[]) => void
  setGoalSteps: (steps: GoalStep[]) => void
  addGoal: (goal: Omit<Goal, 'id' | 'user_id' | 'created_at' | 'progress'>) => Promise<void>
  updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>
  deleteGoal: (id: string) => Promise<void>
  addGoalStep: (goalId: string, title: string) => Promise<void>
  updateGoalStep: (id: string, updates: Partial<GoalStep>) => Promise<void>
  deleteGoalStep: (id: string) => Promise<void>
  
  // Vision Board
  visionBoardItems: VisionBoardItem[]
  setVisionBoardItems: (items: VisionBoardItem[]) => void
  addVisionBoardItem: (item: Omit<VisionBoardItem, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  updateVisionBoardItem: (id: string, updates: Partial<VisionBoardItem>) => Promise<void>
  deleteVisionBoardItem: (id: string) => Promise<void>
  
  // Timer
  isTimerRunning: boolean
  timerMinutes: number
  timerSeconds: number
  timerMode: 'work' | 'break'
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
  
  // UI State
  currentPage: string
  setCurrentPage: (page: string) => void
}

export const useStore = create<AppStore>((set, get) => ({
  // Auth
  user: null,
  session: null,
  setUser: (user) => set({ user }),
  setSession: (session) => set({ session }),
  
  signUp: async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { full_name: fullName }
      }
    })
    return { error }
  },
  
  signIn: async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { error }
  },
  
  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, tasks: [], habits: [], goals: [], goalSteps: [], visionBoardItems: [] })
  },
  
  initializeAuth: () => {
    supabase.auth.onAuthStateChange((event, session) => {
      set({ session, user: session?.user ?? null })
      
      if (session?.user) {
        setTimeout(() => {
          const { loadUserData } = get()
          loadUserData()
        }, 0)
      }
    })
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ session, user: session?.user ?? null })
      if (session?.user) {
        const { loadUserData } = get()
        loadUserData()
      }
    })
  },
  
  loadUserData: async () => {
    const { user } = get()
    console.log('Loading user data for user:', user?.id)
    if (!user) return
    
    try {
      // Load tasks, habits, goals, etc.
      const [tasksRes, habitsRes, goalsRes, stepsRes, visionRes] = await Promise.all([
        supabase.from('tasks').select('*').eq('user_id', user.id),
        supabase.from('habits').select('*').eq('user_id', user.id),
        supabase.from('goals').select('*').eq('user_id', user.id),
        supabase.from('goal_steps').select('*'),
        supabase.from('vision_board').select('*').eq('user_id', user.id)
      ])
      
      console.log('Data loaded:', {
        tasks: tasksRes.data?.length || 0,
        habits: habitsRes.data?.length || 0,
        goals: goalsRes.data?.length || 0,
        steps: stepsRes.data?.length || 0,
        vision: visionRes.data?.length || 0
      })
      
      if (tasksRes.data) set({ tasks: tasksRes.data as Task[] })
      if (habitsRes.data) set({ habits: habitsRes.data as Habit[] })
      if (goalsRes.data) set({ goals: goalsRes.data as Goal[] })
      if (stepsRes.data) set({ goalSteps: stepsRes.data as GoalStep[] })
      if (visionRes.data) set({ visionBoardItems: visionRes.data as VisionBoardItem[] })
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  },
  
  // Tasks
  tasks: [],
  setTasks: (tasks) => set({ tasks }),
  addTask: async (task) => {
    const { user } = get()
    if (!user) return
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({ ...task, user_id: user.id })
      .select()
      .single()
    
    if (!error && data) {
      set(state => ({ tasks: [...state.tasks, data as Task] }))
    }
  },
  updateTask: async (id, updates) => {
    const { error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      set(state => ({
        tasks: state.tasks.map(task => 
          task.id === id ? { ...task, ...updates } : task
        )
      }))
    }
  },
  deleteTask: async (id) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
    
    if (!error) {
      set(state => ({
        tasks: state.tasks.filter(task => task.id !== id)
      }))
    }
  },
  
  // Habits
  habits: [],
  setHabits: (habits) => set({ habits }),
  addHabit: async (habit) => {
    const { user } = get()
    if (!user) return
    
    const { data, error } = await supabase
      .from('habits')
      .insert({ ...habit, user_id: user.id, streak: 0 })
      .select()
      .single()
    
    if (!error && data) {
      set(state => ({ habits: [...state.habits, data as Habit] }))
    }
  },
  updateHabit: async (id, updates) => {
    const { error } = await supabase
      .from('habits')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      set(state => ({
        habits: state.habits.map(habit => 
          habit.id === id ? { ...habit, ...updates } : habit
        )
      }))
    }
  },
  deleteHabit: async (id) => {
    const { error } = await supabase
      .from('habits')
      .delete()
      .eq('id', id)
    
    if (!error) {
      set(state => ({
        habits: state.habits.filter(habit => habit.id !== id)
      }))
    }
  },
  completeHabit: async (id) => {
    const today = new Date().toISOString().split('T')[0]
    const habit = get().habits.find(h => h.id === id)
    if (!habit) return
    
    const newStreak = habit.last_completed === today ? habit.streak : habit.streak + 1
    await get().updateHabit(id, { 
      streak: newStreak, 
      last_completed: today 
    })
  },
  
  // Goals
  goals: [],
  goalSteps: [],
  setGoals: (goals) => set({ goals }),
  setGoalSteps: (goalSteps) => set({ goalSteps }),
  addGoal: async (goal) => {
    const { user } = get()
    if (!user) return
    
    const { data, error } = await supabase
      .from('goals')
      .insert({ ...goal, user_id: user.id, progress: 0 })
      .select()
      .single()
    
    if (!error && data) {
      set(state => ({ goals: [...state.goals, data] }))
    }
  },
  updateGoal: async (id, updates) => {
    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      set(state => ({
        goals: state.goals.map(goal => 
          goal.id === id ? { ...goal, ...updates } : goal
        )
      }))
    }
  },
  deleteGoal: async (id) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)
    
    if (!error) {
      set(state => ({
        goals: state.goals.filter(goal => goal.id !== id),
        goalSteps: state.goalSteps.filter(step => step.goal_id !== id)
      }))
    }
  },
  addGoalStep: async (goalId, title) => {
    const { data, error } = await supabase
      .from('goal_steps')
      .insert({ goal_id: goalId, title })
      .select()
      .single()
    
    if (!error && data) {
      set(state => ({ goalSteps: [...state.goalSteps, data] }))
    }
  },
  updateGoalStep: async (id, updates) => {
    const { error } = await supabase
      .from('goal_steps')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      set(state => ({
        goalSteps: state.goalSteps.map(step => 
          step.id === id ? { ...step, ...updates } : step
        )
      }))
    }
  },
  deleteGoalStep: async (id) => {
    const { error } = await supabase
      .from('goal_steps')
      .delete()
      .eq('id', id)
    
    if (!error) {
      set(state => ({
        goalSteps: state.goalSteps.filter(step => step.id !== id)
      }))
    }
  },
  
  // Vision Board
  visionBoardItems: [],
  setVisionBoardItems: (visionBoardItems) => set({ visionBoardItems }),
  addVisionBoardItem: async (item) => {
    const { user } = get()
    if (!user) return
    
    const { data, error } = await supabase
      .from('vision_board')
      .insert({ ...item, user_id: user.id })
      .select()
      .single()
    
    if (!error && data) {
      set(state => ({ visionBoardItems: [...state.visionBoardItems, data] }))
    }
  },
  updateVisionBoardItem: async (id, updates) => {
    const { error } = await supabase
      .from('vision_board')
      .update(updates)
      .eq('id', id)
    
    if (!error) {
      set(state => ({
        visionBoardItems: state.visionBoardItems.map(item => 
          item.id === id ? { ...item, ...updates } : item
        )
      }))
    }
  },
  deleteVisionBoardItem: async (id) => {
    const { error } = await supabase
      .from('vision_board')
      .delete()
      .eq('id', id)
    
    if (!error) {
      set(state => ({
        visionBoardItems: state.visionBoardItems.filter(item => item.id !== id)
      }))
    }
  },
  
  // Timer
  isTimerRunning: false,
  timerMinutes: 25,
  timerSeconds: 0,
  timerMode: 'work',
  startTimer: () => set({ isTimerRunning: true }),
  pauseTimer: () => set({ isTimerRunning: false }),
  resetTimer: () => set({ 
    isTimerRunning: false, 
    timerMinutes: 25, 
    timerSeconds: 0,
    timerMode: 'work'
  }),
  
  // UI State
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page })
}))