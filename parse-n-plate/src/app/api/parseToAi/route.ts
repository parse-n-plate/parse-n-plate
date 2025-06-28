import {NextRequest, NextResponse} from "next/server";
import {Groq} from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(req: NextRequest) {
  console.log("test request")
  try {
    const body = await req.json();
    const html = body.html; // <== this is the actual HTML
    console.log("test")

    const response = await groq.chat.completions.create({
      model: "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You're a recipe parser. Given the HTML of a recipe website, extract only the ingredient list in clean structured JSON. Ignore anything under the comments section."
        },
        {
          role: "user",
          content: html.slice(0, 10000)
        }
      ]
    })


    console.log("data", response)
    return "";

  } catch (err) {
    console.error("Parsing failed:", err);
    return NextResponse.json({ error: "Failed to parse recipe." }, { status: 500 });
  }
}