export function formatItinerary(text: string): string {
  let html = text
    // Convert blockquotes (> lines)
    .replace(/^> (.*?)$/gm, '<blockquote>$1</blockquote>')
    // Convert headings
    .replace(/### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/## (.*?)$/gm, '<h3>$1</h3>')
    .replace(/# (.*?)$/gm, '<h2>$1</h2>')
    // Convert bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Convert paragraphs
    .replace(/\n\n/g, '</p><p>')
    // Convert list items
    .replace(/^- (.*?)$/gm, '<li>$1</li>')

  // Merge consecutive blockquotes
  html = html.replace(/(<blockquote>.*?<\/blockquote>\s*)+/gs, (match) => {
    const content = match.replace(/<\/?blockquote>/g, '').trim()
    return '<blockquote>' + content + '</blockquote>'
  })

  // Wrap consecutive list items in <ul>
  html = html.replace(/(<li>.*?<\/li>\s*)+/gs, (match) => {
    return '<ul>' + match + '</ul>'
  })

  if (!html.startsWith('<h') && !html.startsWith('<ul>') && !html.startsWith('<blockquote>')) {
    html = '<p>' + html + '</p>'
  }

  return html
}
