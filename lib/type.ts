export interface UserJoinedData {
  userId: string;
  socketId: string;
  username?: string; // Display name
}

export interface CallData {
  from: string;
  offer: RTCSessionDescriptionInit;
}

export interface CallAcceptedData {
  from: string;
  answer: RTCSessionDescriptionInit;
}

export interface RemoteStreamData {
  stream: MediaStream;
  appUserId: string; // Application-specific user ID from your system
  username?: string; // Display name
}

export interface PeerData {
  from: string;
  offer: RTCSessionDescriptionInit;
}

export interface PeerFinalData {
  answer: RTCSessionDescriptionInit;
}
