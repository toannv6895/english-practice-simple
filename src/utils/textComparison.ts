// Text comparison utility for dictation mode
// Handles equivalent words and ignores punctuation

interface WordEquivalents {
  [key: string]: string[];
}

// Common word equivalents in English
const WORD_EQUIVALENTS: WordEquivalents = {
  "i'm": ["im", "i am"],
  "you're": ["youre", "you are"],
  "he's": ["hes", "he is", "he has"],
  "she's": ["shes", "she is", "she has"],
  "it's": ["its", "it is", "it has"],
  "we're": ["were", "we are"],
  "they're": ["theyre", "they are"],
  "that's": ["thats", "that is", "that has"],
  "there's": ["theres", "there is", "there has"],
  "here's": ["heres", "here is", "here has"],
  "what's": ["whats", "what is", "what has"],
  "where's": ["wheres", "where is", "where has"],
  "who's": ["whos", "who is", "who has"],
  "how's": ["hows", "how is", "how has"],
  "when's": ["whens", "when is", "when has"],
  "why's": ["whys", "why is", "why has"],
  "let's": ["lets", "let us"],
  "won't": ["wont", "will not"],
  "can't": ["cant", "cannot", "can not"],
  "don't": ["dont", "do not"],
  "doesn't": ["doesnt", "does not"],
  "didn't": ["didnt", "did not"],
  "wouldn't": ["wouldnt", "would not"],
  "couldn't": ["couldnt", "could not"],
  "shouldn't": ["shouldnt", "should not"],
  "haven't": ["havent", "have not"],
  "hasn't": ["hasnt", "has not"],
  "hadn't": ["hadnt", "had not"],
  "isn't": ["isnt", "is not"],
  "aren't": ["arent", "are not"],
  "wasn't": ["wasnt", "was not"],
  "weren't": ["werent", "were not"],
  "i'll": ["ill", "i will"],
  "you'll": ["youll", "you will"],
  "he'll": ["hell", "he will"],
  "she'll": ["shell", "she will"],
  "it'll": ["itll", "it will"],
  "we'll": ["well", "we will"],
  "they'll": ["theyll", "they will"],
  "i've": ["ive", "i have"],
  "you've": ["youve", "you have"],
  "we've": ["weve", "we have"],
  "they've": ["theyve", "they have"],
  "i'd": ["id", "i would", "i had"],
  "you'd": ["youd", "you would", "you had"],
  "he'd": ["hed", "he would", "he had"],
  "she'd": ["shed", "she would", "she had"],
  "we'd": ["wed", "we would", "we had"],
  "they'd": ["theyd", "they would", "they had"]
};

/**
 * Normalizes text by removing punctuation and converting to lowercase
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove all punctuation
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
}

/**
 * Expands contractions and handles word equivalents
 */
function expandEquivalents(text: string): string[] {
  const normalized = normalizeText(text);
  const words = normalized.split(' ');
  
  // Generate all possible combinations of equivalent words
  const wordVariations: string[][] = words.map(word => {
    const equivalents = [word];
    
    // Check if this word has equivalents
    for (const [key, values] of Object.entries(WORD_EQUIVALENTS)) {
      if (key === word) {
        equivalents.push(...values);
      } else if (values.includes(word)) {
        equivalents.push(key, ...values.filter(v => v !== word));
      }
    }
    
    return Array.from(new Set(equivalents)); // Remove duplicates
  });
  
  // Generate all combinations
  function generateCombinations(arrays: string[][]): string[] {
    if (arrays.length === 0) return [''];
    if (arrays.length === 1) return arrays[0];
    
    const result: string[] = [];
    const firstArray = arrays[0];
    const restCombinations = generateCombinations(arrays.slice(1));
    
    for (const first of firstArray) {
      for (const rest of restCombinations) {
        result.push(rest ? `${first} ${rest}` : first);
      }
    }
    
    return result;
  }
  
  return generateCombinations(wordVariations);
}

/**
 * Compares user input with the correct text, handling equivalents and punctuation
 */
export function compareTexts(userInput: string, correctText: string): {
  isCorrect: boolean;
  matchedWords: boolean[];
  correctWords: string[];
  userWords: string[];
} {
  const normalizedCorrect = normalizeText(correctText);
  const normalizedUser = normalizeText(userInput);
  
  // Generate all possible equivalent versions of the correct text
  const correctVariations = expandEquivalents(normalizedCorrect);
  
  // Check if user input matches any variation
  const isCorrect = correctVariations.some(variation => variation === normalizedUser);
  
  // For word-by-word comparison (for blur effect)
  const correctWords = normalizedCorrect.split(' ');
  const userWords = normalizedUser.split(' ');
  
  const matchedWords: boolean[] = correctWords.map((correctWord, index) => {
    const userWord = userWords[index];
    if (!userWord) return false;
    
    // Check if words match directly or through equivalents
    if (correctWord === userWord) return true;
    
    // Check equivalents
    for (const [key, values] of Object.entries(WORD_EQUIVALENTS)) {
      if ((key === correctWord && values.includes(userWord)) ||
          (values.includes(correctWord) && (key === userWord || values.includes(userWord)))) {
        return true;
      }
    }
    
    return false;
  });
  
  return {
    isCorrect,
    matchedWords,
    correctWords,
    userWords
  };
}

/**
 * Gets the percentage of correctly typed words for gradual blur reveal
 */
export function getTypingProgress(userInput: string, correctText: string): number {
  const { matchedWords } = compareTexts(userInput, correctText);
  if (matchedWords.length === 0) return 0;
  
  const correctCount = matchedWords.filter(Boolean).length;
  return correctCount / matchedWords.length;
}