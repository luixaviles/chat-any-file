import { Injectable } from '@nestjs/common';

import { ChatContent, ModelChatMode, ShortQuestions } from '@app/shared';
import {
  ChatSession,
  Content,
  GenerateContentStreamResult,
  GenerativeModel,
} from '@google/generative-ai';
import { Readable } from 'stream';
import { FileHandlerService } from '../shared/services/file-handler.service';
import { ModelProviderService } from '../shared/services/model-provider.service';
import { SessionService } from '../shared/services/session.service';
const SHORT_QUESTIONS_SIZE = 5;
@Injectable()
export class ChatService {
  chatModel: GenerativeModel;

  constructor(
    private fileHandlerService: FileHandlerService,
    private sessionService: SessionService,
    private modelProvider: ModelProviderService
  ) {
    this.chatModel = this.modelProvider.getChatModel();
  }

  async generateShortQueries(filename: string): Promise<ShortQuestions> {
    const cachedShortQuestions = this.sessionService.getShortQuestions(
      filename,
      SHORT_QUESTIONS_SIZE
    );
    if (cachedShortQuestions !== undefined) {
      return cachedShortQuestions;
    }

    const promptTemplate = `You are an experienced document researcher,
  expert at interpreting and generating queries based on a provided document content.
  Using the below provided context,
  generate 10 short questions(each of them of less than 10 words) a user can do about the document content
  `;

    const model = this.modelProvider.getShorQuestionsModel();
    const { inlineData } = await this.fileHandlerService.getInlineFileData(
      filename
    );
    const generateContentResult = await model.generateContent([
      {
        inlineData,
      },
      {
        text: promptTemplate,
      },
    ]);

    const shortQuestionsString = await generateContentResult.response.text();
    const shortQuestions: ShortQuestions = JSON.parse(shortQuestionsString);
    this.sessionService.saveShorQuestions(filename, shortQuestions);
    return this.sessionService.getShortQuestions(
      filename,
      SHORT_QUESTIONS_SIZE
    );
  }

  async chatStream(
    chatContent: ChatContent
  ): Promise<GenerateContentStreamResult> {
    const { message, filename, options } = chatContent;
    const { mode } = options;

    let chatSession = this.sessionService.getAppSession(filename)?.chatSession;

    if (
      !chatSession ||
      mode !== this.sessionService.getAppSession(filename)?.options.mode
    ) {
      this.clearChatSession(filename);
      chatSession = await this.initializeChatSession(filename, mode);
    }

    return chatSession.sendMessageStream(message);
  }

  private async chatStreamTest(): Promise<Readable> {
    async function* generateChunks() {
      const mockResponse = `Here is a simulated response broken into paragraphs.
      This is the second paragraph with some additional context and information.
      And finally, this is the third paragraph wrapping up the response.`;

      const chunks = mockResponse.split('\n\n');
      for (const chunk of chunks) {
        await new Promise((resolve) => setTimeout(resolve, 500));
        yield chunk + '\n\n';
      }
    }

    const result = await generateChunks();
    return Readable.from(result);
  }

  clearChatSession(filename: string) {
    return this.sessionService.deleteAppSession(filename);
  }

  private async readFileContentAsText(filename: string): Promise<string> {
    return await this.fileHandlerService.getTextContent(filename);
  }

  private async initializeChatSession(
    filename: string,
    mode: ModelChatMode
  ): Promise<ChatSession> {
    const model = this.modelProvider.getChatModel();
    const history = await this.getInitialChatHistory(filename, mode);
    const chatSession = model.startChat({
      history,
    });
    this.sessionService.saveAppSession(filename, {
      chatSession,
      options: {
        mode,
      },
    });

    return chatSession;
  }

  private async getInitialChatHistory(
    filename: string,
    mode: ModelChatMode
  ): Promise<Content[]> {
    const history: Content[] = [];

    switch (mode) {
      case 'advanced':
        {
          const { inlineData } =
            await this.fileHandlerService.getInlineFileData(filename);
          history.push({
            role: 'user',
            parts: [{ inlineData }],
          });
        }
        break;

      case 'text-only':
        {
          const text = await this.readFileContentAsText(filename);
          history.push({
            role: 'user',
            parts: [{ text }],
          });
        }
        break;

      default:
        throw new Error(`Unsupported mode: ${mode}`);
    }

    history.push({
      role: 'model',
      parts: [{ text: 'What would you like to ask?' }],
    });

    return history;
  }
}
