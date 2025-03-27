import { Injectable } from '@nestjs/common';
import { FILE_TYPE_PROMPTS } from './filetype-prompts';
import { FileType, ShortQuestions } from '@app/shared';

@Injectable()
export class ShortQuestionService {
    getShortQuestions(fileType: FileType): ShortQuestions {
        return {
            questions: FILE_TYPE_PROMPTS[fileType]
        };
    }
}