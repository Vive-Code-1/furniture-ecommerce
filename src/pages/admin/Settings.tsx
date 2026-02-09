import { useEffect, useState } from "react";
import { Save, Eye, EyeOff, Settings as SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SettingField {
  key: string;
  label: string;
  placeholder: string;
  sensitive: boolean;
}

const PAYMENT_SETTINGS: SettingField[] = [
  {
    key: "uddoktapay_api_key",
    label: "UddoktaPay API Key",
    placeholder: "Enter your UddoktaPay API key",
    sensitive: true,
  },
  {
    key: "uddoktapay_base_url",
    label: "UddoktaPay Base URL",
    placeholder: "https://sandbox.uddoktapay.com/api",
    sensitive: false,
  },
];

const Settings = () => {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value");

    if (!error && data) {
      const map: Record<string, string> = {};
      data.forEach((row: any) => {
        map[row.key] = row.value;
      });
      setValues(map);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const field of PAYMENT_SETTINGS) {
        const val = values[field.key] ?? "";
        const { error } = await supabase
          .from("site_settings")
          .upsert({ key: field.key, value: val, updated_at: new Date().toISOString() }, { onConflict: "key" });
        if (error) throw error;
      }
      toast({ title: "Settings Saved", description: "Payment gateway settings have been updated." });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage payment gateway and site configuration</p>
      </div>

      {/* Payment Gateway Settings */}
      <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl">
        <h2 className="font-heading text-lg font-bold mb-1 flex items-center gap-2">
          <SettingsIcon className="w-5 h-5" />
          Payment Gateway (UddoktaPay)
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure your UddoktaPay credentials. These will be used for processing online payments.
        </p>

        <div className="space-y-4">
          {PAYMENT_SETTINGS.map((field) => (
            <div key={field.key}>
              <label className="text-sm font-medium mb-1.5 block">{field.label}</label>
              <div className="relative">
                <Input
                  type={field.sensitive && !showSecrets[field.key] ? "password" : "text"}
                  placeholder={field.placeholder}
                  value={values[field.key] ?? ""}
                  onChange={(e) => setValues((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  className="rounded-xl bg-secondary border-border pr-10"
                />
                {field.sensitive && (
                  <button
                    type="button"
                    onClick={() => setShowSecrets((prev) => ({ ...prev, [field.key]: !prev[field.key] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showSecrets[field.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <Button onClick={handleSave} disabled={saving} className="mt-6 rounded-full gap-2">
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
