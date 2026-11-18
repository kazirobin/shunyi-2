export type FieldType = "text" | "number" | "date" | "select" | "email" | "tel" | "image" | "textarea";
export type Field = { key: string; label: string; type: FieldType; options?: string[]; required?: boolean };
export type ModuleConfig = { key: string; title: string; singular: string; icon: string; fields: Field[]; enabled?: boolean };
