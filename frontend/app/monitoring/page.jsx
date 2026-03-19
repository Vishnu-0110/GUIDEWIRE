"use client";

import { useEffect, useState } from "react";
import AppShell from "@/components/layout/app-shell";
import ProtectedPage from "@/components/layout/protected-page";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

export default function MonitoringPage() {
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/monitoring/live");
      setData(data);
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to fetch monitoring data");
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ProtectedPage>
      <AppShell>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Live Monitoring</CardTitle>
              <CardDescription className="mt-2">
                Area-level trigger engine evaluates disruptions hourly for all active users.
              </CardDescription>
            </div>
            <Button variant="outline" onClick={load}>
              Refresh
            </Button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3 lg:grid-cols-8">
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">Temperature</p>
              <p className="mt-1 text-2xl font-black">{data?.live?.temperature ?? "-"}C</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">Rainfall</p>
              <p className="mt-1 text-2xl font-black">{data?.live?.rainfall ?? "-"} mm</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">AQI</p>
              <p className="mt-1 text-2xl font-black">{data?.live?.aqi ?? "-"}</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">Curfew</p>
              <p className="mt-1 text-2xl font-black">{data?.live?.curfew ? "YES" : "NO"}</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">Traffic Index</p>
              <p className="mt-1 text-2xl font-black">{data?.live?.trafficIndex ?? "-"}</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">Platform Status</p>
              <p className="mt-1 text-2xl font-black">
                {data?.live?.platformOutage ? "OUTAGE" : "STABLE"}
              </p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">Local Strike</p>
              <p className="mt-1 text-2xl font-black">{data?.live?.localStrike ? "YES" : "NO"}</p>
            </div>
            <div className="rounded-xl bg-muted/60 p-4">
              <p className="text-xs text-muted-foreground">Zone Closure</p>
              <p className="mt-1 text-2xl font-black">{data?.live?.zoneClosure ? "YES" : "NO"}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm font-semibold">Risk Alerts</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(data?.alerts || []).length ? (
                data.alerts.map((alert, idx) => (
                  <Badge key={`${alert.eventType}_${idx}`} variant="danger">
                    {alert.eventType.replaceAll("_", " ").toUpperCase()} = {Math.round(alert.value)}
                  </Badge>
                ))
              ) : (
                <Badge variant="success">No active disruption currently</Badge>
              )}
            </div>
          </div>
        </Card>

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(data?.recentEvents || []).map((event) => (
            <Card key={event._id}>
              <CardTitle className="text-base">
                {event.eventType.replaceAll("_", " ").toUpperCase()} Trigger
              </CardTitle>
              <CardDescription className="mt-2">
                {event.city} / {event.zone} | severity {Math.round(event.severityPercent * 100)}%
              </CardDescription>
              <p className="mt-2 text-sm text-muted-foreground">
                Value: {event.triggerValue} | At: {new Date(event.timestamp).toLocaleString()}
              </p>
            </Card>
          ))}
        </div>
        {message ? <p className="mt-4 text-sm font-semibold text-primary">{message}</p> : null}
      </AppShell>
    </ProtectedPage>
  );
}
