import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Star, Search, MessageSquare, Upload, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface Review {
  id: string;
  reviewer_name: string;
  reviewer_avatar: string | null;
  rating: number;
  review_text: string;
  product_id: string | null;
  is_featured: boolean;
  created_at: string;
}

const emptyReview = {
  reviewer_name: "",
  rating: 5,
  review_text: "",
  is_featured: false,
  reviewer_avatar: "" as string | null,
};

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingReview, setEditingReview] = useState<typeof emptyReview & { id?: string }>(emptyReview);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [avatarMode, setAvatarMode] = useState<"upload" | "url">("upload");
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setReviews(data);
    setLoading(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file.", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `reviewer-${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(`avatars/${fileName}`, file);

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(`avatars/${fileName}`);
    setEditingReview((p) => ({ ...p, reviewer_avatar: urlData.publicUrl }));
    setUploading(false);
    toast({ title: "Uploaded!", description: "Avatar image uploaded." });
  };

  const handleSave = async () => {
    if (!editingReview.reviewer_name.trim() || !editingReview.review_text.trim()) {
      toast({ title: "Error", description: "Name and review text are required.", variant: "destructive" });
      return;
    }

    setSaving(true);
    const payload = {
      reviewer_name: editingReview.reviewer_name.trim(),
      rating: editingReview.rating,
      review_text: editingReview.review_text.trim(),
      is_featured: editingReview.is_featured,
      reviewer_avatar: editingReview.reviewer_avatar || null,
    };

    if (editingReview.id) {
      const { error } = await supabase.from("reviews").update(payload).eq("id", editingReview.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Updated!", description: "Review updated successfully." });
    } else {
      const { error } = await supabase.from("reviews").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Created!", description: "Review added successfully." });
    }

    setSaving(false);
    setDialogOpen(false);
    setEditingReview(emptyReview);
    fetchReviews();
  };

  const handleDelete = async () => {
    if (deleteIds.length === 0) return;
    const { error } = await supabase.from("reviews").delete().in("id", deleteIds);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Deleted!", description: `${deleteIds.length} review(s) removed.` });
    setDeleteIds([]);
    setSelected(new Set());
    fetchReviews();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((r) => r.id)));
  };

  const openEdit = (review: Review) => {
    setEditingReview({
      id: review.id,
      reviewer_name: review.reviewer_name,
      rating: review.rating,
      review_text: review.review_text,
      is_featured: review.is_featured,
      reviewer_avatar: review.reviewer_avatar,
    });
    setAvatarMode(review.reviewer_avatar ? "url" : "upload");
    setDialogOpen(true);
  };

  const filtered = reviews.filter((r) =>
    r.reviewer_name.toLowerCase().includes(search.toLowerCase()) ||
    r.review_text.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Reviews</h1>
          <p className="text-sm text-muted-foreground">{reviews.length} total reviews</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingReview(emptyReview); setAvatarMode("upload"); } }}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              Add Review
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingReview.id ? "Edit Review" : "Add Review"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Reviewer Name *</Label>
                <Input value={editingReview.reviewer_name} onChange={(e) => setEditingReview((p) => ({ ...p, reviewer_name: e.target.value }))} />
              </div>

              {/* Avatar upload section */}
              <div className="space-y-2">
                <Label>Reviewer Photo</Label>
                <div className="flex gap-2 mb-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={avatarMode === "upload" ? "default" : "outline"}
                    className="rounded-full gap-1 text-xs"
                    onClick={() => setAvatarMode("upload")}
                  >
                    <Upload className="w-3 h-3" /> Upload
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={avatarMode === "url" ? "default" : "outline"}
                    className="rounded-full gap-1 text-xs"
                    onClick={() => setAvatarMode("url")}
                  >
                    <Link className="w-3 h-3" /> URL
                  </Button>
                </div>

                {avatarMode === "upload" ? (
                  <div className="flex items-center gap-3">
                    {editingReview.reviewer_avatar && (
                      <img src={editingReview.reviewer_avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                    )}
                    <label className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-border rounded-xl p-3 cursor-pointer hover:border-primary/50 transition-colors">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {uploading ? "Uploading..." : "Choose image"}
                      </span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    {editingReview.reviewer_avatar && (
                      <img src={editingReview.reviewer_avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover border-2 border-border" />
                    )}
                    <Input
                      placeholder="https://example.com/photo.jpg"
                      value={editingReview.reviewer_avatar || ""}
                      onChange={(e) => setEditingReview((p) => ({ ...p, reviewer_avatar: e.target.value }))}
                      className="flex-1"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Rating (1-5)</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setEditingReview((p) => ({ ...p, rating: s }))}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${s <= editingReview.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Review Text *</Label>
                <Textarea value={editingReview.review_text} onChange={(e) => setEditingReview((p) => ({ ...p, review_text: e.target.value }))} rows={3} />
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={editingReview.is_featured} onCheckedChange={(checked) => setEditingReview((p) => ({ ...p, is_featured: checked }))} />
                <Label>Featured on homepage</Label>
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full rounded-full">
                {saving ? "Saving..." : editingReview.id ? "Update Review" : "Add Review"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 bg-destructive/10 border border-destructive/20 rounded-xl p-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <Button size="sm" variant="destructive" className="rounded-full gap-1" onClick={() => setDeleteIds(Array.from(selected))}>
            <Trash2 className="w-3 h-3" />
            Delete Selected
          </Button>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search reviews..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-full bg-card" />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews found</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border bg-secondary/30">
                  <th className="px-4 py-4">
                    <Checkbox checked={selected.size === filtered.length && filtered.length > 0} onCheckedChange={toggleAll} />
                  </th>
                  <th className="px-4 py-4 font-medium">Reviewer</th>
                  <th className="px-4 py-4 font-medium">Rating</th>
                  <th className="px-4 py-4 font-medium hidden md:table-cell">Review</th>
                  <th className="px-4 py-4 font-medium">Featured</th>
                  <th className="px-4 py-4 font-medium hidden md:table-cell">Date</th>
                  <th className="px-4 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((review) => (
                  <tr key={review.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4">
                      <Checkbox checked={selected.has(review.id)} onCheckedChange={() => toggleSelect(review.id)} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {review.reviewer_avatar ? (
                          <img src={review.reviewer_avatar} alt={review.reviewer_name} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary">{review.reviewer_name.charAt(0)}</span>
                          </div>
                        )}
                        <span className="font-medium">{review.reviewer_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, s) => (
                          <Star key={s} className={`w-3 h-3 ${s < review.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell max-w-xs truncate text-muted-foreground">{review.review_text}</td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary" className={`rounded-full text-xs ${review.is_featured ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-secondary text-muted-foreground"}`}>
                        {review.is_featured ? "Featured" : "Hidden"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-muted-foreground">
                      {format(new Date(review.created_at), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(review)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteIds([review.id])} className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AlertDialog open={deleteIds.length > 0} onOpenChange={(open) => !open && setDeleteIds([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteIds.length} Review(s)?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminReviews;
