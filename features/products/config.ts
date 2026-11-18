import type { ModuleConfig } from "@/features/types";
export const config: ModuleConfig = { key:"products", title:"Products", singular:"Product", icon:"👕", fields:[
 {key:"name",label:"Product name",type:"text",required:true},{key:"styleNo",label:"Style number",type:"text",required:true},{key:"category",label:"Category",type:"select",options:["T-shirt","Polo shirt","Shirt","Hoodie","Jeans","Jacket","Kidswear"]},{key:"imageUrl",label:"Image URL",type:"image",required:true},{key:"buyerName",label:"Buyer name",type:"text"},{key:"description",label:"Description",type:"textarea"},{key:"isFeatured",label:"Featured",type:"select",options:["true","false"]},{key:"extraNote",label:"Extra note",type:"textarea"},{key:"status",label:"Status",type:"select",options:["active","archived"]}
]};
