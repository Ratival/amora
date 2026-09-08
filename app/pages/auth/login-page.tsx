import * as React from "react";
import { Link, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Heart,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { useAuth } from "~/contexts/auth-context";
import { loginSchema, type LoginFormData } from "~/lib/schemas";
import { toast } from "sonner";

export function LoginPage() {
  const { login, currentUser, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(false);

  // If already authenticated, redirect to appropriate dashboard
  React.useEffect(() => {
    if (!isLoading && currentUser) {
      if (currentUser.role === "admin") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate(`/${currentUser.coupleSlug || "template"}/dashboard`, {
          replace: true,
        });
      }
    }
  }, [currentUser, isLoading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      if (result.success) {
        toast.success("Login berhasil!", {
          description: `Dialihkan ke ${result.redirectUrl}`,
        });
      } else {
        toast.error("Gagal Masuk", {
          description: result.message || "Email atau password salah",
        });
      }
    } catch (err: any) {
      toast.error("Gagal Masuk", {
        description: err.message || "Terjadi kesalahan server",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-muted/30 relative overflow-hidden">
      {/* Background soft glow circles */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-2">
            <Heart className="h-6 w-6 fill-current" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Amora
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Silahkan masukkan akun anda
          </p>
        </div>

        {/* Login Card */}
        <Card className="border-border/80 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-semibold">Masuk Akun</CardTitle>
            <CardDescription className="text-xs">
              Masukkan email dan kata sandi Anda untuk mengakses dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Email<span className="text-destructive ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="nama@email.com"
                    {...register("email")}
                    className={`pl-9 text-xs ${errors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    autoComplete="email"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit(onSubmit)();
                      }
                    }}
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-destructive flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Password<span className="text-destructive ml-0.5">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={`pl-9 text-xs ${errors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
                    autoComplete="current-password"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit(onSubmit)();
                      }
                    }}
                  />
                </div>
                {errors.password && (
                  <p className="text-[11px] text-destructive flex items-center gap-1.5 mt-1 font-medium">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-9 text-xs font-semibold cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    Masuk ke Dashboard
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            to="/"
            className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            ← Kembali ke Halaman Depan
          </Link>
        </div>
      </div>
    </div>
  );
}
