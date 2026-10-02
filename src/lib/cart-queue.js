// Serialize saves while the UI remains responsive to every click.
export function createCartQueue() {
 let chain=Promise.resolve(),pending=0;
 const confirmed=new Map(),versions=new Map();
 return {
  enqueue(item,qty,persist,rollback){
   if(!pending)confirmed.clear();
   if(!confirmed.has(item.key))confirmed.set(item.key,item);
   const version=Symbol();versions.set(item.key,version);pending++;
   const save=chain.then(async()=>{
    try {await persist(qty);confirmed.set(item.key,qty>0?{...item,qty}:null)}
    catch(error){if(versions.get(item.key)===version)rollback(confirmed.get(item.key),error)}
   }).finally(()=>{pending--});
   chain=save.catch(()=>{});return save;
  },
  flush(){return chain},
 };
}
