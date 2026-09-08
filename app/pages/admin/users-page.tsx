import * as React from "react";
import { Search, Plus, Trash2, Loader2, UserPlus, Pencil, ShieldAlert } from "lucide-react";
import { DashboardHeader } from "~/components/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Switch } from "~/components/ui/switch";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { useAuth } from "~/contexts/auth-context";
import { toast } from "sonner";
import type { User, UserRole } from "~/types/dashboard";

export function AdminUsersPage() {
  const { users, couples, currentUser, createUser, updateUser, deleteUser, refreshData } = useAuth();
  const [search, setSearch] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  // Create Form fields
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<UserRole>("couple");
  const [coupleSlug, setCoupleSlug] = React.useState("");

  // Edit Form fields
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  const [editName, setEditName] = React.useState("");
  const [editEmail, setEditEmail] = React.useState("");
  const [editPassword, setEditPassword] = React.useState("");
  const [editRole, setEditRole] = React.useState<UserRole>("couple");
  const [editCoupleSlug, setEditCoupleSlug] = React.useState("");
  const [editIsActive, setEditIsActive] = React.useState(true);

  React.useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      await createUser({
        name,
        email,
        password,
        role,
        coupleSlug: role === "couple" ? coupleSlug : "",
      });

      toast.success(`Pengguna "${name}" berhasil ditambahkan!`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("couple");
      setCoupleSlug("");
      setCreateOpen(false);
    } catch (err: any) {
      toast.error("Gagal menambahkan pengguna", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (u: User) => {
    if (currentUser?.id === u.id || currentUser?.email === u.email) {
      toast.error("Anda tidak dapat mengedit akun Anda sendiri dari menu ini!");
      return;
    }
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditPassword("");
    setEditRole(u.role);
    setEditCoupleSlug(u.coupleSlug || "");
    setEditIsActive(u.isActive ?? true);
    setEditOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName || !editEmail) return;

    if (editPassword && editPassword.length < 6) {
      toast.error("Password baru minimal 6 karakter");
      return;
    }

    setLoading(true);
    try {
      await updateUser(editingUser.id, {
        name: editName,
        email: editEmail,
        password: editPassword || undefined,
        role: editRole,
        coupleSlug: editRole === "couple" ? editCoupleSlug : "",
        isActive: editIsActive,
      });

      toast.success(`Pengguna "${editName}" berhasil diperbarui!`);
      setEditOpen(false);
      setEditingUser(null);
    } catch (err: any) {
      toast.error("Gagal memperbarui pengguna", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (u: User) => {
    if (currentUser?.id === u.id || currentUser?.email === u.email) {
      toast.error("Tidak dapat menghapus akun Anda sendiri yang sedang aktif!");
      return;
    }
    setDeleteTarget(u);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      toast.success(`Pengguna "${deleteTarget.name}" berhasil dihapus.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error("Gagal menghapus pengguna", { description: err.message });
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1">
      <DashboardHeader
        title="Manajemen Pengguna"
        description="Kelola akun platform admin dan akun mempelai yang terdaftar di Amora."
      />

      <div className="p-4 sm:p-6 space-y-6">
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4">
            <div>
              <CardTitle className="text-base font-semibold">Daftar Akun Pengguna</CardTitle>
              <CardDescription className="text-xs">
                Total {users.length} akun terdaftar dalam sistem.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-full sm:w-60 relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Cari nama atau email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>

              <Button
                size="sm"
                onClick={() => setCreateOpen(true)}
                className="h-8 gap-1.5 text-xs font-semibold rounded-md cursor-pointer shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Pengguna</span>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Pengguna</TableHead>
                  <TableHead className="text-xs">Role</TableHead>
                  <TableHead className="text-xs">Undangan Terkait</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Tanggal Dibuat</TableHead>
                  <TableHead className="text-xs text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-muted-foreground">
                      Tidak ada data pengguna yang sesuai.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => {
                    const isAdmin = u.role === "admin";
                    const isStaff = u.role === "staff";
                    return (
                      <TableRow key={u.id}>
                        <TableCell className="py-3">
                          <div className="font-semibold text-xs text-foreground flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p>{u.name}</p>
                              <p className="text-[11px] text-muted-foreground">{u.email}</p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider font-mono ${
                              isAdmin
                                ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                                : isStaff
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </TableCell>

                        <TableCell className="text-xs">
                          {u.coupleSlug ? (
                            <span className="font-mono text-primary font-medium">
                              /{u.coupleSlug}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Semua (Super Admin)</span>
                          )}
                        </TableCell>

                        <TableCell>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Aktif
                          </span>
                        </TableCell>

                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(u.createdAt).toLocaleDateString("id-ID")}
                        </TableCell>

                        <TableCell className="text-right">
                          {currentUser?.id === u.id || currentUser?.email === u.email ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md border border-border/60">
                              <ShieldAlert className="h-3 w-3 text-primary" />
                              <span>Akun Anda</span>
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEdit(u)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 cursor-pointer"
                                title="Edit Pengguna"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteClick(u)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Add User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateUser}>
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-primary" />
                <span>Tambah Pengguna Baru</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Buat akun pengguna baru untuk mengelola platform atau undangan pernikahan.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Nama Lengkap<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Alamat Email<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  type="email"
                  required
                  placeholder="contoh: budi@ratival.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Password (Minimal 6 karakter)<span className="text-destructive ml-0.5">*</span>
                </label>
                <Input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-foreground">
                  Peran / Role<span className="text-destructive ml-0.5">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full h-8 px-2.5 text-xs rounded-md border border-input bg-background text-foreground"
                >
                  <option value="couple">Pengantin (Couple)</option>
                  <option value="staff">Staff Operasional</option>
                  <option value="admin">Super Administrator</option>
                </select>
              </div>

              {role === "couple" && (
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    Undangan Terkait<span className="text-destructive ml-0.5">*</span>
                  </label>
                  {couples.length > 0 ? (
                    <select
                      value={coupleSlug}
                      onChange={(e) => setCoupleSlug(e.target.value)}
                      className="w-full h-8 px-2.5 text-xs rounded-md border border-input bg-background text-foreground font-mono"
                    >
                      <option value="">-- Pilih Undangan Pasangan --</option>
                      {couples.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.groomName && c.brideName ? `${c.groomName} & ${c.brideName}` : c.title} (/{c.slug})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      placeholder="Masukkan slug undangan (misal: arya-siti)"
                      value={coupleSlug}
                      onChange={(e) => setCoupleSlug(e.target.value)}
                      className="text-xs h-8 font-mono"
                    />
                  )}
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Akun akan secara otomatis diarahkan ke dashboard undangan ini.
                  </p>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCreateOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading} size="sm" className="text-xs cursor-pointer">
                {loading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan Pengguna"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          {editingUser && (
            <form onSubmit={handleUpdateUser}>
              <DialogHeader>
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Pencil className="h-4 w-4 text-primary" />
                  <span>Edit Pengguna: {editingUser.name}</span>
                </DialogTitle>
                <DialogDescription className="text-xs">
                  Perbarui informasi akun, role akses, atau atur ulang password.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 py-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    Nama Lengkap<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    Alamat Email<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    Password Baru (Kosongkan jika tidak ingin mengubah)
                  </label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="text-xs h-8"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-foreground">
                    Peran / Role<span className="text-destructive ml-0.5">*</span>
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as UserRole)}
                    className="w-full h-8 px-2.5 text-xs rounded-md border border-input bg-background text-foreground"
                  >
                    <option value="couple">Pengantin (Couple)</option>
                    <option value="staff">Staff Operasional</option>
                    <option value="admin">Super Administrator</option>
                  </select>
                </div>

                {editRole === "couple" && (
                  <div className="space-y-1">
                    <label className="font-semibold text-foreground">
                      Undangan Terkait
                    </label>
                    {couples.length > 0 ? (
                      <select
                        value={editCoupleSlug}
                        onChange={(e) => setEditCoupleSlug(e.target.value)}
                        className="w-full h-8 px-2.5 text-xs rounded-md border border-input bg-background text-foreground font-mono"
                      >
                        <option value="">-- Pilih Undangan Pasangan --</option>
                        {couples.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.groomName && c.brideName ? `${c.groomName} & ${c.brideName}` : c.title} (/{c.slug})
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        placeholder="Masukkan slug undangan (misal: arya-siti)"
                        value={editCoupleSlug}
                        onChange={(e) => setEditCoupleSlug(e.target.value)}
                        className="text-xs h-8 font-mono"
                      />
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <div>
                    <p className="font-medium text-foreground">Status Akun Aktif</p>
                    <p className="text-muted-foreground text-[11px]">
                      Jika nonaktif, pengguna tidak dapat masuk ke sistem.
                    </p>
                  </div>
                  <Switch
                    checked={editIsActive}
                    onCheckedChange={setEditIsActive}
                  />
                </div>
              </div>

              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditOpen(false)}
                  className="text-xs cursor-pointer"
                >
                  Batal
                </Button>
                <Button type="submit" disabled={loading} size="sm" className="text-xs cursor-pointer">
                  {loading ? (
                    <>
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {/* Delete User Confirmation Modal */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              <span>Hapus Akun Pengguna</span>
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Apakah Anda yakin ingin menghapus akun pengguna{" "}
              <strong className="text-foreground font-semibold">"{deleteTarget?.name}"</strong> ({deleteTarget?.email})?
              <br />
              Tindakan ini tidak dapat dibatalkan dan seluruh data otentikasi akun ini akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel disabled={deleting} className="text-xs cursor-pointer">
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleting}
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              className="text-xs bg-destructive text-white hover:bg-destructive/90 font-semibold cursor-pointer shadow-xs"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Menghapus...
                </>
              ) : (
                "Hapus Pengguna"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
