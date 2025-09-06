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
    .sort((a, b) => b.getTime() - a.getTime()) // Most recent first
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  let streak = 0
  let currentDate = new Date(today)
  
  // Check if today is marked, and if not, start from yesterday
  const todayMarked = dates.some(date => {
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    return checkDate.getTime() === today.getTime()
  })
  
  // If today is not marked, start checking from yesterday for previous streak
  if (!todayMarked) {
    currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
  }
  
  for (const date of dates) {
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    if (checkDate.getTime() === currentDate.getTime()) {
      streak++
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)
    } else if (checkDate.getTime() < currentDate.getTime()) {
      // Gap found, streak is broken
      break
    }
  }
  
  return streak
}

export function getLongestStreak(completedDates: Array<{ completed_date: string }>): number {
  if (completedDates.length === 0) return 0
  if (completedDates.length === 1) return 1
  
  const dates = completedDates
    .map(cd => new Date(cd.completed_date))
    .sort((a, b) => a.getTime() - b.getTime()) // Earliest first for consecutive checking
  
  let longestStreak = 1
  let currentStreak = 1
  
  for (let i = 1; i < dates.length; i++) {
    const prevDate = new Date(dates[i - 1])
    const currDate = new Date(dates[i])
    
    prevDate.setHours(0, 0, 0, 0)
    currDate.setHours(0, 0, 0, 0)
    
    // Check if dates are consecutive (exactly 1 day apart)
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

export function calculateDisplayStreak(completedDates: Array<{ completed_date: string }>): number {
  if (completedDates.length === 0) return 0
  
  const dates = completedDates
    .map(cd => new Date(cd.completed_date))
    .sort((a, b) => b.getTime() - a.getTime())
  
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  let streak = 0
  let currentDate = new Date(yesterday) // Start from yesterday
  
  for (const date of dates) {
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)
    
    if (checkDate.getTime() === currentDate.getTime()) {
      streak++
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000) // Go back one day
    } else if (checkDate.getTime() < currentDate.getTime()) {
      break
    }
  }
  
  return streak
}

export function calculateDaysUntilTarget(targetDate: Date | string): number {
  const target = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  
  const diffMs = target.getTime() - today.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function getEarliestDate(dates: string[]): Date {
  if (dates.length === 0) return new Date()
  
  return dates.reduce((earliest, dateStr) => {
    const currentDate = new Date(dateStr)
    return currentDate < earliest ? currentDate : earliest
  }, new Date(dates[0]))
}

export function debugStreak(completedDates: Array<{ completed_date: string }>): void {
  console.log('=== Streak Debug ===')
  console.log('Completed dates:', completedDates.map(cd => cd.completed_date).sort())
  console.log('Current streak:', calculateStreak(completedDates))
  console.log('Longest streak:', getLongestStreak(completedDates))
  console.log('Today:', new Date().toISOString().split('T')[0])
  console.log('==================')
}
