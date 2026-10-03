# Receipt styling

Approved brief: a large orange KICKS backdrop for the transactional receipt. Preserve totals, customer details, test labels, and embedded product images.

Direction: existing Kicks burnt orange (#bd4f2b), warm paper backdrop, 104px italic wordmark above and a pale orange raster KICKS watermark behind the order contents, with separators beneath every product row. Email-safe inline styles and presentation tables; no external font or positioned overlays. The generated PNG repeats behind the content; production uses its public HTTPS URL and local email uses an inline CID attachment. Email clients that suppress backgrounds retain the readable warm paper panel. Product images retain descriptive alt text.

Preview fixture uses synthetic customer details. Local rendering does not certify all email clients. Existing delivered emails do not change; the new design requires a new receipt after deployment.

Follow-up: ProductCard now tracks its own add operation. Only the clicked button dims and says Adding; other cards retain their black appearance while the shared cart save lock prevents overlapping mutations. Local checks: 35 tests, production build, Fallow duplication, and diff whitespace checks. Push and deployment remain user-managed.

Receipt heading: Thanks for your order! Display the first eight order-ID characters in uppercase (for example #735EB97D), omit the long payment reference from the email, and retain full identifiers in the database. Test/simulation disclosure moves to small footer text. Background appearance in Gmail still requires a newly sent receipt; existing emails do not update.
