import { useEffect, useState, useRef } from "react";
import { Plus, Pencil, Trash2, Search, Package, Upload, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  stock_quantity: number;
  thumbnail_url: string | null;
  is_active: boolean;
  created_at: string;
}

const emptyProduct = {
  name: "",
  description: "",
  category: "",
  price: 0,
  stock_quantity: 0,
  thumbnail_url: "",
  is_active: true,
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editingProduct, setEditingProduct] = useState<typeof emptyProduct & { id?: string }>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setProducts(data);
    setLoading(false);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, file, { contentType: file.type });

    if (error) {
      toast({ title: "Upload Error", description: error.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    setEditingProduct((p) => ({ ...p, thumbnail_url: urlData.publicUrl }));
    setUploading(false);
    toast({ title: "Uploaded!", description: "Image uploaded successfully." });
  };

  const handleSave = async () => {
    if (!editingProduct.name.trim() || !editingProduct.category.trim()) {
      toast({ title: "Error", description: "Name and category are required.", variant: "destructive" });
      return;
    }

    setSaving(true);

    const payload = {
      name: editingProduct.name.trim(),
      description: editingProduct.description?.trim() || null,
      category: editingProduct.category.trim(),
      price: editingProduct.price,
      stock_quantity: editingProduct.stock_quantity,
      thumbnail_url: editingProduct.thumbnail_url?.trim() || null,
      is_active: editingProduct.is_active,
    };

    if (editingProduct.id) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingProduct.id);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Updated!", description: "Product updated successfully." });
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
      else toast({ title: "Created!", description: "Product added successfully." });
    }

    setSaving(false);
    setDialogOpen(false);
    setEditingProduct(emptyProduct);
    fetchProducts();
  };

  const handleDelete = async () => {
    if (deleteIds.length === 0) return;
    const { error } = await supabase.from("products").delete().in("id", deleteIds);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Deleted!", description: `${deleteIds.length} product(s) removed.` });
    setDeleteIds([]);
    setSelected(new Set());
    fetchProducts();
  };

  const openEdit = (product: Product) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description || "",
      category: product.category,
      price: Number(product.price),
      stock_quantity: product.stock_quantity,
      thumbnail_url: product.thumbnail_url || "",
      is_active: product.is_active,
    });
    setDialogOpen(true);
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
    else setSelected(new Set(filtered.map((p) => p.id)));
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{products.length} total products</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) { setEditingProduct(emptyProduct); setImageMode("upload"); }
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct.id ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input value={editingProduct.name} onChange={(e) => setEditingProduct((p) => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>Category *</Label>
                <Input value={editingProduct.category} onChange={(e) => setEditingProduct((p) => ({ ...p, category: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price ($)</Label>
                  <Input type="number" min={0} step="0.01" value={editingProduct.price} onChange={(e) => setEditingProduct((p) => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
                </div>
                <div className="space-y-2">
                  <Label>Stock</Label>
                  <Input type="number" min={0} value={editingProduct.stock_quantity} onChange={(e) => setEditingProduct((p) => ({ ...p, stock_quantity: parseInt(e.target.value) || 0 }))} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={editingProduct.description || ""} onChange={(e) => setEditingProduct((p) => ({ ...p, description: e.target.value }))} />
              </div>

              {/* Image upload section */}
              <div className="space-y-3">
                <Label>Product Image</Label>
                <Tabs value={imageMode} onValueChange={(v) => setImageMode(v as "upload" | "url")}>
                  <TabsList className="w-full">
                    <TabsTrigger value="upload" className="flex-1 gap-1"><Upload className="w-3 h-3" />Upload</TabsTrigger>
                    <TabsTrigger value="url" className="flex-1 gap-1"><LinkIcon className="w-3 h-3" />URL</TabsTrigger>
                  </TabsList>
                </Tabs>

                {imageMode === "upload" ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full rounded-xl h-20 border-dashed"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Uploading..." : "Click to upload image"}
                    </Button>
                  </div>
                ) : (
                  <Input
                    value={editingProduct.thumbnail_url || ""}
                    onChange={(e) => setEditingProduct((p) => ({ ...p, thumbnail_url: e.target.value }))}
                    placeholder="https://..."
                  />
                )}

                {editingProduct.thumbnail_url && (
                  <div className="relative">
                    <img src={editingProduct.thumbnail_url} alt="Preview" className="w-full h-32 object-cover rounded-xl border border-border" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full"
                      onClick={() => setEditingProduct((p) => ({ ...p, thumbnail_url: "" }))}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )}
              </div>

              <Button onClick={handleSave} disabled={saving} className="w-full rounded-full">
                {saving ? "Saving..." : editingProduct.id ? "Update Product" : "Add Product"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Bulk Action Bar */}
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
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-full bg-card"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-card rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No products found</p>
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
                  <th className="px-4 py-4 font-medium">Product</th>
                  <th className="px-4 py-4 font-medium">Category</th>
                  <th className="px-4 py-4 font-medium">Price</th>
                  <th className="px-4 py-4 font-medium">Stock</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4">
                      <Checkbox checked={selected.has(product.id)} onCheckedChange={() => toggleSelect(product.id)} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {product.thumbnail_url ? (
                          <img src={product.thumbnail_url} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-secondary" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                            <Package className="w-4 h-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{product.category}</td>
                    <td className="px-4 py-4 font-semibold">${Number(product.price).toFixed(2)}</td>
                    <td className="px-4 py-4">{product.stock_quantity}</td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary" className={`rounded-full text-xs ${product.is_active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                        {product.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(product)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteIds([product.id])} className="text-destructive hover:text-destructive">
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

      {/* Delete Dialog */}
      <AlertDialog open={deleteIds.length > 0} onOpenChange={(open) => !open && setDeleteIds([])}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteIds.length} Product(s)?</AlertDialogTitle>
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

export default AdminProducts;
