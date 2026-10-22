
import './App.css' 
import KeyHelper from '../helpers/KeyHelper'
import DictionaryHelper, { type Language } from '../helpers/DictionaryHelper'
import { useEffect, useState } from 'react'

const gameCopy = {
  en: {
    headerNote: 'A LITTLE WORD BREAK',
    eyebrow: 'THE DAILY WORD GAME',
    description: 'Find the hidden word in six tries.',
    puzzle: "TODAY'S PUZZLE",
    guesses: 'GUESSES',
    submitHint: 'to submit',
    eraseHint: 'to erase',
    correct: 'Correct',
    present: 'In word',
    footnote: 'A fresh five-letter puzzle, every day.',
    invalidWord: "That word isn't in the dictionary. Try another.",
    shortWord: (length: number) => `Your guess needs ${length} letters.`,
    win: 'You guessed the word correctly!',
    loss: (word: string) => `Game over. The word was ${word.toUpperCase()}.`,
    loadError: 'The Romanian dictionary could not be loaded.',
    languageLabel: 'LANGUAGE',
    loading: 'LOADING',
  },
  ro: {
    headerNote: 'O PAUZĂ DE CUVINTE',
    eyebrow: 'JOCUL ZILNIC DE CUVINTE',
    description: 'Găsește cuvântul ascuns în șase încercări.',
    puzzle: 'JOCUL DE AZI',
    guesses: 'ÎNCERCĂRI',
    submitHint: 'pentru trimitere',
    eraseHint: 'pentru ștergere',
    correct: 'Corect',
    present: 'În cuvânt',
    footnote: 'Un cuvânt nou de cinci litere, în fiecare zi.',
    invalidWord: 'Cuvântul nu este în dicționar. Încearcă altul.',
    shortWord: (length: number) => `Introdu un cuvânt de ${length} litere.`,
    win: 'Ai ghicit cuvântul!',
    loss: (word: string) => `Joc terminat. Cuvântul era ${word.toLocaleUpperCase('ro-RO')}.`,
    loadError: 'Dicționarul român nu a putut fi încărcat.',
    languageLabel: 'LIMBĂ',
    loading: 'SE ÎNCARCĂ',
  },
};

//todo: implement default difficulty levels
//todo: implement different word lengths selection


