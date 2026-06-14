type DebouncedFunction<T extends (..._args: never[]) => void> = (
  ..._args: Parameters<T>
) => void;

export const debounce = <T extends (..._args: never[]) => void>(
  fn: T,
  delay: number = 7000,
): DebouncedFunction<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (..._args: Parameters<T>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn(..._args);
      //timeoutId = null;
    }, delay);
  };
};
