# EMRIX shop (frontend)

The storefront customers use. Next.js 16 + Tailwind CSS v4. This folder is a complete project on its own: it has its
own dependencies, lockfile and copy of the shared code (`shared/`), and deploys without the other apps. All data comes
from the [backend](https://github.com/mahingithub/emrix-backend) API.

## Run it locally

Needs Node.js 20.12 or newer, and the backend running (locally on port 3300, or deployed).

```bash
npm install
cp .env.example .env.local    # then fill it in
npm run dev                   # http://localhost:3100
```

| Setting | What |
| --- | --- |
| `API_URL` | The backend's address, no trailing slash (e.g. `http://localhost:3300`) |
| `INTERNAL_API_KEY` | The **same** secret as in the backend and the admin panel |

Other scripts: `npm run typecheck`, `npm run lint`, `npm run build`, `npm start`. The build pre-renders shop pages from
the backend, so the backend has to be up.

## Deploy (e.g. [Vercel](https://vercel.com))

New project from this repository. Root Directory: *(empty: this repository's root)*; Vercel detects Next.js. Environment:
`API_URL` (e.g. `https://<your-backend>.onrender.com`) and `INTERNAL_API_KEY`. They're needed at build time too, so
deploy the backend first. Then set the backend's `SHOP_URL` to this site's address.

Shop pages are static and cached. After changes in the admin panel the backend asks for a refresh
(`POST /api/revalidate`); they also refresh on their own every 5 minutes.

On any other Node host: `npm ci && npm run build`, then `npm start`.

## Pages

| Path | What |
| --- | --- |
| `src/app/(shop)/` | Home, shop, anime collections, product, cart, checkout, order, track, help |
| `src/app/(shop)/product/[slug]/try-on/` | The try-on page (product page → **Try on**) |
| `src/app/api/try-on/` | Passes try-on requests on to the backend with the shopper's browser id |
| `src/app/api/revalidate/` | Lets the backend refresh shop pages after changes |
| `src/lib/backend.ts` · `src/actions/storefront.ts` | The link to the API; checkout, coupon and tracking actions |
| `src/components/try-on/` | The try-on studio |
| `public/images/catalog/` | Bundled artwork and launch mockups (uploaded photos take priority) |
| `shared/` | Types, helpers, the brand theme and a few UI pieces, shared with the admin panel and backend |

The **Try on** button only shows when the backend has photo try-on set up (see the backend's README).

**Shared code:** the admin panel and backend each have their own copy of `shared/`. After changing a file there, copy
the change into the other two apps' `shared/` folders so all three stay in step.
