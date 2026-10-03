import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import sharp from 'sharp'
import { escapeHtml, money } from './email-format.js'

export const productImage = item => item.image || item.product_variants?.products?.image

// Read bundled thumbnails only; never fetch arbitrary URLs or filesystem paths.
export async function receiptImages(items) {
 const images=new Map()
 for(const item of items) {
  const image=productImage(item)
  if(typeof image!=='string'||images.has(image))continue
  const key=image.replace(/^\/products\//,'').replace(/\.png$/,'')
  if(!/^[a-zA-Z0-9_-]+$/.test(key))continue
  try {images.set(image,(await readFile(join(process.cwd(),'public','receipt-products',`${key}.png`))).toString('base64'))}
  catch(error) {if(error.code!=='ENOENT')throw error}
 }
 const height=Math.max(128,items.length*128)
 const rows=items.map((item,index)=>{
  const y=index*128, image=images.get(productImage(item))
  const words=String(item.name||'Shoe').split(/\s+/),lines=['']
  for(const word of words){const last=lines.length-1;if(lines[last]&&(lines[last]+' '+word).length>28)lines.push(word);else lines[last]+=(lines[last]?' ':'')+word}
  const name=lines.slice(0,2).map((line,i)=>`<text x="112" y="${y+44+i*22}" font-size="17" font-weight="600">${escapeHtml(line)}</text>`).join('')
  return `<text x="288" y="${y+94}" text-anchor="middle" font-size="132" font-weight="900" font-style="italic" letter-spacing="-8" fill="#f4d8c5">KICKS</text>${image?`<image href="data:image/png;base64,${image}" x="0" y="${y+16}" width="96" height="96"/>`:''}<g fill="#222">${name}<text x="112" y="${y+96}" font-size="14">EU ${escapeHtml(item.size)} × ${escapeHtml(item.quantity)}</text><text x="572" y="${y+64}" text-anchor="end" font-size="17" font-weight="600">${escapeHtml(money(item.unit_price_kobo*item.quantity))}</text></g><line x1="0" x2="576" y1="${y+127}" y2="${y+127}" stroke="#d8c7b8"/>`
 }).join('')
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="576" height="${height}" font-family="Arial,Helvetica,sans-serif"><rect width="576" height="${height}" fill="#fffdf9"/>${rows}</svg>`
 const content=await sharp(Buffer.from(svg)).resize(1152,height*2).png().toBuffer()
 const id='receipt-items@kicks'
 return {sources:new Map([['kicks-items',`cid:${id}`]]),attachments:[{filename:'kicks-order-items.png',content:content.toString('base64'),disposition:'inline',id}]}
}
