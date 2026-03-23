// functions that reply on random numbers
// the result of these functions can not be determined in user tests so they are packages up in to this file

const getRandom = (n: number): number => Math.floor(Math.random() * (n + 1));

export function getRandomEdgePosition(
  edge: string,
  screenSize: { screenWidth: number; screenHeight: number },
): { x: number; y: number } {
  switch (edge) {
    case "top":
      return { x: getRandom(screenSize.screenWidth), y: 0 };
    case "right":
      return {
        x: screenSize.screenWidth,
        y: getRandom(screenSize.screenHeight),
      };
    case "bottom":
      return {
        x: getRandom(screenSize.screenWidth),
        y: screenSize.screenHeight,
      };
    case "left":
      return { x: 0, y: getRandom(screenSize.screenHeight) };
  }
  return { x: getRandom(screenSize.screenWidth), y: 0 };
}
