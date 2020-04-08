export default function horizontalRatio(
  horizontal: null | undefined | boolean | [number, number]
) {
  if (
    horizontal === null ||
    horizontal === undefined ||
    typeof horizontal === "boolean"
  ) {
    return [2, 10];
  }

  return horizontal;
}
