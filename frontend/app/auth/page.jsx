"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import useAuthStore from "@/store/useAuthStore";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initialSignup = {
  name: "",
  email: "",
  password: "",
  phone: "",
  city: "Coimbatore",
  zone: "central",
  platform: "Swiggy",
  dailyIncome: 1200,
  workingHours: 10
};

export default function AuthPage() {
  const [mode, setMode] = useState("signup");
  const [usePhone, setUsePhone] = useState(false);
  const [signupData, setSignupData] = useState(initialSignup);
  const [loginData, setLoginData] = useState({ email: "", password: "", phone: "", otp: "" });
  const [otpMock, setOtpMock] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  const { setSession } = useAuthStore();

  const onSignup = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = {
        ...signupData,
        dailyIncome: Number(signupData.dailyIncome),
        workingHours: Number(signupData.workingHours)
      };
      if (usePhone) {
        payload.email = undefined;
        payload.password = undefined;
      } else {
        payload.phone = undefined;
      }
      const { data } = await api.post("/auth/signup", payload);
      setSession({ token: data.token, user: data.user });
      if (data.otpMock) setOtpMock(data.otpMock);
      router.push("/onboarding");
    } catch (error) {
      setMessage(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const onRequestOtp = async () => {
    if (!loginData.phone) return;
    setLoading(true);
    setMessage("");
    try {
      const { data } = await api.post("/auth/request-otp", { phone: loginData.phone });
      setOtpMock(data.otpMock);
      setMessage("OTP generated (mock).");
    } catch (error) {
      setMessage(error.response?.data?.message || "OTP request failed");
    } finally {
      setLoading(false);
    }
  };

  const onLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const payload = usePhone
        ? { phone: loginData.phone, otp: loginData.otp }
        : { email: loginData.email, password: loginData.password };
      const { data } = await api.post("/auth/login", payload);
      setSession({ token: data.token, user: data.user });
      router.push("/dashboard");
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-8">
      <div className="grid w-full gap-6 md:grid-cols-2">
        <Card className="bg-orange-50/60">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            GigShield Access
          </p>
          <CardTitle className="mt-2 text-3xl">Secure Weekly Protection</CardTitle>
          <CardDescription className="mt-3 text-base">
            Login using email/password or phone OTP. This product is built for food-delivery
            partners with weekly income-loss protection.
          </CardDescription>
          {otpMock ? (
            <p className="mt-4 rounded-lg bg-accent/60 px-3 py-2 text-sm font-semibold">
              Mock OTP: {otpMock}
            </p>
          ) : null}
          {message ? <p className="mt-3 text-sm text-primary">{message}</p> : null}
        </Card>

        <Card>
          <div className="mb-4 flex gap-2">
            <Button
              type="button"
              variant={mode === "signup" ? "default" : "outline"}
              onClick={() => setMode("signup")}
            >
              Signup
            </Button>
            <Button
              type="button"
              variant={mode === "login" ? "default" : "outline"}
              onClick={() => setMode("login")}
            >
              Login
            </Button>
            <Button type="button" variant="ghost" onClick={() => setUsePhone((p) => !p)}>
              {usePhone ? "Use Email" : "Use Phone OTP"}
            </Button>
          </div>

          {mode === "signup" ? (
            <form className="space-y-3" onSubmit={onSignup}>
              <div>
                <Label>Name</Label>
                <Input
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  required
                />
              </div>
              {usePhone ? (
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={signupData.phone}
                    onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                    required
                  />
                </div>
              ) : (
                <>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>City</Label>
                  <Input
                    value={signupData.city}
                    onChange={(e) => setSignupData({ ...signupData, city: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Platform</Label>
                  <select
                    className="h-10 w-full rounded-xl border border-border bg-white px-3 text-sm"
                    value={signupData.platform}
                    onChange={(e) => setSignupData({ ...signupData, platform: e.target.value })}
                  >
                    <option>Swiggy</option>
                    <option>Zomato</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Daily Income (Rs.)</Label>
                  <Input
                    type="number"
                    value={signupData.dailyIncome}
                    onChange={(e) =>
                      setSignupData({ ...signupData, dailyIncome: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Working Hours/day</Label>
                  <Input
                    type="number"
                    value={signupData.workingHours}
                    onChange={(e) =>
                      setSignupData({ ...signupData, workingHours: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button disabled={loading} className="w-full">
                {loading ? "Please wait..." : "Create Account"}
              </Button>
            </form>
          ) : (
            <form className="space-y-3" onSubmit={onLogin}>
              {usePhone ? (
                <>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={loginData.phone}
                      onChange={(e) => setLoginData({ ...loginData, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="OTP"
                      value={loginData.otp}
                      onChange={(e) => setLoginData({ ...loginData, otp: e.target.value })}
                      required
                    />
                    <Button type="button" variant="outline" onClick={onRequestOtp}>
                      Get OTP
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Password</Label>
                    <Input
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
              <Button disabled={loading} className="w-full">
                {loading ? "Please wait..." : "Login"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
