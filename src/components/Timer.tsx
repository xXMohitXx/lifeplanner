import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, RotateCcw, Coffee, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useStore } from '@/store/useStore'

const Timer = () => {
  const {
    isTimerRunning,
    timerMinutes,
    timerSeconds,
    timerMode,
    startTimer,
    pauseTimer,
    resetTimer
  } = useStore()

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isTimerRunning) {
      interval = setInterval(() => {
        useStore.setState((state) => {
          if (state.timerSeconds > 0) {
            return { timerSeconds: state.timerSeconds - 1 }
          } else if (state.timerMinutes > 0) {
            return {
              timerMinutes: state.timerMinutes - 1,
              timerSeconds: 59
            }
          } else {
            // Timer finished
            const newMode = state.timerMode === 'work' ? 'break' : 'work'
            const newMinutes = newMode === 'work' ? 25 : 5
            
            // Play notification sound (optional)
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(`${state.timerMode === 'work' ? 'Work' : 'Break'} session completed!`, {
                body: `Time for a ${newMode} session`,
                icon: '/favicon.ico'
              })
            }
            
            return {
              isTimerRunning: false,
              timerMode: newMode,
              timerMinutes: newMinutes,
              timerSeconds: 0
            }
          }
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerRunning])

  const totalSeconds = timerMode === 'work' ? 25 * 60 : 5 * 60
  const currentSeconds = timerMinutes * 60 + timerSeconds
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100

  const formatTime = (minutes: number, seconds: number) => {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  // Request notification permission on component mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gradient-primary mb-2">Focus Timer</h1>
        <p className="text-muted-foreground">Stay focused with the Pomodoro technique</p>
      </div>

      {/* Main Timer */}
      <div className="max-w-md mx-auto">
        <Card className={`shadow-large transition-smooth ${
          timerMode === 'work' 
            ? 'gradient-primary text-white' 
            : 'gradient-success text-white'
        }`}>
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center space-x-2 text-white">
              {timerMode === 'work' ? (
                <>
                  <Zap className="w-6 h-6" />
                  <span>Focus Time</span>
                </>
              ) : (
                <>
                  <Coffee className="w-6 h-6" />
                  <span>Break Time</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-6">
            {/* Timer Display */}
            <motion.div
              key={`${timerMinutes}-${timerSeconds}`}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              className="text-6xl font-bold font-mono"
            >
              {formatTime(timerMinutes, timerSeconds)}
            </motion.div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={progress} 
                className="h-3 bg-white/20"
              />
              <p className="text-sm opacity-90">
                {Math.round(progress)}% complete
              </p>
            </div>

            {/* Control Buttons */}
            <div className="flex justify-center space-x-4">
              <Button
                onClick={isTimerRunning ? pauseTimer : startTimer}
                variant="secondary"
                size="lg"
                className="flex-1 max-w-[120px] transition-bounce hover:scale-105"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Start
                  </>
                )}
              </Button>
              
              <Button
                onClick={resetTimer}
                variant="outline"
                size="lg"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 transition-bounce hover:scale-105"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Statistics & Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <Card className="card-hover shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-primary" />
              <span>Today's Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary mb-2">0</div>
            <p className="text-sm text-muted-foreground">
              Pomodoro sessions completed
            </p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Focus time</span>
                <span className="font-medium">0 min</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Break time</span>
                <span className="font-medium">0 min</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Coffee className="w-5 h-5 text-success" />
              <span>Pomodoro Tips</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-primary">•</span>
                <span>Work for 25 minutes with full focus</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-success">•</span>
                <span>Take a 5-minute break between sessions</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-accent">•</span>
                <span>After 4 sessions, take a longer 15-30 min break</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-warning">•</span>
                <span>Eliminate distractions during focus time</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mode Explanation */}
      <Card className="max-w-2xl mx-auto shadow-soft">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <h3 className="text-lg font-semibold">
              {timerMode === 'work' ? '💪 Focus Mode' : '☕ Break Mode'}
            </h3>
            <p className="text-muted-foreground">
              {timerMode === 'work' 
                ? 'Time to concentrate! Close distractions and focus on your most important task.'
                : 'Great job! Take a break, stretch, hydrate, or do something relaxing.'
              }
            </p>
            
            {!isTimerRunning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-4"
              >
                <Button
                  onClick={startTimer}
                  className="gradient-primary text-white shadow-glow transition-bounce hover:scale-105"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start {timerMode === 'work' ? 'Focus' : 'Break'} Session
                </Button>
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Timer