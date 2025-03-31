import { create } from "zustand";

type State = {
  isSetupComplete: boolean;
};

type Actions = {
  setIsSetupComplete: () => void;
};

export const useMeetingStore = create<State & Actions>((set) => ({
  isSetupComplete: true,
  setIsSetupComplete: (data?: boolean) =>
    set((state) => ({ isSetupComplete: data ? data : !state.isSetupComplete })),
}));
