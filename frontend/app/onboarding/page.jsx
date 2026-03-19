"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/layout/protected-page";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import useAuthStore from "@/store/useAuthStore";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [form, setForm] = useState({
    city: user?.city || "Coimbatore",
    zone: user?.zone || "central",
    platform: user?.platform || "Swiggy",
    dailyIncome: user?.dailyIncome || 1200,
    workingHours: user?.workingHours || 10
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const { data } = await api.put("/users/me", {
        ...form,
        dailyIncome: Number(form.dailyIncome),
        workingHours: Number(form.workingHours)
      });
      setUser(data.user);
      setMessage("Onboarding saved.");
      router.push("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save onboarding");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedPage>
      <AppShell>
        <Card className="mx-auto max-w-2xl">
          <CardTitle>Onboarding</CardTitle>
          <CardDescription className="mt-2">
            Persona focus: Food delivery partners (Swiggy/Zomato). Update location and income profile for
            weekly risk and payout calculation.
          </CardDescription>
          <form className="mt-5 space-y-4" onSubmit={submit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>City</Label>
                <select
                  className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  <option>Coimbatore</option>
                  <option>Chennai</option>
                  <option>Bengaluru</option>
                  <option>Hyderabad</option>
                  <option>Mumbai</option>
                </select>
              </div>
              <div>
                <Label>Zone</Label>
                <Input
                  value={form.zone}
                  onChange={(e) => setForm({ ...form, zone: e.target.value })}
                  placeholder="central / north / south"
                />
              </div>
            </div>
            <div>
              <Label>Delivery Platform</Label>
              <select
                className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm"
                value={form.platform}
                onChange={(e) => setForm({ ...form, platform: e.target.value })}
              >
                <option>Swiggy</option>
                <option>Zomato</option>
              </select>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label>Average Daily Income (Rs.)</Label>
                <Input
                  type="number"
                  value={form.dailyIncome}
                  onChange={(e) => setForm({ ...form, dailyIncome: e.target.value })}
                />
              </div>
              <div>
                <Label>Working Hours/Day</Label>
                <Input
                  type="number"
                  value={form.workingHours}
                  onChange={(e) => setForm({ ...form, workingHours: e.target.value })}
                />
              </div>
            </div>
            <Button className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save Onboarding"}
            </Button>
            <p className="text-xs text-muted-foreground">
              Coverage is strictly income-loss only. No health, life, accident, or vehicle repair claims.
            </p>
            {message ? <p className="text-sm font-semibold text-primary">{message}</p> : null}
          </form>
        </Card>
      </AppShell>
    </ProtectedPage>
  );
}
