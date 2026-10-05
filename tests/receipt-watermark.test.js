import test from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { receiptImages } from '../server/receipt-images.js'

test('a long receipt has one centered watermark instead of one per item',async()=>{
 for(const count of [4,8]){
  const items=Array.from({length:count},()=>({name:'Test pair',size:43,quantity:1,unit_price_kobo:9500000}))
  const result=await receiptImages(items)
  const {data,info}=await sharp(Buffer.from(result.attachments[0].content,'base64')).removeAlpha().raw().toBuffer({resolveWithObject:true})
  let first=info.height,last=-1
  for(let y=0;y<info.height;y++)for(let x=0;x<info.width;x++){
   const i=(y*info.width+x)*info.channels
   if(data[i]===244&&data[i+1]===223&&data[i+2]===208){first=Math.min(first,y);last=Math.max(last,y)}
  }
  assert.ok(last>=first,'watermark remains visible')
  assert.ok(last-first<256,'branding occupies one band for the whole item group')
  assert.ok(Math.abs((first+last)/2-info.height/2)<8,'branding is centered across the group')
 }
})
