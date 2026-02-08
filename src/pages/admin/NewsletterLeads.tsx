import { useEffect, useState } from "react";
import { Mail, Trash2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

const NewsletterLeads = () => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleteIds, setDeleteIds] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    const { data, error } = await supabase
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setSubscribers(data);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (deleteIds.length === 0) return;
    const { error } = await supabase.from("newsletter_subscribers").delete().in("id", deleteIds);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else toast({ title: "Deleted!", description: `${deleteIds.length} subscriber(s) removed.` });
    setDeleteIds([]);
    setSelected(new Set());
    fetchSubscribers();
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.id)));
  };

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Newsletter Leads</h1>
        <p className="text-sm text-muted-foreground">{subscribers.length} subscribers</p>
      </div>

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

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search by email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 rounded-full bg-card" />
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-card rounded-xl animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-12 text-center">
          <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No subscribers yet</p>
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
                  <th className="px-4 py-4 font-medium">Email</th>
                  <th className="px-4 py-4 font-medium">Subscribed Date</th>
                  <th className="px-4 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4">
                      <Checkbox checked={selected.has(sub.id)} onCheckedChange={() => toggleSelect(sub.id)} />
                    </td>
                    <td className="px-4 py-4 font-medium">{sub.email}</td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {format(new Date(sub.created_at), "MMM dd, yyyy HH:mm")}
                    </td>
                    <td className="px-4 py-4">
                      <Button variant="ghost" size="icon" onClick={() => setDeleteIds([sub.id])} className="text-destructive hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
            <AlertDialogTitle>Delete {deleteIds.length} Subscriber(s)?</AlertDialogTitle>
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

export default NewsletterLeads;
