import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  ChatService,
  FileHandlerService,
  ModelProviderService,
  SessionService,
  ShortQuestionService,
} from '@app/api';
import { AppController } from './app.controller';

import { ScheduleModule } from '@nestjs/schedule';
import * as admin from 'firebase-admin';

@Module({
  imports: [ConfigModule.forRoot(), ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [
    ChatService,
    ShortQuestionService,
    FileHandlerService,
    SessionService,
    ModelProviderService,
  ],
})
export class AppModule {
  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }
}
