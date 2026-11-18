import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"buyers", title:"Buyers", singular:"Buyer", icon:"♧", fields:[
    {key:"company",label:"Company name",type:"text",required:true},{key:"contact",label:"Contact person",type:"text"},
    {key:"email",label:"Email",type:"email"},{key:"phone",label:"Phone",type:"tel"},{key:"country",label:"Country",type:"text"},
    {key:"status",label:"Status",type:"select",options:["Active","Inactive"]}
  ]};
