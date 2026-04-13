"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import UserForm from "@/components/forms/UserForm";
import { apiRequest } from "@/lib/api";
import type { User } from "@/types/user";
import Alert from "@/components/feedback/Alert";

export default function AdminUserDetailsPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await apiRequest<User>(`/admin/users/${params.id}`);
        setUser(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load user.");
      }
    }

    if (params.id) {
      void load();
    }
  }, [params.id]);

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PageShell>
          <SectionHeader title="Edit User" subtitle="Update profile fields and account status for an existing user." />
          {error ? <Alert variant="error" message={error} /> : null}
          {user ? <UserForm initialData={user} isEdit /> : null}
        </PageShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
