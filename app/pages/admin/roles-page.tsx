import * as React from "react";
import { Save, Plus, ShieldCheck, UserCheck } from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { toast } from "sonner";

interface MenuPermissionRow {
  key: string;
  name: string;
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  audit: boolean;
}

interface RoleConfig {
  key: string;
  label: string;
  description: string;
  matrix: MenuPermissionRow[];
}

const DEFAULT_MODULES: { key: string; name: string }[] = [
  { key: "overview", name: "Ringkasan Platform" },
  { key: "couples", name: "Pasangan & Undangan" },
  { key: "users", name: "Manajemen Pengguna" },
  { key: "roles", name: "Hak Akses & Role" },
  { key: "settings", name: "Pengaturan Platform" },
];

const INITIAL_ROLES: RoleConfig[] = [
  {
    key: "admin",
    label: "Super Admin",
    description: "Akses penuh ke semua fitur dan pengaturan sistem platform.",
    matrix: DEFAULT_MODULES.map((m) => ({
      key: m.key,
      name: m.name,
      view: true,
      create: true,
      update: true,
      delete: m.key === "roles" || m.key === "settings" ? false : true,
      audit: true,
    })),
  },
  {
    key: "staff",
    label: "Staff Operasional",
    description: "Dapat melihat dan mengelola data pasangan serta undangan pernikahan.",
    matrix: DEFAULT_MODULES.map((m) => ({
      key: m.key,
      name: m.name,
      view: true,
      create: m.key === "couples" || m.key === "users",
      update: m.key === "couples" || m.key === "users",
      delete: false,
      audit: false,
    })),
  },
  {
    key: "couple",
    label: "Pengantin (Couple)",
    description: "Hanya memiliki akses ke portal dashboard undangan miliknya sendiri.",
    matrix: DEFAULT_MODULES.map((m) => ({
      key: m.key,
      name: m.name,
      view: m.key === "couples",
      create: false,
      update: m.key === "couples",
      delete: false,
      audit: false,
    })),
  },
];

export function AdminRolesPage() {
  const [roles, setRoles] = React.useState<RoleConfig[]>(INITIAL_ROLES);
  const [selectedRoleKey, setSelectedRoleKey] = React.useState<string>("admin");

  // Create Role State
  const [createRoleOpen, setCreateRoleOpen] = React.useState(false);
  const [newRoleKey, setNewRoleKey] = React.useState("");
  const [newRoleLabel, setNewRoleLabel] = React.useState("");
  const [newRoleDesc, setNewRoleDesc] = React.useState("");

  const currentRole = roles.find((r) => r.key === selectedRoleKey) || roles[0];

  const handleToggle = (moduleKey: string, field: "view" | "create" | "update" | "delete" | "audit") => {
    setRoles((prev) =>
      prev.map((role) => {
        if (role.key !== selectedRoleKey) return role;
        return {
          ...role,
          matrix: role.matrix.map((row) =>
            row.key === moduleKey ? { ...row, [field]: !row[field] } : row
          ),
        };
      })
    );
  };

  const handleSave = () => {
    toast.success(`Hak Akses untuk Role "${currentRole.label}" Berhasil Disimpan!`);
  };

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleKey || !newRoleLabel) return;

    const formattedKey = newRoleKey.toLowerCase().replace(/[^a-z0-9-_]/g, "");

    if (roles.some((r) => r.key === formattedKey)) {
      toast.error("Role dengan kode tersebut sudah ada!");
      return;
    }

    const newRole: RoleConfig = {
      key: formattedKey,
      label: newRoleLabel,
      description: newRoleDesc || `Hak akses kustom untuk role ${newRoleLabel}`,
      matrix: DEFAULT_MODULES.map((m) => ({
        key: m.key,
        name: m.name,
        view: true,
        create: false,
        update: false,
        delete: false,
        audit: false,
      })),
    };

    setRoles((prev) => [...prev, newRole]);
    setSelectedRoleKey(formattedKey);
    setNewRoleKey("");
    setNewRoleLabel("");
    setNewRoleDesc("");
    setCreateRoleOpen(false);
    toast.success(`Role Baru "${newRoleLabel}" Berhasil Dibuat!`);
  };

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Hak Akses & Role Matrix"
        description="Atur izin granular (View, Create, Update, Delete, Audit) untuk setiap modul platform."
      />

      <div className="p-4 sm:p-6 space-y-4">
        {/* Role Selector & Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-muted/60 p-1 rounded-md border border-border/80 flex-wrap">
            {roles.map((r) => (
              <button
                key={r.key}
                type="button"
                onClick={() => setSelectedRoleKey(r.key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm cursor-pointer transition-colors ${
                  selectedRoleKey === r.key
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateRoleOpen(true)}
              className="h-8 gap-1.5 text-xs font-semibold rounded-md cursor-pointer shrink-0"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Role</span>
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              className="h-8 gap-1.5 text-xs font-semibold rounded-md cursor-pointer shrink-0"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Simpan Izin</span>
            </Button>
          </div>
        </div>

        {/* Matrix Card */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Matriks Izin Modul: {currentRole.label} ({currentRole.key})</span>
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {currentRole.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs font-semibold w-1/3">Modul / Menu</TableHead>
                  <TableHead className="text-xs font-semibold text-center">View (Lihat)</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Create (Tambah)</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Update (Ubah)</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Delete (Hapus)</TableHead>
                  <TableHead className="text-xs font-semibold text-center">Audit (Log)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRole.matrix.map((row) => (
                  <TableRow key={row.key}>
                    <TableCell className="font-semibold text-xs text-foreground">
                      {row.name}
                    </TableCell>

                    {(["view", "create", "update", "delete", "audit"] as const).map((action) => (
                      <TableCell key={action} className="text-center">
                        <input
                          type="checkbox"
                          checked={row[action]}
                          onChange={() => handleToggle(row.key, action)}
                          className="h-4 w-4 rounded-sm border-border text-primary accent-primary cursor-pointer"
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>

          <CardFooter className="p-4 border-t border-border/60 bg-muted/10 flex justify-between items-center">
            <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
              Perubahan izin berlaku secara instan saat sesi pengguna aktif diperbarui.
            </p>
            <Button size="sm" onClick={handleSave} className="text-xs h-8 cursor-pointer">
              Simpan Perubahan
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Add Role Dialog */}
      <Dialog open={createRoleOpen} onOpenChange={setCreateRoleOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateRole}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold">Tambah Role Baru</DialogTitle>
              <DialogDescription className="text-xs">
                Buat peran pengguna baru untuk mengatur matriks hak akses kustom.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Nama Role (Label)<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  required
                  placeholder="Contoh: Editor Konten, Event Organizer, Moderator"
                  value={newRoleLabel}
                  onChange={(e) => {
                    setNewRoleLabel(e.target.value);
                    if (!newRoleKey) {
                      setNewRoleKey(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, "-"));
                    }
                  }}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Kode Identifier (Key)<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  required
                  placeholder="contoh: editor, event-organizer"
                  value={newRoleKey}
                  onChange={(e) => setNewRoleKey(e.target.value.toLowerCase().replace(/[^a-z0-9-_]/g, ""))}
                  className="text-xs h-8 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">Deskripsi Tugas</label>
                <Input
                  placeholder="Deskripsi singkat wewenang peran ini..."
                  value={newRoleDesc}
                  onChange={(e) => setNewRoleDesc(e.target.value)}
                  className="text-xs h-8"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateRoleOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button type="submit" size="sm" className="text-xs cursor-pointer">
                Simpan Role
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
