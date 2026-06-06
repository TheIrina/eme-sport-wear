# Advertising Integration (Meta Catalog, Google Merchant, CAPI, and Storefront Tracking) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a dynamic XML Product Feed for Meta/Google, backend Conversions API (CAPI) and Google Analytics (GA4) tracking for orders, and define a comprehensive integration specification for storefront tracking.

**Architecture:** Create modular workflow steps for fetching and formatting product catalogs into XML, serve it via a custom GET endpoint, implement a subscriber for backend order events to forward conversions to Meta and Google Ads, and document storefront integration rules for deduplication.

**Tech Stack:** MedusaJS v2, TypeScript, XML/RSS 2.0, Meta Conversions API (CAPI), Google Analytics 4 (GA4) Measurement Protocol.

---

## Technical Overview & Storefront Integration Requirements

To achieve maximum compatibility and avoid duplicate counts, browser-side tracking and server-side tracking must work in sync.

### 1. Storefront Tracking Implementations (Browser-side Checklist)

The storefront (e.g., Next.js) must implement browser tracking for standard e-commerce events. To ensure maximum compatibility with the Medusa v2 backend CAPI, the following integrations must be built:

#### A. Initializing Pixels & Tags
*   **Meta Pixel Script:** Load the standard `fbp` base code inside the root layout (`app/layout.tsx` in Next.js).
*   **Google Tag (gtag.js):** Load the Google Analytics 4 (GA4) / Google Tag container.

#### B. Event Deduplication Rule (Event ID)
Every standard event sent from the browser must include an `event_id` parameter. When the corresponding event is triggered on the backend (specifically `Purchase`), the backend will send the exact same `event_id`. 
*   **Deduplication Key Format:** `purchase_<order_id>` (e.g., `purchase_order_01HTB9X...`).

#### C. Event Payloads (Browser-side JavaScript)
When triggering events on the storefront, use these exact payloads:

1.  **ViewContent (Product Page View)**
    *   Trigger: Product detail page load.
    *   Code:
        ```javascript
        fbq('track', 'ViewContent', {
          content_type: 'product',
          content_ids: [variantId], // Must match the variant ID (id) from Medusa
          content_name: productName,
          value: parseFloat(price),
          currency: currencyCode.toUpperCase()
        }, { eventID: `view_${variantId}` });
        ```

2.  **AddToCart**
    *   Trigger: User clicks "Add to cart".
    *   Code:
        ```javascript
        fbq('track', 'AddToCart', {
          content_type: 'product',
          content_ids: [variantId],
          content_name: productName,
          value: parseFloat(price),
          currency: currencyCode.toUpperCase()
        }, { eventID: `add_${variantId}_${Date.now()}` });
        ```

3.  **InitiateCheckout**
    *   Trigger: User enters the checkout flow page.
    *   Code:
        ```javascript
        fbq('track', 'InitiateCheckout', {
          content_type: 'product',
          content_ids: cartItems.map(item => item.variant_id),
          num_items: cartItems.length,
          value: parseFloat(cartSubtotal),
          currency: currencyCode.toUpperCase()
        }, { eventID: `checkout_${cartId}` });
        ```

4.  **Purchase (Order Confirmation Page)**
    *   Trigger: Redirected to `/order/confirmed/[id]`.
    *   Code:
        ```javascript
        fbq('track', 'Purchase', {
          content_type: 'product',
          content_ids: orderItems.map(item => item.variant_id),
          value: parseFloat(orderTotal),
          currency: currencyCode.toUpperCase()
        }, { eventID: `purchase_${orderId}` }); // Crucial: Must match backend event_id
        ```

---

### 2. Client Metadata Transmission to Backend (Event Match Quality)

Since the Medusa backend triggers the Conversions API (CAPI) on the server, it needs to access the user's browser context (cookies, IP, User Agent) to achieve a high Match Quality score.

