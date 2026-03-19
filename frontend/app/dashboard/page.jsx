"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/layout/protected-page";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/lib/api";

function RiskBadge({ risk }) {
  if (risk === "HIGH") return <Badge variant="danger">High Risk</Badge>;
  if (risk === "MEDIUM") return <Badge variant="warning">Medium Risk</Badge>;
  return <Badge variant="success">Low Risk</Badge>;
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [monitoring, setMonitoring] = useState(null);
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState({ lat: "", lng: "" });

  const load = async () => {
    try {
      const [me, live] = await Promise.all([api.get("/users/me"), api.get("/monitoring/live")]);
      setData(me.data);
      setMonitoring(live.data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to load dashboard");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleOnline = async (online) => {
    try {
      await api.post("/users/work-status", {
        online,
        lat: Number(location.lat) || undefined,
        lng: Number(location.lng) || undefined
      });
      setMessage(online ? "You are ONLINE and eligible for payouts." : "You are OFFLINE.");
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Work status update failed");
    }
  };

  return (
    <ProtectedPage>
      <AppShell>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardDescription>Weekly Risk Level</CardDescription>
            <CardTitle className="mt-2">
              {data?.dashboard?.riskLevel || "Loading"}{" "}
              {data?.dashboard?.riskLevel ? <RiskBadge risk={data.dashboard.riskLevel} /> : null}
            </CardTitle>
          </Card>
          <Card>
            <CardDescription>Current Plan</CardDescription>
            <CardTitle className="mt-2">{data?.dashboard?.currentPlan || "-"}</CardTitle>
          </Card>
          <Card>
            <CardDescription>Coverage Amount</CardDescription>
            <CardTitle className="mt-2">Rs.{data?.dashboard?.coverageAmount || 0}</CardTitle>
          </Card>
          <Card>
            <CardDescription>Last Payout</CardDescription>
            <CardTitle className="mt-2">Rs.{data?.dashboard?.lastPayout || 0}</CardTitle>
          </Card>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardTitle>Live Conditions</CardTitle>
            <CardDescription className="mt-2">
              Real-time inputs used for payout triggers
            </CardDescription>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-7">
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="mt-1 text-2xl font-black">{monitoring?.live?.temperature ?? "-"}C</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground">Rainfall</p>
                <p className="mt-1 text-2xl font-black">{monitoring?.live?.rainfall ?? "-"} mm</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground">AQI</p>
                <p className="mt-1 text-2xl font-black">{monitoring?.live?.aqi ?? "-"}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground">Traffic Index</p>
                <p className="mt-1 text-2xl font-black">{monitoring?.live?.trafficIndex ?? "-"}</p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground">Platform</p>
                <p className="mt-1 text-2xl font-black">
                  {monitoring?.live?.platformOutage ? "OUTAGE" : "STABLE"}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground">Local Strike</p>
                <p className="mt-1 text-2xl font-black">
                  {monitoring?.live?.localStrike ? "YES" : "NO"}
                </p>
              </div>
              <div className="rounded-xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground">Zone Closure</p>
                <p className="mt-1 text-2xl font-black">
                  {monitoring?.live?.zoneClosure ? "YES" : "NO"}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <CardTitle>Work Status Validation</CardTitle>
            <CardDescription className="mt-2">
              Payout is allowed only when disruption = TRUE and user ONLINE = TRUE.
            </CardDescription>
            <div className="mt-4 space-y-3">
              <Input
                placeholder="Latitude (optional)"
                value={location.lat}
                onChange={(e) => setLocation({ ...location, lat: e.target.value })}
              />
              <Input
                placeholder="Longitude (optional)"
                value={location.lng}
                onChange={(e) => setLocation({ ...location, lng: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={() => toggleOnline(true)}>Go Online</Button>
                <Button variant="outline" onClick={() => toggleOnline(false)}>
                  Go Offline
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Current: {data?.user?.isOnline ? "ONLINE" : "OFFLINE"}
              </p>
            </div>
          </Card>
        </div>
        {message ? <p className="mt-4 text-sm font-semibold text-primary">{message}</p> : null}
      </AppShell>
    </ProtectedPage>
  );
}
