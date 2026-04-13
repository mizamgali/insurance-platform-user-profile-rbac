"use client";

import { useMemo, useState, type FormEvent } from "react";
import { createUser, updateUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import Alert from "@/components/feedback/Alert";
import type { User } from "@/types/user";

interface UserFormProps {
  initialData?: User | null;
  isEdit?: boolean;
}

const roleOptions = ["ADMIN", "AGENT", "CUSTOMER", "UNDERWRITER", "CLAIMS_ADJUSTER"];
const statusOptions = ["ACTIVE", "INACTIVE", "SUSPENDED"];
const userTypeOptions = ["CUSTOMER", "INTERNAL"];

export default function UserForm({ initialData, isEdit = false }: UserFormProps) {
  const router = useRouter();
  const [form, setForm] = useState({
    username: initialData?.username || "",
    password: "",
    firstName: initialData?.profile.firstName || "",
    lastName: initialData?.profile.lastName || "",
    email: initialData?.profile.email || "",
    phone: initialData?.profile.phone || "",
    city: initialData?.profile.city || "",
    country: initialData?.profile.country || "",
    userType: initialData?.profile.userType || "CUSTOMER",
    roles: initialData?.roles || [],
    accountStatus: initialData?.accountStatus || "ACTIVE"
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = useMemo(() => (isEdit ? "Edit User" : "Create User"), [isEdit]);

  function toggleRole(role: string) {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((item) => item !== role)
        : [...prev.roles, role]
    }));
  }

  function validate() {
    if (!isEdit && form.username.trim().length < 3) return "Username must be at least 3 characters.";
    if (!isEdit && form.password.length < 8) return "Password must be at least 8 characters.";
    if (!form.firstName.trim()) return "First name is required.";
    if (!form.lastName.trim()) return "Last name is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return "A valid email is required.";
    if (form.roles.length === 0) return "Select at least one role.";
    return "";
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    const validationMessage = validate();
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    const payload = {
      ...(isEdit ? {} : { username: form.username.trim(), password: form.password }),
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      city: form.city.trim(),
      country: form.country.trim(),
      userType: form.userType,
      roles: form.roles,
      accountStatus: form.accountStatus
    };

    try {
      setIsSubmitting(true);
      if (isEdit && initialData) {
        await updateUser(initialData._id, payload);
      } else {
        await createUser(payload);
      }
      setSuccess(isEdit ? "User updated successfully." : "User created successfully.");
      router.push("/admin/users");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save user.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="panel form-grid">
      <div className="full-span">
        <h2>{title}</h2>
      </div>
      {error ? <div className="full-span"><Alert variant="error" message={error} /></div> : null}
      {success ? <div className="full-span"><Alert variant="success" message={success} /></div> : null}

      {!isEdit ? (
        <div>
          <label>Username</label>
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
        </div>
      ) : null}

      {!isEdit ? (
        <div>
          <label>Password</label>
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        </div>
      ) : null}

      <div>
        <label>First Name</label>
        <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
      </div>

      <div>
        <label>Last Name</label>
        <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
      </div>

      <div>
        <label>Email</label>
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>

      <div>
        <label>Phone</label>
        <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>

      <div>
        <label>City</label>
        <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      </div>

      <div>
        <label>Country</label>
        <input value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} />
      </div>

      <div>
        <label>User Type</label>
        <select value={form.userType} onChange={(e) => setForm({ ...form, userType: e.target.value })}>
          {userTypeOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      <div>
        <label>Account Status</label>
        <select value={form.accountStatus} onChange={(e) => setForm({ ...form, accountStatus: e.target.value })}>
          {statusOptions.map((option) => <option key={option} value={option}>{option}</option>)}
        </select>
      </div>

      <div className="full-span">
        <label>Roles</label>
        <div className="checkbox-grid">
          {roleOptions.map((role) => (
            <label key={role} className="checkbox-card">
              <input type="checkbox" checked={form.roles.includes(role)} onChange={() => toggleRole(role)} disabled={isEdit} />
              <span>{role}</span>
            </label>
          ))}
        </div>
        {isEdit ? <p className="helper-text">Role changes are managed on the RBAC page. The checkboxes below are read-only here.</p> : null}
      </div>

      <div className="full-span actions-row">
        <button type="button" className="btn btn-secondary" onClick={() => router.push("/admin/users")}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>{isSubmitting ? "Saving..." : title}</button>
      </div>
    </form>
  );
}
