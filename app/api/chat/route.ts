import { auth } from "@/auth"
import { NextResponse } from "next/server"
import Groq from "groq-sdk"

export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  try {
    const body = await req.json();
    const { message, pdfContext, conversationHistory, groqApiKey } = body;

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Use the API key from request body or fall back to environment variable
    const apiKey = groqApiKey || process.env.GROQ_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ 
        error: 'Groq API key not configured. Please set it in settings.' 
      }, { status: 400 });
    }

    const groq = new Groq({ apiKey });

    // Build conversation history for context
    const systemPrompt = `You are an AI academic chatbot designed to help students learn and understand concepts. 
Your responses should be:
- Clear and educational
- Focused on helping the student understand, not just providing answers
- Encouraging critical thinking
- Appropriate for academic purposes
${pdfContext ? `\n\nYou have access to the following document context to answer questions:\n${pdfContext}` : ''}

When answering:
1. Provide well-structured, clear explanations
2. Include examples when relevant
3. Suggest further learning areas if appropriate
4. Be conversational but professional`;

    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Add conversation history if available
    if (conversationHistory && Array.isArray(conversationHistory)) {
      for (const msg of conversationHistory.slice(-10)) { // Keep last 10 messages for context
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }
    }

    // Add current user message
    messages.push({
      role: 'user' as const,
      content: message,
    });

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseContent = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      response: responseContent,
    });
  } catch (error) {
    console.error('Chat error:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
});
