// src/components/dashboard/common/NotificationBell.tsx

"use client";
import { useState } from "react";
import { BellIcon } from "@heroicons/react/24/outline";
import { BellIcon as BellSolid } from "@heroicons/react/24/solid";

interface NotificationBellProps {
  notificationCount?: number;
  onClick?: () => void;
  className?: string;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notificationCount = 0,
  onClick,
  className = "",
}) => {
  const [hasNewNotifications] = useState(notificationCount > 0);

  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
    >
      {hasNewNotifications ? (
        <BellSolid className="w-6 h-6" />
      ) : (
        <BellIcon className="w-6 h-6" />
      )}

      {notificationCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {notificationCount > 9 ? "9+" : notificationCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
