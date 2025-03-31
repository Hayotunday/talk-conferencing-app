import { create } from "zustand";

export interface userInterface {
  userid: string | null;
  email: string | null;
  username: string | null;
  image: string | null;
}

type State = {
  user: userInterface;
  isLoggedIn: boolean;
};

type Actions = {
  update: (data: userInterface) => void;
  login: () => void;
  logout: () => void;
};

export const useUserStore = create<State & Actions>((set) => ({
  user: {
    email: null,
    image: null,
    userid: null,
    username: null,
  },
  isLoggedIn: false,
  update: (data: userInterface) =>
    set((state) => ({ user: { ...state.user, ...data } })),
  login: () => set(() => ({ isLoggedIn: true })),
  logout: () =>
    set(() => ({
      isLoggedIn: false,
      user: {
        userid: null,
        email: null,
        username: null,
        image: null,
      },
    })),
}));
