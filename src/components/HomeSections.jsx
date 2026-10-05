import { useState } from 'react'
import { ArrowRight, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { shoppingAnswers } from '../../shared/shopping-guide.js'
import { photo } from '../data/products'

const display = 'font-display font-normal uppercase leading-[.98] tracking-[-.025em]'
const action = 'inline-flex min-h-11 w-fit items-center gap-4 text-base font-medium text-primary transition-colors duration-300 ease-[cubic-bezier(.32,.72,0,1)] hover:text-foreground'
const footerAction = 'flex min-h-11 w-fit items-center text-lg font-normal transition-opacity duration-300 ease-[cubic-bezier(.32,.72,0,1)] hover:opacity-70 md:text-xl'
const page = 'mx-auto max-w-[1680px] px-5 md:px-12 xl:px-16'

export function GoogleMark() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 shrink-0"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36Z"/><path fill="#34A853" d="M12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.12H3.05v2.59A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.92a6 6 0 0 1 0-3.84V7.49H3.05a10 10 0 0 0 0 9.02l3.35-2.59Z"/><path fill="#EA4335" d="M12 5.96c1.47 0 2.79.5 3.82 1.5l2.87-2.87A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.95 5.49l3.35 2.59A5.99 5.99 0 0 1 12 5.96Z"/></svg>
}

export function HomeHero({ onShop }) {
  const [view, setView] = useState('campaign')
  return <section className="relative mx-auto max-w-[1680px] overflow-hidden border-b border-border lg:min-h-[clamp(620px,49.5vw,790px)]">
    <div className="relative z-10 px-5 pb-9 pt-10 lg:w-[50%] md:px-12 md:py-[clamp(70px,6vw,108px)] xl:px-16">
      <h1 className={display + ' origin-left text-[clamp(3.5rem,12.5vw,7rem)] [transform:skewX(-7deg)] lg:text-[clamp(5.5rem,8.8vw,9.25rem)]'}><span className="block whitespace-nowrap">A different</span><span className="block">pace<span className="text-primary">.</span></span></h1>
      <p className="mt-7 text-lg leading-[1.4] md:mt-8 md:text-[clamp(19px,1.65vw,26px)]">Court classics. Everyday favourites.<br/>Pairs with personality.</p>
      <Button asChild className="mt-8 h-14 rounded-none bg-foreground px-7 text-base font-medium text-background hover:bg-primary md:mt-9 md:h-16 md:px-8 md:text-lg"><a href="#shop" onClick={onShop}>Find your next pair <ArrowRight className="ml-3"/></a></Button>
      <div className="mt-4 md:mt-5"><a href="#collections" className={action + ' text-foreground md:text-lg'}>Explore the collection <ArrowRight size={21} strokeWidth={1.4}/></a></div>
    </div>
    <div className={'relative isolate aspect-[4/3] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:aspect-auto ' + (view === 'campaign' ? 'lg:w-[58%]' : 'lg:w-[50%]')}>
      <a href="#product/samba-green" aria-label="View the Adidas Samba product" className="absolute inset-0">
        {view === 'campaign' ? <>
          <img src="/campaign/hero.webp" alt="Forest green Samba on an orange textured pedestal with a large Kicks wordmark" fetchPriority="high" className="absolute inset-0 size-full object-cover object-left"/>
        </> : <>
          <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[30%] bg-primary"/>
          <span aria-hidden="true" className={display + ' absolute left-[7%] top-[9%] text-[clamp(4rem,10vw,10rem)] text-primary/15'}>KICKS.</span>
          <img src={photo('samba-green')} alt="Actual forest green Samba catalogue photograph" className="absolute left-[7%] top-[15%] h-[68%] w-[78%] object-contain drop-shadow-[0_24px_18px_rgba(25,26,23,.15)] lg:top-[22%] lg:h-[59%]"/>
        </>}
      </a>
      <div role="group" aria-label="Hero photograph view" className="absolute right-4 top-5 z-10 flex gap-3 md:right-6 md:top-[52%] md:flex-col">
        <button onClick={() => setView('campaign')} aria-label="Show campaign photograph" aria-pressed={view === 'campaign'} className={'size-11 rounded-full border border-foreground/50 bg-forest ring-offset-2 ring-offset-background md:size-11 ' + (view === 'campaign' ? 'ring-1 ring-foreground' : '')}/>
        <button onClick={() => setView('product')} aria-label="Show actual product photograph" aria-pressed={view === 'product'} className={'size-11 rounded-full border border-foreground/50 bg-background ring-offset-2 ring-offset-background md:size-11 ' + (view === 'product' ? 'ring-1 ring-foreground' : '')}/>
      </div>
      {view === 'product' && <p className="pointer-events-none absolute bottom-5 left-5 right-20 text-xs font-medium leading-5 text-primary-foreground md:bottom-7 md:left-8">Adidas Samba · Forest / Cream<br/>Actual product photograph</p>}
    </div>
  </section>
}

