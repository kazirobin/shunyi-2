import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"suppliers", title:"Suppliers", singular:"Supplier", icon:"⇄", fields:[
    {key:"company",label:"Company name",type:"text",required:true},{key:"contact",label:"Contact person",type:"text"},
    {key:"category",label:"Supply category",type:"select",options:["Fabric","Accessories","Packaging","Machinery","Other"]},
    {key:"phone",label:"Phone",type:"tel"},{key:"email",label:"Email",type:"email"},{key:"address",label:"Address",type:"text"}
  ]};
