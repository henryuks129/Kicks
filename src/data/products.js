// Prototype catalog: prices and size availability are demo fixtures, not supplier claims.
export const products = [
  { id:'samba-green', brand:'Adidas', name:'Samba', color:'Forest / Cream', category:'Lifestyle', price:85000, image:'samba-green', description:'A textured forest-green upper, cream stripes and a gum sole. A familiar terrace silhouette with a different finish.' },
  { id:'puma-black', brand:'Puma', name:'Suede XL', color:'Black / White', category:'Lifestyle', price:70000, image:'puma-black', description:'Black suede, oversized white laces and a low profile. An everyday rotation staple.' },
  { id:'puma-red', brand:'Puma', name:'Suede XL', color:'Red / White', category:'Lifestyle', price:70000, image:'puma-red', description:'A red suede upper with a white sole and contrast stripe. For days that need a little colour.' },
  { id:'raf-grey', brand:'Raf Simons', name:'Runner', color:'Stone grey', category:'Sport style', price:120000, image:'raf-grey', description:'A sculptural grey silhouette with layered panels and a chunky outsole.' },
  { id:'samba-mint', brand:'Adidas', name:'Samba LT', color:'Mint / Cream', category:'Lifestyle', price:90000, image:'samba-mint', description:'Soft mint panels, dark green stripes and a folded tongue give this low top its character.' },
  { id:'dunk', brand:'Nike', name:'SB Dunk Low', color:'Blue / Cream', category:'Court', price:95000, image:'dunk', gallery:['dunk','dunk-sole'], description:'Blue accents, patterned panels and an illustrated outsole. A low-top skate silhouette with plenty to look at.' },
].map(p => ({ ...p, sizes:[39,40,41,42,43,44,45] }))
export const money = value => new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN',maximumFractionDigits:0}).format(value)
export const photo = name => `/products/${name}.png`
