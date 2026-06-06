# Storefront Pixel & Google Analytics Tracking Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate Meta Pixel and Google Analytics (gtag.js) tracking on the Next.js storefront with client-side event tracking, automated route tracking, deduplication matching the Medusa v2 backend, and server-side Match Quality metadata propagation.

**Architecture:** Create client-side tracking components that trigger on product view, cart add, checkout, and purchase events. Inject standard tracking scripts at the root layout level, manage SPA navigation page views, and read cookies/headers on the server during the checkout address step to update the Medusa Cart's metadata for backend CAPI usage.

**Tech Stack:** Next.js (App Router), TypeScript, Meta Pixel, Google Analytics 4 (gtag.js), Medusa JS SDK.

---

## Technical Overview & Storefront Integration Requirements

To achieve accurate reporting, browser tracking and backend Conversions API (CAPI) must work in sync:

1. **Event Deduplication (Event ID)**:
   - For `Purchase` events, the browser must fire the event with an `eventID` format matching `purchase_<order_id>` (e.g. `purchase_ord_01J...`).
   - The backend CAPI subscriber will trigger the exact same event using the same `eventID` to allow Meta/Google to merge them.
   - For `ViewContent`, the event ID should be `view_<variant_id>`. For `AddToCart`, it should be `add_<variant_id>_<timestamp>`. For `InitiateCheckout`, it should be `checkout_<cart_id>`.

2. **Match Quality Propagation**:
   - The Next.js storefront will extract Facebook browser cookies (`_fbp` and `_fbc`) and network parameters (`user-agent` and client IP) server-side inside the `setAddresses` Server Action.
   - These parameters will be attached to the Medusa Cart's `metadata` using the JS SDK.
   - The Medusa backend will automatically transfer this metadata to the Order record, enabling the backend subscriber to forward it to Meta CAPI.

---

## Tasks Checklist

### Task 1: Setup global types and environment variables

**Files:**
- Create: `src/types/analytics.d.ts`
- Modify: `.env`

- [ ] **Step 1: Declare global Window types**
Create `src/types/analytics.d.ts` to allow window-level calls to `fbq` and `gtag` without TypeScript compilation errors.

```typescript
declare global {
  interface Window {
    fbq?: (...args: any[]) => void
    gtag?: (...args: any[]) => void
  }
}

export {}
```

- [ ] **Step 2: Add tracking keys to environment variables**
Modify `.env` to include the client-side Meta Pixel and GA4 tracking keys.

```env
NEXT_PUBLIC_META_PIXEL_ID=your_facebook_pixel_id
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga4_measurement_id
```

- [ ] **Step 3: Run formatting and verify no TypeScript issues**
Run:
```bash
npm run format && npm run lint
```
Expected: No TypeScript or syntax errors.

- [ ] **Step 4: Commit**
```bash
git add src/types/analytics.d.ts .env
git commit -m "feat(analytics): setup global types and env configuration for analytics tracking"
```

---

### Task 2: Implement Scripts Loader and Navigation Tracking Components

**Files:**
- Create: `src/modules/layout/components/analytics/index.tsx`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Create scripts loader and route tracker**
Create the client-side `AnalyticsProvider` component that injects script tags and tracks SPA navigation path changes.

```tsx
"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, Suspense } from "react"
import Script from "next/script"

export function NavigationAnalytics() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (typeof window === "undefined") return

    // 1. Meta Pixel PageView
    if (typeof window.fbq === "function") {
      window.fbq('track', 'PageView')
    }

    // 2. Google Analytics page_view
    if (typeof window.gtag === "function") {
      window.gtag('event', 'page_view', {
        page_path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ""),
        page_location: window.location.href,
        page_title: document.title
      })
    }
  }, [pathname, searchParams])

  return null
}

export function AnalyticsScripts() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID

  return (
    <>
      {pixelId && (
        <>
          <Script
            id="fb-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${pixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
              alt=""
            />
          </noscript>
        </>
      )}

      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  send_page_view: false
                });
              `,
            }}
          />
        </>
      )}
    </>
  )
}

export function AnalyticsProvider() {
  return (
    <>
      <AnalyticsScripts />
      <Suspense fallback={null}>
        <NavigationAnalytics />
      </Suspense>
    </>
  )
}
```

- [ ] **Step 2: Inject AnalyticsProvider into Root Layout**
Modify `src/app/layout.tsx` to render the `AnalyticsProvider` component.

```diff
 import { GeistMono } from "geist/font/mono"
 import { Analytics } from "@vercel/analytics/react"
 import { SpeedInsights } from "@vercel/speed-insights/next"
