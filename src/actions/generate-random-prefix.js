export function generateRandomPrefix() {
  const randomString = Math.random()
    .toString(36)
    .substring(7);

  return `unscoped-${randomString}`;
}