function App() {
  const [wordLength] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [notice, setNotice] = useState('');
  const [language, setLanguage] = useState<Language>('en');
  const [isLoadingLanguage, setIsLoadingLanguage] = useState(false);
  const [randomWordToGuess, setRandomWordToGuess] = useState<string>(() => DictionaryHelper.getRandomWordOfLength(5));
  const [currentRow, setCurrentRow] = useState(0);
  const [retries] = useState(6);
  const [words, setWords] = useState<string[]>(
  Array(retries).fill('')
);
  const [submittedRows, setSubmittedRows] = useState<boolean[]>(Array(retries).fill(false));
  const [rowColors, setRowColors] = useState<string[][]>(
    Array.from({ length: retries }, () => Array(wordLength).fill('#787c7e'))
  );

const copy = gameCopy[language];

async function ChangeLanguage(nextLanguage: Language) {
  if (nextLanguage === language || isLoadingLanguage) return;

  setIsLoadingLanguage(true);
  setNotice('');

  try {
    const nextWord = await DictionaryHelper.getRandomWordForLanguage(wordLength, nextLanguage);
    setLanguage(nextLanguage);
    setRandomWordToGuess(nextWord);
    setCurrentRow(0);
    setWords(Array(retries).fill(''));
    setSubmittedRows(Array(retries).fill(false));
    setRowColors(Array.from({ length: retries }, () => Array(wordLength).fill('#787c7e')));
    setGameOver(false);
  } catch {
    setNotice(copy.loadError);
  } finally {
    setIsLoadingLanguage(false);
  }
}

useEffect(() => {
  if (!notice) return;

  const timeoutId = window.setTimeout(() => setNotice(''), 2400);
  return () => window.clearTimeout(timeoutId);
}, [notice]);


useEffect(() => {
  if(!gameOver) {
  const CheckCurrentWord = (word: string): string[] => {
    const colors = Array(wordLength).fill('#787c7e');

    for (let index = 0; index < wordLength; index++) {
      const letter = word[index];

      if (letter === randomWordToGuess[index]) {
        colors[index] = '#6aaa64';
      } else if (randomWordToGuess.includes(letter)) {
        colors[index] = '#c9b458';
      }
    }

    if(word === randomWordToGuess) {
      setNotice(copy.win);
      setGameOver(true);
      return colors;
    }

    return colors;
  };

  const IsCurrentWordValid = (currentWord: string) => {
    if (!DictionaryHelper.isWordInDictionary(currentWord, language)) {
      setNotice(copy.invalidWord);
      return false;
    }

    return true;
  };

  const BackspaceKeyPressed = () => {
    setWords((prevWords) => {
      const newWords = [...prevWords];
      newWords[currentRow] = newWords[currentRow].slice(0, -1);
      return newWords;
    });
  };

  //todo: fix 
  // APPLE
  // PAPER
  // ERUPT
  
  const EnterKeyPressed = () => {
    const currentWord = words[currentRow];

    if(currentWord.length < wordLength) {
      setNotice(copy.shortWord(wordLength));
      return;
    }

    if(!IsCurrentWordValid(currentWord)){
      return;
    }

    if (currentWord.length === wordLength && !submittedRows[currentRow]) {
      setWords((prevWords) => {
        const newWords = [...prevWords];
        newWords[currentRow] = currentWord;
        return newWords;
      });

      setSubmittedRows((prevRows) => {
        const newRows = [...prevRows];
        newRows[currentRow] = true;
        return newRows;
      });

      const colors = CheckCurrentWord(currentWord);
      setRowColors((prevColors) => {
        const newColors = [...prevColors];
        newColors[currentRow] = colors;
        return newColors;
      });

      if (currentRow === retries - 1 && currentWord !== randomWordToGuess) {
        setNotice(copy.loss(randomWordToGuess));
        setGameOver(true);
      }

      setCurrentRow((prevRow) => Math.min(prevRow + 1, retries - 1));
    }
  };

  const removeListener = KeyHelper((key) => {
    if (key === 'Backspace') {
      if (!submittedRows[currentRow]) {
        BackspaceKeyPressed();
      }
      return;
    }

    if (key === 'Enter') {
      EnterKeyPressed();
      return;
    }

    if (DictionaryHelper.isLetter(key, language) && !submittedRows[currentRow]) {
      setWords((prevWords) => {
        const newWords = [...prevWords];

        if (newWords[currentRow].length < wordLength) {
          newWords[currentRow] += DictionaryHelper.normalizeWord(key, language);
        }

        return newWords;
      });
    }
  });

  return removeListener;
}
}, [copy, currentRow, gameOver, language, randomWordToGuess, retries, submittedRows, wordLength, words]);

 return (
  <div className="game-page">
    <header className="game-header">
      <a className="brand" href="#top" aria-label="Wordle home">
        <span className="brand-mark">W</span>
        <span className="brand-name">WORDLE</span>
      </a>
      <div className="header-actions">
        <label className="language-picker">
          <span>{isLoadingLanguage ? copy.loading : copy.languageLabel}</span>
          <select
            aria-label="Language"
            disabled={isLoadingLanguage}
            onChange={(event) => void ChangeLanguage(event.target.value as Language)}
            value={language}
          >
            <option value="en">English</option>
            <option value="ro">Română</option>
          </select>
        </label>
        <div className="header-note">
          <span className="header-note-dot" />
          {copy.headerNote}
        </div>
      </div>
    </header>

    <main className="game-main" id="top">
      <section className="game-intro" aria-labelledby="game-title">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="game-title">Wordle<span>.</span></h1>
        <p className="intro-copy">{copy.description}</p>
      </section>

      <section className="game-panel" aria-label="Wordle puzzle">
        <div className="board-heading">
          <span className="board-label">{copy.puzzle}</span>
          <span className="guess-count">
            <strong>{submittedRows.filter(Boolean).length}</strong> / {retries} {copy.guesses}
          </span>
        </div>

        <div className="game-board" role="grid" aria-label="Six guesses, five letters each">
          {Array.from({ length: retries }).map((_, retryIndex) => (
            <div className="guess-row" role="row" key={retryIndex}>
              {Array.from({ length: wordLength }).map((_, index) => {
                const letter = words[retryIndex][index] ?? '';
                const isSubmitted = submittedRows[retryIndex];

                return (
                  <div
                    className={[
                      'letter-tile',
                      letter ? 'has-letter' : '',
                      isSubmitted ? 'is-submitted' : '',
                      retryIndex === currentRow && !isSubmitted ? 'is-current' : '',
                    ].filter(Boolean).join(' ')}
                    role="gridcell"
                    aria-label={letter ? `Letter ${letter}` : 'Empty'}
                    key={`${retryIndex}-${index}`}
                    style={isSubmitted ? { backgroundColor: rowColors[retryIndex][index] } : undefined}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="board-footer">
          <span className="keyboard-hint"><kbd>ENTER</kbd> {copy.submitHint} <span className="hint-divider">/</span> <kbd>BACKSPACE</kbd> {copy.eraseHint}</span>
          <span className="color-legend" aria-label="Color meanings">
            <span className="legend-item"><i className="legend-swatch correct" /> {copy.correct}</span>
            <span className="legend-item"><i className="legend-swatch present" /> {copy.present}</span>
          </span>
        </div>
      </section>

      <p className="game-footnote">{copy.footnote}</p>
    </main>
    {notice && <div className="game-toast" role="status">{notice}</div>}
  </div>
);
}

export default App
