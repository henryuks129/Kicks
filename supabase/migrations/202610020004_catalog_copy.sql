begin;
-- Preserve existing product names, prices, variants and stock.
update public.products set description=replace(description,' Demo product based on the supplied visual reference.','')
where id in ('paisley-clog','grey-panel-runner','violet-runner','navy-embroidered-clog','botanical-loafer','koi-loafer');
commit;
