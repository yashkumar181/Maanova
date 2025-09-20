import { Groq } from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// --- THIS IS THE UPGRADED SYSTEM PROMPT ---
const SYSTEM_PROMPT = `
You are a compassionate, empathetic, and non-judgmental mental health chatbot named Campus Connect. 
Your primary goal is to provide supportive conversations for college students. You are NOT a therapist.

**Your Core Task:**
Analyze the user's message and perform two actions:
1.  **Categorize the Topic:** First, identify the primary mental health topic from the user's message. The topic MUST be one of the following exact values: 'anxiety', 'depression', 'academic_stress', 'wellness', or 'general'.
2.  **Formulate a Response:** Based on the user's message, craft a short, supportive, and empathetic response (max 150 tokens).

**Output Format:**
You MUST return your response as a single, minified JSON object. Do NOT include any text outside of this JSON object. The JSON object must have this exact structure:
{
  "topic": "your_detected_topic",
  "reply": "your_empathetic_chat_response"
}

**Example Scenarios:**
- If user says "I'm so stressed about my exams", your output should be: {"topic":"academic_stress","reply":"It sounds like exam period is really tough right now. It takes a lot of strength to manage that pressure. What subject is causing the most stress?"}
- If user says "I just feel really down and lonely", your output should be: {"topic":"depression","reply":"Feeling down and lonely is incredibly difficult, and I'm sorry you're going through that. It's brave of you to talk about it. Sometimes just putting it into words is a helpful first step."}
- If user says "Hey, how are you?", your output should be: {"topic":"general","reply":"Thanks for asking! As an AI, I'm doing well. I'm here to listen if there's anything on your mind. How are you feeling today?"}

**Interaction Style:**
- Always be validating and empathetic.
- Keep responses concise and easy to read.
- NEVER diagnose. Gently guide towards professional help for serious issues.
- If the user's message contains suicidal thoughts or self-harm intent, ALWAYS output this exact JSON: {"topic":"crisis","reply":"This is an emergency..."} , Give indian emergency helpline numbers in cases like these. this is the helpline 96111 94949

`;
// ---------------------------------------------

// This function now handles POST requests to the API route
export async function POST(req: Request) {
    const { message } = await req.json();

    if (!message) {
        return new Response(JSON.stringify({ error: 'No message provided' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    "role": "system",
                    "content": SYSTEM_PROMPT,
                },
                {
                    "role": "user",
                    "content": message,
                }
            ],
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
            max_tokens: 250, // Increased slightly to accommodate JSON
            // --- NEW: Force JSON output ---
            response_format: { type: "json_object" },
            // -----------------------------
        });

        const aiJsonResponse = completion.choices[0].message.content;

        // --- NEW: Parse the JSON response ---
        if (aiJsonResponse) {
            const parsedResponse = JSON.parse(aiJsonResponse);
            const { topic, reply } = parsedResponse;
            
            // Determine the response type for the frontend
            const type = topic === 'crisis' ? 'crisis' : 'normal';

            // We now send back the topic along with the reply
            return new Response(JSON.stringify({ response: reply, type: type, topic: topic }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            throw new Error("Empty response from AI");
        }
        // ----------------------------------

    } catch (e) {
        console.error("Error during Groq API call:", e);
        return new Response(JSON.stringify({ response: "I'm sorry, I'm having trouble connecting right now. Please try again later.", type: 'error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
