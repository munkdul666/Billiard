# 🎱 Billiard Bar — Удирдлагын систем

Next.js 14 (App Router) + Supabase + Tailwind CSS + TypeScript ашигласан билliard барын бүртгэлийн систем. Dark mode, realtime sync, iPad/mobile-friendly.

## Юу хийдэг вэ (MVP)

- **Нэвтрэх** — Supabase Auth (имэйл + нууц үг). Нэвтрэхгүй бол dashboard руу орохгүй (`middleware.ts`).
- **Нүүр хуудас** — 6 ширээ карт хэлбэрээр. Төлөв (🟢 чөлөөтэй / 🔴 тоглож байна), live timer, одоогийн тооцоо, "Эхлүүлэх" товч. SVG ширээний background.
- **Ширээний дэлгэрэнгүй** — секунд тутам шинэчлэгдэх тоолуур, ширээний цэнэ (цаг × тариф), бараа нэмэх/устгах, нийт дүн.
- **Тооцоо хаах** — receipt modal, хэвлэх товч, баталгаажуулахад ширээ чөлөөтэй болно.
- **Realtime** — нэг browser-т ширээ өөрчлөгдөхөд бусад дээр автомат шинэчлэгдэнэ (Supabase Realtime).

> Тайлан (PDF), бараа удирдах, settings хуудсыг дараагийн шатанд нэмж болно.

## 1. Supabase тохиргоо

1. [supabase.com](https://supabase.com) дээр шинэ project үүсгэ.
2. **SQL Editor** → `supabase/schema.sql`-ийн агуулгыг хуулж ажиллуул. Энэ нь хүснэгтүүд, 6 ширээ, 8 бараа, realtime, RLS policy-г үүсгэнэ.
3. **Authentication → Providers → Email** идэвхжүүл.
4. **Authentication → Users → Add user** дээр нэг admin данс үүсгэ (имэйл + нууц үг).
5. **Project Settings → API** дээрээс `Project URL` болон `anon public` key-г хуул.

## 2. Орчны хувьсагч

`.env.local` файлд өөрийн утгуудаа тавь:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 3. Локал ажиллуулах

```bash
npm install
npm run dev
```

http://localhost:3000 руу ор → admin дансаараа нэвтэр.

## 4. Vercel deploy

1. GitHub repo-г Vercel-д холбо.
2. Environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Deploy.

## Бүтэц

```
app/
  (auth)/login/page.tsx        — нэвтрэх
  (dashboard)/layout.tsx       — header + auth хамгаалалт
  (dashboard)/page.tsx         — ширээний grid
  (dashboard)/tables/[id]/...  — ширээний дэлгэрэнгүй
components/                    — TableCard, TableDetail, ReceiptModal г.м
lib/supabase/                  — browser / server / middleware client
lib/format.ts, colors.ts, types.ts
supabase/schema.sql            — өгөгдлийн сангийн бүтэц
```

## Тэмдэглэл

- `next` нь аюулгүй байдлын patch (`^14.2.33`) хувилбартай. `npm install` дээр хамгийн сүүлийн 14.2.x татагдана.
- Бүх хуудас mobile/iPad дээр ажиллахаар хийгдсэн.
