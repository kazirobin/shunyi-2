import type { ModuleConfig } from "@/features/types";
export const config: ModuleConfig = { key:"work-style", title:"Work Style", singular:"Work record", icon:"🧵", fields:[
 {key:"date",label:"Date",type:"date",required:true},{key:"styleNo",label:"Style number",type:"text",required:true},{key:"buyerOrder",label:"Buyer / Order",type:"text"},{key:"process",label:"Process",type:"select",options:["Cutting","Sewing","Finishing","Packing","Quality"]},{key:"employee",label:"Employee / Operator",type:"text"},{key:"inputPieces",label:"Input pieces",type:"number"},{key:"outputPieces",label:"Output pieces",type:"number"},{key:"rejectPieces",label:"Reject pieces",type:"number"},{key:"pendingPieces",label:"Pending pieces",type:"number"},{key:"notes",label:"Notes",type:"textarea"}
]};
