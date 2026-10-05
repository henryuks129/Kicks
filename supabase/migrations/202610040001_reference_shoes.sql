begin;
-- Demo fixtures only. Do not overwrite existing products, prices or stock.
insert into public.products(id,brand,name,color,category,description,image,price_kobo) values
('zip-suede-brown','Kicks Select','Zip Suede Low','Clay brown','Lifestyle','A brown suede pair with a centre zip and sculpted sole. Based on the supplied product reference.','zip-suede-brown',10500000),
('sculpted-orange','Kicks Select','Sculpted Slip-on','Orange / Forest','Sport style','Orange, yellow and forest-green panels form an expressive sculpted slip-on.','sculpted-orange',9500000),
('sculpted-lime','Kicks Select','Sculpted Slip-on','Lime / Espresso','Sport style','A lime-green sculpted silhouette with dark brown contrast panels.','sculpted-lime',9500000),
('dunk-pokemon-blue','Nike','Illustrated Court Low','Sky blue / White','Court','A blue and white low-top pair with illustrated details and a vivid blue outsole. Model name is descriptive pending seller confirmation.','dunk-pokemon-blue',9500000)
on conflict(id) do nothing;
insert into public.product_variants(product_id,size,stock)
select p.id,s,10 from public.products p cross join generate_series(39,45) as s
where p.id in ('zip-suede-brown','sculpted-orange','sculpted-lime','dunk-pokemon-blue')
on conflict(product_id,size) do nothing;
commit;
