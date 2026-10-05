import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import * as fontModule from 'opentype.js'

const opentype=fontModule.default || fontModule
let fonts
function loadFonts() {
 if(!fonts)fonts=Promise.all(['BarlowCondensed-SemiBold.ttf','NotoSans-BoldItalic.ttf','NotoSans-Regular.ttf'].map(async name=>{
  const bytes=await readFile(join(process.cwd(),'public','fonts',name))
  return opentype.parse(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength))
 })).catch(error=>{fonts=undefined;throw error})
 return fonts
}

// Only bundled glyph outlines enter the SVG: no text element, system font lookup,
// external reference, or user-provided XML can affect the rendered receipt.
export async function receiptText(value,size,{brand=false,color='#222222'}={}) {
 if(!/^#[0-9a-f]{6}$/i.test(color))throw new Error('Invalid receipt text color')
 const [body,wordmark,fallback]=await loadFonts()
 const preferred=brand?wordmark:body, path=new opentype.Path()
 let x=0,previous,previousFont
 for(const character of String(value)) {
  let font=preferred,glyph=font.charToGlyph(character)
  if(!glyph || glyph.index===0){font=fallback;glyph=font.charToGlyph(character)}
  if(previous && previousFont===font)x+=font.getKerningValue(previous,glyph)*size/font.unitsPerEm
  path.commands.push(...glyph.getPath(x,0,size).commands)
  x+=(glyph.advanceWidth || 0)*size/font.unitsPerEm
  previous=glyph;previousFont=font
 }
 path.fill=color
 const bounds=path.getBoundingBox(),width=Math.max(1,Math.ceil(bounds.x2-bounds.x1)+2),height=Math.max(1,Math.ceil(bounds.y2-bounds.y1)+2)
 return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${bounds.x1-1} ${bounds.y1-1} ${width} ${height}">${path.toSVG(3)}</svg>`)
}
