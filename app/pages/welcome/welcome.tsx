import type { TemplateProps } from "~/templates/types";
import { InvitationRenderer } from "~/templates";

export const Welcome = (props: TemplateProps) => {
  return <InvitationRenderer {...props} />;
};

export default Welcome;

