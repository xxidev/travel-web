export function formatItinerary(text: string): string {
  let html = text
    .replace(/### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/## (.*?)$/gm, '<h3>$1</h3>')
    .replace(/# (.*?)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^- (.*?)$/gm, '<li>$1</li>')

  html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
    return '<ul>' + match + '</ul>'
  })

  if (!html.startsWith('<h') && !html.startsWith('<ul>')) {
    html = '<p>' + html + '</p>'
  }

  return html
}
