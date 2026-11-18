import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"departments", title:"Departments", singular:"Department", icon:"▤", fields:[
    {key:"name",label:"Department name",type:"text",required:true},{key:"manager",label:"Department manager",type:"text"},
    {key:"employees",label:"Employee count",type:"number"},{key:"description",label:"Description",type:"text"}
  ]};
