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
    email: "idowudanielayotunde@gmail.com",
    image:
      "http://res.cloudinary.com/hayotunday/image/upload/v1737985601/qtfx1jg2u1bxatoizyol.png",
    userid: "zVyAJLOQQwfcRQHfZon1N2641Pj2",
    username: "Hayotunday",
  },
  // user: {
  //   userid: null,
  //   email: null,
  //   username: null,
  //   image: null,
  // },
  isLoggedIn: true,
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
