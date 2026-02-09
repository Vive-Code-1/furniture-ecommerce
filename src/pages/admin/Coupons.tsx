import { useEffect, useState } from "react";
import { Tag, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number;
  max_uses: number | null;
  used_count: number;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
}

const emptyCoupon = {
  code: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_amount: 0,
  max_uses: "",
  expires_at: "",
};

const Coupons = () => {
  const { toast } = useToast();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setCoupons(data as Coupon[]);
    setLoading(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyCoupon);
    setDialogOpen(true);
  };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
      min_order_amount: c.min_order_amount,
      max_uses: c.max_uses?.toString() ?? "",
      expires_at: c.expires_at ? c.expires_at.slice(0, 16) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.code.trim()) {
      toast({ title: "Error", description: "Coupon code is required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    const payload = {
      code: form.code.trim().toUpperCase(),
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      min_order_amount: Number(form.min_order_amount),
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      expires_at: form.expires_at || null,
    };

    let error;
    if (editingId) {
      ({ error } = await supabase.from("coupons").update(payload).eq("id", editingId));
    } else {
      ({ error } = await supabase.from("coupons").insert(payload));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: editingId ? "Coupon Updated" : "Coupon Created" });
      setDialogOpen(false);
      fetchCoupons();
    }
    setSaving(false);
  };

  const toggleActive = async (c: Coupon) => {
    await supabase.from("coupons").update({ is_active: !c.is_active }).eq("id", c.id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("Delete this coupon?")) return;
    await supabase.from("coupons").delete().eq("id", id);
    fetchCoupons();
    toast({ title: "Coupon Deleted" });
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Coupons</h1>
          <p className="text-sm text-muted-foreground">Manage discount codes and promotions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreate} className="rounded-full gap-2">
              <Plus className="w-4 h-4" /> Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Coupon Code</label>
                <Input
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))}
                  className="rounded-xl bg-secondary border-border uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Discount Type</label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm((p) => ({ ...p, discount_type: v }))}>
                    <SelectTrigger className="rounded-xl bg-secondary border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Value</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder={form.discount_type === "percentage" ? "10" : "5.00"}
                    value={form.discount_value || ""}
                    onChange={(e) => setForm((p) => ({ ...p, discount_value: Number(e.target.value) }))}
                    className="rounded-xl bg-secondary border-border"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Min Order ($)</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.min_order_amount || ""}
                    onChange={(e) => setForm((p) => ({ ...p, min_order_amount: Number(e.target.value) }))}
                    className="rounded-xl bg-secondary border-border"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Max Uses</label>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Unlimited"
                    value={form.max_uses}
                    onChange={(e) => setForm((p) => ({ ...p, max_uses: e.target.value }))}
                    className="rounded-xl bg-secondary border-border"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Expires At</label>
                <Input
                  type="datetime-local"
                  value={form.expires_at}
                  onChange={(e) => setForm((p) => ({ ...p, expires_at: e.target.value }))}
                  className="rounded-xl bg-secondary border-border"
                />
              </div>
              <Button onClick={handleSave} disabled={saving} className="w-full rounded-full">
                {saving ? "Saving..." : editingId ? "Update Coupon" : "Create Coupon"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading coupons...</p>
      ) : coupons.length === 0 ? (
        <div className="text-center py-12">
          <Tag className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No coupons yet. Create your first one!</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead className="hidden sm:table-cell">Min Order</TableHead>
                <TableHead className="hidden sm:table-cell">Usage</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden md:table-cell">Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono font-semibold">{c.code}</TableCell>
                  <TableCell>
                    {c.discount_type === "percentage"
                      ? `${c.discount_value}%`
                      : `$${c.discount_value}`}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    ${c.min_order_amount}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {c.used_count}{c.max_uses ? `/${c.max_uses}` : " / ∞"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={c.is_active ? "default" : "secondary"}>
                      {c.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                    {c.expires_at
                      ? new Date(c.expires_at).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => toggleActive(c)} title={c.is_active ? "Deactivate" : "Activate"}>
                        {c.is_active ? <ToggleRight className="w-4 h-4 text-green-500" /> : <ToggleLeft className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteCoupon(c.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default Coupons;
