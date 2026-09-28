
import './App.css' 
import KeyHelper from '../helpers/KeyHelper'
import DictionaryHelper from '../helpers/DictionaryHelper'
import { useEffect, useState } from 'react'
import { TextField } from '@fluentui/react';

//todo: implement default difficulty levels
//todo: implement different word lengths selection
//todo: implement multiple languages


function App() {
  const [wordLength] = useState(5);
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
  }

  return colors;
}

useEffect(() => {
  const BackspaceKeyPressed = () => {
    setWords((prevWords) => {
      const newWords = [...prevWords];
      newWords[currentRow] = newWords[currentRow].slice(0, -1);
      return newWords;
    });
  };

  const EnterKeyPressed = () => {
    const currentWord = words[currentRow];

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

    // if(currentWord.length < wordLength) {
    //   //TODO FIX
    //   console.log('Current Word has to have a length of ' + wordLength + ' letters. Current length is ' + currentWord.length);
    // }
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
}, [CheckCurrentWord, currentRow, retries, submittedRows, wordLength, words]);
    
  // console.log(randomWordToGuess);
 return (
  <div
    style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '7px',
      }}
    >
      {Array.from({ length: retries }).map((_, retryIndex) => (
        <div
          key={retryIndex}
          style={{
            display: 'flex',
            gap: '7px',
          }}
        >
          {Array.from({ length: wordLength }).map((_, index) => (
            <TextField
              key={`${retryIndex}-${index}`}
              readOnly
              value={words[retryIndex][index] ?? ''}
              styles={{
                root: { width: 50 },
                field: {
                  textAlign: 'center',
                  fontSize: 24,
                  fontWeight: 600,
                  backgroundColor: submittedRows[retryIndex]
                    ? rowColors[retryIndex][index]
                    : undefined,
                  color: submittedRows[retryIndex] ? '#ffffff' : undefined,
                },
              }}
            />
          ))}
        </div>
      ))}
    </div>
  </div>
);
}

export default App