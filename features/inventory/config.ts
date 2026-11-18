import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"inventory", title:"Inventory", singular:"Inventory item", icon:"▥", fields:[
    {key:"item",label:"Item name",type:"text",required:true},{key:"category",label:"Category",type:"select",options:["Fabric","Thread","Button","Zipper","Label","Packaging","Other"]},
    {key:"sku",label:"SKU / Code",type:"text"},{key:"unit",label:"Unit",type:"select",options:["Pcs","Yard","Kg","Roll","Cone","Meter"]},
    {key:"stock",label:"Current stock",type:"number"},{key:"reorderLevel",label:"Reorder level",type:"number"},
    {key:"supplier",label:"Supplier",type:"text"}
  ]};