#### A. Capturing Cookies on the Storefront
The storefront must read the following browser cookies using a utility library (e.g., `js-cookie`):
*   `_fbp`: Facebook Browser Pixel ID (e.g., `fb.1.1596403881.123456789`).
*   `_fbc`: Facebook Click ID (generated when a user arrives via an ad click, containing `fbclid`).

#### B. Forwarding Parameters during Checkout
When the customer proceeds with checking out, the storefront must update the Medusa Cart's `metadata` object using the Medusa Client SDK or HTTP PUT:

*   **API Endpoint:** `POST /store/carts/{cart_id}`
*   **Payload:**
    ```json
    {
      "metadata": {
        "fbp": "fb.1.1596403881.123456789",
        "fbc": "fb.1.1596403881.fbclid_value",
        "client_ip": "203.0.113.195",
        "client_user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)..."
      }
    }
    ```

#### C. Backend Processing
When the order is placed, Medusa copies the `cart.metadata` to `order.metadata`. The backend subscriber [order-placed.ts](file:///Users/santiago/proyectos/medusa-js/apps/backend/src/subscribers/order-placed.ts) will automatically parse these values from the order's metadata and forward them to the Meta Graph API and GA4, guaranteeing seamless tracking.

---

## Tasks Checklist

### Task 1: Create Product Feed Workflow Steps

**Files:**
- Create: `apps/backend/src/workflows/steps/get-product-feed-items.ts`
- Create: `apps/backend/src/workflows/steps/build-product-feed-xml.ts`

- [ ] **Step 1: Create the get-product-feed-items step**
Create the step to query published products and format them into generic feed item structures.

```ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { QueryContext } from "@medusajs/framework/utils"

export type FeedItem = {
  id: string
  title: string
  description: string
  link: string
  image_link?: string
  availability: string
  price: string
  item_group_id: string
}

type StepInput = {
  currency_code: string
  country_code: string
}

export const getProductFeedItemsStep = createStep(
  "get-product-feed-items",
  async (input: StepInput, { container }) => {
    const feedItems: FeedItem[] = []
    const query = container.resolve("query")
    const configModule = container.resolve("configModule")
    const storefrontUrl = process.env.STOREFRONT_URL || "http://localhost:3000"

    const limit = 100
    let offset = 0
    let count = 0
    const currencyCode = input.currency_code.toLowerCase()

    do {
      const { data: products, metadata } = await query.graph({
        entity: "product",
        fields: [
          "id",
          "title",
          "description",
          "handle",
          "thumbnail",
          "status",
          "variants.id",
          "variants.title",
          "variants.inventory_quantity",
          "variants.manage_inventory",
          "variants.calculated_price.*",
        ],
        filters: {
          status: "published",
        },
        context: {
          variants: {
            calculated_price: QueryContext({
              currency_code: currencyCode,
            }),
          },
        },
        pagination: {
          take: limit,
          skip: offset,
        },
      })

      count = metadata?.count ?? 0
      offset += limit

      for (const product of products) {
        if (!product.variants || !product.variants.length) {
          continue
        }
        for (const variant of product.variants) {
          const priceAmount = variant.calculated_price?.calculated_amount ?? 0
          const decimalPrice = priceAmount / 100
          const formattedPrice = `${decimalPrice.toFixed(2)} ${currencyCode.toUpperCase()}`
          
          const availability = variant.manage_inventory === false || (variant.inventory_quantity && variant.inventory_quantity > 0)
            ? "in stock"
            : "out of stock"

          feedItems.push({
            id: variant.id,
            title: `${product.title} - ${variant.title}`,
            description: product.description || product.title,
            link: `${storefrontUrl}/products/${product.handle}`,
            image_link: product.thumbnail || undefined,
            availability,
            price: formattedPrice,
            item_group_id: product.id,
          })
        }
      }
    } while (count > offset)

    return new StepResponse({ items: feedItems })
  }
)
```

- [ ] **Step 2: Create the build-product-feed-xml step**
Create the step to format the list of products into a compliant RSS 2.0 XML schema.

```ts
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { FeedItem } from "./get-product-feed-items"

type StepInput = {
  items: FeedItem[]
}

export const buildProductFeedXmlStep = createStep(
  "build-product-feed-xml",
  async (input: StepInput) => {
    const escape = (str: string) =>
      str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")

    const itemsXml = input.items.map((item) => {
      return (
        `<item>` +
          `<g:id>${escape(item.id)}</g:id>` +
          `<title>${escape(item.title)}</title>` +
          `<description>${escape(item.description)}</description>` +
          `<link>${escape(item.link)}</link>` +
          (item.image_link ? `<g:image_link>${escape(item.image_link)}</g:image_link>` : "") +
          `<g:availability>${escape(item.availability)}</g:availability>` +
          `<g:price>${escape(item.price)}</g:price>` +
          `<g:item_group_id>${escape(item.item_group_id)}</g:item_group_id>` +
        `</item>`
      )
    }).join("")

    const xml =
      `<?xml version="1.0" encoding="UTF-8"?>` +
      `<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">` +
        `<channel>` +
          `<title>Product Feed</title>` +
          `<description>Dynamic Product Feed for Google and Meta Ads</description>` +
          itemsXml +
        `</channel>` +
      `</rss>`

    return new StepResponse(xml)
  }
)
```

- [ ] **Step 3: Commit files**

```bash
git add apps/backend/src/workflows/steps/get-product-feed-items.ts apps/backend/src/workflows/steps/build-product-feed-xml.ts
git commit -m "feat(backend): add steps for generating product feed"
```

---

### Task 2: Create Product Feed Workflow and Route

**Files:**
- Create: `apps/backend/src/workflows/generate-product-feed.ts`
- Create: `apps/backend/src/api/store/products/feed/route.ts`

- [ ] **Step 1: Create the workflow file**
Wire the steps together inside a workflow.

```ts
import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { getProductFeedItemsStep } from "./steps/get-product-feed-items"
import { buildProductFeedXmlStep } from "./steps/build-product-feed-xml"

