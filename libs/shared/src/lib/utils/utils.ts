// Supported Document Types:
// PDF - application/pdf
// JavaScript - application/x-javascript, text/javascript
// Python - application/x-python, text/x-python
// TXT - text/plain
// HTML - text/html
// CSS - text/css
// Markdown - text/md
// CSV - text/csv
// XML - text/xml
// RTF - text/rtf

// Supported Image Types:
// PNG - image/png
// JPEG - image/jpeg
// WEBP - image/webp
// HEIC - image/heic
// HEIF - image/heif

// Supported Video formats:
// video/mp4
// video/mpeg
// video/mov
// video/avi
// video/x-flv
// video/mpg
// video/webm
// video/wmv
// video/3gpp

// Supported Audio Formats:
// WAV - audio/wav
// MP3 - audio/mp3
// AIFF - audio/aiff
// AAC - audio/aac
// OGG Vorbis - audio/ogg
// FLAC - audio/flac

const contentTypesByFileType = {
  document: [
      'application/pdf',
      'text/plain',
      // 'application/x-javascript',
      // 'text/javascript',
      // 'application/x-python',
      // 'text/x-python',
      // 'text/html',
      // 'text/css',
      // 'text/md',
      // 'text/csv',
      // 'text/xml',
      // 'text/rtf'
  ],
  image: [
      'image/png',
      'image/jpeg',
      'image/webp',
      // 'image/heic',
      // 'image/heif'
  ],
  video: [
      'video/mp4',
      'video/mpeg',
      'video/mov',
      'video/avi',
      // 'video/mpg',
      // 'video/webm',
      // 'video/3gpp',
      // 'video/x-flv',
      // 'video/wmv',
  ],
  audio: [
      'audio/mp3',
      'audio/wav',
      'audio/ogg',
      // 'audio/aiff',
      // 'audio/aac',
      // 'audio/flac'
  ]
};

export const supportedContentTypes: string[] = [
  ...contentTypesByFileType.document,
  ...contentTypesByFileType.image,
  ...contentTypesByFileType.video,
  ...contentTypesByFileType.audio
];

/**
 * Checks if the provided MIME type is supported.
 *
 * @param mimeType - The MIME type to check.
 * @returns `true` if the MIME type is supported, `false` otherwise.
 */
export function isSupportedContentType(mimeType: string): boolean {
  return supportedContentTypes.includes(mimeType);
}