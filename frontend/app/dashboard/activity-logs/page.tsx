"use client";

import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, isAdmin, isStaff, logout } = useAuth();

  return (
    <div>
      <h1>Welcome, {user?.name}</h1>
      {isAdmin() && <p>You have admin privileges.</p>}
      {isStaff() && <p>You are a staff member.</p>}

      <button onClick={logout}>Logout</button>
    </div>
  );
}
