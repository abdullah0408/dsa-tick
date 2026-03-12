import { RiCodeSSlashLine } from "@remixicon/react";
import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <main className="relative min-h-svh overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--muted))_0%,transparent_45%)]" />
      <section className="relative mx-auto flex min-h-svh w-full max-w-6xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-sm bg-background">
          <div className="flex items-center gap-3">
            <div className="bg-primary border border-border p-1">
              <RiCodeSSlashLine className="size-4 text-primary-foreground" />
            </div>
            <h1 className="text-sm font-bold uppercase tracking-wider">
              Algo<span className="text-muted-foreground">Sheet</span>
            </h1>
          </div>
          <div className="px-6 py-6">{children}</div>
        </div>
      </section>
    </main>
  );
};

export default AuthLayout;
