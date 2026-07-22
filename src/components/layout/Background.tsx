/**
 * The blueprint backdrop: a fixed dotted grid across the whole viewport, plus
 * two dashed vertical guide lines aligned to the edges of the centered shell.
 * Pure CSS — no shader, no ongoing cost.
 */
export function Background() {
  return (
    <div className="backdrop" aria-hidden="true">
      <div className="backdrop-dots" />
    </div>
  )
}
