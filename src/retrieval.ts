const MAX_CHUNK_CHARS = 1100;
const CHUNK_OVERLAP_CHARS = 160;

export type Passage = {
  text: string;
  index: number;
  score: number;
};

function words(value: string): string[] {
  return value.toLocaleLowerCase().match(/[\p{L}\p{N}]{2,}/gu) ?? [];
}

export function splitIntoChunks(text: string): string[] {
  const normalized = text.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const paragraphs = normalized.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = '';
  const pushCurrent = () => {
    if (current.trim()) chunks.push(current.trim());
    current = '';
  };

  for (const paragraph of paragraphs) {
    const part = paragraph.trim();
    if (!part) continue;
    if (part.length > MAX_CHUNK_CHARS) {
      pushCurrent();
      for (let start = 0; start < part.length; start += MAX_CHUNK_CHARS - CHUNK_OVERLAP_CHARS) {
        chunks.push(part.slice(start, start + MAX_CHUNK_CHARS).trim());
      }
      continue;
    }
    if (current && current.length + part.length + 2 > MAX_CHUNK_CHARS) pushCurrent();
    current = current ? `${current}\n\n${part}` : part;
  }
  pushCurrent();
  return chunks;
}

export function findRelevantPassages(chunks: string[], query: string, limit = 4): Passage[] {
  const queryTerms = [...new Set(words(query))];
  if (!chunks.length || !queryTerms.length) return [];
  const tokenized = chunks.map(words);
  const averageLength = tokenized.reduce((sum, doc) => sum + doc.length, 0) / chunks.length;
  const documentFrequency = new Map(queryTerms.map((term) => [term, tokenized.reduce((count, doc) => count + (doc.includes(term) ? 1 : 0), 0)]));

  return tokenized
    .map((doc, index) => {
      const counts = new Map<string, number>();
      for (const term of doc) counts.set(term, (counts.get(term) ?? 0) + 1);
      const score = queryTerms.reduce((total, term) => {
        const count = counts.get(term) ?? 0;
        if (!count) return total;
        const df = documentFrequency.get(term) ?? 0;
        const inverseFrequency = Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5));
        const lengthNorm = count + 1.2 * (0.25 + 0.75 * (doc.length / Math.max(1, averageLength)));
        return total + inverseFrequency * ((count * 2.2) / lengthNorm);
      }, 0);
      return { text: chunks[index], index, score };
    })
    .filter((passage) => passage.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
