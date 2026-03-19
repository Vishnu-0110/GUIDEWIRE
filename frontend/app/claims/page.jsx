"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/layout/protected-page";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";

export default function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/claims/my");
        setClaims(data.claims || []);
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to load claims");
      }
    };
    load();
  }, []);

  return (
    <ProtectedPage>
      <AppShell>
        <Card>
          <CardTitle>Auto Claims</CardTitle>
          <CardDescription className="mt-2">
            Manual claims are disabled. Trigger-based income-loss payouts appear automatically.
          </CardDescription>
        </Card>

        <div className="mt-4 space-y-3">
          {claims.map((claim) => (
            <Card key={claim._id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  {claim.eventId?.eventType?.toUpperCase() || "DISRUPTION"} Event
                </CardTitle>
                <Badge
                  variant={
                    claim.status === "paid"
                      ? "success"
                      : claim.status === "rejected"
                        ? "danger"
                        : "warning"
                  }
                >
                  {claim.status.toUpperCase()}
                </Badge>
              </div>
              <p className="mt-2 text-sm">
                Trigger reason: {claim.reason} | Amount credited: Rs.{claim.payout}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Time: {new Date(claim.createdAt).toLocaleString()}
              </p>
            </Card>
          ))}
          {!claims.length ? (
            <Card>
              <CardDescription>No claims yet. Keep monitoring live risks.</CardDescription>
            </Card>
          ) : null}
        </div>
        {message ? <p className="mt-4 text-sm font-semibold text-primary">{message}</p> : null}
      </AppShell>
    </ProtectedPage>
  );
}
