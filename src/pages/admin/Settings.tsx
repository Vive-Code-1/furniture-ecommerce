import { useEffect, useState } from "react";
import { Save, Eye, EyeOff, CreditCard } from "lucide-react";
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

const UDDOKTAPAY_SETTINGS: SettingField[] = [
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

const STRIPE_SETTINGS: SettingField[] = [
  {
    key: "stripe_secret_key",
    label: "Stripe Secret Key",
    placeholder: "sk_live_... or sk_test_...",
    sensitive: true,
  },
  {
    key: "stripe_publishable_key",
    label: "Stripe Publishable Key",
    placeholder: "pk_live_... or pk_test_...",
    sensitive: false,
  },
];

const ALL_SETTINGS = [...UDDOKTAPAY_SETTINGS, ...STRIPE_SETTINGS];

const Settings = () => {
  const { toast } = useToast();
  const [values, setValues] = useState<Record<string, string>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [savingUddokta, setSavingUddokta] = useState(false);
  const [savingStripe, setSavingStripe] = useState(false);

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

  const handleSave = async (fields: SettingField[], setSaving: (v: boolean) => void, label: string) => {
    setSaving(true);
    try {
      for (const field of fields) {
        const val = values[field.key] ?? "";
        const { error } = await supabase
          .from("site_settings")
          .upsert({ key: field.key, value: val, updated_at: new Date().toISOString() }, { onConflict: "key" });
        if (error) throw error;
      }
      toast({ title: "Settings Saved", description: `${label} settings have been updated.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to save settings.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const renderFields = (fields: SettingField[]) => (
    <div className="space-y-4">
      {fields.map((field) => (
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
  );

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
        <h1 className="font-heading text-2xl font-bold">Payment Gateway</h1>
        <p className="text-sm text-muted-foreground">Manage your payment gateway credentials</p>
      </div>

      {/* UddoktaPay Settings */}
      <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl">
        <h2 className="font-heading text-lg font-bold mb-1 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          UddoktaPay
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure your UddoktaPay credentials for processing online payments.
        </p>
        {renderFields(UDDOKTAPAY_SETTINGS)}
        <Button onClick={() => handleSave(UDDOKTAPAY_SETTINGS, setSavingUddokta, "UddoktaPay")} disabled={savingUddokta} className="mt-6 rounded-full gap-2">
          <Save className="w-4 h-4" />
          {savingUddokta ? "Saving..." : "Save UddoktaPay"}
        </Button>
      </div>

      {/* Stripe Settings */}
      <div className="bg-card rounded-2xl border border-border p-6 max-w-2xl">
        <h2 className="font-heading text-lg font-bold mb-1 flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Stripe
        </h2>
        <p className="text-sm text-muted-foreground mb-6">
          Configure your Stripe API credentials for processing card payments.
        </p>
        {renderFields(STRIPE_SETTINGS)}
        <Button onClick={() => handleSave(STRIPE_SETTINGS, setSavingStripe, "Stripe")} disabled={savingStripe} className="mt-6 rounded-full gap-2">
          <Save className="w-4 h-4" />
          {savingStripe ? "Saving..." : "Save Stripe"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;
