import { ReactNode } from "react";
import Header from "~/components/Header";

function MainPage({ children }: { children: ReactNode }) {
  return <div className="h-lvh"> {children}</div>;
}

export function Page({ children }: { children: ReactNode }) {
  return (
    <MainPage>
      <Header />
      {children}
    </MainPage>
  );
}
