# VISORA

Customer engagement platform (Braze-style) for **profiles**, **events**, **segments**, **campaigns**, and **Canvas journeys**.

This is the first vertical slice: a working dashboard plus REST identify/track APIs. Delivery is recorded in the local database (no live ESP/push provider yet). Send the next product instructions and we will extend from this core.

## Stack

- Next.js 15 (App Router) + TypeScript
- Prisma + SQLite
- Tailwind CSS 4

## Run locally

```bash
npm install
npx prisma db push
npx tsx prisma/seed.ts
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Local API key (seeded): `visora_sk_local`

## What is in this slice

| Area | Behavior |
| --- | --- |
| Audience | Identified profiles, custom attributes, subscription flags, event stream |
| Segments | Attribute + event filters (AND/OR), live membership |
| Campaigns | Email / push / SMS / in-app drafts, liquid-style `{{ first_name }}` tokens, send to a segment |
| Canvas | Ordered journey steps; launch enrolls the segment |
| Developer | REST `identify` and `track` with API keys |

## REST

`Authorization: Bearer <api key>`

- `POST /api/v1/users/identify` — upsert profile + attributes
- `POST /api/v1/users/track` — append events (creates the profile if missing)
- `GET /api/v1/users/:externalId` — profile + recent events

Identify body:

```json
{
  "external_id": "user_001",
  "email": "user@example.com",
  "first_name": "Alex",
  "attributes": { "plan": "pro", "ltv": 840 }
}
```

Track body:

```json
{
  "external_id": "user_001",
  "events": [{ "name": "purchase", "properties": { "amount": 49 } }]
}
```

## Segment rules

```json
{
  "op": "and",
  "filters": [
    { "kind": "attribute", "field": "plan", "op": "eq", "value": "pro" },
    { "kind": "event", "name": "purchase", "op": "performed", "days": 14 }
  ]
}
```

## Next (when you send instructions)

Typical Braze follow-ons: real ESP/SMS/push adapters, Canvas delay worker, content cards, catalog, feature flags, multi-workspace auth, analytics funnels.
