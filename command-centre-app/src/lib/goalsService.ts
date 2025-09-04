import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  onSnapshot,
  type Unsubscribe,
  QuerySnapshot,
  DocumentData
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

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

// Helper function to convert Firestore timestamp to ISO string
const timestampToString = (timestamp: Timestamp | null): string => {
  return timestamp ? timestamp.toDate().toISOString() : new Date().toISOString()
}

export class GoalsService {
  // Real-time listener for goals with offline-first approach
  subscribeToGoals(callback: (goals: Goal[]) => void): Unsubscribe {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')

    const goalsQuery = query(
      collection(db, 'goals'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    )

    return onSnapshot(goalsQuery, async (snapshot: QuerySnapshot<DocumentData>) => {
      try {
        // Log snapshot metadata to understand data source
        console.log('Goals snapshot metadata:', {
          hasPendingWrites: snapshot.metadata.hasPendingWrites,
          fromCache: snapshot.metadata.fromCache
        })
        
        // Process all goal documents in parallel for better performance
        const goalPromises = snapshot.docs.map(async (goalDoc) => {
          const goalData = goalDoc.data()
          
          // Get action steps for this goal
          const actionStepsQuery = query(
            collection(db, 'action_steps'),
            where('goal_id', '==', goalDoc.id)
          )
          
          // Get completed dates for this goal
          const completedDatesQuery = query(
            collection(db, 'completed_dates'),
            where('goal_id', '==', goalDoc.id)
          )
          
          // Execute queries in parallel for better performance
          const [actionStepsSnapshot, completedDatesSnapshot] = await Promise.all([
            getDocs(actionStepsQuery),
            getDocs(completedDatesQuery)
          ])
          
          const action_steps = actionStepsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: timestampToString(doc.data().created_at),
            updated_at: timestampToString(doc.data().updated_at)
          })) as ActionStep[]
          
          const completed_dates = completedDatesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            created_at: timestampToString(doc.data().created_at)
          })) as CompletedDate[]
          
          return {
            id: goalDoc.id,
            ...goalData,
            created_at: timestampToString(goalData.created_at),
            updated_at: timestampToString(goalData.updated_at),
            action_steps,
            completed_dates
          } as Goal
        })
        
        const resolvedGoals = await Promise.all(goalPromises)
        callback(resolvedGoals)
        
        console.log(`Loaded ${resolvedGoals.length} goals from ${snapshot.metadata.fromCache ? 'cache' : 'server'}`)
      } catch (error) {
        console.error('Error in goals subscription:', error)
        // Don't throw error - let the app continue with empty array
        callback([])
      }
    }, (error) => {
      console.error('Error subscribing to goals:', error)
      // On error, provide empty array to prevent app crash
      callback([])
    })
  }

  // Enhanced subscription that listens to all related collections in real-time
  subscribeToAllGoalsData(callback: (goals: Goal[]) => void): Unsubscribe {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')

    let goals: Goal[] = []
    let actionSteps: { [goalId: string]: ActionStep[] } = {}
    let completedDates: { [goalId: string]: CompletedDate[] } = {}

    // Subscribe to goals
    const goalsQuery = query(
      collection(db, 'goals'),
      where('user_id', '==', user.uid),
      orderBy('created_at', 'desc')
    )

    // Subscribe to action steps
    const actionStepsQuery = query(
      collection(db, 'action_steps')
    )

    // Subscribe to completed dates  
    const completedDatesQuery = query(
      collection(db, 'completed_dates')
    )

    const combineAndCallback = () => {
      const combinedGoals = goals.map(goal => ({
        ...goal,
        action_steps: actionSteps[goal.id] || [],
        completed_dates: completedDates[goal.id] || []
      }))
      callback(combinedGoals)
    }

    // Goals subscription
    const unsubscribeGoals = onSnapshot(goalsQuery, (snapshot) => {
      console.log('Goals updated from', snapshot.metadata.fromCache ? 'cache' : 'server')
      goals = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          user_id: data.user_id,
          title: data.title,
          description: data.description,
          target_date: data.target_date,
          progress: data.progress,
          created_at: timestampToString(data.created_at),
          updated_at: timestampToString(data.updated_at),
          action_steps: [],
          completed_dates: []
        } as Goal
      })
      combineAndCallback()
    })

    // Action steps subscription - filtered for user's goals
    const unsubscribeActionSteps = onSnapshot(actionStepsQuery, (snapshot) => {
      console.log('Action steps updated from', snapshot.metadata.fromCache ? 'cache' : 'server')
      actionSteps = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        const goalId = data.goal_id
        // Only include action steps for goals that belong to current user
        if (goals.some(goal => goal.id === goalId)) {
          if (!actionSteps[goalId]) actionSteps[goalId] = []
          actionSteps[goalId].push({
            id: doc.id,
            ...data,
            created_at: timestampToString(data.created_at),
            updated_at: timestampToString(data.updated_at)
          } as ActionStep)
        }
      })
      combineAndCallback()
    })

    // Completed dates subscription - filtered for user's goals
    const unsubscribeCompletedDates = onSnapshot(completedDatesQuery, (snapshot) => {
      console.log('Completed dates updated from', snapshot.metadata.fromCache ? 'cache' : 'server')
      completedDates = {}
      snapshot.docs.forEach(doc => {
        const data = doc.data()
        const goalId = data.goal_id
        // Only include completed dates for goals that belong to current user
        if (goals.some(goal => goal.id === goalId)) {
          if (!completedDates[goalId]) completedDates[goalId] = []
          completedDates[goalId].push({
            id: doc.id,
            ...data,
            created_at: timestampToString(data.created_at)
          } as CompletedDate)
        }
      })
      combineAndCallback()
    })

    // Return combined unsubscribe function
    return () => {
      unsubscribeGoals()
      unsubscribeActionSteps()
      unsubscribeCompletedDates()
    }
  }

  // Get all goals for the authenticated user
  async getGoals(): Promise<Goal[]> {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')

    try {
      // Get goals
      const goalsQuery = query(
        collection(db, 'goals'),
        where('user_id', '==', user.uid),
        orderBy('created_at', 'desc')
      )
      const goalsSnapshot = await getDocs(goalsQuery)
      
      const goals: Goal[] = []
      
      for (const goalDoc of goalsSnapshot.docs) {
        const goalData = goalDoc.data()
        
        // Get action steps for this goal
        const actionStepsQuery = query(
          collection(db, 'action_steps'),
          where('goal_id', '==', goalDoc.id)
        )
        const actionStepsSnapshot = await getDocs(actionStepsQuery)
        const action_steps = actionStepsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: timestampToString(doc.data().created_at),
          updated_at: timestampToString(doc.data().updated_at)
        })) as ActionStep[]
        
        // Get completed dates for this goal
        const completedDatesQuery = query(
          collection(db, 'completed_dates'),
          where('goal_id', '==', goalDoc.id)
        )
        const completedDatesSnapshot = await getDocs(completedDatesQuery)
        const completed_dates = completedDatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          created_at: timestampToString(doc.data().created_at)
        })) as CompletedDate[]
        
        goals.push({
          id: goalDoc.id,
          ...goalData,
          created_at: timestampToString(goalData.created_at),
          updated_at: timestampToString(goalData.updated_at),
          action_steps,
          completed_dates
        } as Goal)
      }
      
      return goals
    } catch (error) {
      console.error('Error getting goals:', error)
      throw error
    }
  }

  // Create a new goal
  async createGoal(goalData: CreateGoalData): Promise<Goal> {
    const user = auth.currentUser
    if (!user) throw new Error('User not authenticated')

    try {
      const docRef = await addDoc(collection(db, 'goals'), {
        title: goalData.title,
        description: goalData.description || null,
        target_date: goalData.target_date || null,
        user_id: user.uid,
        progress: 0,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })

      // Return the created goal with empty arrays for related data
      return {
        id: docRef.id,
        user_id: user.uid,
        title: goalData.title,
        description: goalData.description || null,
        target_date: goalData.target_date || null,
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        action_steps: [],
        completed_dates: []
      }
    } catch (error) {
      console.error('Error creating goal:', error)
      throw error
    }
  }

  // Update a goal
  async updateGoal(goalId: string, updateData: UpdateGoalData): Promise<Goal> {
    try {
      const goalRef = doc(db, 'goals', goalId)
      await updateDoc(goalRef, {
        ...updateData,
        updated_at: serverTimestamp()
      })

      // Get the updated goal data
      const goals = await this.getGoals()
      const updatedGoal = goals.find(goal => goal.id === goalId)
      if (!updatedGoal) throw new Error('Goal not found after update')
      
      return updatedGoal
    } catch (error) {
      console.error('Error updating goal:', error)
      throw error
    }
  }

  // Delete a goal
  async deleteGoal(goalId: string): Promise<void> {
    try {
      // Delete related action steps
      const actionStepsQuery = query(
        collection(db, 'action_steps'),
        where('goal_id', '==', goalId)
      )
      const actionStepsSnapshot = await getDocs(actionStepsQuery)
      const actionStepDeletes = actionStepsSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      )
      
      // Delete related completed dates
      const completedDatesQuery = query(
        collection(db, 'completed_dates'),
        where('goal_id', '==', goalId)
      )
      const completedDatesSnapshot = await getDocs(completedDatesQuery)
      const completedDateDeletes = completedDatesSnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      )
      
      // Wait for all related data to be deleted
      await Promise.all([...actionStepDeletes, ...completedDateDeletes])
      
      // Delete the goal
      const goalRef = doc(db, 'goals', goalId)
      await deleteDoc(goalRef)
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  }

  // Create a new action step
  async createActionStep(actionStepData: CreateActionStepData): Promise<ActionStep> {
    try {
      const docRef = await addDoc(collection(db, 'action_steps'), {
        ...actionStepData,
        completed: false,
        completed_date: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp()
      })

      return {
        id: docRef.id,
        goal_id: actionStepData.goal_id,
        title: actionStepData.title,
        completed: false,
        completed_date: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    } catch (error) {
      console.error('Error creating action step:', error)
      throw error
    }
  }

  // Toggle action step completion
  async toggleActionStep(actionStepId: string, completed: boolean): Promise<ActionStep> {
    try {
      const actionStepRef = doc(db, 'action_steps', actionStepId)
      await updateDoc(actionStepRef, {
        completed,
        completed_date: completed ? new Date().toISOString() : null,
        updated_at: serverTimestamp()
      })

      // Get the updated action step to find the goal_id
      const goals = await this.getGoals()
      let actionStep: ActionStep | undefined
      let goalId: string | undefined

      for (const goal of goals) {
        const foundStep = goal.action_steps.find(step => step.id === actionStepId)
        if (foundStep) {
          actionStep = foundStep
          goalId = goal.id
          break
        }
      }

      if (!actionStep || !goalId) {
        throw new Error('Action step not found')
      }

      // Update goal progress
      await this.updateGoalProgress(goalId)

      return actionStep
    } catch (error) {
      console.error('Error toggling action step:', error)
      throw error
    }
  }

  // Delete an action step
  async deleteActionStep(actionStepId: string, goalId: string): Promise<void> {
    try {
      const actionStepRef = doc(db, 'action_steps', actionStepId)
      await deleteDoc(actionStepRef)

      // Update goal progress
      await this.updateGoalProgress(goalId)
    } catch (error) {
      console.error('Error deleting action step:', error)
      throw error
    }
  }

  // Add a completed date for streak tracking
  async addCompletedDate(goalId: string, date: string = new Date().toISOString().split('T')[0]): Promise<void> {
    try {
      // Check if the date already exists to avoid duplicates
      const completedDatesQuery = query(
        collection(db, 'completed_dates'),
        where('goal_id', '==', goalId),
        where('completed_date', '==', date)
      )
      const snapshot = await getDocs(completedDatesQuery)
      
      if (snapshot.empty) {
        await addDoc(collection(db, 'completed_dates'), {
          goal_id: goalId,
          completed_date: date,
          created_at: serverTimestamp()
        })
      }
    } catch (error) {
      console.error('Error adding completed date:', error)
      throw error
    }
  }

  // Remove a completed date
  async removeCompletedDate(goalId: string, date: string): Promise<void> {
    try {
      const completedDatesQuery = query(
        collection(db, 'completed_dates'),
        where('goal_id', '==', goalId),
        where('completed_date', '==', date)
      )
      const snapshot = await getDocs(completedDatesQuery)
      
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)
    } catch (error) {
      console.error('Error removing completed date:', error)
      throw error
    }
  }

  // Update goal progress based on completed action steps
  private async updateGoalProgress(goalId: string): Promise<void> {
    try {
      // Get all action steps for this goal
      const actionStepsQuery = query(
        collection(db, 'action_steps'),
        where('goal_id', '==', goalId)
      )
      const actionStepsSnapshot = await getDocs(actionStepsQuery)
      
      if (actionStepsSnapshot.empty) {
        return
      }

      // Calculate progress percentage
      const actionSteps = actionStepsSnapshot.docs.map(doc => doc.data())
      const completedSteps = actionSteps.filter(step => step.completed).length
      const progress = Math.round((completedSteps / actionSteps.length) * 100)

      // Update goal progress
      const goalRef = doc(db, 'goals', goalId)
      await updateDoc(goalRef, {
        progress,
        updated_at: serverTimestamp()
      })
    } catch (error) {
      console.error('Error updating goal progress:', error)
      throw error
    }
  }

  // Get goal statistics
  async getGoalStats(): Promise<{
    totalGoals: number
    completedActions: number
    totalActions: number
    averageProgress: number
  }> {
    try {
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
    } catch (error) {
      console.error('Error getting goal stats:', error)
      throw error
    }
  }
}

export const goalsService = new GoalsService()
