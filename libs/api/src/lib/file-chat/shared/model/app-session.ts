import { ChatSession } from '@google/generative-ai';
import { ModelChatMode } from '@app/shared';

export interface AppSession {
    chatSession: ChatSession;
    options : {
        mode: ModelChatMode
    }
}