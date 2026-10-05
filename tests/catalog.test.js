import test from 'node:test';
import assert from 'node:assert/strict';
import {selectProducts} from '../shared/catalog.js';
const rows=[{brand:'Adidas',name:'Samba',color:'Forest',category:'Lifestyle',price_kobo:12000000},{brand:'Nike',name:'Court Low',color:'Blue',category:'Court',price_kobo:9500000}];
test('web and native catalogue share category, colour search and sorting',()=>{
 assert.equal(selectProducts(rows,{filter:'Lifestyle'})[0].name,'Samba');
 assert.equal(selectProducts(rows,{query:'  BLUE  '})[0].brand,'Nike');
 assert.deepEqual(selectProducts(rows,{sort:'low'}).map(p=>p.brand),['Nike','Adidas']);
 assert.deepEqual(selectProducts(rows.map(p=>({...p,price:p.price_kobo/100,price_kobo:undefined})),{sort:'high'}).map(p=>p.brand),['Adidas','Nike']);
 assert.equal(selectProducts(rows,{filter:'Court',query:'samba'}).length,0);
 assert.equal(rows[0].brand,'Adidas');
});
