import Link from "next/link";
import { ShieldCheck, CloudRain, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: CloudRain,
    title: "Parametric Auto-Trigger",
    description: "Rain, AQI, heat, traffic lock, curfew, or app outage instantly trigger payout."
  },
  {
    icon: Brain,
    title: "AI Risk Pricing",
    description: "Forecast-driven risk engine recommends weekly plans."
  },
  {
    icon: Zap,
    title: "Zero-Claim Payout",
    description: "No claim filing. Eligible partners receive automatic transfer."
  },
  {
    icon: ShieldCheck,
    title: "Fraud-Resilient",
    description: "GPS + activity + anomaly detection protects system integrity."
  }
];

export default function LandingPage() {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8">
      <section className="relative overflow-hidden rounded-3xl border border-border/70 bg-white/80 p-8 shadow-xl md:p-12">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-200/50 blur-2xl" />
        <div className="absolute -bottom-10 left-10 h-32 w-32 rounded-full bg-emerald-200/50 blur-2xl" />
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Food Delivery Weekly Income Protection
        </p>
        <h1 className="max-w-2xl text-4xl font-black leading-tight md:text-6xl">
          Protect Your Weekly Earnings
        </h1>
        <p className="mt-4 max-w-2xl text-base text-muted-foreground md:text-lg">
          GigShield AI protects Swiggy and Zomato delivery partners from sudden
          income loss due to weather, air pollution, social disruptions, and app outages.
        </p>
        <p className="mt-2 text-sm font-semibold text-muted-foreground">
          Coverage scope: income loss only. No health, life, accident, or vehicle repair coverage.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/auth">Get Started</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/dashboard">View Demo Dashboard</Link>
          </Button>
        </div>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <Card className="bg-red-50/60">
          <CardTitle>Problem</CardTitle>
          <CardDescription className="mt-2 text-base">
            Delivery partners lose income when disruptions stop orders, but traditional
            insurance is slow and claim-heavy.
          </CardDescription>
        </Card>
        <Card className="bg-emerald-50/70">
          <CardTitle>Solution</CardTitle>
          <CardDescription className="mt-2 text-base">
            GigShield AI uses real-time disruption signals and pays instantly based on
            parametric thresholds and verified work activity.
          </CardDescription>
        </Card>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title}>
            <feature.icon className="mb-3 h-6 w-6 text-primary" />
            <CardTitle className="text-base">{feature.title}</CardTitle>
            <CardDescription className="mt-2">{feature.description}</CardDescription>
          </Card>
        ))}
      </section>
    </div>
  );
}
