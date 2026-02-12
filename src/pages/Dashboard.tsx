import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Copy, Trash2, LinkIcon, LogOut, Plus, QrCode, Download, Pencil, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { QRCodeCanvas } from "qrcode.react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { Tables } from "@/integrations/supabase/types";

const generateShortCode = () => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) result += chars.charAt(Math.floor(Math.random() * chars.length));
  return result;
};

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [links, setLinks] = useState<Tables<"links">[]>([]);
  const [url, setUrl] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const qrRef = useRef<HTMLCanvasElement>(null);
  const [editLink, setEditLink] = useState<Tables<"links"> | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [saving, setSaving] = useState(false);
  const [analyticsLink, setAnalyticsLink] = useState<Tables<"links"> | null>(null);
  const [chartData, setChartData] = useState<{ date: string; clicks: number }[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  const fetchLinks = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("links")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (data) setLinks(data);
  };

  useEffect(() => {
    if (user) fetchLinks();
  }, [user]);

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !url.trim()) return;
    setCreating(true);
    const short_code = customSlug.trim() || generateShortCode();
    if (customSlug.trim() && !/^[a-zA-Z0-9_-]{3,20}$/.test(customSlug.trim())) {
      toast({ title: "Slug tidak valid", description: "Gunakan 3-20 karakter (huruf, angka, - atau _)", variant: "destructive" });
      setCreating(false);
      return;
    }
    const { error } = await supabase.from("links").insert({
      user_id: user.id,
      original_url: url.trim().startsWith("http") ? url.trim() : `https://${url.trim()}`,
      short_code,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Gagal membuat link", description: error.message, variant: "destructive" });
    } else {
      setUrl("");
      setCustomSlug("");
      fetchLinks();
      toast({ title: "Link berhasil dibuat!" });
    }
  };

  const deleteLink = async (id: string) => {
    await supabase.from("links").delete().eq("id", id);
    fetchLinks();
  };

  const copyLink = (shortCode: string) => {
    const shortUrl = `${window.location.origin}/s/${shortCode}`;
    navigator.clipboard.writeText(shortUrl);
    toast({ title: "Tersalin!", description: shortUrl });
  };

  const openEdit = (link: Tables<"links">) => {
    setEditLink(link);
    setEditUrl(link.original_url);
    setEditSlug(link.short_code);
  };

  const saveEdit = async () => {
    if (!editLink) return;
    if (!/^[a-zA-Z0-9_-]{3,20}$/.test(editSlug.trim())) {
      toast({ title: "Slug tidak valid", description: "Gunakan 3-20 karakter (huruf, angka, - atau _)", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("links")
      .update({
        original_url: editUrl.trim().startsWith("http") ? editUrl.trim() : `https://${editUrl.trim()}`,
        short_code: editSlug.trim(),
      })
      .eq("id", editLink.id);
    setSaving(false);
    if (error) {
      toast({ title: "Gagal menyimpan", description: error.message, variant: "destructive" });
    } else {
      setEditLink(null);
      fetchLinks();
      toast({ title: "Link berhasil diperbarui!" });
    }
  };

  const openAnalytics = async (link: Tables<"links">) => {
    setAnalyticsLink(link);
    setLoadingChart(true);
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from("click_logs")
      .select("clicked_at")
      .eq("link_id", link.id)
      .gte("clicked_at", sevenDaysAgo.toISOString());

    // Build last 7 days
    const days: { date: string; clicks: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ date: d.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }), clicks: 0 });
    }

    if (data) {
      data.forEach((row) => {
        const clickDate = new Date(row.clicked_at);
        const label = clickDate.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
        const found = days.find((d) => d.date === label);
        if (found) found.clicks++;
      });
    }

    setChartData(days);
    setLoadingChart(false);
  };

  if (authLoading) return <div className="flex min-h-screen items-center justify-center">Memuat...</div>;
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2 font-bold text-lg">
            <LinkIcon className="h-5 w-5" />
            Shortly
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">{user.email}</span>
            <Button variant="ghost" size="icon" onClick={signOut}><LogOut className="h-4 w-4" /></Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 space-y-8">
        <form onSubmit={createLink} className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Masukkan URL panjang..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="flex-1"
            />
            <Button type="submit" disabled={creating}>
              <Plus className="h-4 w-4 mr-1" />
              {creating ? "..." : "Pendekkan"}
            </Button>
          </div>
          <Input
            placeholder="Custom slug (opsional, contoh: promo-ku)"
            value={customSlug}
            onChange={(e) => setCustomSlug(e.target.value)}
            className="max-w-xs"
          />
        </form>

        {links.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Belum ada link. Buat link pertamamu di atas!</p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short Link</TableHead>
                  <TableHead className="hidden sm:table-cell">URL Asli</TableHead>
                  <TableHead className="text-center">Klik</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {links.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-mono text-sm">/s/{link.short_code}</TableCell>
                    <TableCell className="hidden sm:table-cell max-w-[200px] truncate text-muted-foreground text-sm">
                      {link.original_url}
                    </TableCell>
                    <TableCell className="text-center">{link.click_count}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="ghost" size="icon" onClick={() => copyLink(link.short_code)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(link)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openAnalytics(link)}>
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setQrCode(link.short_code)}>
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteLink(link.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>

      {/* QR Code Dialog */}
      <Dialog open={!!qrCode} onOpenChange={() => setQrCode(null)}>
        <DialogContent className="max-w-xs">
          <DialogHeader>
            <DialogTitle>QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3 py-4">
            {qrCode && (
              <QRCodeCanvas
                ref={qrRef}
                value={`${window.location.origin}/s/${qrCode}`}
                size={200}
                level="M"
              />
            )}
            <p className="text-sm text-muted-foreground break-all text-center">
              {window.location.origin}/s/{qrCode}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const canvas = qrRef.current;
                if (!canvas) return;
                const a = document.createElement("a");
                a.download = `qr-${qrCode}.png`;
                a.href = canvas.toDataURL("image/png");
                a.click();
              }}
            >
              <Download className="h-4 w-4 mr-1" />
              Download PNG
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Link Dialog */}
      <Dialog open={!!editLink} onOpenChange={() => setEditLink(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Edit Link</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1">
              <label className="text-sm font-medium">URL Asli</label>
              <Input value={editUrl} onChange={(e) => setEditUrl(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Short Code</label>
              <Input value={editSlug} onChange={(e) => setEditSlug(e.target.value)} />
            </div>
            <Button onClick={saveEdit} disabled={saving} className="w-full">
              {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={!!analyticsLink} onOpenChange={() => setAnalyticsLink(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Klik 7 Hari Terakhir — /s/{analyticsLink?.short_code}</DialogTitle>
          </DialogHeader>
          {loadingChart ? (
            <p className="text-center py-8 text-muted-foreground">Memuat...</p>
          ) : (
            <div className="h-52 py-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="clicks" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