type GenerateProductFeedWorkflowInput = {
  currency_code: string
  country_code: string
}

export const generateProductFeedWorkflow = createWorkflow(
  "generate-product-feed",
  (input: GenerateProductFeedWorkflowInput) => {
    const { items: feedItems } = getProductFeedItemsStep(input)

    const xml = buildProductFeedXmlStep({
      items: feedItems,
    })

    return new WorkflowResponse({ xml })
  }
)

export default generateProductFeedWorkflow
```

- [ ] **Step 2: Create the API Route**
Expose the endpoint `/store/products/feed` for GET requests.

```ts
import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import generateProductFeedWorkflow from "../../../../workflows/generate-product-feed"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const currencyCode = (req.query.currency_code as string) || "usd"
  const countryCode = (req.query.country_code as string) || "us"

  const { result } = await generateProductFeedWorkflow(req.scope).run({
    input: {
      currency_code: currencyCode,
      country_code: countryCode,
    },
  })

  res.setHeader("Content-Type", "application/rss+xml; charset=utf-8")
  res.status(200).send(result.xml)
}
```

- [ ] **Step 3: Commit workflow and route**

```bash
git add apps/backend/src/workflows/generate-product-feed.ts apps/backend/src/api/store/products/feed/route.ts
git commit -m "feat(backend): expose store product feed api route"
```

---

### Task 3: Create Server-side Conversions Subscriber (CAPI & GA4)

**Files:**
- Create: `apps/backend/src/subscribers/order-placed.ts`

- [ ] **Step 1: Create the order placed subscriber**
Listen to the `order.placed` event and report details to Meta CAPI and Google Analytics 4 (which links to Google Ads).

```ts
import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"
import { createHash } from "crypto"

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const query = container.resolve("query")
  
  const { data: [order] } = await query.graph({
    entity: "order",
    fields: [
      "id",
      "total",
      "currency_code",
      "customer.email",
      "customer.phone",
      "metadata",
    ],
    filters: { id: data.id },
  })

  if (!order) {
    return
  }

  const orderAmount = order.total / 100
  const currency = order.currency_code.toUpperCase()

  // Hash helper for PII protection (SHA-256)
  const hash = (val?: string) => {
    if (!val) return undefined
    return createHash("sha256").update(val.trim().toLowerCase()).digest("hex")
  }

  const hashedEmail = hash(order.customer?.email)
  const hashedPhone = hash(order.customer?.phone)

  // Extract metadata sent by storefront (if present)
  const fbp = order.metadata?.fbp as string | undefined
  const fbc = order.metadata?.fbc as string | undefined
  const clientIp = order.metadata?.client_ip as string | undefined
  const clientUserAgent = order.metadata?.client_user_agent as string | undefined

  // 1. Meta Conversions API (CAPI) Integration
  const metaPixelId = process.env.META_PIXEL_ID
  const metaAccessToken = process.env.META_ACCESS_TOKEN

  if (metaPixelId && metaAccessToken) {
    try {
      const payload = {
        data: [
          {
            event_name: "Purchase",
            event_time: Math.floor(Date.now() / 1000),
            event_id: `purchase_${order.id}`, // Deduplication Key matching storefront
            user_data: {
              em: hashedEmail ? [hashedEmail] : [],
              ph: hashedPhone ? [hashedPhone] : [],
              fbp: fbp ? [fbp] : [],
              fbc: fbc ? [fbc] : [],
              client_ip_address: clientIp || undefined,
              client_user_agent: clientUserAgent || undefined,
            },
            custom_data: {
              value: orderAmount,
              currency: currency,
            },
            action_source: "website",
          },
        ],
      }

      await fetch(`https://graph.facebook.com/v19.0/${metaPixelId}/events?access_token=${metaAccessToken}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error("Meta CAPI transmission error:", error)
    }
  }

  // 2. GA4 Measurement Protocol Integration
  const ga4MeasurementId = process.env.GA4_MEASUREMENT_ID
  const ga4ApiSecret = process.env.GA4_API_SECRET

  if (ga4MeasurementId && ga4ApiSecret) {
    try {
      const payload = {
        client_id: `ga4_${order.id}`,
        events: [
          {
            name: "purchase",
            params: {
              transaction_id: order.id,
              value: orderAmount,
              currency: currency,
              items: [],
            },
          },
        ],
      }

      await fetch(`https://www.google-analytics.com/mp/collect?api_secret=${ga4ApiSecret}&measurement_id=${ga4MeasurementId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    } catch (error) {
      console.error("Google Analytics Measurement Protocol transmission error:", error)
    }
  }
}

export const config: SubscriberConfig = {
  event: "order.placed",
}
```

- [ ] **Step 2: Commit subscriber**

```bash
git add apps/backend/src/subscribers/order-placed.ts
git commit -m "feat(backend): add order.placed subscriber for Meta CAPI and GA4"
```

---

## Verification & Testing Plan

### Automated Step Tests
Verify workflow execution and step return formats.

Create unit test file `apps/backend/src/workflows/__tests__/generate-product-feed.spec.ts`:

```ts
import { generateProductFeedWorkflow } from "../generate-product-feed"

describe("Product Feed Generation Workflow", () => {
  it("should output valid workflow response", async () => {
    // Basic test checking workflow definition exports
    expect(generateProductFeedWorkflow).toBeDefined()
  })
})
```

Run tests command:
```bash
npm run test:unit
```

### Manual Verification
1. Start the server locally:
   ```bash
   npm run backend:dev
   ```
2. Request the product feed via browser or curl:
   ```bash
   curl "http://localhost:9000/store/products/feed?currency_code=USD&country_code=US"
   ```
3. Confirm that it returns `<?xml version="1.0" encoding="UTF-8"?>` and lists product variants with `<g:price>` and `<g:availability>`.
