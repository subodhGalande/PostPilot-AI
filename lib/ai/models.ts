export type AIProvider = "google" | "openai" | "anthropic";

export interface AIModelConfig {
  id: string;
  label: string;
  provider: AIProvider;
  description?: string;
}

export const SUPPORTED_MODELS: AIModelConfig[] = [
  {
    id: "gemma-4-31b-it",
    label: "Gemma 4 (31B)",
    provider: "google",
    description: "Your preferred highly capable model.",
  },
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    provider: "google",
    description: "Fast and efficient for most tasks.",
  },
  {
    id: "gemini-2.0-pro-exp-02-05",
    label: "Gemini 2.0 Pro (Experimental)",
    provider: "google",
    description: "Most capable model for complex reasoning.",
  },
  {
    id: "gemini-1.5-flash",
    label: "Gemini 1.5 Flash",
    provider: "google",
    description: "Balanced performance and speed.",
  },
  {
    id: "gemini-1.5-pro",
    label: "Gemini 1.5 Pro",
    provider: "google",
    description: "High capability for detailed content.",
  },
];

export const DEFAULT_MODEL = SUPPORTED_MODELS[0];

export function getModelById(id: string) {
  return SUPPORTED_MODELS.find((m) => m.id === id) || DEFAULT_MODEL;
}
