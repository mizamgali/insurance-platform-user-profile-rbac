"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/guards/ProtectedRoute";
import RoleGuard from "@/components/guards/RoleGuard";
import PageShell from "@/components/layout/PageShell";
import SectionHeader from "@/components/layout/SectionHeader";
import RoleAssignmentForm from "@/components/forms/RoleAssignmentForm";
import { apiRequest } from "@/lib/api";
import type { User } from "@/types/user";
import type { Role } from "@/types/role";
import Alert from "@/components/feedback/Alert";

export default function AdminRbacPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    try {
      const [usersResponse, rolesResponse] = await Promise.all([
        apiRequest<User[]>("/admin/users"),
        apiRequest<Role[]>("/admin/rbac/roles")
      ]);
      setUsers(usersResponse.data);
      setRoles(rolesResponse.data);
      if (!selectedUserId && usersResponse.data.length > 0) {
        setSelectedUserId(usersResponse.data[0]._id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load RBAC data.");
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const selectedUser = users.find((user) => user._id === selectedUserId);

  async function handleRoleUpdate(nextRoles: string[]) {
    if (!selectedUserId) return;
    setError("");
    setSuccess("");
    try {
      await apiRequest(`/admin/rbac/users/${selectedUserId}/roles`, {
        method: "PUT",
        body: { roles: nextRoles }
      });
      setSuccess("Roles updated successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update roles.");
    }
  }

  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <PageShell>
          <SectionHeader title="RBAC Management" subtitle="Assign and manage user roles centrally." />
          {error ? <Alert variant="error" message={error} /> : null}
          {success ? <Alert variant="success" message={success} /> : null}

          <div className="panel">
            <label>Select User</label>
            <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
              {users.map((user) => (
                <option key={user._id} value={user._id}>{user.username}</option>
              ))}
            </select>
          </div>

          {selectedUser ? (
            <div className="panel-stack">
              <div className="panel">
                <p><strong>Selected User:</strong> {selectedUser.username}</p>
                <p><strong>Current Roles:</strong> {selectedUser.roles.join(", ")}</p>
              </div>
              <RoleAssignmentForm availableRoles={roles.map((role) => role.name)} currentRoles={selectedUser.roles} onSubmit={handleRoleUpdate} />
            </div>
          ) : null}
        </PageShell>
      </RoleGuard>
    </ProtectedRoute>
  );
}
