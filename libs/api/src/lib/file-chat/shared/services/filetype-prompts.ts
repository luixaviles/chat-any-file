import { ShortQuestion } from '@app/shared';

export const FILE_TYPE_PROMPTS: { [key: string]: ShortQuestion[] } = {
  document: [],
  image: [
    {
      question: 'Descriptive understanding',
      questionDetail:
        'Describe the image. Include information about the objects present, the setting and the lighting.',
    },
    {
      question: 'Identify Objects',
      questionDetail: `List all the objects you can identify in this image. Be as specific as possible (e.g., instead of 'bird', say 'American Robin').`,
    },
    {
      question: 'Use the image for creative writing',
      questionDetail: `Write a short story or descriptive passage inspired by this image`,
    },
    {
      question: 'alt text for visually impaired users',
      questionDetail: `Write a short alt text description for this image. Focus on the most important elements to convey the image's content to someone who cannot see it.`,
    },

  ],
  video: [
    {
      question: 'Describe the video scenes',
      questionDetail:
        'Describe the video scene-by-scene, noting the setting, main actions occurring, and identifying all recognizable objects and people in each scene',
    },
    {
      question: 'Summary of the video',
      questionDetail: `Provide a concise summary of the video's main events and plot points (if there is a narrative)`,
    },
    {
      question: 'Analyze the emotions in the video',
      questionDetail: `Analyze the emotions expressed by the individuals in the video (both visually and audibly). Identify the overall sentiment conveyed in the video (positive, negative, neutral)`,
    },
    {
      question: 'Transcribe spoken dialogue',
      questionDetail: `Transcribe all spoken dialogue and audio content in the video. Then, extract the most frequent and significant keywords that accurately reflect the video's topics and themes.`,
    },
  ],
  audio: [
    {
      question: 'Summary of the audio',
      questionDetail: 'Summarize the main points and topics discussed in the audio file',
    },
    {
      question: 'Transcribe',
      questionDetail: `Transcribe the entire audio file verbatim. Identify each speaker and question their contributions clearly. Include timestamps for each speaker's turns`,
    },
    {
      question: 'Sentiment analysis',
      questionDetail: `Analyze the sentiment expressed in the audio file. Identify any instances of strong emotion (e.g., joy, anger, sadness) and provide context for those moments.`,
    },
    {
      question: 'Keyword Extraction',
      questionDetail: `Extract the most frequent and significant keywords and phrases from the audio transcription. Identify the main topics discussed in the audio based on the keywords and their co-occurrence`,
    },
  ],
};
