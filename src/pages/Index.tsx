import { useEffect } from 'react'
import { useStore } from '@/store/useStore'
import Layout from '@/components/Layout'
import Dashboard from '@/components/Dashboard'
import TaskManager from '@/components/TaskManager'
import HabitTracker from '@/components/HabitTracker'
import Timer from '@/components/Timer'
import GoalPlanner from '@/components/GoalPlanner'
import MotivationBoard from '@/components/MotivationBoard'
import Settings from '@/components/Settings'
import AuthPage from '@/components/AuthPage'

const Index = () => {
  const { currentPage, user, initializeAuth } = useStore()

  useEffect(() => {
    console.log('Index component mounted, initializing auth')
    initializeAuth()
  }, [initializeAuth])

  console.log('Current user state:', user)
  console.log('Current page state:', currentPage)

  // Show auth page if user is not logged in
  if (!user) {
    console.log('No user found, showing auth page')
    return <AuthPage />
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'tasks':
        return <TaskManager />
      case 'habits':
        return <HabitTracker />
      case 'timer':
        return <Timer />
      case 'goals':
        return <GoalPlanner />
      case 'motivation':
        return <MotivationBoard />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  return (
    <Layout>
      {renderCurrentPage()}
    </Layout>
  );
};

export default Index;
