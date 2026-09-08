import * as React from "react";
import { Eye, Palette } from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useAuth } from "~/contexts/auth-context";
import type { ThemeTemplate } from "~/types/dashboard";

export function AdminTemplatesPage() {
  const { templates } = useAuth();
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All");
  const [previewTemplate, setPreviewTemplate] = React.useState<ThemeTemplate | null>(null);

  const categories = React.useMemo(() => {
    return ["All", ...Array.from(new Set(templates.map((t) => t.category)))];
  }, [templates]);

  const filteredTemplates = templates.filter(
    (t) => selectedCategory === "All" || t.category === selectedCategory
  );

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Katalog Tema & Template Undangan"
        description="Pilihan tema visual dan layout undangan pernikahan yang tersedia untuk pasangan."
      />

      <div className="p-4 sm:p-6 space-y-6">
        {/* Filter categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className="h-8 px-3 text-xs cursor-pointer"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="overflow-hidden border-border/80 shadow-xs flex flex-col group">
              <div className="relative aspect-16/10 overflow-hidden bg-muted">
                <img
                  src={template.previewImage}
                  alt={template.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {template.popular && (
                  <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold shadow-xs">
                    Popular
                  </div>
                )}
                <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-background/90 backdrop-blur-xs text-[10px] font-semibold text-foreground">
                  {template.category}
                </div>
              </div>

              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground">
                    {template.name}
                  </CardTitle>
                  <div
                    className="h-4 w-4 rounded-full border border-border shrink-0"
                    style={{ backgroundColor: template.accentColor }}
                    title={`Aksen: ${template.accentColor}`}
                  />
                </div>
                <CardDescription className="text-xs text-muted-foreground line-clamp-2">
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 pt-1 flex-1 text-xs text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium text-foreground">Tipografi:</span> {template.fontFamily}
                </p>
                <p>
                  <span className="font-medium text-foreground">Digunakan oleh:</span> {template.activeCouplesCount} Pasangan
                </p>
              </CardContent>

              <CardFooter className="p-4 pt-0 border-t border-border/60 mt-auto bg-muted/10">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewTemplate(template)}
                  className="w-full h-8 text-xs cursor-pointer gap-1.5"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>Lihat Detail & Pratinjau</span>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        {previewTemplate && (
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Palette className="h-4 w-4 text-primary" />
                {previewTemplate.name}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Kategori: {previewTemplate.category} • {previewTemplate.activeCouplesCount} pasangan aktif
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="aspect-16/9 rounded-xl overflow-hidden border border-border">
                <img
                  src={previewTemplate.previewImage}
                  alt={previewTemplate.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-foreground">{previewTemplate.description}</p>
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60">
                    <p className="text-[11px] text-muted-foreground">Kombinasi Huruf</p>
                    <p className="font-semibold text-foreground">{previewTemplate.fontFamily}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Warna Aksen</p>
                      <p className="font-semibold text-foreground font-mono">{previewTemplate.accentColor}</p>
                    </div>
                    <div
                      className="h-6 w-6 rounded-full border border-border"
                      style={{ backgroundColor: previewTemplate.accentColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </main>
  );
}
