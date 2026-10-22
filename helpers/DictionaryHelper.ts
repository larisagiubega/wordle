import wordleWordlist from 'wordle-wordlist';
 const wordsDictionary: string[] = wordleWordlist.cache.answers;

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

  static isWordInDictionary(word: string): boolean {
    return wordsDictionary.includes(word);
  }
}

export default DictionaryHelper;