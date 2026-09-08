import type { CoupleProject } from "~/types/dashboard";

export interface TemplateProps {
  couple?: CoupleProject | null;
  guestName?: string;
  isTemplatePreview?: boolean;
}
