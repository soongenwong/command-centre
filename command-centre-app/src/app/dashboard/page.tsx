'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Target, Plus, CheckCircle, TrendingUp, Calendar, LogOut, Settings, User } from 'lucide-react'
import { formatDate, calculateStreak } from '@/lib/utils'
import { useAuth } from '@/components/providers/auth-provider'

interface Goal {
  id: string
  title: string
  description: string
  targetDate: Date
  progress: number
  actionSteps: ActionStep[]
  completedDates: Date[]
}

interface ActionStep {
  id: string
  title: string
  completed: boolean
  completedDate?: Date
}

export default function Dashboard() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [goals, setGoals] = useState<Goal[]>([])
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', targetDate: '' })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [user, loading, router])

  // Mock data for demo purposes
  useEffect(() => {
    if (user) {
      setGoals([
        {
          id: '1',
          title: 'Learn TypeScript',
          description: 'Master TypeScript fundamentals and advanced concepts',
          targetDate: new Date('2025-12-31'),
          progress: 65,
          actionSteps: [
            { id: '1', title: 'Complete TypeScript basics course', completed: true, completedDate: new Date('2025-01-15') },
            { id: '2', title: 'Build a TypeScript project', completed: true, completedDate: new Date('2025-01-20') },
            { id: '3', title: 'Learn advanced types', completed: false },
            { id: '4', title: 'Contribute to open source TypeScript project', completed: false },
          ],
          completedDates: [
            new Date('2025-01-15'),
            new Date('2025-01-16'),
            new Date('2025-01-17'),
            new Date('2025-01-20'),
            new Date('2025-01-21'),
          ]
        },
        {
          id: '2',
          title: 'Daily Exercise',
          description: 'Exercise for at least 30 minutes every day',
          targetDate: new Date('2025-12-31'),
          progress: 80,
          actionSteps: [
            { id: '5', title: 'Morning jog', completed: true, completedDate: new Date() },
            { id: '6', title: 'Strength training', completed: true, completedDate: new Date() },
            { id: '7', title: 'Yoga session', completed: false },
          ],
          completedDates: Array.from({ length: 25 }, (_, i) => {
            const date = new Date()
            date.setDate(date.getDate() - i)
            return date
          })
        }
      ])
    }
  }, [user])

  const handleCreateGoal = () => {
    if (newGoal.title && newGoal.description && newGoal.targetDate) {
      const goal: Goal = {
        id: Date.now().toString(),
        title: newGoal.title,
        description: newGoal.description,
        targetDate: new Date(newGoal.targetDate),
        progress: 0,
        actionSteps: [],
        completedDates: []
      }
      setGoals([...goals, goal])
      setNewGoal({ title: '', description: '', targetDate: '' })
      setIsCreateGoalOpen(false)
    }
  }

  const toggleActionStep = (goalId: string, stepId: string) => {
    setGoals(goals.map(goal => {
      if (goal.id === goalId) {
        const updatedSteps = goal.actionSteps.map(step => {
          if (step.id === stepId) {
            return {
              ...step,
              completed: !step.completed,
              completedDate: !step.completed ? new Date() : undefined
            }
          }
          return step
        })
        
        const completedSteps = updatedSteps.filter(step => step.completed).length
        const progress = Math.round((completedSteps / updatedSteps.length) * 100)
        
        return {
          ...goal,
          actionSteps: updatedSteps,
          progress: updatedSteps.length > 0 ? progress : 0
        }
      }
      return goal
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <Target className="h-12 w-12 text-orange-600 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const totalGoals = goals.length
  const completedActions = goals.reduce((acc, goal) => 
    acc + goal.actionSteps.filter(step => step.completed).length, 0
  )
  const totalActions = goals.reduce((acc, goal) => acc + goal.actionSteps.length, 0)
  const longestStreak = Math.max(...goals.map(goal => calculateStreak(goal.completedDates)), 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-orange-50">
      {/* Navigation */}
      <nav className="border-b border-orange-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-8 w-8 text-orange-600" />
            <h1 className="text-2xl font-bold text-gray-900">Command Centre</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-600">{user?.user_metadata?.full_name || user?.email}</span>
            </div>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => signOut()}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.user_metadata?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-gray-600">Here&apos;s your goal tracking overview for today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGoals}</div>
              <p className="text-xs text-gray-600">Active goals being tracked</p>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Actions</CardTitle>
              <CheckCircle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedActions}/{totalActions}</div>
              <p className="text-xs text-gray-600">Action steps completed</p>
            </CardContent>
          </Card>

          <Card className="border-orange-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Longest Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{longestStreak} days</div>
              <p className="text-xs text-gray-600">Your best consistency record</p>
            </CardContent>
          </Card>
        </div>

        {/* Goals Section */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
          <Dialog open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a new goal to track your progress and stay motivated.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g., Learn Python"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Describe your goal in detail..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateGoalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateGoal}>Create Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {goals.map((goal) => (
            <Card key={goal.id} className="border-orange-100">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    <CardDescription className="mt-1">{goal.description}</CardDescription>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    {formatDate(goal.targetDate)}
                  </div>
                </div>
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm text-gray-600">{goal.progress}%</span>
                  </div>
                  <Progress value={goal.progress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">Action Steps</h4>
                    <span className="text-xs text-gray-600">
                      {goal.actionSteps.filter(step => step.completed).length}/{goal.actionSteps.length} completed
                    </span>
                  </div>
                  <div className="space-y-2">
                    {goal.actionSteps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center space-x-3 p-2 rounded-md hover:bg-orange-50 cursor-pointer"
                        onClick={() => toggleActionStep(goal.id, step.id)}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          step.completed 
                            ? 'bg-orange-600 border-orange-600' 
                            : 'border-gray-300'
                        }`}>
                          {step.completed && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>
                        <span className={`text-sm flex-1 ${
                          step.completed ? 'line-through text-gray-500' : 'text-gray-700'
                        }`}>
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Current Streak</span>
                      <span className="font-medium text-orange-600">
                        {calculateStreak(goal.completedDates)} days
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {goals.length === 0 && (
          <Card className="border-orange-100 text-center py-12">
            <CardContent>
              <Target className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No goals yet</h3>
              <p className="text-gray-600 mb-4">
                Start your journey by creating your first goal!
              </p>
              <Button onClick={() => setIsCreateGoalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
