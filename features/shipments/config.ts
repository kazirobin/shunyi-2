import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"shipments", title:"Shipment", singular:"Shipment", icon:"➜", fields:[
    {key:"shipmentNo",label:"Shipment number",type:"text",required:true},{key:"orderNo",label:"Order number",type:"text"},
    {key:"buyer",label:"Buyer",type:"text"},{key:"quantity",label:"Quantity",type:"number"},
    {key:"carrier",label:"Carrier",type:"text"},{key:"trackingNo",label:"Tracking number",type:"text"},
    {key:"shipDate",label:"Shipment date",type:"date"},{key:"status",label:"Status",type:"select",options:["Preparing","Dispatched","In transit","Delivered"]}
  ]};
