import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

export const AppTooltipProvider = ({ children }: { children: ReactNode }) => {
  return <TooltipProvider>{children}</TooltipProvider>;
};
