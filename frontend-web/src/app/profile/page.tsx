"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { apiRequest, suspendOwnProfile } from "@/lib/api";
import type { User } from "@/types/user";
import ConfirmDialog from "@/components/feedback/ConfirmDialog";
import Alert from "@/components/feedback/Alert";
import { clearAuth } from "@/lib/auth";

export default function ProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    async function load() {
      try {
        const response = await apiRequest<User>("/profile/me");
        setProfile(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile.");
      }
    }

    void load();
  }, []);

  const isAdmin = profile?.roles.includes("ADMIN") ?? false;

  async function handleSuspend() {
    try {
      await suspendOwnProfile();
      clearAuth();
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to suspend account.");
    }
  }

  return (
    <ProtectedRoute>
      <PageShell>
        <SectionHeader title="Profile" subtitle="Comprehensive user identity and business profile data." />
        {error ? <Alert variant="error" message={error} /> : null}

        {profile ? (
          <>
            <div className="profile-grid">
              <div className="panel">
                <h3>Identity</h3>
                <p><strong>Username:</strong> {profile.username}</p>
                <p><strong>Full Name:</strong> {profile.profile.firstName} {profile.profile.lastName}</p>
                <p><strong>Email:</strong> {profile.profile.email}</p>
                <p><strong>Phone:</strong> {profile.profile.phone || "-"}</p>
                <p><strong>Roles:</strong> {profile.roles.join(", ")}</p>
              </div>

              <div className="panel">
                <h3>Profile Details</h3>
                <p><strong>Status:</strong> {profile.accountStatus}</p>
                <p><strong>User Type:</strong> {profile.profile.userType}</p>
                <p><strong>City:</strong> {profile.profile.city || "-"}</p>
                <p><strong>Country:</strong> {profile.profile.country || "-"}</p>
              </div>
            </div>

            <div className="actions-row" style={{ marginTop: 20 }}>
              <button className="btn btn-secondary" onClick={() => router.push("/profile/edit")}>Edit profile</button>
              {!isAdmin ? (
                <button className="btn btn-danger" onClick={() => setShowConfirm(true)}>
                  Suspend my account
                </button>
              ) : null}
            </div>

            {showConfirm ? (
              <div style={{ marginTop: 20 }}>
                <ConfirmDialog
                  title="Suspend your account?"
                  description="This action will set your account to SUSPENDED and log you out immediately. Only an admin can reactivate it."
                  onCancel={() => setShowConfirm(false)}
                  onConfirm={() => void handleSuspend()}
                />
              </div>
            ) : null}
          </>
        ) : null}
      </PageShell>
    </ProtectedRoute>
  );
}
