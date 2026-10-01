-- Existing six-product prototype catalog. Prices and stock are demo fixtures.
insert into public.products(id,brand,name,color,category,description,image,gallery,price_kobo) values
('samba-green','Adidas','Samba','Forest / Cream','Lifestyle','A textured forest-green upper, cream stripes and a gum sole. A familiar terrace silhouette with a different finish.','samba-green',null,8500000),
('puma-black','Puma','Suede XL','Black / White','Lifestyle','Black suede, oversized white laces and a low profile. An everyday rotation staple.','puma-black',null,7000000),
('puma-red','Puma','Suede XL','Red / White','Lifestyle','A red suede upper with a white sole and contrast stripe. For days that need a little colour.','puma-red',null,7000000),
('raf-grey','Raf Simons','Runner','Stone grey','Sport style','A sculptural grey silhouette with layered panels and a chunky outsole.','raf-grey',null,12000000),
('samba-mint','Adidas','Samba LT','Mint / Cream','Lifestyle','Soft mint panels, dark green stripes and a folded tongue give this low top its character.','samba-mint',null,9000000),
('dunk','Nike','SB Dunk Low','Blue / Cream','Court','Blue accents, patterned panels and an illustrated outsole. A low-top skate silhouette with plenty to look at.','dunk','["dunk","dunk-sole"]'::jsonb,9500000)
on conflict(id) do nothing;
insert into public.product_variants(product_id,size,stock)
select p.id,s,10 from public.products p cross join generate_series(39,45) s
on conflict(product_id,size) do nothing;
