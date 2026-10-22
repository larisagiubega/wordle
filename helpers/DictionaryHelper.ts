import wordleWordlist from 'wordle-wordlist';
import nspell from 'nspell';

export type Language = 'en' | 'ro';

const wordsDictionary: string[] = wordleWordlist.cache.answers;
let romanianSpellChecker: ReturnType<typeof nspell> | undefined;
let romanianAnswers: string[] = [];
let romanianDictionaryPromise: Promise<void> | undefined;

 const presetWordsDictionary: string[] = [
  'apple',
  'crane',
  'flame',
  'grape',
  'house',
  'light',
  'plant',
  'stone',
  'table',
  'water',
];


 class DictionaryHelper {
  static getRandomWordOfLength(length: number, usePresets = false): string {
    const wordsOfLength = usePresets 
      ? presetWordsDictionary.filter(word => word.length === length)
      : wordsDictionary.filter(word => word.length === length);

   if(wordsOfLength.length === 0) {
      throw new Error(`No words found of length ${length}`);  
   }

   return wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];  
  }

  static async getRandomWordForLanguage(length: number, language: Language): Promise<string> {
    if (language === 'en') {
      return this.getRandomWordOfLength(length);
    }

    await loadRomanianDictionary();
    const wordsOfLength = romanianAnswers.filter(word => Array.from(word).length === length);

    if (wordsOfLength.length === 0) {
      throw new Error(`No Romanian words found of length ${length}`);
    }

    return wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];
  }

  static isWordInDictionary(word: string, language: Language = 'en'): boolean {
    const normalizedWord = this.normalizeWord(word, language);

    if (language === 'en') {
      return wordsDictionary.includes(normalizedWord);
    }

    return romanianSpellChecker?.correct(normalizedWord) ?? false;
  }

  static isLetter(key: string, language: Language): boolean {
    return language === 'ro'
      ? /^[a-zăâîșțşţ]$/i.test(key)
      : /^[a-z]$/i.test(key);
  }

  static normalizeWord(word: string, language: Language): string {
    const normalizedWord = word.toLocaleLowerCase(language === 'ro' ? 'ro-RO' : 'en-US');

    return language === 'ro'
      ? normalizedWord.replace(/ş/g, 'ș').replace(/ţ/g, 'ț')
      : normalizedWord;
  }
}

async function fetchDictionaryFile(fileName: string): Promise<string> {
  const response = await fetch(`${import.meta.env.BASE_URL}dictionaries/ro/${fileName}`);

  if (!response.ok) {
    throw new Error(`Failed to load Romanian dictionary file: ${fileName}`);
  }

  return response.text();
}

function loadRomanianDictionary(): Promise<void> {
  if (!romanianDictionaryPromise) {
    romanianDictionaryPromise = Promise.all([
      fetchDictionaryFile('index.aff'),
      fetchDictionaryFile('index.dic'),
    ])
      .then(([affixData, dictionaryData]) => {
        const spellChecker = nspell(affixData, dictionaryData);
        const entries = dictionaryData.split(/\r?\n/).slice(1);

        romanianAnswers = Array.from(new Set(entries.flatMap((entry) => {
          const word = entry.split('/')[0].trim();

          if (!/^[a-zăâîșțşţ]+$/i.test(word)) {
            return [];
          }

          const normalizedWord = word.toLocaleLowerCase('ro-RO')
            .replace(/ş/g, 'ș')
            .replace(/ţ/g, 'ț');

          return Array.from(normalizedWord).length === 5 && spellChecker.correct(word)
            ? [normalizedWord]
            : [];
        })));

        if (romanianAnswers.length === 0) {
          throw new Error('Romanian dictionary did not contain any five-letter words');
        }

        romanianSpellChecker = spellChecker;
      })
      .catch((error: unknown) => {
        romanianDictionaryPromise = undefined;
        throw error;
      });
  }

  return romanianDictionaryPromise;
}

export default DictionaryHelper;