export function Collections({ onChoose }) {
  const groups = [
    { category: 'Lifestyle', title: <>Everyday<br/>icons</>, image: 'lifestyle', alt: 'Green Samba resting on a natural stone block', surface: 'bg-forest' },
    { category: 'Court', title: <>Court<br/>classics</>, image: 'court', alt: 'Blue and white court low-top on a blue studio floor', surface: 'bg-sky' },
  ]
  return <section id="collections" className={page + ' scroll-mt-28 py-14 md:py-20'}>
    <h2 className={display + ' text-[clamp(2.75rem,7.5vw,7.875rem)] text-primary md:whitespace-nowrap'}>Good pairs. Great rotations.</h2>
    <p className="mb-7 mt-3 text-lg md:text-2xl">Shop by your pace.</p>
    <div className="grid gap-4 md:grid-cols-[3fr_2fr]">{groups.map(group => <a key={group.category} href="#shop" onClick={() => onChoose(group.category)} className={'group relative isolate block min-h-[390px] overflow-hidden text-cream md:min-h-[clamp(420px,39vw,630px)] ' + group.surface}>
      <img src={'/campaign/' + group.image + '.webp'} alt={group.alt} loading="lazy" className="absolute inset-0 size-full scale-[1.035] object-cover"/>
      <span aria-hidden="true" className="absolute inset-0 bg-foreground/5"/>
      <h3 className={display + ' absolute left-6 top-7 z-10 text-[clamp(4rem,7.2vw,7.6rem)] md:left-9 md:top-9'}>{group.title}</h3>
      <span className="absolute bottom-6 left-6 z-10 flex min-h-11 items-center gap-4 text-[19px] font-semibold uppercase tracking-[.06em] text-cream transition-opacity duration-300 ease-[cubic-bezier(.32,.72,0,1)] group-hover:opacity-75 md:bottom-8 md:left-9">Explore {group.category} <ArrowRight size={22} strokeWidth={1.4}/></span>
    </a>)}</div>
  </section>
}

export function Editorial({ onChoose, selected }) {
  return <section className={page + ' py-12 md:py-20'}>
    <div className="grid items-center gap-8 lg:grid-cols-[.82fr_2fr] lg:gap-10">
      <div><h2 className={display + ' text-[clamp(3.8rem,6.8vw,7rem)]'}>Not every<br/>pair plays<br/>it safe<span className="text-primary">.</span></h2><p className="mt-7 text-lg leading-[1.5] md:text-xl">Sculpted soles. Unexpected colour.<br/>A different point of view.</p><a href="#shop" onClick={() => onChoose('Sport style')} className={action + ' mt-6'}>Explore sport style <ArrowRight size={22} strokeWidth={1.4}/></a></div>
      <a href="#shop" onClick={() => onChoose('Sport style')} aria-label="Explore the sport style collection" className="relative block aspect-[3/2] overflow-hidden bg-forest">
        <img src="/campaign/editorial.webp" alt="Silver technical runner and embroidered navy buckle clog against a forest green Kicks backdrop" loading="lazy" className="size-full scale-[1.035] object-cover"/>
      </a>
    </div>
    <nav aria-label="Shop by style" className="mt-10 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:mt-14 md:gap-x-10">{['Lifestyle','Court','Sport style','Slip-ons'].map((category,index) => <span key={category} className="inline-flex items-center gap-5 md:gap-10">{index > 0 && <span aria-hidden="true" className="text-border">|</span>}<a href="#shop" onClick={() => onChoose(category)} aria-current={selected === category ? 'true' : undefined} className={'inline-flex min-h-11 items-center text-base transition-colors duration-300 ease-[cubic-bezier(.32,.72,0,1)] md:text-lg ' + (selected === category ? 'font-semibold text-primary' : 'hover:text-primary')}>{category}</a></span>)}</nav>
  </section>
}



export function ShoppingGuide() {
  return <section id="shopping-guide" className={page + ' scroll-mt-28 pb-14 pt-12 md:pb-16 md:pt-20'}>
    <div className="mb-8 grid items-center gap-6 lg:mb-10 lg:grid-cols-[1.5fr_1fr]"><h2 className={display + ' text-[clamp(3rem,5.8vw,6.1rem)]'}>Your pair. Your pace.</h2><p className="text-lg leading-[1.5] md:text-xl">Choose your EU size. Build your bag.<br/>Sign in when you are ready to check out.</p></div>
    <div>{shoppingAnswers.map(([question, answer]) => <details key={question} className="group border-b border-foreground/55"><summary className="flex min-h-24 cursor-pointer list-none items-center justify-between gap-5 py-6 text-lg font-semibold md:min-h-28 md:text-[clamp(22px,1.9vw,30px)] [&::-webkit-details-marker]:hidden">{question}<Plus strokeWidth={1.4} aria-hidden="true" className="shrink-0 motion-safe:transition-transform group-open:rotate-45" size={28}/></summary><p className="max-w-4xl pb-7 text-base leading-7 text-muted-foreground">{answer}</p></details>)}</div>
  </section>
}

export function StoreFooter({ onChoose }) {
  return <footer className="bg-primary text-primary-foreground"><div className={page + ' py-12 md:pb-7 md:pt-14'}>
    <div className="grid items-start gap-10 md:grid-cols-[2.6fr_.75fr_.85fr] md:gap-7">
      <a href="#" aria-label="Kicks home" className={display + ' w-fit origin-left text-[clamp(6rem,19vw,20rem)] leading-[.86] [transform:skewX(-8deg)]'}>KICKS.</a>
      <nav aria-label="Footer shop"><h2 className={display + ' mb-4 text-3xl tracking-normal'}>Shop:</h2>{['All pairs','Lifestyle','Court','Slip-ons'].map(category => <a key={category} href="#shop" onClick={() => onChoose(category)} className={footerAction}>{category}</a>)}</nav>
      <nav aria-label="Footer explore"><h2 className={display + ' mb-4 text-3xl tracking-normal'}>Explore:</h2><a href="#atlas" className={footerAction}>Shoe field guide</a><a href="#shopping-guide" className={footerAction}>Shopping guide</a></nav>
    </div>
    <div className="mt-9 flex flex-wrap justify-between gap-3 border-t border-cream/30 pt-4 text-sm"><p>A fresh pair. A different pace.</p><p>Test store. No real shipment.</p></div>
  </div></footer>
}
