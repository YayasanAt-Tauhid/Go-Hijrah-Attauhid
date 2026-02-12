import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LinkIcon } from "lucide-react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Registrasi gagal", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Berhasil!", description: "Cek email kamu untuk verifikasi akun." });
      navigate("/login");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 text-foreground">
            <LinkIcon className="h-6 w-6" />
            <span className="text-xl font-bold">Shortly</span>
          </Link>
          <h1 className="text-2xl font-semibold">Buat akun baru</h1>
          <p className="text-sm text-muted-foreground">Daftar untuk mulai memendekkan link</p>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="nama@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="Min. 6 karakter" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Memproses..." : "Daftar"}
          </Button>
        </form>
        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary underline underline-offset-4 hover:text-primary/80">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
