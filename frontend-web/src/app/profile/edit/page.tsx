"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import ProfileForm from "@/components/forms/ProfileForm";
import { apiRequest } from "@/lib/api";
import type { User, UserProfile } from "@/types/user";
import Alert from "@/components/feedback/Alert";

export default function EditProfilePage() {
  const [profile, setProfile] = useState<User | null>(null);
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

  async function handleSubmit(payload: Partial<UserProfile>) {
    try {
      await apiRequest<User>("/profile/me", { method: "PUT", body: payload });
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile.");
      throw err;
    }
  }

  return (
    <ProtectedRoute>
      <PageShell>
        <SectionHeader title="Edit Profile" subtitle="Maintain your profile details securely." />
        {error ? <Alert variant="error" message={error} /> : null}
        {profile ? <ProfileForm initialValue={profile.profile} onSubmit={handleSubmit} /> : null}
      </PageShell>
    </ProtectedRoute>
  );
}
