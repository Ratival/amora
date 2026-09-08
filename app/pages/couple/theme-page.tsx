import * as React from "react";
import { Check } from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { useAuth } from "~/contexts/auth-context";
import { toast } from "sonner";

export function CoupleThemePage() {
  const { currentCouple, templates, updateCouple } = useAuth();
  const [selectedThemeId, setSelectedThemeId] = React.useState(
    currentCouple?.themeId || "modern-minimalist"
  );

  React.useEffect(() => {
    if (currentCouple?.themeId) {
      setSelectedThemeId(currentCouple.themeId);
    }
  }, [currentCouple?.themeId]);

  const couple = currentCouple;

  const handleSelectTheme = (themeId: string) => {
    setSelectedThemeId(themeId);
    if (couple) {
      updateCouple(couple.slug, { themeId });
      toast.success("Tema Desain Berhasil Diperbarui!");
    }
  };

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Tema & Kustomisasi Desain"
        description="Pilih tampilan visual yang paling sesuai dengan konsep pernikahan Anda."
      />

      <div className="p-4 sm:p-6 space-y-6 max-w-5xl">
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {templates.map((theme) => {
            const isSelected = selectedThemeId === theme.id;
            return (
              <Card
                key={theme.id}
                className={`overflow-hidden border-2 transition-all shadow-xs cursor-pointer ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border/80 hover:border-primary/40"
                }`}
                onClick={() => handleSelectTheme(theme.id)}
              >
                <div className="relative aspect-16/10 overflow-hidden bg-muted">
                  <img
                    src={theme.previewImage}
                    alt={theme.name}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md flex items-center gap-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>Tema Aktif</span>
                    </div>
                  )}
                </div>

                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-bold text-foreground">
                      {theme.name}
                    </CardTitle>
                    <div
                      className="h-5 w-5 rounded-full border border-border shrink-0"
                      style={{ backgroundColor: theme.accentColor }}
                    />
                  </div>
                  <CardDescription className="text-xs text-muted-foreground">
                    {theme.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-1 text-xs text-muted-foreground space-y-1">
                  <p>
                    <span className="font-semibold text-foreground">Kategori:</span> {theme.category}
                  </p>
                  <p>
                    <span className="font-semibold text-foreground">Tipografi:</span> {theme.fontFamily}
                  </p>
                </CardContent>

                <CardFooter className="p-4 pt-0 border-t border-border/60 mt-auto bg-muted/10">
                  <Button
                    size="sm"
                    variant={isSelected ? "default" : "outline"}
                    className="w-full h-8 text-xs font-semibold cursor-pointer"
                  >
                    {isSelected ? "Sedang Digunakan" : "Gunakan Tema Ini"}
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </main>
  );
}
