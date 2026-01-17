// components/ActivityFeed.tsx
"use client";

import { useState, useEffect } from "react";
import { FiActivity, FiLoader } from "react-icons/fi";
import { supabase } from "@/lib/supabase-client";
import ActivityItem from "./ActivityItem";
import type { GroupActivity } from "@/lib/types/groups";

type ActivityFeedProps = {
  groupId: string;
};

export default function ActivityFeed({ groupId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<GroupActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [groupId]);

  const fetchActivities = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the current session token
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(`/api/groups/${groupId}/activities`, {
        credentials: "include",
        headers: {
          ...(session?.access_token && {
            "Authorization": `Bearer ${session.access_token}`
          })
        }
      });

      const data = await response.json();
      
      if (response.ok) {
        setActivities(data.activities || []);
      } else {
        setError(data.error || "Failed to load activities");
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
      setError("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <FiLoader className="h-6 w-6 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-white/10 bg-white/5 py-12">
        <FiActivity className="mb-3 h-10 w-10 text-slate-600" />
        <h3 className="mb-1 text-sm font-semibold text-slate-300">
          No activity yet
        </h3>
        <p className="text-xs text-slate-500">
          Group activities will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <FiActivity className="h-4 w-4" />
          Activity Feed
        </h3>
        <span className="text-xs text-slate-500">
          {activities.length} {activities.length === 1 ? "activity" : "activities"}
        </span>
      </div>

      {/* Activities List */}
      <div className="relative">
        {activities.map((activity, index) => (
          <div key={activity.id}>
            <ActivityItem activity={activity} />
            {/* Remove line from last item */}
            {index === activities.length - 1 && (
              <div className="absolute bottom-0 left-4 h-3 w-px bg-gradient-to-b from-white/10 to-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
