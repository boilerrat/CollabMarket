"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { sdk } from "@farcaster/miniapp-sdk";
import { SkillsMultiSelect } from "@/components/skills-multiselect";
import { payPostingFeeWithFarcasterWallet } from "@/lib/wallet";

type ProfileForm = {
  display_name: string;
  handle: string;
  bio: string;
  avatar_url?: string;
  skills: string;
  availability_hours_week: number | "";
};

export default function ProfilePage() {
  const [form, setForm] = useState<ProfileForm>({
    display_name: "",
    handle: "",
    bio: "",
    avatar_url: "",
    skills: "",
    availability_hours_week: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [feeCfg, setFeeCfg] = useState<{ enabled: boolean; price: string; token: string | null; chainId: number | null } | null>(null);
  const [paymentTx, setPaymentTx] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fillFromFarcaster = async () => {
      try {
        type SdkUser = { displayName?: string; username?: string; bio?: string; pfpUrl?: string };
        type SdkContext = { user?: SdkUser };
        const ctxGetter = (sdk as unknown as { context?: { get?: () => SdkContext } }).context?.get;
        const context = typeof ctxGetter === "function" ? ctxGetter() : undefined;
        const user = context?.user;
        if (!user) return;
        setForm((prev) => ({
          ...prev,
          display_name: user.displayName || prev.display_name,
          handle: user.username || prev.handle,
          bio: user.bio || prev.bio,
          avatar_url: user.pfpUrl || prev.avatar_url,
        }));
      } catch {
        // ignore if SDK context not available
      }
    };
    fillFromFarcaster();
  }, []);

  useEffect(() => {
    const loadFees = async () => {
      try {
        const res = await fetch("/api/fees");
        const data = await res.json();
        if (data?.ok && data?.fees) {
          const price = typeof data.fees.price === "number" ? String(data.fees.price) : data.fees.price?.toString?.() || "";
          setFeeCfg({ enabled: Boolean(data.fees.enabled), price, token: data.fees.token || null, chainId: data.fees.chainId || null });
        }
      } catch {}
    };
    loadFees();
  }, []);

  const onChange = (key: keyof ProfileForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = key === "availability_hours_week" ? Number(e.target.value) || "" : e.target.value;
    setForm((f) => ({ ...f, [key]: value }));
  };

  const onSubmit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (feeCfg?.enabled && !paymentTx.trim()) {
        setMessage("Please paste your payment transaction hash");
        setSaving(false);
        return;
      }
      const url = new URL("/api/profile", window.location.origin);
      if (feeCfg?.enabled && paymentTx.trim()) url.searchParams.set("payment_tx", paymentTx.trim());
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save");
      setMessage("Saved");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save";
      setMessage(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Fill details for collaborator directory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input id="display_name" value={form.display_name} onChange={onChange("display_name")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="handle">Farcaster Handle</Label>
              <Input id="handle" value={form.handle} onChange={onChange("handle")} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" rows={4} value={form.bio} onChange={onChange("bio")} />
            </div>
            <div className="grid gap-2">
              <Label>Skills</Label>
              <SkillsMultiSelect
                selected={form.skills ? form.skills.split(',').map((s) => s.trim()).filter(Boolean) : []}
                onChange={(skills) => setForm((f) => ({ ...f, skills: skills.join(', ') }))}
                options={["React","Next.js","TypeScript","Tailwind","Design","Solidity","Python"]}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="availability_hours_week">Availability (hours/week)</Label>
              <Input id="availability_hours_week" inputMode="numeric" value={String(form.availability_hours_week)} onChange={onChange("availability_hours_week")} />
            </div>
            {feeCfg?.enabled ? (
              <div className="grid gap-2">
                <Label htmlFor="payment_tx">Payment Transaction Hash</Label>
                <Input id="payment_tx" placeholder="0x..." value={paymentTx} onChange={(e) => setPaymentTx(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  A small fee is required to post your profile. Price: {feeCfg.price ? `${Number(feeCfg.price) / 1_000_000} USDC` : "USDC"}. Paste the tx hash after paying.
                </p>
                <div>
                  <Button type="button" variant="secondary" disabled={paying} onClick={async () => {
                    if (!feeCfg?.chainId || !feeCfg?.token || !feeCfg?.price) return;
                    setPaying(true);
                    try {
                      const hash = await payPostingFeeWithFarcasterWallet({
                        chainId: feeCfg.chainId,
                        usdc: feeCfg.token,
                        postingFee: (await (await fetch("/api/fees")).json()).fees.contract,
                        amount: BigInt(feeCfg.price),
                        action: "profile",
                      });
                      setPaymentTx(hash);
                      
                    } catch (e) {
                      // eslint-disable-next-line no-console
                      console.error(e);
                    } finally {
                      setPaying(false);
                    }
                  }}>Pay with Farcaster Wallet</Button>
                </div>
              </div>
            ) : null}
            <div className="flex gap-2">
              <Button onClick={onSubmit} disabled={saving}>{saving ? "Saving..." : "Save Profile"}</Button>
            </div>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


