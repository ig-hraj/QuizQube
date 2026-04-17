import { auth } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import normalizeText from '../../lib/normalizeText'
import pdfParse from 'pdf-parse'

export async function POST(req: Request) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF
    const pdfData = await pdfParse(buffer);
    const normalizedText = normalizeText(pdfData.text);

    return NextResponse.json({ content: normalizedText }, { status: 200 });
  } catch (error) {
    console.error('Error parsing PDF:', error);
    return NextResponse.json({ 
      error: `Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
}