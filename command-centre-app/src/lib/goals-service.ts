// Re-export the GoalsService for backward compatibility
export { GoalsService, type Goal, type ActionStep, type CompletedDate } from './goalsService'
import { GoalsService, type Goal } from './goalsService'

// Create singleton instance
const goalsServiceInstance = new GoalsService()

// Export service methods for backward compatibility
export const goalsService = {
  getGoals: () => goalsServiceInstance.getGoals(),
  createGoal: (goal: Parameters<typeof goalsServiceInstance.createGoal>[0]) => goalsServiceInstance.createGoal(goal),
  updateGoal: (id: string, updates: Parameters<typeof goalsServiceInstance.updateGoal>[1]) => goalsServiceInstance.updateGoal(id, updates),
  deleteGoal: (id: string) => goalsServiceInstance.deleteGoal(id)
}

export const actionStepsService = {
  getActionStepsByGoal: (goalId: string) => goalsServiceInstance.getGoals().then((goals: Goal[]) => {
    const goal = goals.find((g: Goal) => g.id === goalId)
    return goal?.action_steps || []
  }),
  createActionStep: (actionStep: Parameters<typeof goalsServiceInstance.createActionStep>[0]) => goalsServiceInstance.createActionStep(actionStep),
  updateActionStep: (id: string, updates: { completed: boolean }) => goalsServiceInstance.toggleActionStep(id, updates.completed),
  deleteActionStep: (id: string, goalId: string) => goalsServiceInstance.deleteActionStep(id, goalId)
}

export const completedDatesService = {
  getCompletedDatesByGoal: (goalId: string) => goalsServiceInstance.getGoals().then((goals: Goal[]) => {
    const goal = goals.find((g: Goal) => g.id === goalId)
    return goal?.completed_dates || []
  }),
  addCompletedDate: (goalId: string, date: string) => goalsServiceInstance.addCompletedDate(goalId, date),
  removeCompletedDate: (goalId: string, date: string) => goalsServiceInstance.removeCompletedDate(goalId, date)
}
