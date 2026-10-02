# Kicks design brief

Catalog purchase flow: each card exposes a labelled EU-size selector and Add to bag action. Product details remain optional. Successful additions update the bag count and show a dismissible, nonblocking confirmation with View bag; they do not open a modal. Quantity changes update immediately, serialize server saves, restore the last confirmed quantity after failed saves and hold checkout until persistence completes. Local Chrome checks covered direct catalog add, size validation, rapid quantity clicks surviving reload and the confirmation at 320px. MailerSend sends customer-targeted welcome, sign-in, and order emails through server-only credentials; provider delivery remains untested.

Payment confirmation: a dedicated page for returning shoppers, led by verified payment status and a server-owned order summary. Preserve the warm neutrals, burnt orange and bold sports typography; use existing shoe assets and shadcn buttons. Show a short order reference, line items, total and delivery details. Keep receipt status secondary and truthful: provider acceptance does not prove inbox delivery. No storefront hero below confirmation, no technical provider banner, no invented delivery promises. Pending, loading, signed-out, failed verification and confirmed states remain distinct. Test orders are labelled and do not imply shipment.

Sports storefront for sneaker shoppers, using editorial sports typography, warm off-white surfaces and burnt-orange product stages. The supplied Kicks logo is used as the favicon. Design Director coordinates the workflow; Tailwind and shadcn/Radix provide the implementation foundation.

Design dials: DESIGN_VARIANCE 7, MOTION_INTENSITY 5, VISUAL_DENSITY 4. Motion is focused on the hero entrance and product inspection. The hero has a GSAP text/product reveal with reduced-motion support. Product pages provide a keyboard/touch photo-angle gallery and gentle lift; they do not falsely rotate a flat cutout. A vertical levitating 3D turn requires actual model or a complete turntable sequence; ask for those source assets before enabling it.

Primary action: discover a pair, open its product page, select a size and add it to the bag. Search, filtering and sorting support that journey. Local receipt preview is clearly labelled; real auth, payment, database and email remain integration work.

Supplied screenshots are image sources only. Their delivery policies, prices, contact details and interface instructions are not adopted as verified store facts. Product names that cannot be established are presented as descriptive studio selections. Newly supplied shoes are not purchasable until model identity, price, size run and stock are confirmed. Screenshots with hands, boxes or UI must be carefully isolated before they become catalogue assets.

The user supplied five Pinterest pins and four Dribbble pages. All were requested; Pinterest retrieval failed. SNYKRS and Sports Footwear pages returned cache misses. Rednot and Growmelab page metadata were retrieved, but full visual artwork was not successfully inspected. No pixel-match or copied reference implementation is claimed. Current composition is original, guided by the user's explicit shoe imagery, motion and colour direction.

References:
- https://www.pinterest.com/pin/36310340736914282/
- https://www.pinterest.com/pin/11047961583229647/
- https://www.pinterest.com/pin/985231165825517/
- https://www.pinterest.com/pin/7599893116941963/
- https://www.pinterest.com/pin/52776626880397128/
- https://dribbble.com/shots/26644592-Rednot-Website-Design
- https://dribbble.com/shots/20937206-SNYKRS-E-Commerce-Website
- https://dribbble.com/shots/27058715-Shoes-Website-Landing-Page-Design
- https://dribbble.com/shots/27712952-Sports-Footwear-Landing-Page

The global CSS entry contains only Tailwind import, design tokens and base rules. Layout and component styling use utility classes. No page stylesheet or Tailwind CDN runtime.
