import { SubtitleEntry } from '../types';

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

export const parseTimeToSeconds = (timeStr: string): number => {
  const parts = timeStr.split(':').map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  return 0;
};

export const formatSubtitleText = (text: string): string => {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
};

export function mergeSubtitlesBySentences(subtitles: SubtitleEntry[]): SubtitleEntry[] {
  if (!subtitles || subtitles.length === 0) {
    return [];
  }

  const processedSubtitles: SubtitleEntry[] = [];
  let currentGroup: SubtitleEntry[] = [];
  let groupStartTime = 0;
  let groupEndTime = 0;

  for (let i = 0; i < subtitles.length; i++) {
    const subtitle = subtitles[i];
    
    if (currentGroup.length === 0) {
      groupStartTime = subtitle.startTime;
    }
    currentGroup.push(subtitle);
    groupEndTime = subtitle.endTime;

    // Check if current text ends with sentence-ending punctuation
    const combinedText = currentGroup.map(s => s.text.trim()).join(' ');
    const endsWithSentenceEnd = /[.!?]$/.test(combinedText.trim());
    
    // Also check if we should finalize (end of array or next subtitle starts with capital)
    const nextSubtitle = subtitles[i + 1];
    const isLastSubtitle = i === subtitles.length - 1;
    const nextStartsWithCapital = nextSubtitle && /^[A-Z]/.test(nextSubtitle.text.trim());
    
    const shouldFinalize = endsWithSentenceEnd || isLastSubtitle || nextStartsWithCapital;

    if (shouldFinalize) {
      const mergedText = currentGroup.map(s => s.text.trim()).join(' ');
      
      processedSubtitles.push({
        id: processedSubtitles.length + 1,
        startTime: groupStartTime,
        endTime: groupEndTime,
        text: mergedText.trim()
      });

      currentGroup = [];
    }
  }

  // Handle any remaining subtitles
  if (currentGroup.length > 0) {
    const mergedText = currentGroup.map(s => s.text.trim()).join(' ');
    
    processedSubtitles.push({
      id: processedSubtitles.length + 1,
      startTime: groupStartTime,
      endTime: groupEndTime,
      text: mergedText.trim()
    });
  }

  return processedSubtitles;
}

export function regenerateTranscript(subtitles: SubtitleEntry[]): SubtitleEntry[] {
  return mergeSubtitlesBySentences(subtitles);
}

export function getTranscriptPreview(subtitles: SubtitleEntry[]): string {
  if (!subtitles || subtitles.length === 0) {
    return 'No transcript available';
  }

  const previewLength = 3;
  const preview = subtitles
    .slice(0, previewLength)
    .map(s => s.text)
    .join(' ');
  
  const ellipsis = subtitles.length > previewLength ? '...' : '';
  return preview + ellipsis;
}

export function countWords(subtitles: SubtitleEntry[]): number {
  return subtitles.reduce((total, subtitle) => {
    return total + subtitle.text.trim().split(/\s+/).length;
  }, 0);
}

export function getTranscriptStats(subtitles: SubtitleEntry[]): {
  totalSentences: number;
  totalWords: number;
  averageWordsPerSentence: number;
  shortSentences: number;
  longSentences: number;
} {
  const totalSentences = subtitles.length;
  const totalWords = countWords(subtitles);
  const averageWordsPerSentence = totalSentences > 0 ? totalWords / totalSentences : 0;
  
  const shortSentences = subtitles.filter(s => 
    s.text.trim().split(/\s+/).length < 20
  ).length;
  
  const longSentences = subtitles.filter(s => 
    s.text.trim().split(/\s+/).length >= 20
  ).length;

  return {
    totalSentences,
    totalWords,
    averageWordsPerSentence,
    shortSentences,
    longSentences
  };
}