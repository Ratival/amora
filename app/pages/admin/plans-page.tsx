import * as React from "react";
import { Check } from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { useAuth } from "~/contexts/auth-context";

export function AdminPlansPage() {
  const { plans } = useAuth();

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Paket & Harga SaaS"
        description="Kelola paket langganan, fitur, dan penetapan harga untuk platform Amora."
      />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col border-border/80 relative shadow-xs ${
                plan.isPopular ? "border-primary shadow-md ring-1 ring-primary/20" : ""
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-xs">
                  {plan.badge}
                </div>
              )}

              <CardHeader className="p-5 pb-3">
                <CardTitle className="text-base font-bold text-foreground">
                  {plan.name}
                </CardTitle>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-2xl font-black text-foreground">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>
                <CardDescription className="text-xs text-muted-foreground pt-1">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 pt-2 flex-1 space-y-3">
                <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Fitur Termasuk:
                </div>
                <ul className="space-y-2 text-xs">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="p-5 pt-0 mt-auto border-t border-border/60 bg-muted/10">
                <div className="w-full pt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Pengguna Aktif:</span>
                  <span className="font-bold text-foreground">{plan.activeSubscribers} Pasangan</span>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
