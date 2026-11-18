import type { ModuleConfig } from "@/features/types";

export const config: ModuleConfig = { key:"settings", title:"Settings", singular:"Setting", icon:"⚙", fields:[
    {key:"companyName",label:"Company name",type:"text"},{key:"address",label:"Address",type:"text"},
    {key:"phone",label:"Company phone",type:"tel"},{key:"email",label:"Company email",type:"email"},
    {key:"currency",label:"Currency",type:"text"},{key:"timezone",label:"Timezone",type:"text"}
  ]};
