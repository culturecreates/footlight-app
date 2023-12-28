export const ratioChecker = (ratio) => {
  if (ratio && typeof ratio == 'string') {
    let splitRatio = ratio?.split(':');
    if (splitRatio?.length > 1) return splitRatio[0] / splitRatio[1];
  }
};
