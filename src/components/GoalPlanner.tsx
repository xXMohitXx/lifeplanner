import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Plus, Target, Calendar, Trash2, CheckCircle2, Circle } from 'lucide-react'
import { GoalDialog } from './GoalDialog'
import { format } from 'date-fns'

const GoalPlanner = () => {
  const { goals, goalSteps, addGoalStep, updateGoalStep, deleteGoalStep, deleteGoal } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<any>(null)
  const [newStepTitle, setNewStepTitle] = useState('')
  const [showStepsFor, setShowStepsFor] = useState<string | null>(null)

  const getGoalSteps = (goalId: string) => {
    return goalSteps.filter(step => step.goal_id === goalId)
  }

  const handleEdit = (goal: any) => {
    setEditingGoal(goal)
    setIsDialogOpen(true)
  }

  const handleClose = () => {
    setIsDialogOpen(false)
    setEditingGoal(null)
  }

  const handleAddStep = async (goalId: string) => {
    if (!newStepTitle.trim()) return
    await addGoalStep(goalId, newStepTitle.trim())
    setNewStepTitle('')
  }

  const toggleStep = async (step: any) => {
    await updateGoalStep(step.id, { is_completed: !step.is_completed })
  }

  const handleDeleteStep = async (stepId: string) => {
    await deleteGoalStep(stepId)
  }

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal? This action cannot be undone.')) {
      await deleteGoal(goalId)
      setShowStepsFor(null)
    }
  }

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 3600 * 24))
    
    if (diffDays < 0) return { status: 'overdue', color: 'destructive', text: 'Overdue' }
    if (diffDays <= 7) return { status: 'urgent', color: 'secondary', text: `${diffDays} days left` }
    return { status: 'normal', color: 'default', text: format(deadlineDate, 'MMM dd, yyyy') }
  }

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
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Goal Planner
          </h1>
          <p className="text-muted-foreground mt-2">
            Break down your big dreams into achievable steps
          </p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      {/* Stats Overview */}
      <motion.div variants={cardVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{goals.length}</p>
                <p className="text-sm text-muted-foreground">Total Goals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-secondary/10 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {goals.filter(goal => goal.progress === 100).length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-accent/10 p-3 rounded-xl">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / Math.max(goals.length, 1))}%
                </p>
                <p className="text-sm text-muted-foreground">Avg Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <motion.div
          variants={cardVariants}
          className="text-center py-16 space-y-4"
        >
          <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <Target className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">No goals yet</h3>
            <p className="text-muted-foreground mt-2">
              Start your journey by creating your first goal
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Goal
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {goals.map((goal) => {
            const deadlineStatus = getDeadlineStatus(goal.deadline)
            const steps = getGoalSteps(goal.id)
            const isExpanded = showStepsFor === goal.id

            return (
              <motion.div key={goal.id} variants={cardVariants}>
                <Card className="border-accent/20 hover:shadow-elegant transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">{goal.title}</CardTitle>
                        {goal.description && (
                          <CardDescription className="text-sm">
                            {goal.description}
                          </CardDescription>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(goal)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {deadlineStatus && (
                      <Badge variant={deadlineStatus.color as any} className="w-fit">
                        <Calendar className="w-3 h-3 mr-1" />
                        {deadlineStatus.text}
                      </Badge>
                    )}
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-3" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {steps.length} step{steps.length !== 1 ? 's' : ''}
                        {steps.length > 0 && (
                          <span className="ml-2">
                            ({steps.filter(s => s.is_completed).length} completed)
                          </span>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowStepsFor(isExpanded ? null : goal.id)}
                      >
                        {isExpanded ? 'Hide Steps' : 'View Steps'}
                      </Button>
                    </div>

                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3 pt-3 border-t"
                      >
                        {/* Add new step */}
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add a new step..."
                            value={newStepTitle}
                            onChange={(e) => setNewStepTitle(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleAddStep(goal.id)}
                            className="flex-1 px-3 py-2 text-sm border rounded-lg bg-background"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddStep(goal.id)}
                            disabled={!newStepTitle.trim()}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Goal steps */}
                        <div className="space-y-2">
                          {steps.map((step) => (
                            <div
                              key={step.id}
                              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <button
                                onClick={() => toggleStep(step)}
                                className="flex-shrink-0"
                              >
                                {step.is_completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-primary" />
                                ) : (
                                  <Circle className="w-5 h-5 text-muted-foreground" />
                                )}
                              </button>
                              <span
                                className={`flex-1 text-sm ${
                                  step.is_completed
                                    ? 'line-through text-muted-foreground'
                                    : ''
                                }`}
                              >
                                {step.title}
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteStep(step.id)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <GoalDialog
        isOpen={isDialogOpen}
        onClose={handleClose}
        goal={editingGoal}
      />
    </motion.div>
  )
}

export default GoalPlanner