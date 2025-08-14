import { useState, useEffect } from 'react'
import { Zap, X } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useStore, Habit } from '@/store/useStore'

interface HabitDialogProps {
  isOpen: boolean
  onClose: () => void
  habit?: Habit | null
}

const HabitDialog = ({ isOpen, onClose, habit }: HabitDialogProps) => {
  const { addHabit, updateHabit, deleteHabit } = useStore()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    frequency: 'daily' as 'daily' | 'weekly' | 'custom'
  })

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name,
        description: habit.description || '',
        frequency: habit.frequency
      })
    } else {
      setFormData({
        name: '',
        description: '',
        frequency: 'daily'
      })
    }
  }, [habit, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name.trim()) return

    try {
      if (habit) {
        await updateHabit(habit.id, formData)
      } else {
        await addHabit(formData)
      }
      onClose()
    } catch (error) {
      console.error('Error saving habit:', error)
    }
  }

  const handleDelete = async () => {
    if (habit && confirm('Are you sure you want to delete this habit?')) {
      await deleteHabit(habit.id)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl text-gradient-primary flex items-center">
            <Zap className="w-5 h-5 mr-2" />
            {habit ? 'Edit Habit' : 'Create New Habit'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Habit Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Drink 8 glasses of water"
              className="text-lg"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Why is this habit important to you?"
              rows={3}
            />
          </div>

          {/* Frequency */}
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value: 'daily' | 'weekly' | 'custom') => 
                setFormData(prev => ({ ...prev, frequency: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">
                  <div className="flex items-center">
                    <span>📅 Daily</span>
                  </div>
                </SelectItem>
                <SelectItem value="weekly">
                  <div className="flex items-center">
                    <span>🗓️ Weekly</span>
                  </div>
                </SelectItem>
                <SelectItem value="custom">
                  <div className="flex items-center">
                    <span>⚙️ Custom</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Motivational Tips */}
          <div className="p-4 rounded-lg gradient-subtle border border-primary/20">
            <h4 className="font-medium text-primary mb-2">💡 Habit Building Tips</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Start small - even 1 minute counts!</li>
              <li>• Be specific about when and where</li>
              <li>• Link to existing habits for easier adoption</li>
              <li>• Celebrate small wins along the way</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            {habit && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="sm:mr-auto"
              >
                Delete Habit
              </Button>
            )}
            <div className="flex space-x-3 sm:ml-auto">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="gradient-success text-white"
                disabled={!formData.name.trim()}
              >
                {habit ? 'Update Habit' : 'Create Habit'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default HabitDialog