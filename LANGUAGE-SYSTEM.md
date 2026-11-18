# Language selector

The management interface now supports:
- English (`en`)
- Simplified Chinese (`zh-CN`)

Use the language selector in the top-right header. The selection is stored in the browser under `shunyi-language` and is restored on the next visit. No database or employee data is changed by switching languages.

The translation layer is in `lib/language.ts`; add or update English-to-Chinese labels in the `zh` translation list.
