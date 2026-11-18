import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"orders", title:"Orders", singular:"Order", icon:"▣", fields:[
    {key:"orderNo",label:"Order number",type:"text",required:true},{key:"buyer",label:"Buyer",type:"text",required:true},
    {key:"product",label:"Product",type:"text"},{key:"quantity",label:"Order quantity (pcs)",type:"number"},
    {key:"unitPrice",label:"Unit price",type:"number"},{key:"orderDate",label:"Order date",type:"date"},
    {key:"dueDate",label:"Delivery date",type:"date"},{key:"status",label:"Status",type:"select",options:["Pending","Sampling","In production","Ready to ship","Shipped","Completed","Cancelled"]}
  ]};
