import * as React from "react";
import type { TemplateProps } from "./types";
import { getTemplateComponent } from "./registry";
import { useAuth } from "~/contexts/auth-context";

export * from "./types";
export * from "./registry";
export * from "./classic-monochrome";

export function InvitationRenderer({ couple: propCouple, guestName, isTemplatePreview }: TemplateProps) {
  const { currentCouple: contextCouple } = useAuth();
  const couple = propCouple || contextCouple;

  const TemplateComponent = getTemplateComponent(couple?.themeId);

  return <TemplateComponent couple={couple} guestName={guestName} isTemplatePreview={isTemplatePreview} />;
}
