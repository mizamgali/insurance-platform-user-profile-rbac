"use client";

import { useState, type FormEvent } from "react";
import type { UserProfile } from "@/types/user";
import Alert from "@/components/feedback/Alert";

interface ProfileFormProps {
  initialValue: UserProfile;
  onSubmit: (payload: Partial<UserProfile>) => Promise<void>;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export default function ProfileForm({ initialValue, onSubmit }: ProfileFormProps) {
  const [form, setForm] = useState<Partial<UserProfile>>(initialValue);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validate(): boolean {
    const nextErrors: FormErrors = {};
    if (!form.firstName?.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName?.trim()) nextErrors.lastName = "Last name is required.";
    if (!form.email?.trim()) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    if (!validate()) return;

    try {
      setIsSubmitting(true);
      await onSubmit(form);
      setMessage("Profile updated successfully.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      {message ? <div className="full-span"><Alert variant="success" message={message} /></div> : null}

      <div>
        <label>First Name</label>
        <input value={form.firstName ?? ""} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
        {errors.firstName ? <p className="field-error">{errors.firstName}</p> : null}
      </div>

      <div>
        <label>Last Name</label>
        <input value={form.lastName ?? ""} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
        {errors.lastName ? <p className="field-error">{errors.lastName}</p> : null}
      </div>

      <div>
        <label>Email</label>
        <input value={form.email ?? ""} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        {errors.email ? <p className="field-error">{errors.email}</p> : null}
      </div>

      <div>
        <label>Phone</label>
        <input value={form.phone ?? ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </div>

      <div>
        <label>City</label>
        <input value={form.city ?? ""} onChange={(e) => setForm({ ...form, city: e.target.value })} />
      </div>

      <div>
        <label>Country</label>
        <input value={form.country ?? ""} onChange={(e) => setForm({ ...form, country: e.target.value })} />
      </div>

      <div>
        <label>Roles</label>
        <input value={initialValue.userType ? "Locked by system" : "Locked by system"} disabled />
      </div>

      <div>
        <label>Account Status</label>
        <input value="Read-only" disabled />
      </div>

      <div className="full-span actions-row">
        <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save profile changes"}
        </button>
      </div>
    </form>
  );
}
