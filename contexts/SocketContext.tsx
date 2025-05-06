import { createContext, ReactNode, useContext } from "react";
import socket, { Socket } from "@/lib/socket";

interface iSocketContext {
  socket: Socket;
}

interface SocketContextProps {
  children: ReactNode;
}

export const SocketContext = createContext<iSocketContext | null>(null);

export const SocketContextProvider = ({ children }: SocketContextProps) => {
  return (
    <SocketContext.Provider
      value={{
        socket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketContextProvider");
  }
  return context;
};
