"use client";

import React, { useEffect, useRef, useState } from "react";

interface PinInputProps {
  length?: number;
  onComplete: (pin: string) => void;
  disabled?: boolean;
}

const PinInput = ({
  length = 6,
  onComplete,
  disabled = false,
}: PinInputProps) => {
  const [pin, setPin] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
  ) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;

    const newPin = [...pin];
    // Only take the last digit if multiple are entered
    newPin[index] = value.substring(value.length - 1);
    setPin(newPin);

    // If value is added, move to next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (newPin.every((digit) => digit !== "")) {
      onComplete(newPin.join(""));
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").substring(0, length);
    if (!/^\d+$/.test(pastedData)) return;

    const newPin = [...pin];
    pastedData.split("").forEach((char, idx) => {
      if (idx < length) newPin[idx] = char;
    });
    setPin(newPin);

    const nextIndex =
      pastedData.length < length ? pastedData.length : length - 1;
    inputRefs.current[nextIndex]?.focus();

    if (newPin.every((digit) => digit !== "")) {
      onComplete(newPin.join(""));
    }
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {pin.map((digit, index) => (
        <input
          key={index}
          ref={(el) => {
            inputRefs.current[index] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          disabled={disabled}
          className="w-10 h-12 text-center text-xl font-bold border-2 rounded-lg bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
};

export default PinInput;
