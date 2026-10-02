import { ArrowLeft, ArrowUpRight, MapPin } from 'lucide-react'

const regions = [
  {name:'The Court',category:'Court',tag:'Hard lines · quick feet',left:'19%',top:'34%',color:'bg-[#bd4f2b]'},
  {name:'The Terrace',category:'Lifestyle',tag:'Everyday icons · easy pace',left:'61%',top:'24%',color:'bg-[#6d8062]'},
  {name:'The Track',category:'Sport style',tag:'Built to move · layered forms',left:'46%',top:'65%',color:'bg-[#c4a86b]'},
  {name:'The Studio',category:'Slip-ons',tag:'Odd details · considered craft',left:'78%',top:'63%',color:'bg-[#788c90]'},
]

export function ShoeAtlas({onChoose}) {
  return <main className="mx-auto max-w-[1500px] px-5 py-9 md:px-12 md:py-14">
    <a href="#shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft size={16}/> Back to the shop</a>
    <div className="mt-7 flex flex-wrap items-end justify-between gap-5">
      <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-primary">A guide to the rotation</p><h1 className="mt-3 text-5xl font-black leading-[.9] tracking-[-.06em] md:text-7xl">THE SHOE ATLAS</h1></div>
      <p className="max-w-sm pb-1 text-base leading-7 text-muted-foreground">Every pair has its place. Pick a terrain to find the styles that belong there.</p>
    </div>
    <p className="mt-8 flex items-center gap-2 text-sm font-medium"><MapPin size={16} className="text-primary"/> Choose a district</p>
    <div className="relative mt-3 min-h-[500px] overflow-hidden rounded-[1.5rem] border border-border bg-[#e9e6dc] md:h-[610px] md:rounded-[2rem]">
      <div className="absolute inset-0 opacity-75" aria-hidden="true">
        <svg viewBox="0 0 1200 620" className="size-full" preserveAspectRatio="xMidYMid slice">
          <path d="M-80 405C100 320 190 455 340 350s210-152 350-65 220 190 380 84 205-113 230-122M-50 500c150-85 255 45 410-50s213-146 344-49 216 164 344 74 173-100 210-105M55 110c137 93 241 13 363 92s188 92 310 13 255-86 434 18M34 250c110-61 228 3 328 68s191 98 317 24 249-155 484-59M200-25c-12 160 134 197 86 343s-2 191 128 228 186 78 156 112M880-18c-56 153-2 216 77 313s79 184 3 344M1070 50c-118 112-62 194 13 267s110 171 57 290" fill="none" stroke="#b8b8aa" strokeWidth="2" strokeDasharray="2 11"/>
          <path d="M90 80c107 45 154 134 217 181s153 58 242 2 181-90 269-36 135 131 227 143 164-54 220-123M-8 333c148-44 216 54 347 31s180-134 292-123 193 108 302 89 170-94 271-85M389-32c6 145 84 209 61 304s-45 153 16 245 84 131 79 143M745-21c-61 121-60 214-5 289s65 130 29 234 11 133 96 155" fill="none" stroke="#f7f5ed" strokeWidth="6"/>
          <path d="M75 112 215 52l103 44 34 117-110 77-145-36z" fill="#738879"/><path d="m441 59 145-28 134 89-24 122-122 39-150-89z" fill="#bd4f2b"/><path d="m268 341 111-111 119 44 32 137-87 129-148-23-67-101z" fill="#c4a86b"/><path d="m768 330 120-111 153 59 40 128-105 118-167-8-67-85z" fill="#8b9a8b"/>
          <path d="M78 111 215 51l104 46m121-38 146-28 134 89m-452 220 111-110 119 43m270 58 120-112 153 60" fill="none" stroke="#f7f5ed" strokeWidth="3"/>
        </svg>
      </div>
      <p className="absolute left-6 top-5 text-[10px] font-semibold uppercase tracking-[.18em] text-foreground/60 md:left-8 md:top-7">KICKS · FIELD GUIDE 01</p>
      {regions.map((region,index)=><button key={region.category} onClick={()=>onChoose(region.category)} className="group absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 rounded-xl px-2 py-2 text-center focus-visible:outline-2 focus-visible:outline-ring" style={{left:region.left,top:region.top}} aria-label={`Explore ${region.category}: ${region.tag}`}>
        <span className={`grid size-11 place-items-center rounded-full border-[5px] border-[#f7f5ed] text-white shadow-lg transition-transform group-hover:scale-110 ${region.color}`}><ArrowUpRight size={16}/></span>
        <span className="rounded-md bg-background/95 px-3 py-2 shadow-sm"><span className="block text-sm font-bold">{region.name}</span><span className="mt-0.5 hidden text-[11px] text-muted-foreground sm:block">{region.tag}</span></span>
      </button>)}
      <span className="absolute bottom-5 right-6 rounded-full border border-border/80 bg-background/80 px-3 py-2 text-[10px] font-medium uppercase tracking-[.14em] text-muted-foreground md:bottom-7 md:right-8">Move through the collection</span>
      <span className="absolute bottom-5 left-6 hidden text-[10px] font-medium uppercase tracking-[.14em] text-foreground/60 sm:block md:bottom-7 md:left-8">Lagos · Everywhere</span>
    </div>
    <div className="mt-4 grid grid-cols-2 gap-2 md:hidden">{regions.map(region=><button key={region.category} onClick={()=>onChoose(region.category)} className="min-h-14 rounded-xl border border-border bg-background px-4 text-left"><span className="block text-sm font-semibold">{region.name}</span><span className="text-xs text-muted-foreground">{region.tag}</span></button>)}</div>
  </main>
}
