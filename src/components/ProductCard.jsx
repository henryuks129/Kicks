import { useState } from 'react'
import { ArrowUpRight, ChevronDown, Plus } from 'lucide-react'
import { money, photo } from '../data/products'
import { Button } from './ui/button'

export function ProductCard({product,onAdd,busy}) {
 const [size,setSize]=useState(''),[error,setError]=useState(''),[adding,setAdding]=useState(false);
 async function add(event){
  event.preventDefault();
  if(busy||adding)return;
  if(!size){setError('Choose a size to add this pair.');return}
  setError('');setAdding(true);
  try {await onAdd(product,Number(size))}finally {setAdding(false)}
 }
 return <article>
  <a href={`#product/${product.id}`} className="group block">
   <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-muted"><img src={photo(product.image)} alt={`${product.brand} ${product.name}, ${product.color}`} loading="lazy" className="h-[85%] w-[85%] object-contain transition-transform duration-500 motion-safe:group-hover:-translate-y-3 motion-safe:group-hover:-rotate-6"/></div>
   <div className="mt-4 flex justify-between gap-3"><div><p className="mb-1 text-xs text-muted-foreground">{product.brand} / {product.category}</p><h3 className="text-xl font-bold tracking-tight">{product.name}</h3><p className="mt-1 text-sm text-muted-foreground">{product.color}</p></div><div className="text-right"><p className="text-sm font-semibold">{money(product.price)}</p><ArrowUpRight className="mt-4 ml-auto" size={20}/></div></div>
  </a>
  <form onSubmit={add} className="mt-5">
   <div className="flex gap-2">
    <label className="relative min-w-0 flex-1"><span className="sr-only">EU size for {product.brand} {product.name}, {product.color}</span><select value={size} onChange={event=>{setSize(event.target.value);setError('')}} aria-invalid={!!error} aria-describedby={error?`size-error-${product.id}`:undefined} className="h-12 w-full appearance-none rounded-full border border-border bg-transparent px-4 pr-11 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"><option value="">Choose EU size</option>{product.sizes.map(value=><option key={value} value={value}>EU {value}</option>)}</select><ChevronDown aria-hidden="true" className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16}/></label>
    <Button type="submit" disabled={busy||adding||!product.sizes.length} aria-busy={adding} aria-label={`Add ${product.brand} ${product.name}, ${product.color} to bag`} className={`shrink-0 ${busy&&!adding&&product.sizes.length?'disabled:opacity-100':''}`}>{adding?'Adding…':'Add to bag'} <Plus size={16}/></Button>
   </div>
   {error&&<p id={`size-error-${product.id}`} role="alert" className="mt-2 text-sm text-primary">{error}</p>}
  </form>
 </article>
}
