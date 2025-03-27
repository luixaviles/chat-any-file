export function extractJsonFromMarkdown(markdown: string): string | null {
    const regex = /```json([\s\S]*?)```/gm;
    const match = regex.exec(markdown);
    if (match) {
      return match[1].trim();
    } else {
      return null;
    }
  }