begin;
-- Additional visual-reference demo products. Prices and stock are fixtures,
-- not seller-confirmed offers. Existing variants are never overwritten.
insert into public.products(id,brand,name,color,category,description,image,price_kobo) values
('paisley-clog','Kicks Select','Paisley Buckle Clog','Espresso / Sand','Slip-ons','A sculptural clog with a dark paisley-like upper and warm footbed. Demo product based on the supplied visual reference.','paisley-clog-cutout',8500000),
('grey-panel-runner','Kicks Select','Layered Panel Runner','Stone / Graphite','Sport style','A layered grey runner with sculpted panels and a chunky outsole. Demo product based on the supplied visual reference.','grey-runner-reference-cutout',12000000),
('violet-runner','Kicks Select','Futurist Runner','Black / Violet','Sport style','A dark low-top runner with violet details and a sculpted sole. Demo product based on the supplied visual reference.','violet-runner-reference-cutout',11500000),
('navy-embroidered-clog','Kicks Select','Embroidered Suede Clog','Navy / Cream','Slip-ons','A navy suede clog with flowing contrast embroidery and a buckle strap. Demo product based on the supplied visual reference.','navy-embroidered-clog-reference-cutout',7800000),
('botanical-loafer','Kicks Select','Botanical Penny Loafer','Black / Ivory','Slip-ons','A classic loafer shape with a botanical painted vamp. Demo product based on the supplied visual reference.','botanical-loafer-reference-cutout',12500000),
('koi-loafer','Kicks Select','Koi Painted Loafer','Black / Cream','Slip-ons','A black-and-cream loafer pair with painted koi details. Demo product based on the supplied visual reference.','koi-loafer-reference-cutout',12500000)
on conflict(id) do nothing;

insert into public.product_variants(product_id,size,stock)
select p.id,s,10 from public.products p
cross join generate_series(39,45) as s
where p.id in ('paisley-clog','grey-panel-runner','violet-runner','navy-embroidered-clog','botanical-loafer','koi-loafer')
on conflict(product_id,size) do nothing;

commit;
