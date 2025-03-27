import {
  GenerativeModel,
  GoogleGenerativeAI,
  Schema,
  SchemaType,
} from '@google/generative-ai';
import { Injectable } from '@nestjs/common';

const GEMINI_2_LITE = 'gemini-2.0-flash';
const GEMINI_2_TOKEN_LIMIT = 1048576;
const DEFAULT_MODEL_NAME = GEMINI_2_LITE;

const SHORT_QUESTIONS_SCHEMA: Schema = {
  description: 'List of short questions based on a text context',
  type: SchemaType.OBJECT,
  properties: {
    questions: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          question: {
            type: SchemaType.STRING,
            description: 'short question',
            nullable: false,
          },
          questionDetail: {
            type: SchemaType.STRING,
            description: 'question detail',
            nullable: false,
          },
        },
        required: ['question', 'questionDetail'],
      },
    },
  },
  required: ['questions']
};
@Injectable()
export class ModelProviderService {
  chatModel: GenerativeModel;
  shortQuestionsModel: GenerativeModel;

  constructor() {
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    this.chatModel = genAI.getGenerativeModel({
      model: DEFAULT_MODEL_NAME,
      systemInstruction: `You are an experienced document researcher,
  expert at interpreting and answering questions based on a provided document content.
  Answer the user's question to the best of your ability. Be verbose!
  If you cannot answer a question, just return: "I cannot answer that question"`
    });
    this.shortQuestionsModel = genAI.getGenerativeModel({
      model: DEFAULT_MODEL_NAME,
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: SHORT_QUESTIONS_SCHEMA,
      },
    });
  }

  getChatModel(): GenerativeModel {
    return this.chatModel;
  }

  getShorQuestionsModel(): GenerativeModel {
    return this.shortQuestionsModel;
  }
}
