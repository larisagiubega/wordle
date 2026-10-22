
import './App.css' 
import KeyHelper from '../helpers/KeyHelper'
import DictionaryHelper from '../helpers/DictionaryHelper'
import { useEffect, useState } from 'react'

//todo: implement default difficulty levels
//todo: implement different word lengths selection
//todo: implement multiple languages


function App() {
  const [wordLength] = useState(5);
  const [gameOver, setGameOver] = useState(false);
  const [randomWordToGuess] = useState<string>(DictionaryHelper.getRandomWordOfLength(5));
  const [currentRow, setCurrentRow] = useState(0);
  const [retries] = useState(6);
  const [words, setWords] = useState<string[]>(
  Array(retries).fill('')
);
  const [submittedRows, setSubmittedRows] = useState<boolean[]>(Array(retries).fill(false));
  const [rowColors, setRowColors] = useState<string[][]>(
    Array.from({ length: retries }, () => Array(wordLength).fill('#787c7e'))
  );


// eslint-disable-next-line react-hooks/exhaustive-deps
function CheckCurrentWord(word: string): string[] {
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
    alert('You guessed the word correctly!'); 
    setGameOver(true);
    return colors;
  }

  return colors;
}

function IsCurrentWordValid(currentWord: string) {
  if (!DictionaryHelper.isWordInDictionary(currentWord)) {
    alert('What kind of word is that? I can\'t find it in the dictionary!');
    return false;
  }

  return true;
}


useEffect(() => {
  if(!gameOver) {
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
      alert(`The word must be ${wordLength} letters long!`);  
      return;
    }

    if(!IsCurrentWordValid(currentWord)){
      return;
    }

    // if(currentWord.length === wordLength && currentRow === retries +1) {
    // setGameOver(true);
    // alert(`Game over! The word was: ${randomWordToGuess}`); 
    // }

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

    if (/^[a-zA-Z]$/.test(key) && !submittedRows[currentRow]) {
      setWords((prevWords) => {
        const newWords = [...prevWords];

        if (newWords[currentRow].length < wordLength) {
          newWords[currentRow] += key.toLowerCase();
        }

        return newWords;
      });
    }
  });

  return removeListener;
}
}, [currentRow, retries, submittedRows, wordLength, words]);

 return (
  <div className="game-page">
    <header className="game-header">
      <a className="brand" href="#top" aria-label="Wordle home">
        <span className="brand-mark">W</span>
        <span className="brand-name">WORDLE</span>
      </a>
      <div className="header-note">
        <span className="header-note-dot" />
        A LITTLE WORD BREAK
      </div>
    </header>

    <main className="game-main" id="top">
      <section className="game-intro" aria-labelledby="game-title">
        <p className="eyebrow">THE DAILY WORD GAME</p>
        <h1 id="game-title">Wordle<span>.</span></h1>
        <p className="intro-copy">Find the hidden word in six tries.</p>
      </section>

      <section className="game-panel" aria-label="Wordle puzzle">
        <div className="board-heading">
          <span className="board-label">TODAY'S PUZZLE</span>
          <span className="guess-count">
            <strong>{submittedRows.filter(Boolean).length}</strong> / {retries} GUESSES
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
          <span className="keyboard-hint"><kbd>ENTER</kbd> to submit <span className="hint-divider">/</span> <kbd>BACKSPACE</kbd> to erase</span>
          <span className="color-legend" aria-label="Color meanings">
            <span className="legend-item"><i className="legend-swatch correct" /> Correct</span>
            <span className="legend-item"><i className="legend-swatch present" /> In word</span>
          </span>
        </div>
      </section>

      <p className="game-footnote">A fresh five-letter puzzle, every day.</p>
    </main>
  </div>
);
}

export default App
