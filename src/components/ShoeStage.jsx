import { useEffect, useRef } from 'react'
import { RotateCw } from 'lucide-react'
import { photo } from '../data/products'
export function ShoeStage({ image, name, compact = false }) {
  const shoe = useRef(null)
  const animation = useRef(null)
  useEffect(() => () => animation.current?.cancel(), [])
  const spin = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    animation.current?.cancel()
    animation.current = shoe.current.animate([
      { transform:'translateY(0) rotate(0deg)' },
      { transform:'translateY(-24px) rotate(0deg)', offset:.16 },
      { transform:'translateY(-24px) rotate(360deg)', offset:.86 },
      { transform:'translateY(0) rotate(360deg)' },
    ], { duration:1800, easing:'cubic-bezier(.22,.61,.36,1)' })
  }
  return <div className={`relative flex items-center justify-center overflow-hidden bg-[#bd4f2b] ${compact ? 'aspect-[4/3]' : 'min-h-[380px] lg:min-h-[620px]'}`} onPointerEnter={event => { if(event.pointerType === 'mouse') spin() }}>
    <img ref={shoe} src={photo(image)} alt={name} onError={event => { event.currentTarget.src = photo('samba-green') }} className="relative w-[85%] max-h-[520px] object-contain drop-shadow-2xl" />
    {!compact && <button onClick={spin} className="absolute bottom-5 left-5 flex min-h-11 items-center gap-2 rounded-full bg-foreground px-4 text-xs text-background" aria-label={`Spin ${name} image 360 degrees`}><RotateCw size={15}/> Spin the shoe <span aria-hidden="true">360°</span></button>}
  </div>
}
