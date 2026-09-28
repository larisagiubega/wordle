function KeyHelper(onKeyPress: (key: string) => void) {
  const getPressedKey = (e: KeyboardEvent) => {
    onKeyPress(e.key);
  };

  document.addEventListener('keydown', getPressedKey);

  return () => {
    document.removeEventListener('keydown', getPressedKey);
  };
}

export default KeyHelper;