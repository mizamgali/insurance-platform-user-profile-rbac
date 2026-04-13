"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import { apiRequest, updateUserStatus } from "@/lib/api";
import type { User } from "@/types/user";
import Alert from "@/components/feedback/Alert";
import StatusBadge from "@/components/tables/StatusBadge";

const statusOptions = ["ACTIVE", "INACTIVE", "SUSPENDED"];

export default function AdminAccountStatusPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  async function loadUsers() {
    try {
      const response = await apiRequest<User[]>("/admin/users");
      setUsers(response.data);
      setDrafts(Object.fromEntries(response.data.map((user) => [user._id, user.accountStatus])));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleSave(userId: string) {
    setError("");
    setSuccess("");
    try {
      await updateUserStatus(userId, drafts[userId]);
      setSuccess("Account status updated successfully.");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    }
  }

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PageShell>
          <SectionHeader title="Account Status Management" subtitle="Activate, inactivate, or suspend user accounts." />
          {error ? <Alert variant="error" message={error} /> : null}
          {success ? <Alert variant="success" message={success} /> : null}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Current Status</th>
                  <th>New Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.username}</td>
                    <td>{user.profile.firstName} {user.profile.lastName}</td>
                    <td><StatusBadge value={user.accountStatus} /></td>
                    <td>
                      <select value={drafts[user._id] || user.accountStatus} onChange={(e) => setDrafts((prev) => ({ ...prev, [user._id]: e.target.value }))}>
                        {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-primary" onClick={() => void handleSave(user._id)}>Save</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PageShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
