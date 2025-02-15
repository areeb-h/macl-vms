"use client";

import { useEffect } from "react";
import { useDashboardStore } from "@/lib/store/dashboard";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  Hourglass,
  Calendar,
  Plane,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useVisitorStore } from "@/lib/store/visitor";

export default function Dashboard() {
  const { stats, loading, error, fetchStats, lastUpdated } =
    useDashboardStore();
  const { visitors } = useVisitorStore(); // ✅ Re-fetch when visitors update
  const { user, isAdmin, isStaff, logout } = useAuth();

  useEffect(() => {
    fetchStats(); // ✅ Re-fetch stats when visitors change
  }, [visitors.length]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-500">
              <AlertTriangle />
              <p>Failed to load statistics: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      {/* <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome Back {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Airport Visitor Management System Overview
        </p>
      </div> */}

      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome Back {user?.name}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Airport Visitor Management System Overview
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Visitors
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_visitors}</div>
            <p className="text-xs text-muted-foreground">
              All time visitor count
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked-in</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.checked_in_visitors}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently in premises
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Hourglass className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pending_visitors}</div>
            <p className="text-xs text-muted-foreground">Awaiting check-in</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Today's Visitors
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {/* <div className="text-2xl font-bold">{stats?.visitors_today}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.floor(stats?.visitors_today * 0.1)} from yesterday
            </p> */}

            <div className="text-2xl font-bold">
              {stats?.visitors_today ?? "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats?.visitors_today !== undefined
                ? `+${Math.floor(stats.visitors_today * 0.1)} from yesterday`
                : "Data unavailable"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Nationality Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plane className="h-4 w-4" />
              Visitors by Nationality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.visitors_by_nationality}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nationality" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#93c5fd" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Nationality Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.visitors_by_nationality.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                    <span className="text-sm font-medium">
                      {item.nationality}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{item.count} visitors</span>
                    <span className="text-xs text-muted-foreground">
                      {Math.round((item.count / stats.total_visitors) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
