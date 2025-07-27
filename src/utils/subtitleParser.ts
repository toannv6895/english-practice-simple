import { SubtitleEntry } from '../types';

export function parseSRT(srtContent: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const blocks = srtContent.trim().split('\n\n');
  
  blocks.forEach((block, index) => {
    const lines = block.split('\n');
    if (lines.length >= 3) {
      const timeLine = lines[1];
      const text = lines.slice(2).join('\n');
      
      const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
      if (timeMatch) {
        const startTime = parseTime(timeMatch[1]);
        const endTime = parseTime(timeMatch[2]);
        
        entries.push({
          id: index + 1,
          startTime,
          endTime,
          text: text.trim()
        });
      }
    }
  });
  
  return entries;
}

export function parseVTT(vttContent: string): SubtitleEntry[] {
  const entries: SubtitleEntry[] = [];
  const lines = vttContent.split('\n');
  let currentEntry: Partial<SubtitleEntry> = {};
  let entryIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === '' || line === 'WEBVTT') continue;
    
    // Check if line contains timestamp
    const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
    if (timeMatch) {
      if (currentEntry.text) {
        entries.push(currentEntry as SubtitleEntry);
        entryIndex++;
      }
      
      currentEntry = {
        id: entryIndex + 1,
        startTime: parseTime(timeMatch[1]),
        endTime: parseTime(timeMatch[2]),
        text: ''
      };
    } else if (currentEntry.startTime !== undefined) {
      currentEntry.text = (currentEntry.text || '') + line + '\n';
    }
  }
  
  if (currentEntry.text) {
    entries.push(currentEntry as SubtitleEntry);
  }
  
  return entries;
}

function parseTime(timeString: string): number {
  const parts = timeString.replace(',', '.').split(':');
  const hours = parseInt(parts[0]);
  const minutes = parseInt(parts[1]);
  const seconds = parseFloat(parts[2]);
  
  return hours * 3600 + minutes * 60 + seconds;
}

export function findSubtitleFile(audioFileName: string, files: FileList): File | null {
  const baseName = audioFileName.replace(/\.[^/.]+$/, '');
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileName = file.name.toLowerCase();
    
    if ((fileName.endsWith('.srt') || fileName.endsWith('.vtt')) && 
        fileName.startsWith(baseName.toLowerCase())) {
      return file;
    }
  }
  
  return null;
} 