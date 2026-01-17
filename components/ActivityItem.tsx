// components/ActivityItem.tsx
"use client";

import { 
  FiPlus, 
  FiUserPlus, 
  FiUserMinus, 
  FiCode, 
  FiTrash2, 
  FiSettings,
  FiMail,
  FiLogOut
} from "react-icons/fi";
import Avatar from "./Avatar";
import type { GroupActivity } from "@/lib/types/groups";

type ActivityItemProps = {
  activity: GroupActivity;
};

export default function ActivityItem({ activity }: ActivityItemProps) {
  const getActivityIcon = () => {
    switch (activity.activity_type) {
      case "group_created":
        return <FiPlus className="h-4 w-4 text-emerald-400" />;
      case "group_updated":
        return <FiSettings className="h-4 w-4 text-blue-400" />;
      case "group_deleted":
        return <FiTrash2 className="h-4 w-4 text-red-400" />;
      case "member_joined":
        return <FiUserPlus className="h-4 w-4 text-emerald-400" />;
      case "member_left":
        return <FiLogOut className="h-4 w-4 text-orange-400" />;
      case "member_invited":
        return <FiMail className="h-4 w-4 text-purple-400" />;
      case "member_removed":
        return <FiUserMinus className="h-4 w-4 text-red-400" />;
      case "snippet_shared":
        return <FiCode className="h-4 w-4 text-emerald-400" />;
      case "snippet_removed":
        return <FiTrash2 className="h-4 w-4 text-orange-400" />;
      default:
        return <FiPlus className="h-4 w-4 text-slate-400" />;
    }
  };

  const getActivityText = () => {
    const actorName = activity.actor?.profiles?.display_name || 
                      activity.actor?.profiles?.username || 
                      activity.actor?.email?.split("@")[0] || 
                      "Someone";
    
    const targetName = activity.target?.profiles?.display_name || 
                       activity.target?.profiles?.username || 
                       activity.target?.email?.split("@")[0];

    switch (activity.activity_type) {
      case "group_created":
        return (
          <>
            <span className="font-semibold text-slate-200">{actorName}</span>
            {" "}created this group
          </>
        );
      case "group_updated":
        return (
          <>
            <span className="font-semibold text-slate-200">{actorName}</span>
            {" "}updated group settings
          </>
        );
      case "group_deleted":
        return (
          <>
            <span className="font-semibold text-slate-200">{actorName}</span>
            {" "}deleted this group
          </>
        );
      case "member_joined":
        return (
          <>
            <span className="font-semibold text-slate-200">{actorName}</span>
            {" "}joined the group
          </>
        );
      case "member_left":
        return (
          <>
            <span className="font-semibold text-slate-200">{actorName}</span>
            {" "}left the group
          </>
        );
      case "member_invited":
        return (
          <>
            <span className="font-semibold text-slate-200">{actorName}</span>
            {" "}invited{" "}
            <span className="font-medium text-slate-300">
              {activity.metadata.invite_email || "someone"}
            </span>
          </>
        );
      case "member_removed":
        return (
          <>
            <span className="font-semibold text-slate-200">{actorName}</span>
            {" "}removed{" "}
            <span className="font-semibold text-slate-200">{targetName}</span>
          </>
        );
      case "snippet_shared":
        return (
          <>
            <span className="font-semibold text-slate-200">{actorName}</span>
            {" "}shared{" "}
            <span className="font-medium text-emerald-400">
              {activity.metadata.snippet_title || "a snippet"}
            </span>
            {activity.metadata.snippet_language && (
              <span className="ml-1 text-xs text-slate-500">
                ({activity.metadata.snippet_language})
              </span>
            )}
          </>
        );
      case "snippet_removed":
        return (
          <>
            <span className="font-semibold text-slate-200">{actorName}</span>
            {" "}removed{" "}
            <span className="font-medium text-slate-300">
              {activity.metadata.snippet_title || "a snippet"}
            </span>
          </>
        );
      default:
        return (
          <>
            <span className="font-semibold text-slate-200">{actorName}</span>
            {" "}performed an action
          </>
        );
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? "s" : ""} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="flex items-start gap-2 py-2 sm:gap-3 sm:py-3">
      {/* Timeline Line */}
      <div className="relative flex flex-col items-center">
        {/* Avatar */}
        <Avatar
          src={activity.actor?.profiles?.avatar_url}
          alt={activity.actor?.profiles?.display_name || "User"}
          fallbackText={activity.actor?.profiles?.display_name || activity.actor?.email}
          size="sm"
        />
        {/* Connecting Line */}
        <div className="mt-1 h-full w-px bg-white/10" />
      </div>

      {/* Content */}
      <div className="flex-1 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs text-slate-400 sm:text-sm">
            {getActivityText()}
          </p>
          <div className="flex items-center gap-2">
            {getActivityIcon()}
          </div>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          {getRelativeTime(activity.created_at)}
        </p>
      </div>
    </div>
  );
}
