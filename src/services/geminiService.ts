import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface CampaignInput {
  name: string;
  position: string;
  area: string;
  message: string;
  pillars: string;
  date: string;
  contact: string;
  tone: string;
}

export interface CampaignOutput {
  mainPoster: {
    slogan: string;
    candidateName: string;
    cta: string;
  };
  socialMediaPosts: {
    pillar: string;
    content: string;
  }[];
  whatsappFlyer: {
    text: string;
  };
  eventAnnouncement: {
    title: string;
    details: string;
    urgency: string;
  };
  votingDayMessage: {
    content: string;
  };
}

export async function generateSlogans(message: string, tone: string): Promise<string[]> {
  const prompt = `
    You are a professional political campaign strategist.
    Generate 5 strong, short, and memorable campaign slogans based on this core message: "${message}"
    The tone should be: ${tone}
    The slogans should be suitable for a UPND (United Party for National Development) candidate in Zambia.
    Return only a JSON array of strings.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
    },
  });

  return JSON.parse(response.text || "[]");
}

export async function generateCampaignPack(input: CampaignInput & { selectedSlogan?: string }): Promise<CampaignOutput> {
  const prompt = `
    You are a professional political campaign designer and strategist.
    Generate a complete campaign content pack for the following candidate:
    
    Candidate Name: ${input.name}
    Position: ${input.position}
    Constituency/Area: ${input.area}
    Core Message: ${input.message}
    Selected Slogan: ${input.selectedSlogan || "Generate a new one based on the message"}
    Key Pillars: ${input.pillars}
    Election Date: ${input.date}
    Contact Info: ${input.contact}
    Tone: ${input.tone}
    
    The branding is UPND (United Party for National Development).
    
    Requirements:
    1. MAIN POSTER TEXT: Use the Selected Slogan (if provided), Candidate name prominently styled, Call to action.
    2. 3 SOCIAL MEDIA POSTS: Short, punchy, emotional, each focused on one key pillar.
    3. 1 WHATSAPP FLYER VERSION: Minimal text, easy to read.
    4. 1 EVENT ANNOUNCEMENT: Rally style messaging, include date and urgency.
    5. 1 VOTING DAY MESSAGE: High urgency, motivational tone.
    
    Style: Simple, powerful language, emotionally engaging, consistent messaging.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mainPoster: {
            type: Type.OBJECT,
            properties: {
              slogan: { type: Type.STRING },
              candidateName: { type: Type.STRING },
              cta: { type: Type.STRING },
            },
            required: ["slogan", "candidateName", "cta"],
          },
          socialMediaPosts: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                pillar: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ["pillar", "content"],
            },
          },
          whatsappFlyer: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
            },
            required: ["text"],
          },
          eventAnnouncement: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              details: { type: Type.STRING },
              urgency: { type: Type.STRING },
            },
            required: ["title", "details", "urgency"],
          },
          votingDayMessage: {
            type: Type.OBJECT,
            properties: {
              content: { type: Type.STRING },
            },
            required: ["content"],
          },
        },
        required: ["mainPoster", "socialMediaPosts", "whatsappFlyer", "eventAnnouncement", "votingDayMessage"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
