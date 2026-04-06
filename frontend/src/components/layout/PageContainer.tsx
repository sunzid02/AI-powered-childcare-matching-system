import { ReactNode } from "react";

type Props = {
  title?: string
  subtitle?: string
  children: ReactNode
}

export default function PageContainer({ title, subtitle, children }: Props) {
  return (
    <main className="container">
      <h1 className="page-title">{title}</h1>
      {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
      {children}
    </main>
  );
}