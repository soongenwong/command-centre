import { supabase } from '@/lib/supabaseClient'

export interface Goal {
  id: string
  user_id: string
  title: string
  description: string | null
  target_date: string | null
  progress: number
  created_at: string
  updated_at: string
  action_steps: ActionStep[]
  completed_dates: CompletedDate[]
}

export interface ActionStep {
  id: string
  goal_id: string
  title: string
  completed: boolean
  completed_date: string | null
  created_at: string
  updated_at: string
}

export interface CompletedDate {
  id: string
  goal_id: string
  completed_date: string
  created_at: string
}

export interface CreateGoalData {
  title: string
  description?: string
  target_date?: string
}

export interface UpdateGoalData {
  title?: string
  description?: string
  target_date?: string
  progress?: number
}

export interface CreateActionStepData {
  goal_id: string
  title: string
}

export class GoalsService {
  // Get all goals for the authenticated user
  async getGoals(): Promise<Goal[]> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data: goals, error } = await supabase
      .from('goals')
      .select(`
        *,
        action_steps (*),
        completed_dates (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return goals || []
  }

  // Create a new goal
  async createGoal(goalData: CreateGoalData): Promise<Goal> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('goals')
      .insert([{
        ...goalData,
        user_id: user.id,
        progress: 0
      }])
      .select(`
        *,
        action_steps (*),
        completed_dates (*)
      `)
      .single()

    if (error) throw error
    return data
  }

  // Update a goal
  async updateGoal(goalId: string, updateData: UpdateGoalData): Promise<Goal> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .select(`
        *,
        action_steps (*),
        completed_dates (*)
      `)
      .single()

    if (error) throw error
    return data
  }

  // Delete a goal
  async deleteGoal(goalId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (error) throw error
  }

  // Create a new action step
  async createActionStep(actionStepData: CreateActionStepData): Promise<ActionStep> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { data, error } = await supabase
      .from('action_steps')
      .insert([actionStepData])
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Toggle action step completion
  async toggleActionStep(actionStepId: string, completed: boolean): Promise<ActionStep> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const updateData: Record<string, unknown> = { 
      completed,
      completed_date: completed ? new Date().toISOString() : null
    }

    const { data, error } = await supabase
      .from('action_steps')
      .update(updateData)
      .eq('id', actionStepId)
      .select()
      .single()

    if (error) throw error

    // Update goal progress
    await this.updateGoalProgress(data.goal_id)

    return data
  }

  // Delete an action step
  async deleteActionStep(actionStepId: string, goalId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase
      .from('action_steps')
      .delete()
      .eq('id', actionStepId)

    if (error) throw error

    // Update goal progress
    await this.updateGoalProgress(goalId)
  }

  // Add a completed date for streak tracking
  async addCompletedDate(goalId: string, date: string = new Date().toISOString().split('T')[0]): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase
      .from('completed_dates')
      .insert([{
        goal_id: goalId,
        completed_date: date
      }])

    if (error && error.code !== '23505') { // Ignore unique constraint violations
      throw error
    }
  }

  // Remove a completed date
  async removeCompletedDate(goalId: string, date: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const { error } = await supabase
      .from('completed_dates')
      .delete()
      .eq('goal_id', goalId)
      .eq('completed_date', date)

    if (error) throw error
  }

  // Update goal progress based on completed action steps
  private async updateGoalProgress(goalId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase client not initialized')

    // Get all action steps for this goal
    const { data: actionSteps, error: stepsError } = await supabase
      .from('action_steps')
      .select('completed')
      .eq('goal_id', goalId)

    if (stepsError) throw stepsError

    if (!actionSteps || actionSteps.length === 0) {
      return
    }

    // Calculate progress percentage
    const completedSteps = actionSteps.filter(step => step.completed).length
    const progress = Math.round((completedSteps / actionSteps.length) * 100)

    // Update goal progress
    const { error: updateError } = await supabase
      .from('goals')
      .update({ progress })
      .eq('id', goalId)

    if (updateError) throw updateError
  }

  // Get goal statistics
  async getGoalStats(): Promise<{
    totalGoals: number
    completedActions: number
    totalActions: number
    averageProgress: number
  }> {
    if (!supabase) throw new Error('Supabase client not initialized')

    const goals = await this.getGoals()
    
    const totalGoals = goals.length
    const completedActions = goals.reduce((acc, goal) => 
      acc + goal.action_steps.filter(step => step.completed).length, 0
    )
    const totalActions = goals.reduce((acc, goal) => acc + goal.action_steps.length, 0)
    const averageProgress = totalGoals > 0 
      ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / totalGoals)
      : 0

    return {
      totalGoals,
      completedActions,
      totalActions,
      averageProgress
    }
  }
}

export const goalsService = new GoalsService()
