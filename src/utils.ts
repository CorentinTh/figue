export const isFalsyOrHasThrown = (cb: () => boolean): boolean => {
  try {
    return !cb();
  } catch (e) {
    return true;
  }
};
