



📘 Shunyi Garments — সম্পূর্ণ প্রজেক্ট ডকুমেন্ট (v3, বিস্তারিত)



টেক স্ট্যাক: [Next.js](http://next.js/) 15 (App Router) + TypeScript + Tailwind CSS + MongoDB (Mongoose) + NextAuth + next-themes + Custom i18n



\---



সূচিপত্র



1\. প্রজেক্ট ওভারভিউ ও লক্ষ্য

2\. সিস্টেম আর্কিটেকচার

3\. টেক স্ট্যাক ও প্যাকেজ

4\. ডেটাবেস ডিজাইন (বিস্তারিত স্কিমা)

5\. ফোল্ডার স্ট্রাকচার (প্রতিটি ফাইলের দায়িত্ব)

6\. পাবলিক ল্যান্ডিং পেজ (UI বিস্তারিত)

7\. অ্যাডমিন প্যানেল (মডিউল বিস্তারিত)

8\. ভাষা সিস্টেম (বাংলা + চীনা)

9\. থিম সিস্টেম (ডার্ক/লাইট)

10\. Auth সিস্টেম

11\. API এন্ডপয়েন্ট (রিকোয়েস্ট/রেসপন্স)

12\. ভ্যালিডেশন নিয়ম

13\. Config ও সেটআপ

14\. ডেভেলপমেন্ট রোডম্যাপ (৮ ধাপ)

15\. টেস্টিং চেকলিস্ট

16\. ডিপ্লয়মেন্ট

17\. ভবিষ্যৎ উন্নয়ন



\---



১. প্রজেক্ট ওভারভিউ ও লক্ষ্য



Shunyi Garments একটি garments কোম্পানির জন্য দুই-ইন-ওয়ান সিস্টেম:



· পাবলিক শোকেস: কোম্পানির পণ্য, প্রসেস ও মেশিন তথ্য দেখানো

· অ্যাডমিন প্যানেল: কর্মী, হাজিরা, প্রোডাক্ট ও প্রোডাকশন ম্যানেজমেন্ট



মূল বৈশিষ্ট্য:



· একজন অ্যাডমিন

· বাংলা + চীনা ভাষা টগল

· ডার্ক/লাইট মোড

· ছবি শুধু URL দিয়ে (ImgBB-তে নিজে আপলোড করে লিংক পেস্ট)

· MongoDB URL সরাসরি config ফাইলে

· ৮AM নাম-সিলেক্ট হাজিরা + ৫PM ভিত্তিক OT



লক্ষ্য ব্যবহারকারী: কোম্পানির মালিক/ম্যানেজার (অ্যাডমিন), এবং পাবলিক ভিজিটর (ক্রেতা/অংশীদার)।



\---



২. সিস্টেম আর্কিটেকচার



\`\`\`

┌─────────────────────────────────────────────────┐

│                  Browser (Client)                │

│   পাবলিক সাইট + অ্যাডমিন প্যানেল (React)         │

│   ThemeProvider + LanguageProvider               │

└───────────────────────┬─────────────────────────┘

                        │ HTTP

┌───────────────────────▼─────────────────────────┐

│              [Next.js](http://next.js/) Server (App Router)         │

│  ├── Server Components (পেজ রেন্ডার)             │

│  ├── API Routes (CRUD)                           │

│  └── NextAuth (অ্যাডমিন সেশন)                    │

└───────────────────────┬─────────────────────────┘

                        │ Mongoose

┌───────────────────────▼─────────────────────────┐

│              MongoDB Atlas (Cloud)               │

│  users, employees, attendances, products,        │

│  assignments                                     │

└─────────────────────────────────────────────────┘



ছবি: ImgBB (ইউজার নিজে আপলোড করে URL পেস্ট করে)

\`\`\`



ডেটা ফ্লো উদাহরণ (হাজিরা নেওয়া):



\`\`\`

অ্যাডমিন চেকবক্সে নাম সিলেক্ট → "Present মার্ক" ক্লিক

  → POST /api/attendance/bulk {date, employeeIds[]}

  → সার্ভার Attendance ডকুমেন্ট তৈরি (present)

  → বাকি active কর্মীদের absent রেকর্ড

  → রেসপন্স → UI রিফ্রেশ

\`\`\`



\---



৩. টেক স্ট্যাক ও প্যাকেজ



ইনস্টল কমান্ড:



\`\`\`bash

npx create-next-app\@latest shunyi-garments --typescript --tailwind --app --src-dir=false

cd shunyi-garments

npm install mongoose next-auth next-themes bcryptjs zod

npm install -D @types/bcryptjs

\`\`\`



প্যাকেজগুলোর কাজ:



প্যাকেজ কাজ

mongoose MongoDB ODM, স্কিমা/মডেল

next-auth অ্যাডমিন লগইন ও সেশন

next-themes ডার্ক/লাইট টগল

bcryptjs পাসওয়ার্ড হ্যাশ

zod ইনপুট ভ্যালিডেশন



\---



৪. ডেটাবেস ডিজাইন (বিস্তারিত স্কিমা)



৪.১ User (অ্যাডমিন — একজন)



\`\`\`ts

{

  email: string (unique, required),

  password: string (hashed, required),

  name: string (default "Admin"),

  role: "admin" (fixed),

  createdAt, updatedAt

}

\`\`\`



প্রথম অ্যাডমিন তৈরি হবে একটি seed স্ক্রিপ্ট দিয়ে (scripts/[seed-admin.ts](http://seed-admin.ts/))।



৪.২ Employee



\`\`\`ts

{

  name: string (required),

  employeeId: string (unique, required),      // যেমন EMP-001

  position: string (required),                // Operator, Supervisor...

  department: string (required),              // Sewing, Cutting...

  phone: string (required),

  email: string (optional),

  joinDate: Date (required),

  imageUrl: string (optional),                // ImgBB URL

  status: "active" | "inactive" (default active),

  createdAt, updatedAt

}

\`\`\`



৪.৩ Attendance



\`\`\`ts

{

  employee: ObjectId → Employee (required),

  date: Date (required, শুধু তারিখ),

  status: "present" | "absent" | "leave",

  checkInTime: string (optional, "08:00"),

  overtimeHours: number (default 0),

  isGeneralDuty: boolean (default true),      // ৫PM-এ ছুটি হলে true

  note: string (optional),

  createdAt, updatedAt

}

// Compound unique index: { employee: 1, date: 1 }

\`\`\`



OT লজিক (৫PM ভিত্তিক):



· overtimeHours = 0 হলে → isGeneralDuty = true (সাধারণ ডিউটি)

· overtimeHours > 0 হলে → isGeneralDuty = false

· UI-তে ডিফল্ট ০ দেখাবে; অ্যাডমিন ম্যানুয়ালি বাড়াবেন



৪.৪ Product (এমবেডেড প্রসেস লিস্টসহ)



\`\`\`ts

{

  name: string (required),

  styleNo: string (required, unique),

  category: string (required),

  imageUrl: string (required),               // ImgBB URL

  buyerName: string (optional),

  description: string (optional),

  isFeatured: boolean (default false),

  extraNote: string (optional),              // অতিরিক্ত নোট

  processEntries: [                          // এমবেডেড

    {

      \_id: ObjectId,

      processName: string (required),        // Cutting, Sewing...

      machineName: string (optional),        // Juki-5000...

      targetQty: number (default 0),

      completedQty: number (default 0),

      note: string (optional)

    }

  ],

  status: "active" | "archived" (default active),

  createdAt, updatedAt

}

\`\`\`



৪.৫ Assignment (প্রসেস ↔ কর্মী, many-to-many)



\`\`\`ts

{

  product: ObjectId → Product (required),

  processEntryId: ObjectId (required),       // Product.processEntries এর \_id

  employee: ObjectId → Employee (required),

  assignedQty: number (default 0),

  completedQty: number (default 0),

  date: Date (required),

  createdAt, updatedAt

}

\`\`\`



সম্পর্ক চিত্র:



\`\`\`

User (admin) ── (একজন)



Employee 1 ──< N  Attendance

Employee 1 ──< N  Assignment  >── N  Product

Product  1 ──< N  processEntries (এমবেডেড)

\`\`\`



\---



৫. ফোল্ডার স্ট্রাকচার (প্রতিটি ফাইলের দায়িত্ব)



\`\`\`

shunyi-garments/

├── config/

│   └── [db.ts](http://db.ts/)                    # MONGODB_URI সরাসরি এখানে

├── lib/

│   ├── [mongodb.ts](http://mongodb.ts/)               # connectDB() — কানেকশন ক্যাশে

│   ├── [auth.ts](http://auth.ts/)                  # NextAuth options

│   ├── [i18n.ts](http://i18n.ts/)                  # t() হেল্পার, LanguageContext

│   └── [validators.ts](http://validators.ts/)            # Zod স্কিমা

├── locales/

│   ├── bn.json                  # বাংলা অনুবাদ

│   └── zh.json                  # চীনা অনুবাদ

├── models/

│   ├── [User.ts](http://user.ts/)

│   ├── [Employee.ts](http://employee.ts/)

│   ├── [Attendance.ts](http://attendance.ts/)

│   ├── [Product.ts](http://product.ts/)

│   └── [Assignment.ts](http://assignment.ts/)

├── scripts/

│   └── [seed-admin.ts](http://seed-admin.ts/)            # প্রথম অ্যাডমিন তৈরি

├── app/

│   ├── layout.tsx               # ThemeProvider + LanguageProvider

│   ├── globals.css

│   ├── (public)/

│   │   ├── layout.tsx           # পাবলিক নেভবার + ফুটার

│   │   ├── page.tsx             # হোম

│   │   ├── products/page.tsx

│   │   ├── products/[id]/page.tsx

│   │   ├── about/page.tsx

│   │   └── contact/page.tsx

│   ├── admin/

│   │   ├── layout.tsx           # Sidebar + auth guard

│   │   ├── page.tsx             # ড্যাশবোর্ড

│   │   ├── employees/

│   │   │   ├── page.tsx

│   │   │   ├── new/page.tsx

│   │   │   └── [id]/page.tsx

│   │   ├── attendance/page.tsx

│   │   ├── products/

│   │   │   ├── page.tsx

│   │   │   ├── new/page.tsx

│   │   │   └── [id]/page.tsx

│   │   └── settings/page.tsx

│   ├── login/page.tsx

│   └── api/

│       ├── auth/[...nextauth]/[route.ts](http://route.ts/)

│       ├── employees/[route.ts](http://route.ts/)

│       ├── employees/[id]/[route.ts](http://route.ts/)

│       ├── attendance/[route.ts](http://route.ts/)

│       ├── attendance/bulk/[route.ts](http://route.ts/)

│       ├── products/[route.ts](http://route.ts/)

│       ├── products/[id]/[route.ts](http://route.ts/)

│       └── assignments/[route.ts](http://route.ts/)

└── components/

    ├── providers/

    │   ├── ThemeProvider.tsx

    │   └── LanguageProvider.tsx

    ├── ui/

    │   ├── ThemeToggle.tsx

    │   ├── LanguageToggle.tsx

    │   └── Button.tsx

    ├── admin/

    │   ├── Sidebar.tsx

    │   ├── StatCard.tsx

    │   ├── EmployeeForm.tsx

    │   ├── BulkAttendance.tsx

    │   ├── AttendanceRow\.tsx

    │   ├── ProductForm.tsx

    │   └── ProcessEditor.tsx

    └── public/

        ├── Navbar.tsx

        ├── Footer.tsx

        ├── Hero.tsx

        └── ProductCard.tsx

\`\`\`



\---



৬. পাবলিক ল্যান্ডিং পেজ (UI বিস্তারিত)



৬.১ হোম (/)



· Hero: কোম্পানির নাম, স্লোগান, ব্যাকগ্রাউন্ড ছবি (URL), CTA "পণ্য দেখুন"

· About সেকশন: সংক্ষিপ্ত পরিচিতি

· Featured Products: isFeatured: true পণ্যের ৩-৪টি কার্ড

· Stats: মোট কর্মী, মোট পণ্য (সার্ভার থেকে)

· Footer: যোগাযোগ, সোশ্যাল লিংক



৬.২ পণ্য তালিকা (/products)



· গ্রিড লেআউট (responsive: 1/2/3 কলাম)

· প্রতিটি ProductCard: ছবি, নাম, styleNo, category, প্রসেস ট্যাগ

· সার্চ বার (নাম/styleNo)

· ক্যাটাগরি ফিল্টার



৬.৩ পণ্য বিস্তারিত (/products/[id])



· বড় ছবি (বাম) + তথ্য (ডান)

· নাম, styleNo, buyer, description

· প্রসেস/মেশিন টেবিল: processName, machineName, target, completed

· Extra note (থাকলে)



৬.৪ About ও Contact



· কোম্পানির ইতিহাস, ভিশন, মিশন

· Contact: ফোন, ইমেইল, ঠিকানা (সম্পাদনাযোগ্য নয় — কোডে হার্ডকোড বা settings থেকে)



\---



৭. অ্যাডমিন প্যানেল (মডিউল বিস্তারিত)



৭.১ অ্যাডমিন লেআউট (/admin/layout.tsx)



· বাম পাশে Sidebar (মেনু: ড্যাশবোর্ড, কর্মী, হাজিরা, প্রোডাক্ট, সেটিংস)

· উপরে: থিম টগল, ভাষা টগল, লগআউট

· Auth guard: সেশন না থাকলে /login-এ রিডাইরেক্ট



৭.২ ড্যাশবোর্ড (/admin)



· StatCard: মোট কর্মী, আজ উপস্থিত, আজ অনুপস্থিত, মোট পণ্য, চলমান প্রসেস

· আজকের হাজিরা সারসংক্ষেপ

· সর্বশেষ যোগ হওয়া পণ্য



৭.৩ কর্মী (/admin/employees)



তালিকা পেজ:



· টেবিল: ছবি, নাম, ID, পদ, ডিপার্টমেন্ট, ফোন, স্ট্যাটাস, অ্যাকশন

· সার্চ (নাম/ID/ফোন)

· ডিপার্টমেন্ট ফিল্টার

· "নতুন কর্মী" বাটন



ফর্ম (new ও [id]):



ফিল্ড টাইপ ভ্যালিডেশন

নাম text required, min 2

employeeId text required, unique

পদ text required

ডিপার্টমেন্ট select required

ফোন text required, 11 ডিজিট

ইমেইল email optional

joinDate date required

ছবির URL url optional, http(s)

স্ট্যাটাস toggle active/inactive



ছবি URL পেস্ট করলে নিচে প্রিভিউ দেখাবে।



৭.৪ হাজিরা (/admin/attendance) — সবচেয়ে গুরুত্বপূর্ণ



উপরের অংশ: তারিখ নির্বাচক (ডিফল্ট আজ)



দুইটি ট্যাব/সেকশন:



ক) নাম সিলেক্ট করে হাজিরা (৮AM bulk):



· সব active কর্মীর তালিকা (চেকবক্স + ছবি + নাম + পদ)

· "সবাইকে সিলেক্ট" / "সব বাদ" বাটন

· "Present মার্ক করুন" বাটনে ক্লিক → POST /api/attendance/bulk

· রেসপন্সের পর যারা সিলেক্ট হয়নি তারা absent হিসেবে সেভ হয়



খ) আলাদা হাজিরা:



· প্রতিটি কর্মীর সারিতে:

  · Status: Present / Absent / Leave (radio/বাটন)

  · Check-in time (ডিফল্ট 08:00)

  · OT ঘণ্টা (number, ডিফল্ট 0)

  · Note (optional)

· OT নিয়ম ইন্ডিকেটর: OT = 0 হলে ছোট লেবেল "General Duty (৫PM)" দেখাবে; OT > 0 হলে "Overtime: X ঘণ্টা"

· প্রতিটি সারিতে "সেভ" বাটন → POST /api/attendance



নিচে: মাসিক রিপোর্ট



· মাস নির্বাচন → প্রতিটি কর্মীর present/absent/OT মোট



৭.৫ প্রোডাক্ট (/admin/products)



তালিকা পেজ:



· গ্রিড/টেবিল: ছবি, নাম, styleNo, category, প্রসেস সংখ্যা, স্ট্যাটাস, অ্যাকশন (এডিট/ডিলিট)

· "নতুন পণ্য" বাটন



এন্ট্রি/এডিট ফর্ম (new ও [id]):



ফিল্ড টাইপ নোট

নাম text required

styleNo text required, unique

category text required

ছবির URL url required, প্রিভিউ

buyerName text optional

description textarea optional

isFeatured toggle 

extraNote textarea optional



ProcessEditor (ফর্মের ভিতরে):



· "প্রসেস যোগ করুন" বাটন

· প্রতিটি প্রসেস সারি:

  · processName (text, required)

  · machineName (text)

  · targetQty (number)

  · completedQty (number)

  · note (text)

  · Delete বাটন (সারি মুছবে)

· সব এডিট করা যাবে

· সেভ করলে পুরো processEntries অ্যারে Product-এ সেভ হবে



প্রোডাকশন অ্যাসাইনমেন্ট (পণ্যের [id] পেজে বা আলাদা ট্যাব):



· প্রসেস বেছে নিন → কর্মী বেছে নিন → assignedQty, completedQty → সেভ

· একই প্রসেসে একাধিক কর্মী যোগ করা যাবে (তালিকা দেখাবে)

· একই কর্মী একাধিক প্রসেসে থাকতে পারবে



৭.৬ সেটিংস (/admin/settings)



· ভাষা টগল (বাংলা ⇄ 中文)

· থিম টগল (ডার্ক ⇄ লাইট)

· পাসওয়ার্ড পরিবর্তন (পুরনো + নতুন)



\---



৮. ভাষা সিস্টেম (বাংলা + চীনা)



কাঠামো:



· locales/bn.json ও locales/zh.json — নেস্টেড কী

· LanguageProvider (Context) — language state, setLanguage, t(key)

· t("employee.add") কল করলে বর্তমান ভাষার অনুবাদ ফেরত

· পছন্দ localStorage-এ; ডিফল্ট bn



অনুবাদ কী-এর নমুনা (সম্পূর্ণ তালিকা কোডে):



\`\`\`json

{

  "common": { "save": "...", "cancel": "...", "edit": "...", "delete": "..." },

  "nav": { "home": "...", "products": "...", "about": "...", "contact": "..." },

  "employee": { "title": "...", "add": "...", "name": "...", "position": "...", "department": "...", "phone": "...", "imageUrl": "...", "status": "..." },

  "attendance": { "title": "...", "date": "...", "selectAll": "...", "markPresent": "...", "present": "...", "absent": "...", "leave": "...", "overtime": "...", "generalDuty": "..." },

  "product": { "title": "...", "styleNo": "...", "category": "...", "buyer": "...", "addProcess": "...", "processName": "...", "machineName": "...", "target": "...", "completed": "...", "extraNote": "..." },

  "dashboard": { "totalEmployees": "...", "presentToday": "...", "absentToday": "...", "totalProducts": "..." },

  "settings": { "language": "...", "theme": "...", "dark": "...", "light": "..." }

}

\`\`\`



টগল কম্পোনেন্ট: LanguageToggle.tsx — "বাংলা / 中文" বাটন, ক্লিকে setLanguage।



\---



৯. থিম সিস্টেম (ডার্ক/লাইট)



· next-themes এর ThemeProvider (attribute="class")

· app/layout.tsx-এ র‍্যাপ

· Tailwind: darkMode: "class"

· সব কম্পোনেন্টে dark: ভ্যারিয়েন্ট (যেমন bg-white dark:bg-gray-900)

· ThemeToggle.tsx — সূর্য/চাঁদ আইকন বাটন

· ডিফল্ট system; পছন্দ localStorage-এ



\---



১০. Auth সিস্টেম (একজন অ্যাডমিন)



· NextAuth Credentials Provider

· লগইন ফর্ম → email + password

· bcrypt.compare দিয়ে যাচাই

· JWT সেশন

· [middleware.ts](http://middleware.ts/) দিয়ে /admin/\* প্রোটেক্ট (সেশন ছাড়া /login)

· প্রথম অ্যাডমিন: scripts/[seed-admin.ts](http://seed-admin.ts/) চালিয়ে তৈরি (npm run seed)



সেশন ফ্লো:



\`\`\`

/login → POST (NextAuth) → সেশন কুকি → /admin অ্যাক্সেস

\`\`\`



\---



১১. API এন্ডপয়েন্ট (রিকোয়েস্ট/রেসপন্স)



Method Route Body / Query Response

GET /api/employees ?search=&department= { employees: [...] }

POST /api/employees {name, employeeId, ...} { employee }

PATCH /api/employees/[id] আংশিক ফিল্ড { employee }

DELETE /api/employees/[id] — { success } (soft delete)

GET /api/attendance ?date=&month= { attendances }

POST /api/attendance {employee, date, status, overtimeHours, ...} { attendance }

POST /api/attendance/bulk { date, presentIds: [] } { created, absentCount }

GET /api/products ?search=&category= { products }

POST /api/products {name, processEntries: [...]} { product }

PATCH /api/products/[id] আংশিক + processEntries { product }

DELETE /api/products/[id] — { success }

POST /api/assignments {product, processEntryId, employee, ...} { assignment }



সব API-তে: Zod ভ্যালিডেশন, try/catch, উপযুক্ত status code (200/201/400/401/404/500)।



\---



১২. ভ্যালিডেশন নিয়ম (Zod)



· Employee: name ≥2, employeeId required, phone ১১ ডিজিট, imageUrl valid URL

· Attendance: date required, overtimeHours ≥0 ≤12, একই employee+date ডুপ্লিকেট নয়

· Product: styleNo unique, processEntries-এ processName required

· Bulk attendance: presentIds অ্যারে, date required



\---



১৩. Config ও সেটআপ



config/[db.ts](http://db.ts/):



\`\`\`ts

export const MONGODB_URI =

  "mongodb+srv://\<user>:\<pass>@[cluster0.xxxxx.mongodb.net/shunyi_garments?retryWrites=true&w=majority](http://cluster0.xxxxx.mongodb.net/shunyi_garments?retryWrites=true\&w=majority)";

\`\`\`



এই ফাইল .gitignore-এ রাখুন।



lib/[mongodb.ts](http://mongodb.ts/): কানেকশন ক্যাশে করে connectDB() এক্সপোর্ট।



পরিবেশ: কোনো .env নয় (আপনার অনুরোধ অনুযায়ী)। NextAuth secret-ও config/[auth.ts](http://auth.ts/)-এ রাখতে পারেন, তবে নিরাপত্তার জন্য আলাদা কনফিগ ফাইলে রাখা ভালো।



package.json স্ক্রিপ্ট:



\`\`\`json

{

  "dev": "next dev",

  "build": "next build",

  "start": "next start",

  "seed": "tsx scripts/[seed-admin.ts](http://seed-admin.ts/)"

}

\`\`\`



\---



১৪. ডেভেলপমেন্ট রোডম্যাপ (৮ ধাপ — প্রতিটির ফলাফলসহ)



✅ ধাপ ১: ভিত্তি + থিম



· create-next-app, প্যাকেজ ইনস্টল

· config/[db.ts](http://db.ts/), lib/[mongodb.ts](http://mongodb.ts/)

· ThemeProvider, ThemeToggle, darkMode কনফিগ

· ফলাফল: চলমান অ্যাপ + ডার্ক/লাইট টগল



✅ ধাপ ২: ভাষা সিস্টেম



· locales/bn.json, locales/zh.json

· LanguageProvider, t(), LanguageToggle

· ফলাফল: বাংলা/চীনা টগল কাজ করছে



✅ ধাপ ৩: Auth



· models/[User.ts](http://user.ts/), lib/[auth.ts](http://auth.ts/), [middleware.ts](http://middleware.ts/)

· /login পেজ, [seed-admin.ts](http://seed-admin.ts/)

· ফলাফল: অ্যাডমিন লগইন + /admin প্রোটেক্টেড



✅ ধাপ ৪: কর্মী মডিউল



· models/[Employee.ts](http://employee.ts/), API, তালিকা/ফর্ম/এডিট

· ছবি URL ইনপুট + প্রিভিউ

· ফলাফল: কর্মী CRUD সম্পূর্ণ



✅ ধাপ ৫: হাজিরা মডিউল



· models/[Attendance.ts](http://attendance.ts/), API, bulk API

· BulkAttendance UI (৮AM নাম সিলেক্ট)

· AttendanceRow (OT ৫PM লজিক)

· মাসিক রিপোর্ট

· ফলাফল: হাজিরা সিস্টেম সম্পূর্ণ



✅ ধাপ ৬: প্রোডাক্ট + প্রসেস



· models/[Product.ts](http://product.ts/), [Assignment.ts](http://assignment.ts/), API

· ProductForm + ProcessEditor (add/edit/delete + extraNote)

· Assignment UI

· ফলাফল: প্রোডাক্ট ও প্রোডাকশন ম্যানেজমেন্ট



✅ ধাপ ৭: পাবলিক সাইট



· হোম, পণ্য তালিকা, বিস্তারিত, about, contact

· ফলাফল: পাবলিক শোকেস লাইভ



✅ ধাপ ৮: ড্যাশবোর্ড + ডিপ্লয়মেন্ট



· StatCard সারসংক্ষেপ

· Vercel + MongoDB Atlas ডিপ্লয়

· ফলাফল: লাইভ সাইট



\---



১৫. টেস্টিং চেকলিস্ট



☐ অ্যাডমিন লগইন/লগআউট কাজ করে

☐ সেশন ছাড়া /admin-এ গেলে /login-এ যায়

☐ ভাষা টগল সব টেক্সট বদলায়

☐ থিম টগল সব পেজে কাজ করে, রিফ্রেশেও থাকে

☐ কর্মী যোগ/এডিট/নিষ্ক্রিয় কাজ করে

☐ ছবি URL দিলে প্রিভিউ দেখায়

☐ Bulk হাজিরায় শুধু সিলেক্টেডরা present হয়

☐ OT=0 হলে general duty, >0 হলে overtime দেখায়

☐ একই কর্মীর একই দিনে দুবার হাজিরা দিলে এরর/আপডেট হয়

☐ প্রোডাক্টে একাধিক প্রসেস যোগ/এডিট/ডিলিট হয়

☐ এক প্রসেসে একাধিক কর্মী যোগ হয়

☐ পাবলিক পেজে প্রসেস/মেশিন দেখা যায়

☐ মোবাইলে responsive



\---



১৬. ডিপ্লয়মেন্ট



1\. MongoDB Atlas: ক্লাস্টার + DB user + Network Access (0.0.0.0/0 বা Vercel IP)

2\. GitHub-এ পুশ (config/[db.ts](http://db.ts/) বাদ দিয়ে .gitignore)

3\. Vercel: রিপো কানেক্ট → বিল্ড → ডিপ্লয়

4\. প্রথম অ্যাডমিন: লোকালি npm run seed অথবা Vercel-এ একবার চালান

5\. ডোমেইন (ঐচ্ছিক): Cloudflare/Namecheap



⚠️ config/[db.ts](http://db.ts/)-এ URL সরাসরি থাকায় রিপো পাবলিক করবেন না; প্রাইভেট রাখুন বা Vercel-এ আলাদা কনফিগ রাখুন।



\---



,&#x20;