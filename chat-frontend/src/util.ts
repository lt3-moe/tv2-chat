import React, { useEffect, useState } from "react";

export function useStickyState<T>({
  defaultValue,
  storageKey,
  serialize,
  deserialize
}: {
  defaultValue: T
  storageKey: string
  serialize?: (arg0: T) => string;
  deserialize?: (arg0: string) => T
}): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    const stickyValue = window.localStorage.getItem(storageKey);
    return stickyValue !== null
      ? (deserialize || JSON.parse)(stickyValue)
      : defaultValue;
  });
  useEffect(() => {
    window.localStorage.setItem(storageKey, (serialize || JSON.stringify)(value));
  }, [storageKey, value, serialize]);
  return [value, setValue];
}

export const hashCode = function (s: string) {
  return s.split("").reduce(function (a, b) {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0);
};