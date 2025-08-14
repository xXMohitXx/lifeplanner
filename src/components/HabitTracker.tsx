import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Flame, Calendar, Zap, Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/store/useStore'
import HabitDialog from './HabitDialog'

const HabitTracker = () => {
  const { habits, completeHabit } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState<any>(null)

  const today = new Date().toISOString().split('T')[0]
  
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-purple-600'
    if (streak >= 14) return 'text-success'
    if (streak >= 7) return 'text-warning'
    return 'text-muted-foreground'
  }

  const isCompletedToday = (habit: any) => {
    return habit.last_completed === today
  }

  const handleComplete = async (habitId: string) => {
    await completeHabit(habitId)
  }

  const handleEdit = (habit: any) => {
    setEditingHabit(habit)
    setIsDialogOpen(true)
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setEditingHabit(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold text-gradient-primary">Habit Tracker</h1>
          <p className="text-muted-foreground">Build positive habits, one day at a time</p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="gradient-primary text-white shadow-glow transition-bounce hover:scale-105"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Habit
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="gradient-success text-white shadow-medium">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Total Habits</p>
                <p className="text-3xl font-bold">{habits.length}</p>
              </div>
              <Zap className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-motivation text-white shadow-medium">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Active Streaks</p>
                <p className="text-3xl font-bold">
                  {habits.filter(h => h.streak > 0).length}
                </p>
              </div>
              <Flame className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-primary text-white shadow-medium">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">Longest Streak</p>
                <p className="text-3xl font-bold">
                  {habits.length > 0 ? Math.max(...habits.map(h => h.streak)) : 0}
                </p>
              </div>
              <Trophy className="w-8 h-8 opacity-80" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {habits.map((habit, index) => {
            const completedToday = isCompletedToday(habit)
            
            return (
              <motion.div
                key={habit.id}
                layout
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -50 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card 
                  className={`card-hover h-full group cursor-pointer relative overflow-hidden ${
                    completedToday ? 'ring-2 ring-success shadow-glow' : ''
                  }`}
                  onClick={() => handleEdit(habit)}
                >
                  {completedToday && (
                    <div className="absolute top-0 right-0 bg-success text-white px-2 py-1 text-xs rounded-bl-lg">
                      ✓ Done Today
                    </div>
                  )}
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg group-hover:text-primary transition-smooth">
                      {habit.name}
                    </CardTitle>
                    {habit.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {habit.description}
                      </p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Streak Display */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Flame className={`w-5 h-5 ${getStreakColor(habit.streak)}`} />
                        <span className={`text-2xl font-bold ${getStreakColor(habit.streak)}`}>
                          {habit.streak}
                        </span>
                        <span className="text-sm text-muted-foreground">days</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {habit.frequency}
                      </Badge>
                    </div>

                    {/* Progress Bar for Weekly Goal */}
                    {habit.frequency === 'weekly' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Weekly Progress</span>
                          <span>5/7 days</span>
                        </div>
                        <Progress value={71} className="h-2" />
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      variant={completedToday ? "outline" : "default"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (!completedToday) {
                          handleComplete(habit.id)
                        }
                      }}
                      disabled={completedToday}
                      className={`w-full transition-bounce hover:scale-105 ${
                        completedToday 
                          ? 'bg-success/10 text-success border-success/20' 
                          : 'gradient-success text-white'
                      }`}
                    >
                      {completedToday ? (
                        <>
                          <Trophy className="w-4 h-4 mr-2" />
                          Completed! 🎉
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Mark Complete
                        </>
                      )}
                    </Button>

                    {/* Motivational Message */}
                    {habit.streak > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center p-2 rounded-lg bg-primary/10 border border-primary/20"
                      >
                        <p className="text-xs text-primary font-medium">
                          {habit.streak >= 30 && "🏆 Incredible dedication!"}
                          {habit.streak >= 14 && habit.streak < 30 && "🌟 Amazing streak!"}
                          {habit.streak >= 7 && habit.streak < 14 && "🔥 Great momentum!"}
                          {habit.streak < 7 && "💪 Keep it up!"}
                        </p>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {habits.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-24 h-24 gradient-motivation rounded-full flex items-center justify-center mx-auto mb-6">
            <Flame className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Start Your First Habit</h3>
          <p className="text-muted-foreground mb-6">
            Build positive routines that last a lifetime
          </p>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="gradient-motivation text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Habit
          </Button>
        </motion.div>
      )}

      <HabitDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        habit={editingHabit}
      />
    </div>
  )
}

export default HabitTracker