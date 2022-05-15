export function disableLogs<T>(fn: () => T) {
  const log = console.log;
  console.log = () => {};

  try {
    return fn();
  } finally {
    console.log = log;
  }
}
