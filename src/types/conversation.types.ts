export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  role: ChatRole;
  content: string;
};

export type ConversationRequest = {
  firstName: string;
  birthName: string;
  history: ChatMessage[];
  message: string;
};
