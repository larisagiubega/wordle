//todo: find a good dictionary to use for this project. For now, we will use a hardcoded list of words.

const wordsDict = [
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

   static getRandomWordOfLength(length: number): string {
   const wordsOfLength = wordsDict.filter(word => word.length === length);

   if(wordsOfLength.length === 0) {
      throw new Error(`No words found of length ${length}`);  
   }

   return wordsOfLength[Math.floor(Math.random() * wordsOfLength.length)];  
  }
}

export default DictionaryHelper;