export { mapValues, mergeDeep };

function mapValues<T, U>(obj: Record<string, T>, fn: (value: T, key: string) => U): Record<string, U> {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value, key)]));
}

function mergeDeep(...sources: Record<string, unknown>[]): Record<string, unknown> {
  return sources.reduce((acc, source) => {
    for (const key in source) {
      const value = source[key];

      if (value && value instanceof Object && !Array.isArray(value)) {
        acc[key] = mergeDeep(acc[key] as Record<string, unknown>, value as Record<string, unknown>);
      } else if (value !== undefined) {
        Object.assign(acc, { [key]: value });
      }
    }

    return acc;
  }, {});
}
