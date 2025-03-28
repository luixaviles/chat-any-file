export type ModelChatMode = 'text-only' | 'advanced';
export interface ChatContent {
    agent: 'user' | 'model';
    message: string;
    filename?: string;
    options?: {
        mode: ModelChatMode
    }
}


export type FileType = 'image' | 'video' | 'audio' | 'document';

const typeMap: { [key: string]: FileType } = {
    'image/': 'image',
    'video/': 'video',
    'audio/': 'audio',
    'application/': 'document',
    'text/': 'document'
};


/**
 * Determines the file type based on the provided content type.
 *
 * @param contentType - The MIME type of the content, which can be a string or undefined.
 * @returns The corresponding FileType if a match is found in the typeMap, otherwise undefined.
 */
export function getFileType(contentType: string | undefined): FileType | undefined {
    if(!contentType) {
        return undefined;
    }
    
    for (const key in typeMap) {
        if (contentType.startsWith(key)) {
            return typeMap[key];
        }
    }

    return undefined;
}

export type ShortQuestion = {
  question: string,
  questionDetail: string
}

export interface ShortQuestions {
  questions: ShortQuestion[];
}

export type ShortQuestionRequest = {
  filename: string,
  fileType: FileType
}