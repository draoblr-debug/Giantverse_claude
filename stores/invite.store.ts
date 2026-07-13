import { create } from "zustand";

// Pending Compatibility invite — set when someone arrives at /compatibility
// via a friend's share link (?invite=<Legacy Name>), before they've gone
// through their own /birth -> /reveal ritual yet. Carried in memory only
// (matches assessment.store/scenario.store — no sessionStorage), so it
// survives client-side navigation through the whole ritual and lands the
// friend pre-filled against their inviter once they reach /ending.

export interface PendingInvite {
  inviterName: string; // full Legacy Name, e.g. "Teyuka Kanryō"
  inviterArchetypeLabel: string; // e.g. "Bureaucrat" — for display only
}

interface InviteStore {
  pending: PendingInvite | null;
  setPending: (invite: PendingInvite) => void;
  clearPending: () => void;
}

export const useInviteStore = create<InviteStore>((set) => ({
  pending: null,
  setPending: (pending) => set({ pending }),
  clearPending: () => set({ pending: null }),
}));
