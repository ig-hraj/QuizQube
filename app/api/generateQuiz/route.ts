import { auth } from "@/auth"
import { NextResponse } from "next/server"
import Groq from "groq-sdk"
import { parse as jsonParse } from 'json5';
import { getQuizPrompt, QuizType, QuizDifficulty } from '@/app/helper/prompts';

interface Question {
  question: string;
  options: string[];
  correct: string;
  type: 'multiple_choice' | 'true_false';
}

interface QuizData {
  topic: string;
  questions: Question[];
}

interface RawQuizData {
  topic?: string;
  questions?: Array<{
    question?: string;
    options?: unknown[];
    correct?: string;
    type?: string;
  }>;
}

function sanitizeJSON(jsonString: string): string {
  const match = jsonString.match(/\{[\s\S]*\}/);
  return match ? match[0] : '{}';
}

function truncateContentForModel(content: string, maxChars: number): string {
  if (content.length <= maxChars) return content;
  return `${content.slice(0, maxChars)}\n\n[Content truncated to fit model token limits]`;
}

function validateAndFixQuizData(data: RawQuizData, expectedCount: number, typeOfQuiz: string): QuizData {
  const fixedData: QuizData = {
    topic: typeof data.topic === 'string' ? data.topic : 'Untitled Quiz',
    questions: [],
  };

  if (Array.isArray(data.questions)) {
    fixedData.questions = data.questions.filter((q): q is Question => {
      if (typeof q.question !== 'string' || !Array.isArray(q.options) || typeof q.correct !== 'string' || !['multiple_choice', 'true_false'].includes(q.type || '')) {
        return false;
      }
      q.options = q.options.filter((opt): opt is string => typeof opt === 'string');
      if (typeOfQuiz === 'multiple_choice' && q.type !== 'multiple_choice') return false;
      if (typeOfQuiz === 'true_false' && q.type !== 'true_false') return false;
      if (q.type === 'multiple_choice' && q.options.length !== 4) return false;
      if (q.type === 'true_false' && (q.options.length !== 2 || !q.options.every((opt) => typeof opt === 'string' && ['True', 'False'].includes(opt)))) return false;
      return true;
    }) as Question[];
  }

  if (fixedData.questions.length < expectedCount) {
    console.warn(`Not enough valid questions generated. Expected ${expectedCount}, got ${fixedData.questions.length}`);
  } else if (fixedData.questions.length > expectedCount) {
    fixedData.questions = fixedData.questions.slice(0, expectedCount);
  }

  return fixedData;
}

export const POST = auth(async function POST(req) {
  if (!req.auth) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  const body = await req.json();
  const { apiKey, content, questionCount, difficulty, typeOfQuiz } = body;
  
  // Validate input
  if (!content || !questionCount || !difficulty || !typeOfQuiz || !apiKey ) {
    return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
  }
  // check the format of the api key,it should be gsk_... and 56 characters long
  if (!isValidApiKey(apiKey)) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }
  if (!isValidContent(content)) {
    return NextResponse.json({ error: 'Invalid content' }, { status: 400 });
  }
  if (!isValidQuestionCount(questionCount)) {
    return NextResponse.json({ error: 'Invalid question count' }, { status: 400 });
  }
  // Type guard for QuizType
  if (!isValidQuizType(typeOfQuiz)) {
    return NextResponse.json({ error: 'Invalid quiz type' }, { status: 400 });
  }

  // Type guard for QuizDifficulty
  if (!isValidQuizDifficulty(difficulty)) {
    return NextResponse.json({ error: 'Invalid difficulty level' }, { status: 400 });
  }

  try {
    const groq = new Groq({ apiKey: apiKey });
    const contentBudgets = [12000, 8000, 5000];
    let completion;
    let lastError: unknown;

    for (const budget of contentBudgets) {
      try {
        const prompt = getQuizPrompt(typeOfQuiz, {
          questionCount: Number(questionCount),
          difficulty,
          content: truncateContentForModel(content, budget)
        });

        completion = await groq.chat.completions.create({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: "You are an expert quiz generator. Your responses must be in valid JSON format only, with no additional text. You must strictly adhere to the specified number of questions and quiz type.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        break;
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        const isTokenError = message.includes('Request too large') || message.includes('tokens') || message.includes('TPM');
        if (!isTokenError) {
          throw error;
        }
      }
    }

    if (!completion) {
      throw lastError instanceof Error
        ? new Error('Input is too large for your current Groq tier. Try fewer PDFs or shorter documents.')
        : new Error('Input is too large for your current Groq tier. Try fewer PDFs or shorter documents.');
    }

    const sanitizedJSON = sanitizeJSON(completion.choices[0].message.content || '{}');
    let quizData: RawQuizData;

    try {
      quizData = jsonParse(sanitizedJSON);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      quizData = {};
    }

    const validatedQuizData = validateAndFixQuizData(quizData, questionCount, typeOfQuiz);

    if (validatedQuizData.questions.length !== questionCount) {
      throw new Error(`Invalid number of questions generated. Expected ${questionCount}, got ${validatedQuizData.questions.length}`);
    }

    return NextResponse.json(validatedQuizData, { status: 200 });
  } catch (error) {
    console.error('Error generating quiz:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
});

// Type guard functions
function isValidQuizType(type: unknown): type is QuizType {
  return typeof type === 'string' && ['multiple_choice', 'true_false', 'mixed'].includes(type);
}

function isValidQuizDifficulty(difficulty: unknown): difficulty is QuizDifficulty {
  return typeof difficulty === 'string' && ['easy', 'medium', 'hard'].includes(difficulty);
}

function isValidQuestionCount(count: unknown): count is number {
  return typeof count === 'number' && [5, 10, 20, 30].includes(count);
}

function isValidContent(content: unknown): content is string {
  return typeof content === 'string';
}

function isValidApiKey(apiKey: unknown): apiKey is string {
  // Groq key length can vary, so validate prefix and a sane minimum length.
  return typeof apiKey === 'string' && apiKey.startsWith('gsk_') && apiKey.length >= 20;
}