import { ArrowLeft, ArrowRight } from 'lucide-react'
import { photo } from '../data/products'
export function ShoeStage({ image, name, compact = false, gallery = [], onChange }) {
  const index = Math.max(0, gallery.indexOf(image))
  const move = (direction) => onChange?.(gallery[(index + direction + gallery.length) % gallery.length])
  return <div tabIndex={compact ? -1 : 0} onKeyDown={event => {if(event.key==='ArrowLeft')move(-1);if(event.key==='ArrowRight')move(1)}} className={`group relative flex items-center justify-center overflow-hidden rounded-[1.25rem] [container-type:inline-size] ${compact ? 'aspect-[4/3] bg-muted' : 'min-h-[380px] bg-[#bd4f2b] lg:min-h-[620px]'}`}>
    {!compact && <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[5%] select-none text-center font-display text-[28cqw] leading-none tracking-[-.025em] text-white/20">KICKS</span>}
    <img key={image} src={photo(image)} alt={name} onError={event => { event.currentTarget.src = photo('samba-green') }} loading={compact ? "lazy" : "eager"} className={`relative z-10 w-[82%] object-contain transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-safe:group-hover:-translate-y-3 ${compact ? "h-[85%]" : "mt-[18%] max-h-[440px]"}`} />
    {!compact && gallery.length > 1 && <div className="absolute inset-x-5 bottom-5 z-20 flex justify-between"><button onClick={()=>move(-1)} className="grid size-11 place-items-center rounded-full bg-background/90" aria-label="Previous product angle"><ArrowLeft size={17}/></button><span className="self-center rounded-full bg-background/90 px-3 py-2 text-xs">Photo {index+1} of {gallery.length}</span><button onClick={()=>move(1)} className="grid size-11 place-items-center rounded-full bg-background/90" aria-label="Next product angle"><ArrowRight size={17}/></button></div>}
  </div>
}
