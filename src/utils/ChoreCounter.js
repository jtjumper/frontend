// Helpers for counted chores (partial completion), e.g. "Pick up 30 items".

export const isCountedChore = chore =>
  chore?.targetCount != null && chore.targetCount > 0

export const getRemainingCount = chore => {
  if (!isCountedChore(chore)) return null
  const r = chore.remainingCount
  return r != null && r > 0 ? r : chore.targetCount
}

const NUMBER_WORDS = [
  'zero',
  'one',
  'two',
  'three',
  'four',
  'five',
  'six',
  'seven',
  'eight',
  'nine',
  'ten',
  'eleven',
  'twelve',
  'thirteen',
  'fourteen',
  'fifteen',
  'sixteen',
  'seventeen',
  'eighteen',
  'nineteen',
  'twenty',
]
const TENS = [
  '',
  '',
  'twenty',
  'thirty',
  'forty',
  'fifty',
  'sixty',
  'seventy',
  'eighty',
  'ninety',
]
const toWords = n => {
  if (n <= 20) return NUMBER_WORDS[n]
  if (n < 100)
    return TENS[Math.floor(n / 10)] + (n % 10 ? `-${NUMBER_WORDS[n % 10]}` : '')
  return null
}

const singularize = word => {
  if (/ies$/i.test(word)) return word.replace(/ies$/i, 'y')
  if (/(ss|sh|ch|x)es$/i.test(word)) return word.replace(/es$/i, '')
  if (/[^s]s$/i.test(word)) return word.slice(0, -1)
  return word
}

// Rewrites the chore name to reflect what is left:
//  - "{count}" placeholder is replaced with the remaining count
//  - otherwise the first occurrence of the target (digits or English words,
//    e.g. "30" or "thirty") is replaced
//  - otherwise " (N left)" is appended
// When exactly 1 remains, the word after the number is singularized.
export const getCounterDisplayName = chore => {
  const name = chore?.name ?? ''
  if (!isCountedChore(chore)) return name
  const target = chore.targetCount
  const remaining = getRemainingCount(chore)

  const candidates = ['\\{count\\}', String(target)]
  const words = toWords(target)
  if (words) candidates.push(words.replace('-', '[- ]'))

  for (const c of candidates) {
    const re = new RegExp(`(^|[^\\w])(${c})(?![\\w])(\\s+)?([A-Za-z]+)?`, 'i')
    if (re.test(name)) {
      return name.replace(re, (_m, pre, _num, sp, word) => {
        let w = word || ''
        if (w && remaining === 1) w = singularize(w)
        return `${pre}${remaining}${sp || ''}${w}`
      })
    }
  }
  return `${name} (${remaining} left)`
}
