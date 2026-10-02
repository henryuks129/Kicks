import { useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { photo } from '../data/products'
export function ShoeStage({ image, name, compact = false, gallery = [], onChange }) {
  const index = Math.max(0, gallery.indexOf(image))
  const move = (direction) => onChange?.(gallery[(index + direction + gallery.length) % gallery.length])
  const key = useRef(null)
  return <div tabIndex={compact ? -1 : 0} onKeyDown={event => {if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1)}} className={`group relative flex items-center justify-center overflow-hidden rounded-[1.25rem] bg-[#bd4f2b] ${compact ? 'aspect-[4/3]' : 'min-h-[380px] lg:min-h-[620px]'}`}>
    <span aria-hidden="true" className="pointer-events-none absolute select-none text-[clamp(5rem,17vw,16rem)] font-black italic tracking-[-.08em] text-white/10">KICKS</span>
    <img key={image} src={photo(image)} alt={name} onError={event => { event.currentTarget.src = photo('samba-green') }} className="relative z-10 max-h-[520px] w-[82%] object-contain drop-shadow-2xl transition-transform duration-700 ease-out motion-safe:group-hover:-translate-y-3" />
    {!compact && gallery.length > 1 && <div ref={key} className="absolute inset-x-5 bottom-5 z-20 flex justify-between"><button onClick={()=>move(-1)} className="grid size-11 place-items-center rounded-full bg-background/90" aria-label="Previous product angle"><ArrowLeft size={17}/></button><span className="self-center rounded-full bg-background/90 px-3 py-2 text-xs">Photo {index+1} of {gallery.length}</span><button onClick={()=>move(1)} className="grid size-11 place-items-center rounded-full bg-background/90" aria-label="Next product angle"><ArrowRight size={17}/></button></div>}
  </div>
}
