export const escapeHtml = value => String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
export const money = value => new Intl.NumberFormat('en-NG',{style:'currency',currency:'NGN'}).format(value/100);
