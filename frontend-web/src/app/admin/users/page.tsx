"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import DataTable, { type DataTableColumn } from "@/components/tables/DataTable";
import StatusBadge from "@/components/tables/StatusBadge";
import { apiRequest } from "@/lib/api";
import type { User } from "@/types/user";
import Alert from "@/components/feedback/Alert";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const response = await apiRequest<User[]>("/admin/users");
        setUsers(response.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load users.");
      }
    }

    void load();
  }, []);

  const columns: DataTableColumn<User>[] = [
    { key: "username", label: "Username", render: (row) => row.username },
    { key: "fullName", label: "Full Name", render: (row) => `${row.profile.firstName} ${row.profile.lastName}` },
    { key: "email", label: "Email", render: (row) => row.profile.email },
    { key: "roles", label: "Roles", render: (row) => row.roles.join(", ") },
    { key: "accountStatus", label: "Status", render: (row) => <StatusBadge value={row.accountStatus} /> },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="inline-actions">
          <Link href={`/admin/users/${row._id}`}>Edit</Link>
          <Link href="/admin/rbac">Manage Roles</Link>
          <Link href="/admin/account-status">Manage Status</Link>
        </div>
      )
    }
  ];

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PageShell>
          <SectionHeader title="Admin Users" subtitle="Centralized user account administration." />
          {error ? <Alert variant="error" message={error} /> : null}
          <div className="actions-row" style={{ marginBottom: 20 }}>
            <Link href="/admin/users/create" className="btn btn-primary">Create user</Link>
            <Link href="/admin/rbac" className="btn btn-secondary">Manage roles</Link>
            <Link href="/admin/account-status" className="btn btn-secondary">Manage status</Link>
          </div>
          <DataTable columns={columns} data={users} rowKey={(row) => row._id} />
        </PageShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
