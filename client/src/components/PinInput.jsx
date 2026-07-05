import { useRef } from 'react';

const LENGTH = 4;

export default function PinInput({ value, onChange, autoFocus }) {
  const inputsRef = useRef([]);
  const digits = Array.from({ length: LENGTH }, (_, i) => value[i] || '');

  function setDigits(next) {
    onChange(next.join(''));
  }

  function handleChange(index, e) {
    const raw = e.target.value.replace(/\D/g, '');
    const next = digits.slice();

    if (!raw) {
      next[index] = '';
      setDigits(next);
      return;
    }

    const char = raw[raw.length - 1];
    next[index] = char;
    setDigits(next);
    if (index < LENGTH - 1) inputsRef.current[index + 1]?.focus();
  }

  function handleKeyDown(index, e) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, LENGTH);
    if (!text) return;
    e.preventDefault();
    onChange(text);
    inputsRef.current[Math.min(text.length, LENGTH - 1)]?.focus();
  }

  return (
    <div style={styles.row}>
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => (inputsRef.current[i] = el)}
          className="pin-box"
          type="password"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          autoFocus={autoFocus && i === 0}
          autoComplete="new-password"
          name={`pin-digit-${i}`}
          data-lpignore="true"
          data-1p-ignore
        />
      ))}
    </div>
  );
}

const styles = {
  row: {
    display: 'flex',
    gap: 12,
    justifyContent: 'center',
  },
};
