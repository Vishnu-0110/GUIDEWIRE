"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/layout/protected-page";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function AdminPage() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const response = await api.get("/admin/dashboard");
      setData(response.data);
      setMessage("");
    } catch (error) {
      setMessage(
        error.response?.status === 403
          ? "Admin access required. Create an admin user role in database."
          : error.response?.data?.message || "Failed to load admin dashboard"
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const runTrigger = async () => {
    try {
      await api.post("/admin/trigger-now");
      setMessage("Manual trigger cycle executed.");
      await load();
    } catch (error) {
      setMessage(error.response?.data?.message || "Manual trigger failed");
    }
  };

  return (
    <ProtectedPage>
      <AppShell>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription className="mt-2">
                Track users, policy activity, payouts, fraud alerts, and weekly revenue.
              </CardDescription>
              <p className="mt-2 text-xs text-muted-foreground">
                Scope locked to income-loss protection only on a weekly pricing cycle.
              </p>
            </div>
            <Button variant="outline" onClick={runTrigger}>
              Run Trigger Cycle
            </Button>
          </div>
        </Card>

        {data ? (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
              <Card>
                <CardDescription>Total Users</CardDescription>
                <CardTitle className="mt-2">{data.metrics.totalUsers}</CardTitle>
              </Card>
              <Card>
                <CardDescription>Active Policies</CardDescription>
                <CardTitle className="mt-2">{data.metrics.activePolicies}</CardTitle>
              </Card>
              <Card>
                <CardDescription>Claims Triggered</CardDescription>
                <CardTitle className="mt-2">{data.metrics.claimsTriggered}</CardTitle>
              </Card>
              <Card>
                <CardDescription>Fraud Alerts</CardDescription>
                <CardTitle className="mt-2">{data.metrics.fraudAlerts}</CardTitle>
              </Card>
              <Card>
                <CardDescription>Avg Payout</CardDescription>
                <CardTitle className="mt-2">Rs.{data.metrics.averagePayout}</CardTitle>
              </Card>
              <Card>
                <CardDescription>Weekly Revenue</CardDescription>
                <CardTitle className="mt-2">Rs.{data.metrics.weeklyRevenue}</CardTitle>
              </Card>
            </div>

            <div className="mt-5 space-y-3">
              {data.fraudAlerts.map((alert) => (
                <Card key={alert._id}>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{alert.userId?.name}</CardTitle>
                    <Badge variant={alert.status === "rejected" ? "danger" : "warning"}>
                      {alert.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm">
                    {alert.reason} | Flags: {(alert.fraudFlags || []).join(", ") || "None"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {new Date(alert.createdAt).toLocaleString()}
                  </p>
                </Card>
              ))}
            </div>
          </>
        ) : null}
        {message ? <p className="mt-4 text-sm font-semibold text-primary">{message}</p> : null}
      </AppShell>
    </ProtectedPage>
  );
}
