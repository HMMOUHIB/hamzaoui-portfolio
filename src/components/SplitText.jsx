// Splits text into masked characters for animation while keeping a single,
// readable copy for assistive tech.
export default function SplitText({ text, className = '' }) {
  const words = text.split(' ')
  return (
    <span className={`split ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((w, i) => (
          <span className="word" key={i}>
            {[...w].map((c, j) => (
              <span className="char" key={j}>{c}</span>
            ))}
            {i < words.length - 1 ? '\u00a0' : null}
          </span>
        ))}
      </span>
    </span>
  )
}

export function Lines({ lines, className = '' }) {
  return (
    <span className={`lines ${className}`}>
      {lines.map((l, i) => (
        <span className="line" key={i}>
          <span className="line-inner">{l}</span>
        </span>
      ))}
    </span>
  )
}
