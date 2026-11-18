import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"production", title:"Production", singular:"Production entry", icon:"⚙", fields:[
    {key:"orderNo",label:"Order number",type:"text",required:true},{key:"process",label:"Process",type:"select",options:["Cutting","Sewing","Finishing","Packing"]},
    {key:"line",label:"Line / Unit",type:"text"},{key:"target",label:"Daily target",type:"number"},
    {key:"produced",label:"Produced quantity",type:"number"},{key:"date",label:"Production date",type:"date"}
  ]};
