import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Target, 
  Clock, 
  Heart,
  Sparkles,
  Settings
} from 'lucide-react'
import { useStore } from '@/store/useStore'
import { Button } from '@/components/ui/button'

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
  { id: 'habits', label: 'Habits', icon: Heart },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'timer', label: 'Focus', icon: Clock },
  { id: 'motivation', label: 'Inspiration', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings }
]

const Navigation = () => {
  const { currentPage, setCurrentPage } = useStore()

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border shadow-soft"
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient-primary">LifePlanner</span>
          </motion.div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setCurrentPage(item.id)}
                  className={`relative transition-smooth ${
                    isActive 
                      ? 'gradient-primary text-white shadow-glow' 
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">{item.label}</span>
                  
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 gradient-primary rounded-md -z-10"
                      transition={{ type: "spring", duration: 0.5 }}
                    />
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  )
}

export default Navigation