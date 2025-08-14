import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Plus, Quote, Image as ImageIcon, Trash2, Edit, Heart } from 'lucide-react'
import { toast } from 'sonner'

const MotivationBoard = () => {
  const { visionBoardItems, addVisionBoardItem, updateVisionBoardItem, deleteVisionBoardItem } = useStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState({
    quote: '',
    image_url: '',
    position_x: 0,
    position_y: 0
  })

  const motivationalQuotes = [
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Life is what happens to you while you're busy making other plans. - John Lennon",
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "It is during our darkest moments that we must focus to see the light. - Aristotle",
    "The way to get started is to quit talking and begin doing. - Walt Disney",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
    "Great things never come from comfort zones.",
    "Dream it. Wish it. Do it.",
    "Success doesn't just find you. You have to go out and get it."
  ]

  const [dailyQuote] = useState(() => 
    motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.quote.trim() && !formData.image_url.trim()) {
      toast.error('Please add either a quote or an image URL')
      return
    }

    try {
      const itemData = {
        quote: formData.quote.trim() || undefined,
        image_url: formData.image_url.trim() || undefined,
        position_x: Math.floor(Math.random() * 300),
        position_y: Math.floor(Math.random() * 200)
      }

      if (editingItem) {
        await updateVisionBoardItem(editingItem.id, itemData)
        toast.success('Vision board item updated!')
      } else {
        await addVisionBoardItem(itemData)
        toast.success('Added to your vision board!')
      }
      
      setIsDialogOpen(false)
      setEditingItem(null)
      setFormData({ quote: '', image_url: '', position_x: 0, position_y: 0 })
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleEdit = (item: any) => {
    setEditingItem(item)
    setFormData({
      quote: item.quote || '',
      image_url: item.image_url || '',
      position_x: item.position_x,
      position_y: item.position_y
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to remove this item?')) {
      await deleteVisionBoardItem(itemId)
      toast.success('Item removed from vision board')
    }
  }

  const addQuickQuote = async (quote: string) => {
    try {
      await addVisionBoardItem({
        quote,
        position_x: Math.floor(Math.random() * 300),
        position_y: Math.floor(Math.random() * 200)
      })
      toast.success('Quote added to your vision board!')
    } catch (error) {
      toast.error('Failed to add quote')
    }
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
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 }
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
            Motivation Board
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize your dreams and stay inspired every day
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Vision Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? 'Edit Vision Item' : 'Add to Vision Board'}
              </DialogTitle>
              <DialogDescription>
                Add an inspiring quote or image to your vision board
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quote">Inspirational Quote</Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Enter a motivational quote..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input
                  id="image_url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingItem ? 'Update' : 'Add to Board'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Daily Motivation */}
      <motion.div variants={cardVariants}>
        <Card className="border-accent/20 bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="bg-primary/10 p-3 rounded-xl">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">Daily Motivation</h3>
                <blockquote className="text-muted-foreground italic">
                  "{dailyQuote}"
                </blockquote>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addQuickQuote(dailyQuote)}
                  className="mt-3 gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add to Vision Board
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Vision Board Items */}
      {visionBoardItems.length === 0 ? (
        <motion.div
          variants={cardVariants}
          className="text-center py-16 space-y-4"
        >
          <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto">
            <ImageIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">Your vision board is empty</h3>
            <p className="text-muted-foreground mt-2">
              Start by adding some inspirational quotes or images
            </p>
          </div>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Vision Item
            </Button>
            <Button 
              variant="outline"
              onClick={() => addQuickQuote(dailyQuote)}
              className="gap-2"
            >
              <Quote className="w-4 h-4" />
              Use Daily Quote
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visionBoardItems.map((item, index) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Card className="border-accent/20 hover:shadow-elegant transition-all duration-300 group">
                <CardContent className="p-4">
                  {item.image_url && (
                    <div className="aspect-video rounded-lg overflow-hidden mb-4">
                      <img
                        src={item.image_url}
                        alt="Vision board item"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                  
                  {item.quote && (
                    <blockquote className="text-center italic text-muted-foreground">
                      <Quote className="w-4 h-4 inline mr-2 text-primary" />
                      "{item.quote}"
                    </blockquote>
                  )}

                  <div className="flex justify-center gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <motion.div variants={cardVariants}>
        <Card className="border-accent/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4">Quick Inspiration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {motivationalQuotes.slice(0, 6).map((quote, index) => (
                <div
                  key={index}
                  className="p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors cursor-pointer group"
                  onClick={() => addQuickQuote(quote)}
                >
                  <p className="text-sm text-muted-foreground">"{quote}"</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}

export default MotivationBoard