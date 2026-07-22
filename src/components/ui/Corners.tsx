/** Four crosshair "+" marks at a block's corners. Parent needs `.plate`. */
export function Corners() {
  return (
    <span aria-hidden="true">
      <span className="plate-corner pc-tl">+</span>
      <span className="plate-corner pc-tr">+</span>
      <span className="plate-corner pc-bl">+</span>
      <span className="plate-corner pc-br">+</span>
    </span>
  )
}
