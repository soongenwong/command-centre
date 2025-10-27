# AI Assistant Setup Guide

## Overview
The Goal Command Centre includes an intelligent AI Assistant powered by Groq's Llama 3.1 model. The assistant helps you stay motivated and on track with your goals by providing personalized insights, suggestions, and encouragement.

## Setup Instructions

### 1. Get Your Groq API Key

1. Visit [Groq Console](https://console.groq.com/)
2. Sign up for a free account or sign in
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy your API key (you won't be able to see it again!)

### 2. Configure Environment Variables

1. Copy the template file:
   ```bash
   cp .env.local.template .env.local
   ```

2. Open `.env.local` and add your Groq API key:
   ```bash
   GROQ_API_KEY=your-actual-groq-api-key-here
   ```

3. Make sure `.env.local` is in your `.gitignore` (already configured)

### 3. Restart Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## Features

### What the AI Assistant Can Do

- 📊 **Goal Summaries**: Get an overview of all your goals and progress
- 🔥 **Streak Tracking**: Check your daily streaks and get motivation
- 💡 **Next Steps**: Receive suggestions on what to work on next
- 🎯 **Goal Details**: Get specific information about individual goals
- 🌟 **Motivation**: Receive encouragement based on your achievements
- ✅ **Progress Updates**: See how you're doing across all goals

### Example Queries

Try asking the assistant:
- "Give me a summary"
- "What's my streak?"
- "What should I do next?"
- "Tell me about [your goal name]"
- "Motivate me"
- "Help"

## Technical Details

### Model
- **Provider**: Groq
- **Model**: `llama-3.1-8b-instant`
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 500 (concise responses)

### API Route
The AI assistant uses a secure Next.js API route (`/api/chat`) to:
- Keep your API key secure on the server
- Pass user goals context to the AI
- Generate personalized responses

### Privacy
- Your API key is never exposed to the client
- All AI processing happens server-side
- Goal data is only used for generating responses (not stored by Groq)

## Troubleshooting

### "Groq API key not configured" Error
- Make sure you've added `GROQ_API_KEY` to your `.env.local` file
- Restart your development server after adding the key
- Check that the key doesn't have any extra spaces or quotes

### Assistant Not Responding
- Check your internet connection
- Verify your Groq API key is valid
- Check the browser console for errors
- Make sure you have Groq credits available (free tier included)

### Rate Limits
- Free tier: 30 requests per minute
- If you hit rate limits, wait a minute and try again
- Consider upgrading to paid tier for higher limits

## Cost

Groq offers:
- **Free Tier**: Generous free usage for development and testing
- **Fast Inference**: Extremely low latency responses
- **High Quality**: Powered by Llama 3.1 8B model

Check [Groq's pricing page](https://groq.com/pricing/) for current rates.

## Support

For issues with:
- **Groq API**: Visit [Groq Documentation](https://console.groq.com/docs)
- **This App**: Open an issue in the repository

---

Happy goal tracking! 🎯✨
