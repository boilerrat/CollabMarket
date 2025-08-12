"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { SkillsMultiSelect } from "@/components/skills-multiselect";
import { PageHeader } from "@/components/ui/page-header";
import { payPostingFeeWithFarcasterWallet } from "@/lib/wallet";

export default function NewProjectPage() {
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [projectType, setProjectType] = useState("");
  const [skillsList, setSkillsList] = useState<string[]>([]);
  const [roles, setRoles] = useState<Array<{ skill: string; level?: string; count?: number }>>([{ skill: "", level: "", count: 1 }]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [feeCfg, setFeeCfg] = useState<{ enabled: boolean; price: string; token: string | null; chainId: number | null } | null>(null);
  const [paymentTx, setPaymentTx] = useState("");
  const [paying, setPaying] = useState(false);

  const router = useRouter();

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

  const submit = async () => {
    setSaving(true);
    setMessage(null);
    try {
      if (!title.trim() || !pitch.trim()) {
        toast.error("Title and pitch are required");
        setSaving(false);
        return;
      }
      if (feeCfg?.enabled && !paymentTx.trim()) {
        toast.error("Please paste your payment transaction hash");
        setSaving(false);
        return;
      }
      const url = new URL("/api/projects", window.location.origin);
      if (feeCfg?.enabled && paymentTx.trim()) url.searchParams.set("payment_tx", paymentTx.trim());
      const res = await fetch(url.toString(), {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          pitch,
          project_type: projectType,
          skills: skillsList,
          roles: roles.filter((r) => r.skill.trim()).map((r) => ({ skill: r.skill.trim(), level: r.level?.trim() || undefined, count: Number(r.count || 1) })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to create");
      setTitle("");
      setPitch("");
      setProjectType("");
      setSkillsList([]);
      setRoles([{ skill: "", level: "", count: 1 }]);
      toast.success("Project created");
      router.push("/projects");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create";
      setMessage(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="p-4">
      <div className="mx-auto max-w-2xl">
        <PageHeader title="New Project" description="Describe your project and required skills." backFallbackHref="/projects" />
        <Card>
          <CardHeader className="pb-0" />
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pitch">Pitch</Label>
              <Textarea id="pitch" rows={4} value={pitch} onChange={(e) => setPitch(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Project Type</Label>
              <Input id="type" value={projectType} onChange={(e) => setProjectType(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Required Skills</Label>
              <SkillsMultiSelect selected={skillsList} onChange={setSkillsList} options={["React","Next.js","TypeScript","Tailwind","Design","Solidity","Python"]} />
            </div>
            <div className="grid gap-2">
              <Label>Roles (optional)</Label>
              <div className="space-y-2">
                {roles.map((r, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2">
                    <Input placeholder="Skill" value={r.skill} onChange={(e) => setRoles((arr) => arr.map((x, i) => i===idx ? { ...x, skill: e.target.value } : x))} className="col-span-3" />
                    <Input placeholder="Level" value={r.level || ""} onChange={(e) => setRoles((arr) => arr.map((x, i) => i===idx ? { ...x, level: e.target.value } : x))} className="col-span-2" />
                    <Input placeholder="Count" type="number" min={1} value={r.count ?? 1} onChange={(e) => setRoles((arr) => arr.map((x, i) => i===idx ? { ...x, count: Number(e.target.value) } : x))} />
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button type="button" variant="secondary" onClick={() => setRoles((arr) => [...arr, { skill: "", level: "", count: 1 }])}>Add Role</Button>
                  {roles.length > 1 ? (
                    <Button type="button" variant="outline" onClick={() => setRoles((arr) => arr.slice(0, -1))}>Remove Last</Button>
                  ) : null}
                </div>
              </div>
            </div>
            {feeCfg?.enabled ? (
              <div className="grid gap-2">
                <Label htmlFor="payment_tx">Payment Transaction Hash</Label>
                <Input id="payment_tx" placeholder="0x..." value={paymentTx} onChange={(e) => setPaymentTx(e.target.value)} />
                <p className="text-xs text-muted-foreground">
                  A small fee is required to post. Price: {feeCfg.price ? `${Number(feeCfg.price) / 1_000_000} USDC` : "USDC"}. Paste the tx hash after paying.
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
                        action: "project",
                      });
                      setPaymentTx(hash);
                      toast.success("Payment sent. Tx hash filled.");
                    } catch (e) {
                      const msg = e instanceof Error ? e.message : "Payment failed";
                      toast.error(msg);
                    } finally {
                      setPaying(false);
                    }
                  }}>Pay with Farcaster Wallet</Button>
                </div>
              </div>
            ) : null}
            <div className="flex gap-2">
              <Button onClick={submit} disabled={saving}>{saving ? "Creating..." : "Create Project"}</Button>
              <Button type="button" variant="outline" onClick={() => router.push("/projects")}>Cancel</Button>
            </div>
            {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}