+import { AnalyticsProvider } from "@modules/layout/components/analytics"
 
 export const metadata: Metadata = {
   metadataBase: new URL(getBaseURL()),
@@ -16,6 +17,7 @@ export default function RootLayout(props: { children: React.ReactNode }) {
       <body className="bg-white">
         <main className="relative">{props.children}</main>
         <Analytics />
         <SpeedInsights />
+        <AnalyticsProvider />
       </body>
     </html>
   )
```

- [ ] **Step 3: Run linter and verify build**
Run:
```bash
npm run lint && npm run build
```
Expected: No build errors.

- [ ] **Step 4: Commit**
```bash
git add src/modules/layout/components/analytics/index.tsx src/app/layout.tsx
git commit -m "feat(analytics): render analytics scripts and setup navigation page tracking in root layout"
```

---

### Task 3: Implement client-side events for ViewContent and AddToCart

**Files:**
- Create: `src/modules/products/components/product-analytics/index.tsx`
- Modify: `src/modules/products/templates/index.tsx`
- Modify: `src/features/products/hooks/use-product-actions.ts`

- [ ] **Step 1: Create ProductAnalytics component**
Create the client-side view component `src/modules/products/components/product-analytics/index.tsx` that fires when the detail page loads.

```tsx
"use client"

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

type ProductAnalyticsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
}

export default function ProductAnalytics({ product, region }: ProductAnalyticsProps) {
  useEffect(() => {
    if (typeof window === "undefined" || !product) return

    const variant = product.variants?.[0]
    const price = variant?.calculated_price?.calculated_amount 
      ? variant.calculated_price.calculated_amount / 100 
      : 0
    const currency = region.currency_code.toUpperCase()

    // 1. Meta Pixel ViewContent
    if (typeof window.fbq === "function") {
      window.fbq('track', 'ViewContent', {
        content_type: 'product',
        content_ids: [variant?.id || product.id],
        content_name: product.title,
        value: price,
        currency: currency
      }, { eventID: `view_${variant?.id || product.id}` })
    }

    // 2. Google Analytics view_item
    if (typeof window.gtag === "function") {
      window.gtag('event', 'view_item', {
        currency: currency,
        value: price,
        items: [
          {
            item_id: variant?.id || product.id,
            item_name: product.title,
            price: price,
            quantity: 1
          }
        ]
      })
    }
  }, [product, region])

  return null
}
```

- [ ] **Step 2: Render ProductAnalytics in ProductTemplate**
Modify `src/modules/products/templates/index.tsx` to render the analytics wrapper.

```diff
 import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
 import { notFound } from "next/navigation"
 import ProductActionsWrapper from "./product-actions-wrapper"
 import { HttpTypes } from "@medusajs/types"
