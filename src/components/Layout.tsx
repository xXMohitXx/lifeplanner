import { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '@/store/useStore'
import Navigation from './Navigation'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { currentPage } = useStore()

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      <motion.main 
        key={currentPage}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="pt-20 pb-8 px-4 md:px-8 lg:px-12"
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </motion.main>
    </div>
  )
}

export default Layout