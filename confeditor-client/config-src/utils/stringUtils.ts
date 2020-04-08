export function zeroPadding(str: string, len: number): string {
  if (str.length >= len) {
    return str;
  }
  var padding = '';
  for (let i = str.length; i < len; ++i) {
    padding += '0';
  }
  return padding + str;
}

export function truncate(str: string, len: number): string {
  if (str.length <= len) {
    return str;
  }

  return str.substr(0, len - 3) + '...';
}
