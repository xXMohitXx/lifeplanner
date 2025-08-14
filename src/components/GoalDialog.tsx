import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface GoalDialogProps {
  isOpen: boolean
  onClose: () => void
  goal?: any
}

export const GoalDialog = ({ isOpen, onClose, goal }: GoalDialogProps) => {
  const { addGoal, updateGoal } = useStore()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    deadline: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || '',
        deadline: goal.deadline || ''
      })
    } else {
      setFormData({
        title: '',
        description: '',
        deadline: ''
      })
    }
  }, [goal, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      toast.error('Please enter a goal title')
      return
    }

    setIsLoading(true)
    
    try {
      const goalData = {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        deadline: formData.deadline || undefined
      }

      if (goal) {
        await updateGoal(goal.id, goalData)
        toast.success('Goal updated successfully!')
      } else {
        await addGoal(goalData)
        toast.success('Goal created successfully!')
      }
      
      onClose()
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {goal ? 'Edit Goal' : 'Create New Goal'}
          </DialogTitle>
          <DialogDescription>
            {goal 
              ? 'Update your goal details below.'
              : 'Define a new goal to work towards. Break it down into steps later.'
            }
          </DialogDescription>
        </DialogHeader>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Learn a new language, Start a business..."
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe your goal in more detail..."
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline">Target Deadline</Label>
            <Input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading
                ? (goal ? 'Updating...' : 'Creating...')
                : (goal ? 'Update Goal' : 'Create Goal')
              }
            </Button>
          </div>
        </motion.form>
      </DialogContent>
    </Dialog>
  )
}