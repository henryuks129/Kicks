// The web and native storefront use the same search, category and price ordering.
export function selectProducts(products, {filter = 'All pairs', query = '', sort = 'featured'} = {}) {
 const term = query.trim().toLowerCase();
 return products.filter(product => (filter === 'All pairs' || product.brand === filter || product.category === filter) && `${product.brand} ${product.name} ${product.color || ''}`.toLowerCase().includes(term)).sort((a,b) => {
  const price = product => product.price_kobo ?? product.price * 100;
  return sort === 'low' ? price(a)-price(b) : sort === 'high' ? price(b)-price(a) : 0;
 });
}
