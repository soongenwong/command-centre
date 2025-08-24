'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/components/providers/auth-provider'
import { Plus, Target, Calendar, TrendingUp, CheckCircle2, Circle, Trash2, X } from 'lucide-react'
import { calculateStreak, formatDate } from '@/lib/utils'
import { GoalsService, type Goal } from '@/lib/goalsService'

export default function Dashboard() {
  const { user, signOut } = useAuth()
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateGoalOpen, setIsCreateGoalOpen] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target_date: '' })
  const [newActionStep, setNewActionStep] = useState<Record<string, { title: string, description: string }>>({})
  const [isAddingActionStep, setIsAddingActionStep] = useState<Record<string, boolean>>({})
  
  const goalsService = useMemo(() => new GoalsService(), [])

  const loadGoals = useCallback(async () => {
    try {
      setLoading(true)
      const goalsData = await goalsService.getGoals()
      setGoals(goalsData)
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }, [goalsService])

  // Load data on mount
  useEffect(() => {
    if (user) {
      loadGoals()
    }
  }, [user, loadGoals])

  const handleCreateGoal = async () => {
    if (!newGoal.title.trim()) return

    try {
      const goal = await goalsService.createGoal({
        title: newGoal.title,
        description: newGoal.description,
        target_date: newGoal.target_date || undefined
      })

      setGoals(prev => [...prev, goal])
      setNewGoal({ title: '', description: '', target_date: '' })
      setIsCreateGoalOpen(false)
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await goalsService.deleteGoal(goalId)
      setGoals(prev => prev.filter(goal => goal.id !== goalId))
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleAddActionStep = async (goalId: string) => {
    const stepData = newActionStep[goalId]
    if (!stepData?.title.trim()) return

    try {
      await goalsService.createActionStep({
        goal_id: goalId,
        title: stepData.title
      })

      // Reload goals to get updated data
      await loadGoals()
      setNewActionStep(prev => ({ ...prev, [goalId]: { title: '', description: '' } }))
      setIsAddingActionStep(prev => ({ ...prev, [goalId]: false }))
    } catch (error) {
      console.error('Error adding action step:', error)
    }
  }

  const handleToggleActionStep = async (goalId: string, actionStepId: string, completed: boolean) => {
    try {
      await goalsService.toggleActionStep(actionStepId, completed)
      await loadGoals() // Reload to get updated progress
    } catch (error) {
      console.error('Error toggling action step:', error)
    }
  }

  const handleDeleteActionStep = async (goalId: string, actionStepId: string) => {
    try {
      await goalsService.deleteActionStep(actionStepId, goalId)
      await loadGoals() // Reload to get updated data
    } catch (error) {
      console.error('Error deleting action step:', error)
    }
  }

  const handleMarkDay = async (goalId: string) => {
    const today = new Date().toISOString().split('T')[0]
    const goal = goals.find(g => g.id === goalId)
    const alreadyMarked = goal?.completed_dates?.some(cd => cd.completed_date.split('T')[0] === today)

    try {
      if (alreadyMarked) {
        await goalsService.removeCompletedDate(goalId, today)
      } else {
        await goalsService.addCompletedDate(goalId, today)
      }
      await loadGoals() // Reload to get updated data
    } catch (error) {
      console.error('Error marking day:', error)
    }
  }

  // Helper functions
  const isToday = (date: string): boolean => {
    const today = new Date().toISOString().split('T')[0]
    return date.split('T')[0] === today
  }

  const calculateProgress = (completed: number, total: number): number => {
    if (total === 0) return 0
    return Math.round((completed / total) * 100)
  }

  // Stats calculations
  const totalGoals = goals.length
  const goalsCompletedToday = goals.filter(goal => 
    goal.completed_dates?.some(cd => isToday(cd.completed_date))
  ).length
  const activeStreaks = goals.filter(goal => 
    calculateStreak(goal.completed_dates || []) > 0
  ).length
  const totalActionSteps = goals.reduce((total, goal) => total + (goal.action_steps?.length || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-xl text-orange-600">Loading your goals...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-xl text-orange-600">Please sign in to view your dashboard</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-orange-600">Command Centre</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user.user_metadata?.full_name || user.email}</span>
              <Button variant="outline" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Goals</CardTitle>
              <Target className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalGoals}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{goalsCompletedToday}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Streaks</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeStreaks}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Action Steps</CardTitle>
              <Calendar className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalActionSteps}</div>
            </CardContent>
          </Card>
        </div>

        {/* Goals Section */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">Your Goals</h2>
          <Dialog open={isCreateGoalOpen} onOpenChange={setIsCreateGoalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
                <DialogDescription>
                  Set a new goal to track your progress and build consistent habits.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Exercise daily"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGoal.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your goal in detail..."
                  />
                </div>
                <div>
                  <Label htmlFor="target_date">Target Date (Optional)</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={newGoal.target_date}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, target_date: e.target.value }))}
                  />
                </div>
                <Button onClick={handleCreateGoal} className="w-full bg-orange-600 hover:bg-orange-700">
                  Create Goal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals Grid */}
        {goals.length === 0 ? (
          <Card className="p-8 text-center">
            <CardContent>
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Yet</h3>
              <p className="text-gray-600 mb-4">Create your first goal to start tracking your progress!</p>
              <Button onClick={() => setIsCreateGoalOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const actionSteps = goal.action_steps || []
              const completedDates = goal.completed_dates || []
              const completedSteps = actionSteps.filter(step => step.completed).length
              const progress = calculateProgress(completedSteps, actionSteps.length)
              const currentStreak = calculateStreak(completedDates)
              const markedToday = completedDates.some(cd => isToday(cd.completed_date))

              return (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        {goal.description && (
                          <CardDescription className="mt-1">{goal.description}</CardDescription>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {goal.target_date && (
                      <Badge variant="outline" className="w-fit">
                        Target: {formatDate(goal.target_date)}
                      </Badge>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    {actionSteps.length > 0 && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{completedSteps}/{actionSteps.length} steps</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}

                    {/* Streak */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="text-sm font-medium">{currentStreak} day streak</span>
                      </div>
                      <Button
                        onClick={() => handleMarkDay(goal.id)}
                        variant={markedToday ? "default" : "outline"}
                        size="sm"
                        className={markedToday ? "bg-green-600 hover:bg-green-700" : ""}
                      >
                        {markedToday ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                        <span className="ml-1">Today</span>
                      </Button>
                    </div>

                    {/* Action Steps */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-sm">Action Steps</h4>
                        {!isAddingActionStep[goal.id] && (
                          <Button
                            onClick={() => setIsAddingActionStep(prev => ({ ...prev, [goal.id]: true }))}
                            variant="ghost"
                            size="sm"
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                      
                      {isAddingActionStep[goal.id] && (
                        <div className="space-y-2 mb-3 p-2 bg-gray-50 rounded">
                          <Input
                            placeholder="Action step title"
                            value={newActionStep[goal.id]?.title || ''}
                            onChange={(e) => setNewActionStep(prev => ({
                              ...prev,
                              [goal.id]: { ...prev[goal.id], title: e.target.value, description: prev[goal.id]?.description || '' }
                            }))}
                          />
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => handleAddActionStep(goal.id)}
                              size="sm"
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              Add
                            </Button>
                            <Button
                              onClick={() => setIsAddingActionStep(prev => ({ ...prev, [goal.id]: false }))}
                              variant="outline"
                              size="sm"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {actionSteps.map((step) => (
                          <div key={step.id} className="flex items-center justify-between group">
                            <div className="flex items-center space-x-2 flex-1">
                              <button
                                onClick={() => handleToggleActionStep(goal.id, step.id, !step.completed)}
                                className="flex-shrink-0"
                              >
                                {step.completed ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Circle className="w-4 h-4 text-gray-400" />
                                )}
                              </button>
                              <span className={`text-sm ${step.completed ? 'line-through text-gray-500' : ''}`}>
                                {step.title}
                              </span>
                            </div>
                            <Button
                              onClick={() => handleDeleteActionStep(goal.id, step.id)}
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
