import { motion } from 'framer-motion'
import { Calendar, CheckCircle, Target, TrendingUp, Flame } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/store/useStore'

const Dashboard = () => {
  const { tasks, habits, goals } = useStore()

  const todaysTasks = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0]
    return task.due_date === today
  })

  const completedTasks = tasks.filter(task => task.status === 'completed')
  const overdueTasks = tasks.filter(task => {
    const today = new Date().toISOString().split('T')[0]
    return task.due_date && task.due_date < today && task.status !== 'completed'
  })

  const totalHabitsStreak = habits.reduce((acc, habit) => acc + habit.streak, 0)
  const avgGoalProgress = goals.length > 0 
    ? goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length 
    : 0

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Welcome Header */}
      <motion.div variants={cardVariants} className="text-center">
        <h1 className="text-4xl font-bold text-gradient-primary mb-2">
          Welcome to Your Day ✨
        </h1>
        <p className="text-lg text-muted-foreground">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </motion.div>

      {/* Quick Stats */}
      <motion.div 
        variants={cardVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <Card className="card-hover glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Tasks</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{todaysTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.filter(task => {
                const today = new Date().toISOString().split('T')[0]
                return task.due_date === today
              }).length} completed
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Habit Streaks</CardTitle>
            <Flame className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{totalHabitsStreak}</div>
            <p className="text-xs text-muted-foreground">
              Total days
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Goal Progress</CardTitle>
            <Target className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{Math.round(avgGoalProgress)}%</div>
            <p className="text-xs text-muted-foreground">
              Average completion
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productivity</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Tasks completed
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={cardVariants}>
          <Card className="card-hover shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-primary" />
                <span>Today's Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {todaysTasks.length > 0 ? (
                todaysTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center space-x-3 p-3 rounded-lg bg-secondary/50">
                    <div className={`w-3 h-3 rounded-full ${
                      task.priority === 'high' ? 'bg-destructive' :
                      task.priority === 'medium' ? 'bg-warning' : 'bg-success'
                    }`} />
                    <span className={`flex-1 ${
                      task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                    }`}>
                      {task.title}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.status === 'completed' ? 'bg-success/20 text-success' :
                      task.status === 'in_progress' ? 'bg-warning/20 text-warning' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No tasks scheduled for today</p>
                  <p className="text-sm">Enjoy your free time! 🌟</p>
                </div>
              )}
              
              {overdueTasks.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm font-medium text-destructive mb-2">
                    ⚠️ {overdueTasks.length} overdue task{overdueTasks.length > 1 ? 's' : ''}
                  </p>
                  {overdueTasks.slice(0, 2).map(task => (
                    <p key={task.id} className="text-xs text-destructive/80">
                      • {task.title}
                    </p>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={cardVariants}>
          <Card className="card-hover shadow-medium">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-success" />
                <span>Active Goals</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {goals.length > 0 ? (
                goals.slice(0, 3).map((goal) => (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{goal.title}</span>
                      <span className="text-sm text-success font-semibold">
                        {goal.progress}%
                      </span>
                    </div>
                    <Progress value={goal.progress} className="h-2" />
                    {goal.deadline && (
                      <p className="text-xs text-muted-foreground">
                        Due: {new Date(goal.deadline).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No active goals</p>
                  <p className="text-sm">Set your first goal to get started! 🎯</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Motivational Quote */}
      <motion.div variants={cardVariants}>
        <Card className="gradient-motivation text-white shadow-large">
          <CardContent className="text-center py-8">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
            >
              <blockquote className="text-xl font-medium mb-4">
                "The way to get started is to quit talking and begin doing."
              </blockquote>
              <cite className="text-sm opacity-90">— Walt Disney</cite>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default Dashboard