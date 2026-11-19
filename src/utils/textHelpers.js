const namedHtmlEntities = {
  amp: '&',
  apos: "'",
  copy: '©',
  gt: '>',
  hellip: '…',
  ldquo: '“',
  lsquo: '‘',
  lt: '<',
  mdash: '—',
  nbsp: ' ',
  ndash: '–',
  quot: '"',
  rdquo: '”',
  reg: '®',
  rsquo: '’',
  trade: '™',
};

/**
 * Strip HTML tags from string and return plain text
 * @param {string} html - HTML string
 * @returns {string} Plain text without HTML tags
 */
export const stripHtml = (html) => {
  if (!html) return '';

  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, reference) => {
      if (reference[0] !== '#') return namedHtmlEntities[reference.toLowerCase()] ?? entity;

      const codePoint = reference[1].toLowerCase() === 'x'
        ? Number.parseInt(reference.slice(2), 16)
        : Number.parseInt(reference.slice(1), 10);
      return Number.isInteger(codePoint) && codePoint >= 0 && codePoint <= 0x10ffff
        ? String.fromCodePoint(codePoint)
        : entity;
    })
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Truncate text to specified length with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length (default: 200)
 * @returns {string} Truncated text with ellipsis if needed
 */
export const truncateText = (text, maxLength = 200) => {
  if (!text) return '';
  
  if (text.length <= maxLength) {
    return text;
  }
  
  // Truncate and add ellipsis
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Extract plain text from HTML and truncate to specified length
 * @param {string} html - HTML string
 * @param {number} maxLength - Maximum length (default: 200)
 * @returns {string} Plain text preview
 */
export const getTextPreview = (html, maxLength = 200) => {
  const plainText = stripHtml(html);
  return truncateText(plainText, maxLength);
};
