# Receipt and checkout handoff

Objective: short appreciation heading, eight-character uppercase order label, no test wording in the receipt, dividers between items, and an orange KICKS watermark beneath both the shoes and item text.

The server renders the item panel as one inline PNG with Sharp: bundled thumbnails, names, EU sizes, quantities, amounts, separators and pale orange branding are composited together. This avoids depending on Gmail background-image support. The image has descriptive alt text; heading, order label, total and delivery details remain selectable HTML. Plain table rows remain the fallback for direct template calls without attachments. Full order/payment IDs remain in storage.

Checkout exposes Paystack only. The simulation API remains available for automated testing; its customer-facing button and redundant no-money paragraph were removed. The Paystack button still identifies test mode accurately. Payments remain in test mode.

Account email behavior: welcome events are unique per customer; sign-in events are unique per server-verified Supabase session. Successful events are not resent on refresh or repeat queue processing. Paid-order receipts remain separate.

Files: server/receipt-images.js, server/email-format.js, server/services.js, src/components/Checkout.jsx, tests/email.test.js, tests/payments.test.js, tests/receipt-images.test.js, scripts/build-receipt-images.js, package.json and package-lock.json.

Verification: generated item panel inspected with synthetic order data; tests, production build, Fallow and whitespace checks. Gmail delivery rendering still needs a new receipt. Restart the local Vite server so its imported API/template code reloads; deployed callbacks use the deployed code and need the local commits pushed by the user. Existing emails cannot update.
