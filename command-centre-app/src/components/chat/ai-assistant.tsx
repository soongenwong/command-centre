'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageCircle, Send, X, Minimize2, Maximize2, Sparkles } from 'lucide-react'
import { type Goal } from '@/lib/goalsService'
import { calculateStreak } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIAssistantProps {
  goals: Goal[]
}

export function AIAssistant({ goals }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "👋 Hi! I'm your Goal Command Centre Assistant. I'm here to help you stay informed, motivated, and on track with your goals. Feel free to ask me about your progress, streaks, or what to do next!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const analyzeGoalsData = () => {
    const goalsData = goals.map(goal => ({
      id: goal.id,
      title: goal.title,
      description: goal.description,
      target_date: goal.target_date,
      action_steps: (goal.action_steps || []).map(step => ({
        title: step.title,
        completed: step.completed
      })),
      daily_streak: calculateStreak(goal.completed_dates || []),
      completed_dates: goal.completed_dates?.map(cd => cd.completed_date.split('T')[0]) || [],
      incomplete_tasks: (goal.action_steps || [])
        .filter(step => !step.completed)
        .map(step => step.title)
    }))

    return goalsData
  }

  const generateResponseWithGroq = async (userMessage: string): Promise<string> => {
    try {
      const goalsContext = analyzeGoalsData()
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          goalsContext: goalsContext,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Error calling Groq API:', error)
      return "I'm having trouble connecting right now. Please try again in a moment! 🔄"
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const userInput = input
    setInput('')
    setIsTyping(true)

    try {
      // Call Groq API through our API route
      const response = await generateResponseWithGroq(userInput)
      
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error generating response:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I'm having trouble processing your request right now. Please try again! 🔄",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 z-50"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 shadow-2xl z-50 border-orange-200">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-orange-500 text-white rounded-t-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-5 w-5" />
                <CardTitle className="text-lg">AI Assistant</CardTitle>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="text-white hover:bg-orange-700 h-8 w-8 p-0"
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-orange-700 h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {!isMinimized && (
            <CardContent className="p-0">
              {/* Messages Area */}
              <div className="h-96 overflow-y-auto p-4 space-y-4 bg-gray-50">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-orange-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      }`}
                    >
                      <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                      <div className={`text-xs mt-1 ${
                        message.role === 'user' ? 'text-orange-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border border-gray-200 rounded-lg p-3">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t bg-white">
                <div className="flex space-x-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me about your goals..."
                    className="flex-1"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  Try: "Give me a summary" or "What should I do next?"
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}
    </>
  )
}
