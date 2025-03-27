import { Injectable } from '@nestjs/common';

import { initializeApp, applicationDefault, App } from 'firebase-admin/app';
import { getStorage } from 'firebase-admin/storage';

import PdfParse from 'pdf-parse/lib/pdf-parse';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { InlineDataPart } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import { isSupportedContentType } from '@app/shared';

const GOOGLE_CLOUD_STORAGE_BUCKET = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;

@Injectable()
export class FileHandlerService {
  app: App;
  fileManager: GoogleAIFileManager;

  constructor() {
    this.app = initializeApp(
      {
        credential: applicationDefault(),
      },
      'file-handler'
    );
    this.fileManager = new GoogleAIFileManager(process.env.API_KEY);
  }

  async getTextContent(filePath: string): Promise<string> {
    const fileRef = getStorage(this.app)
      .bucket(GOOGLE_CLOUD_STORAGE_BUCKET)
      .file(`docs/${filePath}`);

    const [pdfBytesBuffer] = await fileRef.download();
    const result: PdfParse.Result = await PdfParse(pdfBytesBuffer);
    return result.text as string;
  }

  async getInlineFileData(filePath: string): Promise<InlineDataPart> {
    const fileRef = getStorage(this.app)
      .bucket(GOOGLE_CLOUD_STORAGE_BUCKET)
      .file(`docs/${filePath}`);

    const [[metadata], [bytesBuffer]] = await Promise.all([
      fileRef.getMetadata(),
      fileRef.download(),
    ]);
    const base64Data = bytesBuffer.toString('base64');

    return {
      inlineData: {
        mimeType: metadata.contentType,
        data: base64Data,
      },
    };
  }

  async uploadFileByURL({
    url,
    uuid,
  }: {
    url: string;
    uuid: string;
  }): Promise<{filename: string}> {
    const urlObj = new URL(url);
    const filename = urlObj.pathname.split('/').pop();
    const fileRef = getStorage(this.app)
      .bucket(GOOGLE_CLOUD_STORAGE_BUCKET)
      .file(`docs/${uuid}/${filename}`);

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType) {
      throw new Error('Failed to get MIME type from response headers');
    }

    if(!isSupportedContentType(contentType)) {
      throw new Error('Content Type is not supported: ' + contentType);
    }
    
    await new Promise((resolve, reject) => {
      const uuid = uuidv4();
      const writeStream = fileRef.createWriteStream({
        metadata: {
          contentType,
          // Issue Firebase Console: https://github.com/firebase/firebase-admin-node/issues/694#issuecomment-583141427
          metadata: {
            firebaseStorageDownloadTokens: uuidv4(),
          },
        },
      });

      response.body.pipe(writeStream).on('error', reject).on('finish', resolve);
    });

    return {
      filename
    };
  }
}
