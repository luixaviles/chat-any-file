import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Req,
  Response,
  UseGuards,
} from '@nestjs/common';

import { ChatService } from '@app/api';
import { ChatContent } from '@app/shared';
import { Readable } from 'stream';

import {
  AnonymousLimitException,
  AnonymousTrackerService,
  FileHandlerService,
  FirebaseAuthGuard,
  ShortQuestionService,
} from '@app/api';
import { ShortQuestionRequest } from '@app/shared';

@Controller()
export class AppController {
  constructor(
    private readonly chatService: ChatService,
    private readonly shortQuestionsService: ShortQuestionService,
    private fileHandlerService: FileHandlerService,
    private anonymousTracker: AnonymousTrackerService
  ) {}

  @Get()
  getData() {
    return 'hello world';
  }

  @Post('short-questions')
  generateShortQuestions(@Body() shortQuestionRequest: ShortQuestionRequest) {
    const { filename, fileType } = shortQuestionRequest;
    if (fileType === 'document') {
      return this.chatService.generateShortQueries(filename);
    }

    return this.shortQuestionsService.getShortQuestions(fileType);
  }

  @UseGuards(FirebaseAuthGuard)
  @Post('chat-stream')
  async chatStream(
    @Body() chatContent: ChatContent,
    @Req() request,
    @Response() response
  ): Promise<void> {
    const [uuid] = chatContent.filename.split('/');
    const { isAnonymous } = request.user;

    if (isAnonymous) {
      request.user.uuid = uuid;
      this.anonymousTracker.trackAnonymousInteraction(uuid);
      if (this.anonymousTracker.hasExceededAnonymousLimit(uuid)) {
        throw new AnonymousLimitException();
      }
    }

    const result = await this.chatService.chatStream(chatContent);
    const readable = Readable.from(
      (async function* () {
        for await (const chunk of result.stream) {
          yield chunk.text();
        }
      })()
    );

    response.setHeader('Content-Type', 'text/plain');
    readable.pipe(response);
  }

  @Delete('delete-file')
  deleteFile(@Body() { filename }: { filename: string }): boolean {
    return this.chatService.clearChatSession(filename);
  }

  @Post('upload-file-url')
  async uploadFileByURL(
    @Body() { url, uuid }: { url: string; uuid: string }
  ): Promise<{ filename: string }> {
    return await this.fileHandlerService.uploadFileByURL({ url, uuid });
  }
}
