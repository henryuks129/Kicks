import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const productImage = item => item.image || item.product_variants?.products?.image

// Embed only bundled catalog thumbnails, never arbitrary URLs or filesystem paths.
export async function receiptImages(items) {
 const sources=new Map(),attachments=[]
 for(const item of [...items,{image:'kicks-backdrop'}]) {
  const image=productImage(item)
  if(typeof image!=='string'||sources.has(image))continue
  const key=image.replace(/^\/products\//,'').replace(/\.png$/,'')
  if(!/^[a-zA-Z0-9_-]+$/.test(key))continue
  let content
  try {content=await readFile(join(process.cwd(),'public','receipt-products',`${key}.png`))}
  catch(error) {if(error.code==='ENOENT')continue;throw error}
  const id=`product-${key}@kicks`
  sources.set(image,`cid:${id}`)
  attachments.push({filename:`${key}.png`,content:content.toString('base64'),disposition:'inline',id})
 }
 return {sources,attachments}
}
