import { GoogleGenAI, Type, FunctionDeclaration, Chat } from "@google/genai";
import { createLead } from "./db";

// API Key is injected by AI Studio
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const submitLeadDeclaration: FunctionDeclaration = {
  name: "submitLead",
  description: "Submit the collected lead information to the CRM. Only call this when you have successfully collected name, phone, vehicle_interest, budget, timeline, and payment_type from the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "The full name of the user." },
      phone: { type: Type.STRING, description: "The phone number of the user." },
      vehicle_interest: { type: Type.STRING, description: "The specific vehicle or type of vehicle the user is interested in." },
      budget: { type: Type.STRING, description: "The budget range for the vehicle." },
      timeline: { type: Type.STRING, description: "When the user plans to buy the vehicle." },
      payment_type: { type: Type.STRING, description: "Cash or financing." },
      status: { type: Type.STRING, description: "Evaluate the lead's urgency: 'Hot' (ready to buy soon), 'Warm' (exploring options), or 'Cold' (just looking)." }
    },
    required: ["name", "phone", "vehicle_interest", "budget", "timeline", "payment_type", "status"]
  }
};

export class SalesAgent {
  private chat: Chat;
  private userId: string;
  private onLeadSubmitted: () => void;

  constructor(userId: string, onLeadSubmitted: () => void) {
    this.userId = userId;
    this.onLeadSubmitted = onLeadSubmitted;
    
    this.chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are an AI sales assistant for an automotive dealership CRM called CV CREATION CRM. Your goal is to collect exactly the following information from the user: Full name, Phone number, Vehicle interest, Budget range, Buying timeline, Payment type (cash or financing). 

CRITICAL RULES:
1. Ask exactly ONE question at a time.
2. Keep responses short, natural, and conversational like a real sales assistant.
3. Do NOT overwhelm the user with multiple questions in one message.
4. Once you have gathered ALL the required information, you MUST call the "submitLead" function to save the lead to the CRM.
5. After calling submitLead, summarize the information to the user and say 'I will pass this to our sales team and they will be in touch shortly.'`,
        tools: [{ functionDeclarations: [submitLeadDeclaration] }],
        temperature: 0.7,
      }
    });
  }

  async sendMessage(message: string): Promise<string> {
    try {
      const response = await this.chat.sendMessage({ message });
      
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === 'submitLead') {
            const args = call.args as any;
            await createLead({
              userId: this.userId,
              name: args.name,
              phone: args.phone,
              vehicle_interest: args.vehicle_interest,
              budget: args.budget,
              timeline: args.timeline,
              payment_type: args.payment_type,
              status: args.status,
              pipeline_stage: "New Lead",
              createdAt: Date.now(),
              updatedAt: Date.now()
            }, { uid: this.userId }); // Mock user object for permissions bypass since we know who is creating
            
            this.onLeadSubmitted();
            
            // Provide tool response back to the model acknowledging success
            const followup = await this.chat.sendMessage({
              message: [{
                functionResponse: {
                  id: call.id,
                  name: call.name,
                  response: { success: true }
                }
              } as any]
            });
            return followup.text || "Thank you! I have passed your information to our sales team.";
          }
        }
      }

      return response.text || "I'm sorry, I couldn't understand that.";
    } catch (error) {
      console.error("Agent error:", error);
      return "Sorry, I encountered an error connecting to our system. Please try again later.";
    }
  }
}
