import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"quality-control", title:"Quality Control", singular:"QC inspection", icon:"✓", fields:[
    {key:"orderNo",label:"Order number",type:"text",required:true},{key:"stage",label:"Inspection stage",type:"select",options:["Fabric","Cutting","Inline","Endline","Final"]},
    {key:"inspected",label:"Inspected quantity",type:"number"},{key:"defects",label:"Defect quantity",type:"number"},
    {key:"result",label:"Result",type:"select",options:["Passed","Failed","Re-inspection"]},{key:"date",label:"Inspection date",type:"date"}
  ]};
