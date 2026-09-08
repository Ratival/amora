import * as React from "react";
import type { TemplateProps } from "./types";
import { ClassicMonochromeTemplate } from "./classic-monochrome";

export type TemplateComponent = React.ComponentType<TemplateProps>;

// Multi-Layout Template Component Registry
export const TEMPLATE_REGISTRY: Record<string, TemplateComponent> = {
  "modern-minimalist": ClassicMonochromeTemplate,
  // Additional layout templates will be registered here as separate components:
  // "rustic-botanical": RusticBotanicalTemplate,
  // "royal-gold": RoyalMagazineTemplate,
  // "traditional-java": TraditionalHeritageTemplate,
};

export function getTemplateComponent(themeId?: string): TemplateComponent {
  if (!themeId) return ClassicMonochromeTemplate;
  return TEMPLATE_REGISTRY[themeId] || ClassicMonochromeTemplate;
}
