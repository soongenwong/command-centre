import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

export function calculateStreak(completedDates: Array<{ completed_date: string }>): number {
  if (completedDates.length === 0) return 0
  
  const dates = completedDates
    .map(cd => new Date(cd.completed_date))
    .sort((a, b) => b.getTime() - a.getTime())
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  const currentDate = new Date(today)
  
  for (const date of dates) {
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    if (checkDate.getTime() === currentDate.getTime()) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (checkDate.getTime() < currentDate.getTime()) {
      break
    }
  }
  
  return streak
}

export function getLongestStreak(completedDates: Array<{ completed_date: string }>): number {
  if (completedDates.length === 0) return 0
  
  const dates = completedDates
    .map(cd => new Date(cd.completed_date))
    .sort((a, b) => a.getTime() - b.getTime())
  
  let longestStreak = 0
  let currentStreak = 1
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1])
    const currDate = new Date(dates[i])
    
    // Check if dates are consecutive
    const daysDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysDiff === 1) {
      currentStreak++
    } else {
      longestStreak = Math.max(longestStreak, currentStreak)
      currentStreak = 1
    }
  }
  
  return Math.max(longestStreak, currentStreak)
}

export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffMs = dateObj.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays > 0) return `In ${diffDays} days`
  return `${Math.abs(diffDays)} days ago`
}

export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function formatDateForInput(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  
  return (
    dateObj.getFullYear() === today.getFullYear() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getDate() === today.getDate()
  )
}
