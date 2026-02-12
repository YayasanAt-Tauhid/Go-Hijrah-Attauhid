import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import dakwahPoster from "@/assets/dakwah-poster.png";

const COUNTDOWN_SECONDS = 5;

const Redirect = () => {
  const { code } = useParams<{ code: string }>();
  const [error, setError] = useState(false);
  const [targetUrl, setTargetUrl] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);

  // Fetch link data
  useEffect(() => {
    const doFetch = async () => {
      if (!code) { setError(true); return; }

      const { data, error: fetchError } = await supabase
        .from("links")
        .select("id, original_url")
        .eq("short_code", code)
        .maybeSingle();

      if (fetchError || !data) { setError(true); return; }

      await supabase.rpc("increment_click_count" as any, { link_id: data.id });
      setTargetUrl(data.original_url);
    };
    doFetch();
  }, [code]);

  // Countdown & redirect
  useEffect(() => {
    if (!targetUrl) return;
    if (countdown <= 0) {
      window.location.href = targetUrl;
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [targetUrl, countdown]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Link tidak ditemukan</h1>
          <p className="text-muted-foreground">Link yang kamu cari tidak ada atau sudah dihapus.</p>
        </div>
      </div>
    );
  }

  if (!targetUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4">
      {/* Poster Dakwah */}
      <div className="w-full max-w-sm overflow-hidden rounded-xl border shadow-lg">
        <img
          src={dakwahPoster}
          alt="Poster Dakwah - Sudahkah kamu sholat hari ini?"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* Countdown */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Kamu akan dialihkan dalam
        </p>
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border-2 border-primary">
          <span className="text-xl font-bold text-primary">{countdown}</span>
        </div>
        <p className="text-xs text-muted-foreground">detik</p>
        <button
          onClick={() => { window.location.href = targetUrl; }}
          className="mt-2 text-sm text-primary underline underline-offset-4 hover:opacity-80"
        >
          Lewati &rarr;
        </button>
      </div>
    </div>
  );
};

export default Redirect;
