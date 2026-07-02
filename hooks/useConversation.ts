import { useConversationStore } from "@/stores/conversation.store";

export function useConversation() {
  return useConversationStore();
}
