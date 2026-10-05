import test from 'node:test'
import assert from 'node:assert/strict'
import sharp from 'sharp'
import { receiptText } from '../server/receipt-type.js'

test('receipt uses the condensed bundled face and renders visible glyphs',async()=>{
 const svg=await receiptText('Kicks Select Zip Suede Low',40)
 const {data,info}=await sharp(svg).raw().toBuffer({resolveWithObject:true})
 assert.ok(info.width>350&&info.width<430,'condensed lettering has the expected width, rather than the 521px fallback')
 assert.ok(data.some((value,index)=>index%4===3&&value>0),'glyphs are visible')
 assert.doesNotMatch(svg.toString(),/NaN|<text\b/)
})

test('receipt values cannot introduce SVG markup and the currency symbol is visible',async()=>{
 const svg=await receiptText('<script>&₦',40)
 assert.doesNotMatch(svg.toString(),/<script|<text\b|NaN/)
 const {data}=await sharp(await receiptText('₦',40)).raw().toBuffer({resolveWithObject:true})
 assert.ok(data.some((value,index)=>index%4===3&&value>0))
})
