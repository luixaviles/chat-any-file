import { ShortQuestions } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { AppSession } from '../model/app-session';

@Injectable()
export class SessionService {
    sessions = new Map<string, AppSession>();
    shortQuestions = new Map<string, ShortQuestions>();

    getAppSession(id: string): AppSession {
        return this.sessions.get(id);
    }

    saveAppSession(id: string, appSession: AppSession): void {
        this.sessions.set(id, appSession);
    }

    deleteAppSession(id: string): boolean {
        return this.sessions.delete(id);
    }

    saveShorQuestions(id: string, shortQuestions: ShortQuestions): void {
        this.shortQuestions.set(id, shortQuestions);
    }

    getShortQuestions(id: string, count = 5): ShortQuestions | undefined {
        const shortQuestions = this.shortQuestions.get(id);
        if(!shortQuestions) {
            return undefined;
        }

        if(count < shortQuestions.questions.length) {
            const randomQuestions = shortQuestions.questions.sort(() => Math.random() - 0.5);
            return {questions: randomQuestions.slice(0, count)};
        }

        return shortQuestions;

    }
}
