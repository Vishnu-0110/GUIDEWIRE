"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/layout/protected-page";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function BuyPolicyPage() {
  const [suggestions, setSuggestions] = useState(null);
  const [message, setMessage] = useState("");
  const [loadingPlan, setLoadingPlan] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/policies/suggestions");
      setSuggestions(data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load plans");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const buy = async (premium) => {
    setLoadingPlan(premium);
    setMessage("");
    try {
      const { data } = await api.post("/policies/buy", { premium });
      setMessage(
        `Policy activated until ${new Date(data.policy.endDate).toLocaleString()} with coverage Rs.${data.policy.coverage}.`
      );
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Policy purchase failed");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <ProtectedPage>
      <AppShell>
        <Card>
          <CardTitle>Buy Weekly Policy</CardTitle>
          <CardDescription className="mt-2">
            Weekly premium model only. Forecast data powers pricing, real-time disruptions power payouts.
          </CardDescription>
          <p className="mt-2 text-xs text-muted-foreground">
            Coverage scope: income loss only. Excludes health, life, accident, and vehicle repair payouts.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Badge variant="warning">
              AI Risk: {suggestions?.risk?.riskLevel || "..."} ({suggestions?.risk?.riskScore ?? "-"})
            </Badge>
            <Badge>Base Premium Recommendation: Rs.{suggestions?.risk?.premium ?? "-"}/week</Badge>
          </div>
        </Card>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {(suggestions?.plans || []).map((plan) => (
            <Card key={plan.premium} className={plan.aiSuggested ? "ring-2 ring-primary/30" : ""}>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription className="mt-2">7-day policy lifecycle</CardDescription>
              <p className="mt-5 text-3xl font-black">Rs.{plan.premium}/week</p>
              <p className="mt-1 text-sm text-muted-foreground">Coverage Rs.{plan.coverage}</p>
              {plan.aiSuggested ? <Badge className="mt-3">AI Suggested</Badge> : null}
              <Button className="mt-5 w-full" onClick={() => buy(plan.premium)} disabled={loadingPlan === plan.premium}>
                {loadingPlan === plan.premium ? "Processing Payment..." : "Pay & Activate"}
              </Button>
            </Card>
          ))}
        </div>
        {message ? <p className="mt-4 text-sm font-semibold text-primary">{message}</p> : null}
      </AppShell>
    </ProtectedPage>
  );
}
