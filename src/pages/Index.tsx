import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { LinkIcon, ArrowRight } from "lucide-react";

const Index = () => {
  const [url, setUrl] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleTry = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/register");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-bold text-lg">
            <LinkIcon className="h-5 w-5" />
            Shortly
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button asChild size="sm">
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Masuk</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/register">Daftar</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4">
        <section className="py-24 text-center space-y-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Pendekkan link, <br />bagikan lebih mudah.
          </h1>
          <p className="mx-auto max-w-md text-lg text-muted-foreground">
            Buat short link gratis untuk setiap URL panjang. Lacak jumlah klik dan kelola semua link kamu dari satu dashboard.
          </p>
          <form onSubmit={handleTry} className="mx-auto flex max-w-lg gap-2">
            <Input
              placeholder="Tempel URL panjang kamu di sini..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              Pendekkan <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>
        </section>

        <section className="grid gap-8 pb-24 sm:grid-cols-3">
          {[
            { title: "Gratis", desc: "Buat short link tanpa batas, tanpa biaya." },
            { title: "Cepat", desc: "Redirect instan dengan performa tinggi." },
            { title: "Aman", desc: "Setiap user punya dashboard pribadi sendiri." },
          ].map((item) => (
            <div key={item.title} className="rounded-lg border p-6 text-center space-y-2">
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
};

export default Index;
