
export enum ChatContentState {
    WAITING,
    GENERATING,
    DONE
}

export type ModelChatMode = 'text-only' | 'advanced';

export interface ClientChatContent {
    agent: 'user' | 'model';
    message: string;
    filename?: string;
    state?: ChatContentState;
    options?: {
        mode: ModelChatMode
    }
}