+import ProductAnalytics from "@modules/products/components/product-analytics"
 
 type ProductTemplateProps = {
   product: HttpTypes.StoreProduct
@@ -27,6 +28,7 @@ const ProductTemplate: React.FC<ProductTemplateProps> = ({
 
   return (
     <>
+      <ProductAnalytics product={product} region={region} />
       <div
         className="content-container flex flex-col small:grid small:grid-cols-2 gap-8 py-6 relative"
         data-testid="product-container"
```

- [ ] **Step 3: Trigger AddToCart event in useProductActions**
Modify `src/features/products/hooks/use-product-actions.ts` to push `AddToCart` and `add_to_cart` events to tracking tools when a variant is selected and added.

```diff
   const handleAddToCart = async () => {
     if (!selectedVariant?.id) return
 
     setIsAdding(true)
 
     await addToCart({
       variantId: selectedVariant.id,
       quantity: quantity,
       countryCode,
     })
 
+    const price = selectedVariant.calculated_price?.calculated_amount 
+      ? selectedVariant.calculated_price.calculated_amount / 100
+      : 0
+    const currency = selectedVariant.calculated_price?.currency_code?.toUpperCase() || "USD"
+
+    if (typeof window.fbq === "function") {
+      window.fbq('track', 'AddToCart', {
+        content_type: 'product',
+        content_ids: [selectedVariant.id],
+        content_name: product.title,
+        value: price * quantity,
+        currency: currency
+      }, { eventID: `add_${selectedVariant.id}_${Date.now()}` })
+    }
+
+    if (typeof window.gtag === "function") {
+      window.gtag('event', 'add_to_cart', {
+        currency: currency,
+        value: price * quantity,
+        items: [
+          {
+            item_id: selectedVariant.id,
+            item_name: product.title,
+            price: price,
+            quantity: quantity
+          }
+        ]
+      })
+    }
+
     setIsAdding(false)
   }
```

- [ ] **Step 4: Run linter and verify compile**
Run:
```bash
npm run lint && npm run build
```
Expected: Build successfully completes.

- [ ] **Step 5: Commit**
```bash
git add src/modules/products/components/product-analytics/index.tsx src/modules/products/templates/index.tsx src/features/products/hooks/use-product-actions.ts
git commit -m "feat(analytics): implement ViewContent and AddToCart events"
```

---

### Task 4: Implement InitiateCheckout and Purchase event tracking

**Files:**
- Create: `src/modules/checkout/components/checkout-analytics/index.tsx`
- Modify: `src/app/[countryCode]/(checkout)/checkout/page.tsx`
- Create: `src/modules/order/components/purchase-analytics/index.tsx`
- Modify: `src/modules/order/templates/order-completed-template.tsx`

- [ ] **Step 1: Create CheckoutAnalytics component**
Create `src/modules/checkout/components/checkout-analytics/index.tsx`.

```tsx
"use client"

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

export default function CheckoutAnalytics({ cart }: { cart: HttpTypes.StoreCart }) {
  useEffect(() => {
    if (typeof window === "undefined" || !cart) return

    const currency = cart.currency_code?.toUpperCase() || "USD"
    const value = cart.subtotal ? cart.subtotal / 100 : 0
    const items = cart.items || []

    if (typeof window.fbq === "function") {
      window.fbq('track', 'InitiateCheckout', {
        content_type: 'product',
        content_ids: items.map(item => item.variant_id),
        num_items: items.length,
        value: value,
        currency: currency
      }, { eventID: `checkout_${cart.id}` })
    }

    if (typeof window.gtag === "function") {
      window.gtag('event', 'begin_checkout', {
        currency: currency,
        value: value,
        items: items.map(item => ({
          item_id: item.variant_id,
          item_name: item.title,
          price: item.unit_price ? item.unit_price / 100 : 0,
          quantity: item.quantity
        }))
      })
    }
  }, [cart])

  return null
}
```

- [ ] **Step 2: Render CheckoutAnalytics in checkout page**
Modify `src/app/[countryCode]/(checkout)/checkout/page.tsx` to render the analytics hook component.

```diff
 import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
 import CheckoutForm from "@modules/checkout/templates/checkout-form"
 import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
+import CheckoutAnalytics from "@modules/checkout/components/checkout-analytics"
 import { Metadata } from "next"
 import { HttpTypes } from "@medusajs/types"
 import { notFound } from "next/navigation"
@@ -22,6 +23,7 @@ export default async function Checkout() {
   const customer = await retrieveCustomer()
 
   return (
     <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-40 py-12">
+      <CheckoutAnalytics cart={cart} />
       <PaymentWrapper cart={cart}>
         <CheckoutForm cart={cart} customer={customer} />
       </PaymentWrapper>
```

- [ ] **Step 3: Create PurchaseAnalytics component**
Create `src/modules/order/components/purchase-analytics/index.tsx`.

```tsx
"use client"

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"

export default function PurchaseAnalytics({ order }: { order: HttpTypes.StoreOrder }) {
  useEffect(() => {
    if (typeof window === "undefined" || !order) return

    const currency = order.currency_code?.toUpperCase() || "USD"
    const value = order.total ? order.total / 100 : 0
    const items = order.items || []

    if (typeof window.fbq === "function") {
      window.fbq('track', 'Purchase', {
        content_type: 'product',
        content_ids: items.map(item => item.variant_id),
        value: value,
        currency: currency
      }, { eventID: `purchase_${order.id}` })
    }

    if (typeof window.gtag === "function") {
      window.gtag('event', 'purchase', {
        transaction_id: order.id,
        currency: currency,
        value: value,
        items: items.map(item => ({
          item_id: item.variant_id,
          item_name: item.title,
          price: item.unit_price ? item.unit_price / 100 : 0,
          quantity: item.quantity
        }))
      })
    }
  }, [order])

  return null
}
```

- [ ] **Step 4: Render PurchaseAnalytics in OrderCompletedTemplate**
Modify `src/modules/order/templates/order-completed-template.tsx` to render `PurchaseAnalytics`.

```diff
 import OrderDetails from "@modules/order/components/order-details"
 import ShippingDetails from "@modules/order/components/shipping-details"
 import PaymentDetails from "@modules/order/components/payment-details"
 import { HttpTypes } from "@medusajs/types"
+import PurchaseAnalytics from "@modules/order/components/purchase-analytics"
 
 type OrderCompletedTemplateProps = {
   order: HttpTypes.StoreOrder
@@ -22,6 +23,7 @@ export default async function OrderCompletedTemplate({
   const isOnboarding = cookies.get("_medusa_onboarding")?.value === "true"
 
   return (
     <div className="py-6 min-h-[calc(100vh-64px)]">
+      <PurchaseAnalytics order={order} />
       <div className="content-container flex flex-col justify-center items-center gap-y-10 max-w-4xl h-full w-full">
```

- [ ] **Step 5: Run lint check**
Run:
```bash
npm run lint && npm run build
```
Expected: Verification passes without compilation issues.

- [ ] **Step 6: Commit**
```bash
git add src/modules/checkout/components/checkout-analytics/index.tsx src/app/[countryCode]/(checkout)/checkout/page.tsx src/modules/order/components/purchase-analytics/index.tsx src/modules/order/templates/order-completed-template.tsx
git commit -m "feat(analytics): track begin_checkout and purchase events with matching event_id"
```

---

### Task 5: Server-side match quality enhancement (cookies and headers extraction)

**Files:**
- Modify: `src/lib/data/cart.ts`

- [ ] **Step 1: Read cookies and headers in setAddresses**
Modify the `setAddresses` server action in `src/lib/data/cart.ts` to extract the `_fbp` and `_fbc` cookies alongside client IP and user-agent context on the server, and populate the Cart's metadata field when updating the cart.

```diff
 import { sdk } from "@lib/config"
 import medusaError from "@lib/util/medusa-error"
 import { HttpTypes } from "@medusajs/types"
 import { revalidateTag } from "next/cache"
 import { redirect } from "next/navigation"
+import { cookies, headers } from "next/headers"
 import {
   getAuthHeaders,
   getCacheOptions,
@@ -341,6 +342,21 @@ export async function setAddresses(currentState: unknown, formData: FormData) {
       throw new Error("No existing cart found when setting addresses")
     }
 
+    const cookieStore = await cookies()
+    const fbp = cookieStore.get("_fbp")?.value
+    const fbc = cookieStore.get("_fbc")?.value
+
+    const headersList = await headers()
+    const clientUserAgent = headersList.get("user-agent") || ""
+    const clientIp = headersList.get("x-forwarded-for")?.split(",")[0].trim() || headersList.get("x-real-ip") || ""
+
+    const metadata: Record<string, any> = {}
+    if (fbp) metadata.fbp = fbp
+    if (fbc) metadata.fbc = fbc
+    if (clientUserAgent) metadata.client_user_agent = clientUserAgent
+    if (clientIp) metadata.client_ip = clientIp
+
     const data = {
       shipping_address: {
         first_name: formData.get("shipping_address.first_name"),
@@ -355,6 +371,7 @@ export async function setAddresses(currentState: unknown, formData: FormData) {
         phone: formData.get("shipping_address.phone"),
       },
       email: formData.get("email"),
+      metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
     } as HttpTypes.StoreUpdateCart
 
     const sameAsBilling = formData.get("same_as_billing")
```

- [ ] **Step 2: Run build build verification**
Run:
```bash
npm run lint && npm run build
```
Expected: Successfully compiles.

- [ ] **Step 3: Commit**
```bash
git add src/lib/data/cart.ts
git commit -m "feat(analytics): propagate cookies and headers server-side to cart metadata on address submit"
```

---

## Verification & Testing Plan

### Automated Build & Lint Verification
1. Run lint and formatting check to ensure standard styling:
   ```bash
   npm run lint
   ```
2. Build the production package locally to confirm Next.js compiler is happy with types:
   ```bash
   npm run build
   ```

### Manual Verification
1. Open the storefront in development mode:
   ```bash
   npm run dev
   ```
2. Use **Meta Pixel Helper** and **Google Analytics Debugger** Chrome extensions to inspect events:
   - Navigate to a product page and verify that `ViewContent` and `view_item` fire. Confirm the eventID matches the variant/product ID.
   - Click "Add to Cart" and verify `AddToCart` and `add_to_cart` fire.
   - Proceed to checkout page and check that `InitiateCheckout` and `begin_checkout` fire with correct parameters.
   - Place a mock order and inspect the `/confirmed` page to verify `Purchase` and `purchase` conversion events carry the correct totals and matching `eventID`.
3. Check the Medusa backend database or Admin dashboard to verify that the placed order's `metadata` property contains `fbp`, `fbc`, `client_user_agent`, and `client_ip`.
