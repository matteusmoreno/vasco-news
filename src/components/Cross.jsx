export const crossSrc = '/cruz-de-malda-no-bg.png'

export function Cross({ className = 'cross' }) {
  return <img className={className} src={crossSrc} alt="" draggable="false" />
}
