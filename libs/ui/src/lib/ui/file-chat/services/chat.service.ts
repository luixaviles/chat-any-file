import { inject, Injectable } from '@angular/core';
import {
  HttpClient
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { FileType, ShortQuestions } from '@app/shared';
import { environment } from '@lib/environments';
import { ClientChatContent } from '../types/client-chat-content';

const decoder = new TextDecoder();
function readChunks(
  reader: ReadableStreamDefaultReader
): AsyncIterable<string> {
  return {
    async *[Symbol.asyncIterator]() {
      let readResult = await reader.read();
      while (!readResult.done) {
        yield decoder.decode(readResult.value);
        readResult = await reader.read();
      }
    },
  };
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private httpClient = inject(HttpClient);

  chat(chatContent: ClientChatContent): Observable<ClientChatContent> {
    const apiHost = environment.apiHost;
    return this.httpClient.post<ClientChatContent>(
      `${apiHost}/chat`,
      chatContent
    );
  }

  deleteSession(filename: string): Observable<boolean> {
    const apiHost = environment.apiHost;
    return this.httpClient.delete<boolean>(`${apiHost}/delete-file`, {
      body: {
        filename,
      },
    });
  }

  generateShortQuestions(
    filename: string,
    fileType: FileType
  ): Observable<ShortQuestions> {
    const apiHost = environment.apiHost;
    return this.httpClient.post<ShortQuestions>(`${apiHost}/short-questions`, {
      filename,
      fileType,
    });
  }



  chatStream(chatContent: ClientChatContent): Observable<string> {
    const apiHost = environment.apiHost;

    return new Observable<string>((observer) => {
      const controller = new AbortController();

      fetch(`${apiHost}/chat-stream`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(chatContent),
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) {
            const errorData = await response.json();
            throw errorData;
          }
          
          const reader = response.body?.getReader();
          if (!reader) {
            observer.complete();
            return;
          }

          try {
            for await (const chunk of readChunks(reader)) {
              observer.next(chunk);
            }
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        })
        .catch((error) => observer.error(error));

      // Cleanup when unsubscribed
      return () => {
        controller.abort();
      };
    });
  }
}
