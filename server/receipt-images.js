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
 const height=Math.max(256,items.length*256),layers=[]
 const font=join(process.cwd(),'public','fonts','NotoSans-Regular.ttf')
 const brandFont=join(process.cwd(),'public','fonts','NotoSans-BoldItalic.ttf')
 // Explicit font files keep both letters and currency symbols independent of server fonts.
 async function textLayer(value,size,left,top,{color='#222222',maxWidth=560,brand=false}={}) {
  const rendered=await sharp({text:{text:`<span foreground="${color}">${escapeHtml(value)}</span>`,font:`Noto Sans ${brand?'Bold Italic ':''}${size}`,fontfile:brand?brandFont:font,rgba:true,dpi:72}}).png().toBuffer()
  const {data,info}=await sharp(rendered).resize({width:maxWidth,withoutEnlargement:true}).png().toBuffer({resolveWithObject:true})
  layers.push({input:data,left:left===null?Math.floor((1152-info.width)/2):left<0?1152+left-info.width:left,top})
 }
 for(const [index,item] of items.entries()) {
  const y=index*256,image=images.get(productImage(item))
  await textLayer('KICKS',240,null,y+12,{color:'#f4d8c5',maxWidth:950,brand:true})
  if(image)layers.push({input:await sharp(Buffer.from(image,'base64')).resize(192,192).png().toBuffer(),left:0,top:y+32})
  const words=String(item.name||'Shoe').split(/\s+/),lines=['']
  for(const word of words){const last=lines.length-1;if(lines[last]&&(lines[last]+' '+word).length>28)lines.push(word);else lines[last]+=(lines[last]?' ':'')+word}
  for(const [lineIndex,line] of lines.slice(0,2).entries())await textLayer(line,34,224,y+48+lineIndex*44,{maxWidth:550})
  await textLayer(`EU ${item.size} × ${item.quantity}`,28,224,y+160,{maxWidth:550})
  await textLayer(money(item.unit_price_kobo*item.quantity),34,-8,y+100,{maxWidth:350})
  layers.push({input:{create:{width:1152,height:2,channels:4,background:'#d8c7b8'}},left:0,top:y+254})
 }
 const content=await sharp({create:{width:1152,height,channels:4,background:'#fffdf9'}}).composite(layers).png().toBuffer()
 const id='receipt-items@kicks'
 return {sources:new Map([['kicks-items',`cid:${id}`]]),attachments:[{filename:'kicks-order-items.png',content:content.toString('base64'),disposition:'inline',id}]}
}
