import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { formatError, ERROR_CODES } from '@/utils/formatError';

export async function POST(req: NextRequest) {
  try {
    const groq = new Groq({
      apiKey: process.env.GROQ_API_KEY,
    });

    const body = await req.json();
    console.log('body;', body);
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        formatError(
          ERROR_CODES.ERR_INVALID_URL,
          'Text input is required and must be a string',
        ),
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        formatError(ERROR_CODES.ERR_NO_RECIPE_FOUND, 'Text input is empty'),
      );
    }

    // Check if Groq API key is configured
    if (!process.env.GROQ_API_KEY) {
      console.error('GROQ_API_KEY is not configured');
      return NextResponse.json(
        formatError(ERROR_CODES.ERR_UNKNOWN, 'AI service is not configured'),
      );
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `========================================
CRITICAL OUTPUT FORMAT
========================================
You MUST output ONLY raw JSON. NO thinking, NO reasoning, NO explanations, NO text before or after the JSON.
START YOUR RESPONSE IMMEDIATELY WITH [ and END WITH ]. Nothing else.

Required JSON structure:
[
  "Recipe Title (string)",
  [
    {
      "groupName": "string",
      "ingredients": [
        {"amount": "string", "units": "string", "ingredient": "string"}
      ]
    }
  ]
]

CRITICAL: The ingredients array (second element) MUST be an array, NEVER null.
- If ingredients are found: extract them into the array structure above
- If NO ingredients found: use empty array []
- NEVER use null for ingredients - ALWAYS use [] if nothing is found

========================================
THE HTML PROVIDED IS YOUR ONLY SOURCE OF DATA
========================================
You are an AI ingredient extractor. Your SOLE purpose is to read the HTML provided and extract ingredient data EXACTLY as it appears.

CORE EXTRACTION PRINCIPLES:
1. Read the HTML carefully and locate the recipe title and ingredients
2. Extract amounts, units, and ingredient names EXACTLY as written in the HTML
3. Never invent, estimate, round, convert, or modify any values
4. If data is missing from HTML, use fallback values (see Edge Cases section)
5. Only normalize whitespace - nothing else

========================================
EXTRACTION WORKFLOW
========================================
Follow these steps in order:
1. Locate and extract the recipe title (usually the main heading)
2. Locate the ingredients section in the HTML
3. For each ingredient, extract:
   - The amount EXACTLY as written (e.g., "2 1/2", "1/4", "½", "0.5")
   - The unit EXACTLY as written (e.g., "cups", "tablespoons", "grams")
   - The ingredient name EXACTLY as written
4. Preserve any ingredient groups found in the HTML
5. Format the extracted data into the required JSON structure

========================================
INGREDIENT EXTRACTION RULES
========================================
AMOUNTS:
- Copy the amount EXACTLY as it appears in HTML: "2 1/2", "1/4", "½", "0.25", "¾"
- Do NOT convert fractions to decimals or vice versa
- Do NOT round or estimate (e.g., if HTML says "2 1/2", output "2 1/2", NOT "2.5")
- If HTML shows a range like "2-3", use "2-3"
- If no amount is provided, use "as needed"

UNITS:
- Copy the unit EXACTLY as it appears: "cups", "tablespoons", "teaspoons", "grams", "ounces", "pounds"
- Do NOT convert units (e.g., do NOT convert tablespoons to cups)
- Do NOT abbreviate or expand (if HTML says "tbsp", use "tbsp")
- If no amount is provided (using "as needed"), leave units as empty string ""

INGREDIENT NAMES:
- Copy the ingredient name EXACTLY as written in HTML
- Include all descriptors: "all-purpose flour", "unsalted butter", "large eggs"
- Do NOT abbreviate, simplify, or modify names
- If a size is part of the ingredient name (e.g., "6-inch tortillas"), include it in the ingredient name and leave units blank

GROUPS:
- If ingredients are grouped in HTML (e.g., "For the crust", "For the filling"), preserve those exact group names
- If no groups exist, use a single group with groupName "Main"
- Do NOT create groups that don't exist in the HTML

========================================
EDGE CASES AND MISSING DATA
========================================
If the recipe title is missing:
- Use the page's main heading or first prominent heading

If an ingredient amount is missing:
- Use "as needed" for amount
- Use "" (empty string) for units
- Still include the ingredient name

If ingredient groups are unclear:
- Use a single group with groupName "Main"

If no valid recipe is found in HTML:
- Return: ["No recipe found", []]

MANDATORY OUTPUT REQUIREMENTS:
- The ingredients array (second element) MUST be an array (never null) - use [] if empty
- If you cannot find ingredients, return []
- The HTML contains recipe data - search more carefully if you initially find nothing

========================================
FORMAT EXAMPLES (FOR STRUCTURE REFERENCE ONLY)
========================================
WARNING: These examples show the JSON FORMAT and STRUCTURE only.
DO NOT use these example values. Extract actual values from the HTML provided.

Example showing varied fraction formats:
[
  "Homemade Bread",
  [
    {
      "groupName": "Main",
      "ingredients": [
        {"amount": "3 1/2", "units": "cups", "ingredient": "bread flour"},
        {"amount": "2 1/4", "units": "teaspoons", "ingredient": "active dry yeast"},
        {"amount": "1/4", "units": "cup", "ingredient": "warm water"},
        {"amount": "½", "units": "tablespoon", "ingredient": "salt"},
        {"amount": "as needed", "units": "", "ingredient": "olive oil for brushing"}
      ]
    }
  ]
]

Example showing multiple groups:
[
  "Chocolate Cake",
  [
    {
      "groupName": "For the cake",
      "ingredients": [
        {"amount": "2 1/2", "units": "cups", "ingredient": "all-purpose flour"},
        {"amount": "1 3/4", "units": "cups", "ingredient": "granulated sugar"},
        {"amount": "3/4", "units": "cup", "ingredient": "unsweetened cocoa powder"}
      ]
    },
    {
      "groupName": "For the frosting",
      "ingredients": [
        {"amount": "½", "units": "cup", "ingredient": "unsalted butter"},
        {"amount": "2 1/2", "units": "cups", "ingredient": "powdered sugar"},
        {"amount": "¼", "units": "teaspoon", "ingredient": "vanilla extract"}
      ]
    }
  ]
]

IMPORTANT: The examples above show JSON format structure only. You MUST extract actual amounts, units, and ingredient names from the HTML provided, not use these example values.

========================================
FINAL REMINDER
========================================
Output ONLY the JSON array. No markdown, no code blocks, no explanations, no text before or after.
START with [ and END with ]. Nothing else.
`,
        },
        {
          role: 'user',
          content: text.slice(0, 15000), // Limit to first 15k characters
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    const result = response.choices[0]?.message?.content;
    console.log('result;', result);

    // Check if the AI explicitly says no recipe was found
    if (result && result.toLowerCase().includes('no recipe found')) {
      return NextResponse.json(
        formatError(
          ERROR_CODES.ERR_NO_RECIPE_FOUND,
          'No valid recipe found in the provided HTML',
        ),
      );
    }

    if (!result || result.trim().length === 0) {
      return NextResponse.json(
        formatError(
          ERROR_CODES.ERR_AI_PARSE_FAILED,
          'No response from AI service',
        ),
      );
    }

    // Validate that the response contains valid JSON structure
    try {
      const extractedJson = extractJsonFromResponse(result);
      JSON.parse(extractedJson);
    } catch {
      console.error('Invalid JSON response from AI:', result);
      return NextResponse.json(
        formatError(
          ERROR_CODES.ERR_AI_PARSE_FAILED,
          'AI returned invalid response format',
        ),
      );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Recipe parsing failed:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('timeout') ||
        error.message.includes('timed out')
      ) {
        return NextResponse.json(
          formatError(ERROR_CODES.ERR_TIMEOUT, 'AI service request timed out'),
        );
      }
      if (
        error.message.includes('authentication') ||
        error.message.includes('unauthorized')
      ) {
        return NextResponse.json(
          formatError(
            ERROR_CODES.ERR_UNKNOWN,
            'AI service authentication failed',
          ),
        );
      }
      if (
        error.message.includes('quota') ||
        error.message.includes('rate limit')
      ) {
        return NextResponse.json(
          formatError(ERROR_CODES.ERR_UNKNOWN, 'AI service quota exceeded'),
        );
      }
    }

    return NextResponse.json(
      formatError(
        ERROR_CODES.ERR_AI_PARSE_FAILED,
        'Failed to parse recipe with AI',
      ),
    );
  }
}

// Helper function to extract JSON from AI response
function extractJsonFromResponse(text: string): string {
  const cleaned = text
    .replace(/^[\s`]*```(?:json)?/, '')
    .replace(/```[\s`]*$/, '')
    .trim();

  // Try to extract JSON array first (for our ["title", [ingredients]] format)
  const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }

  // If no JSON array found, try to extract JSON object
  const objectMatch = cleaned.match(/\{[\s\S]*\}/);
  if (objectMatch) {
    return objectMatch[0];
  }

  return cleaned;
}

export async function GET() {
  return NextResponse.json({
    message: 'Recipe parsing API endpoint',
    usage: "Send POST request with { text: 'your recipe text here' }",
  });
}
