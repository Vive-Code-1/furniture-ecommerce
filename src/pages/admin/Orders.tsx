import { useEffect, useState } from "react";
import { Search, ShoppingCart, Trash2, FileText, RotateCcw, Archive } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { generateInvoiceHTML, openInvoice } from "@/lib/invoice";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  order_date: string;
  total_amount: number;
  status: string;
  shipping_address: string | null;
  is_trashed: boolean;
}

const statuses = ["pending", "processing", "shipped", "delivered", "returned", "canceled"];

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  returned: "bg-orange-100 text-orange-700",
  canceled: "bg-red-100 text-red-700",
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"active" | "trash">("active");
  const [bulkStatusValue, setBulkStatusValue] = useState("");
  const [confirmTrash, setConfirmTrash] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("order_date", { ascending: false });

    if (!error && data) setOrders(data);
    setLoading(false);
  };

  const updateStatus = async (orderId: string, newStatus: string) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", orderId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated!", description: `Order status changed to ${newStatus}.` });
      fetchOrders();
    }
  };

  const bulkUpdateStatus = async () => {
    if (!bulkStatusValue || selected.size === 0) return;
    const { error } = await supabase
      .from("orders")
      .update({ status: bulkStatusValue })
      .in("id", Array.from(selected));

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Updated!", description: `${selected.size} orders updated to ${bulkStatusValue}.` });
    setSelected(new Set());
    setBulkStatusValue("");
    fetchOrders();
  };

  const trashOrders = async () => {
    const ids = Array.from(selected);
    const { error } = await supabase
      .from("orders")
      .update({ is_trashed: true })
      .in("id", ids);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Trashed!", description: `${ids.length} order(s) moved to trash.` });
    setSelected(new Set());
    setConfirmTrash(false);
    fetchOrders();
  };

  const restoreOrders = async (ids: string[]) => {
    const { error } = await supabase
      .from("orders")
      .update({ is_trashed: false })
      .in("id", ids);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Restored!", description: `${ids.length} order(s) restored.` });
    setSelected(new Set());
    fetchOrders();
  };

  const permanentDelete = async (ids: string[]) => {
    const { error } = await supabase
      .from("orders")
      .delete()
      .in("id", ids);

    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Deleted!", description: `${ids.length} order(s) permanently deleted.` });
    setSelected(new Set());
    fetchOrders();
  };

  const generateInvoice = async (order: Order) => {
    const { data: items } = await supabase
      .from("order_items")
      .select("product_name, quantity, unit_price")
      .eq("order_id", order.id);

    const html = generateInvoiceHTML(order, items || []);
    openInvoice(html);
  };

  const bulkGenerateInvoices = async () => {
    const selectedOrders = orders.filter((o) => selected.has(o.id));
    for (const order of selectedOrders) {
      await generateInvoice(order);
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const activeOrders = orders.filter((o) => !o.is_trashed);
  const trashedOrders = orders.filter((o) => o.is_trashed);
  const currentOrders = tab === "active" ? activeOrders : trashedOrders;

  const filtered = currentOrders.filter((o) => {
    const matchesSearch =
      o.order_number.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filterStatus === "all" || o.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((o) => o.id)));
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold">Orders</h1>
          <p className="text-sm text-muted-foreground">{activeOrders.length} active orders</p>
        </div>
        <Tabs value={tab} onValueChange={(v) => { setTab(v as "active" | "trash"); setSelected(new Set()); }}>
          <TabsList>
            <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
            <TabsTrigger value="trash" className="gap-1">
              <Archive className="w-3 h-3" />
              Trash ({trashedOrders.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Bulk Action Bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 bg-primary/5 border border-primary/10 rounded-xl p-3">
          <span className="text-sm font-medium">{selected.size} selected</span>
          {tab === "active" && (
            <>
              <Select value={bulkStatusValue} onValueChange={setBulkStatusValue}>
                <SelectTrigger className="w-[140px] h-8 text-xs rounded-full">
                  <SelectValue placeholder="Change status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {bulkStatusValue && (
                <Button size="sm" className="rounded-full text-xs" onClick={bulkUpdateStatus}>
                  Apply Status
                </Button>
              )}
              <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs" onClick={bulkGenerateInvoices}>
                <FileText className="w-3 h-3" />
                Generate Invoices
              </Button>
              <Button size="sm" variant="destructive" className="rounded-full gap-1 text-xs" onClick={() => setConfirmTrash(true)}>
                <Trash2 className="w-3 h-3" />
                Trash
              </Button>
            </>
          )}
          {tab === "trash" && (
            <>
              <Button size="sm" variant="outline" className="rounded-full gap-1 text-xs" onClick={() => restoreOrders(Array.from(selected))}>
                <RotateCcw className="w-3 h-3" />
                Restore
              </Button>
              <Button size="sm" variant="destructive" className="rounded-full gap-1 text-xs" onClick={() => permanentDelete(Array.from(selected))}>
                <Trash2 className="w-3 h-3" />
                Delete Permanently
              </Button>
            </>
          )}
          <Button size="sm" variant="ghost" className="rounded-full text-xs" onClick={() => setSelected(new Set())}>
            Clear
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 rounded-full bg-card"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px] rounded-full bg-card">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {statuses.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
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
          <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{tab === "trash" ? "Trash is empty" : "No orders found"}</p>
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
                  <th className="px-4 py-4 font-medium">Order ID</th>
                  <th className="px-4 py-4 font-medium">Customer</th>
                  <th className="px-4 py-4 font-medium hidden md:table-cell">Date</th>
                  <th className="px-4 py-4 font-medium">Amount</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4">
                      <Checkbox checked={selected.has(order.id)} onCheckedChange={() => toggleSelect(order.id)} />
                    </td>
                    <td className="px-4 py-4 font-mono text-xs">{order.order_number}</td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        {order.customer_email && (
                          <p className="text-xs text-muted-foreground">{order.customer_email}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell text-muted-foreground">
                      {format(new Date(order.order_date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-4 py-4 font-semibold">${Number(order.total_amount).toFixed(2)}</td>
                    <td className="px-4 py-4">
                      <Badge variant="secondary" className={`text-xs capitalize rounded-full px-2.5 ${statusColors[order.status] || ""}`}>
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {tab === "active" ? (
                          <>
                            <Select value={order.status} onValueChange={(val) => updateStatus(order.id, val)}>
                              <SelectTrigger className="w-[110px] h-8 text-xs rounded-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statuses.map((s) => (
                                  <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="icon" onClick={() => generateInvoice(order)} title="Generate Invoice">
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => { setSelected(new Set([order.id])); setConfirmTrash(true); }} className="text-destructive hover:text-destructive" title="Trash">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => restoreOrders([order.id])}>
                              <RotateCcw className="w-3 h-3" />
                              Restore
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => permanentDelete([order.id])} className="text-destructive hover:text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trash Confirm Dialog */}
      <AlertDialog open={confirmTrash} onOpenChange={setConfirmTrash}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move {selected.size} order(s) to trash?</AlertDialogTitle>
            <AlertDialogDescription>You can restore them from the trash tab later.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={trashOrders} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminOrders;
