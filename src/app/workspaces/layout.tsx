import { PropsWithChildren } from "react";

export default function WorkspacesLayout({
  children,
}: Readonly<PropsWithChildren>) {
  return <div className="DEV">{children}</div>;
}
