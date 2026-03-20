import { useEffect, useState } from "react";
import { FileText, Save, Check } from "lucide-react";
import { getPages, updatePage } from "../api";

interface PageContent {
  _id: string;
  slug: string;
  title: string;
  content: string;
  updatedAt?: string;
}

const SLUG_LABELS: Record<string, string> = {
  help_support: "Help & Support",
  privacy_policy: "Privacy Policy",
  terms_of_service: "Terms of Service",
};

const SLUG_TO_URL: Record<string, string> = {
  help_support: "help-support",
  privacy_policy: "privacy-policy",
  terms_of_service: "terms-of-service",
};

export function Pages() {
  const [pages, setPages] = useState<PageContent[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({ title: "", content: "" });

  const fetchPages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPages();
      const data = Array.isArray(res) ? res : [];
      setPages(data);
      if (data.length > 0 && !selectedSlug) {
        setSelectedSlug(data[0].slug);
        setFormData({ title: data[0].title || "", content: data[0].content || "" });
      }
    } catch {
      setError("Failed to fetch pages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPages(); }, []);

  const selectPage = (slug: string) => {
    setSelectedSlug(slug);
    setSaved(false);
    const page = pages.find((p) => p.slug === slug);
    setFormData({ title: page?.title || SLUG_LABELS[slug] || slug, content: page?.content || "" });
  };

  const handleSave = async () => {
    if (!selectedSlug) return;
    setSaving(true);
    setError(null);
    try {
      const urlSlug = SLUG_TO_URL[selectedSlug] || selectedSlug;
      await updatePage(urlSlug, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      fetchPages();
    } catch {
      setError("Failed to save page");
    } finally {
      setSaving(false);
    }
  };

  const selectedPage = pages.find((p) => p.slug === selectedSlug);

  // Ensure all 3 page slugs are shown even if not yet in DB
  const allSlugs = ["help_support", "privacy_policy", "terms_of_service"];
  const displaySlugs = allSlugs.map((slug) => {
    const existing = pages.find((p) => p.slug === slug);
    return { slug, title: existing?.title || SLUG_LABELS[slug] || slug, exists: !!existing };
  });

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-72 border-r border-[#e1e1e7] bg-white flex flex-col">
        <div className="border-b border-[#e1e1e7] p-6">
          <h1 className="text-2xl font-bold text-[#090838]">Pages</h1>
          <p className="mt-1 text-sm text-[#6b6b88]">Manage static page content</p>
        </div>

        {error && (
          <div className="mx-4 mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
        )}

        <div className="flex-1 overflow-auto py-2">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-[#6b6b88]">Loading...</div>
          ) : (
            displaySlugs.map((item) => (
              <button
                key={item.slug}
                onClick={() => selectPage(item.slug)}
                className={`flex w-full items-center gap-3 px-6 py-3 text-left text-sm transition-colors ${
                  selectedSlug === item.slug
                    ? "bg-blue-50 text-[#0048ff] font-medium"
                    : "text-[#090838] hover:bg-[#f5f6fa]"
                }`}
              >
                <FileText className="size-4 shrink-0" />
                <span>{item.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedSlug ? (
          <>
            <div className="flex items-center justify-between border-b border-[#e1e1e7] p-6">
              <div>
                <h2 className="text-lg font-semibold text-[#090838]">{formData.title}</h2>
                {selectedPage?.updatedAt && (
                  <p className="mt-1 text-xs text-[#6b6b88]">Last updated: {new Date(selectedPage.updatedAt).toLocaleString()}</p>
                )}
              </div>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm text-white transition-colors ${
                  saved ? "bg-green-600" : "bg-[#0048ff] hover:bg-[#0038cc]"
                } disabled:opacity-60`}
              >
                {saved ? <Check className="size-4" /> : <Save className="size-4" />}
                {saving ? "Saving..." : saved ? "Saved!" : "Save"}
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Page Title</label>
                <input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#090838] mb-1">Content</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={20}
                  className="w-full rounded-lg border border-[#e1e1e7] px-3 py-2 text-sm focus:border-[#0048ff] focus:outline-none leading-relaxed"
                  placeholder="Enter page content here..."
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-[#6b6b88]">
            <div className="text-center">
              <FileText className="mx-auto size-12 mb-3 opacity-40" />
              <p>Select a page to edit</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
