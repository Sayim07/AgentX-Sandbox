import Groq from "groq-sdk";

export interface AgentDecision {
  action: "buy" | "sell" | "hire_service" | "register_service" | "hold";
  quantity?: number;
  price?: number;
  serviceId?: string;
  serviceType?: string;
  reasoning: string;
}

const groqApiKey = process.env.GROQ_API_KEY;
const groq = groqApiKey && groqApiKey !== "gsk_your_groq_api_key_here"
  ? new Groq({ apiKey: groqApiKey })
  : null;

/**
 * Call Groq API (Llama 3) for agent decision-making given market state and persona.
 * Enforces a strict timeout to ensure zero latency impact on simulation ticks.
 */
export async function getGroqDecision(
  persona: string,
  agentName: string,
  walletBalance: number,
  marketPrice: number,
  orderBookState: { bidsCount: number; asksCount: number; bestBid?: number; bestAsk?: number },
  availableServices: { id: string; serviceType: string; price: number }[],
  timeoutMs: number = 1500
): Promise<AgentDecision | null> {
  if (!groq) {
    return null; // Fallback to rule engine if API key missing
  }

  const prompt = `You are an autonomous AI agent in a simulated economy named AgentX Sandbox.
Persona: ${persona}
Agent Name: ${agentName}
CRED Balance: ${walletBalance}
Current Asset Market Price: ${marketPrice} CRED
Order Book Bids: ${orderBookState.bidsCount} (Best Bid: ${orderBookState.bestBid ?? 'None'}), Asks: ${orderBookState.asksCount} (Best Ask: ${orderBookState.bestAsk ?? 'None'})
Available Services: ${JSON.stringify(availableServices)}

Generate your next economic decision for this tick.
Respond strictly in valid JSON matching this schema:
{
  "action": "buy" | "sell" | "hire_service" | "hold",
  "quantity": number (1 to 100),
  "price": number (float around market price),
  "serviceId": string (if hiring service),
  "reasoning": string (short 1-sentence reasoning)
}`;

  try {
    const apiPromise = groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: "json_object" },
    });

    const timeoutPromise = new Promise<null>((resolve) =>
      setTimeout(() => resolve(null), timeoutMs)
    );

    const response = (await Promise.race([apiPromise, timeoutPromise])) as any;

    if (!response || !response.choices || !response.choices[0]?.message?.content) {
      return null;
    }

    const content = response.choices[0].message.content;
    const parsed = JSON.parse(content) as AgentDecision;
    return parsed;
  } catch (error) {
    // Quietly fallback on rate limit or API error
    return null;
  }
}
