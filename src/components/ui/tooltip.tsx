import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export const Tooltip = ({ children, content }: { children: React.ReactNode; content: React.ReactNode }) => (
  <TooltipPrimitive.Provider>
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content className="z-50 px-2 py-1 rounded bg-gray-900 text-white text-xs shadow-lg">
          {content}
          <TooltipPrimitive.Arrow className="fill-gray-900" />
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  </TooltipPrimitive.Provider>
);
