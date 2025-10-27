import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { message, goalsContext } = await request.json()

    if (!message || !goalsContext) {
      return NextResponse.json(
        { error: 'Message and goals context are required' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: 'Groq API key not configured' },
        { status: 500 }
      )
    }

    // Create system prompt with goals context
    const systemPrompt = `You are an intelligent and encouraging AI productivity assistant integrated within the "Goal Command Centre" dashboard. Your primary purpose is to help the user stay informed, motivated, and on track with the goals they have set.

Core Instructions:
1. Analyze User Queries: Carefully read the user's question to understand their intent. They may be asking for a summary, specific details, or advice on what to do next.
2. Provide Accurate Information: Base your answers strictly on the user_goals_data provided below. If asked about a goal, retrieve its title, target, sub-tasks, and current streak.
3. Be encouraging: Use the daily_streak data to offer motivation. If a streak is high, congratulate them. If it's low or zero, gently encourage them to get started today.
4. Suggest Next Steps: When a user asks "What should I do next?" analyze their incomplete sub_tasks and suggest one as a clear, actionable next step.
5. Maintain a Conversational Tone: Be helpful and approachable. Address the user directly.
6. Handle Ambiguity: If the user's query is unclear, ask for clarification.
7. Stay Within Scope: If the user asks a question that cannot be answered using the provided data (e.g., "What's the weather like?" or "Give me financial advice"), gently decline and guide them back to their goals.

USER GOALS DATA:
${JSON.stringify(goalsContext, null, 2)}

Remember to:
- Be concise but warm in your responses
- Use emojis sparingly but effectively (🎯, 🔥, 💪, 🌟, ✅, 📊)
- Focus on actionable insights
- Celebrate wins and encourage consistency
- Keep responses under 200 words when possible`

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: message,
        },
      ],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 500,
      top_p: 1,
      stream: false,
    })

    const response = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.'

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Error calling Groq API:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
