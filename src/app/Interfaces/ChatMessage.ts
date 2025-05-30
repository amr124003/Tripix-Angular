export interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'driver';
    timestamp: Date;
    isLoading?: boolean;
  }