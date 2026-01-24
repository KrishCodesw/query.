"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useHistory } from "@/components/hooks/useHistory";
import HeroSection from "@/components/ui/Hero";
import { LogOut, User, CheckCircle2, HomeIcon } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { user, logout } = useAuthStore();
  const { history: localHistory, clearHistory, isLoaded } = useHistory();
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done">(
    "idle",
  );

  // --- 1. THE SYNC LOGIC (Moved from Dashboard) ---
  useEffect(() => {
    const syncGuestData = async () => {
      if (
        user &&
        isLoaded &&
        localHistory.length > 0 &&
        syncStatus === "idle"
      ) {
        setSyncStatus("syncing");
        try {
          console.log("User logged in at Home. Syncing guest data...");

          await fetch("/api/queries/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // We send the local history to the backend to merge/add
            body: JSON.stringify({ guestHistory: localHistory }),
          });

          // Clear local storage after success
          clearHistory();
          setSyncStatus("done");

          // Reset status after a delay so the toast disappears
          setTimeout(() => setSyncStatus("idle"), 3000);
        } catch (error) {
          console.error("Sync failed", error);
          setSyncStatus("idle");
        }
      }
    };

    syncGuestData();
  }, [user, localHistory, isLoaded, clearHistory, syncStatus]);

  // --- 2. HEADER LOGIC ---
  const handleLogout = async () => {
    await logout();
    // No need to redirect, just stay on home, page re-renders as Guest
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* HEADER: Changes based on Auth State */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-white bg-white z-20 ">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-2xl text-gray-800">GETSQL</span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm flex gap-2 items-center font-medium bg-gray-100  text-black px-4 py-2 rounded-full  transition-colors"
          >
            <HomeIcon className="w-4 h-4" /> Home
          </Link>
          {user ? (
            // LOGGED IN VIEW
            <>
              <div className="flex items-center gap-2 text-sm text-black px-3 py-1.5 bg-gray-100 rounded-full">
                <User className="w-4 h-4" />
                <span className="font-medium">{user.full_name || "User"}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            // GUEST VIEW
            <Link
              href="/auth/signin"
              className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* SYNC TOAST (Only shows when syncing happens) */}
      {syncStatus !== "idle" && (
        <div className="absolute top-20 right-6 z-50 animate-in slide-in-from-right fade-in duration-300">
          <div className="bg-black text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-3 text-sm">
            {syncStatus === "syncing" ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Syncing your guest history...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                <span>History saved to account!</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden relative">
        {/* CRITICAL: We pass !!user (boolean). 
            If user exists -> isPro={true} -> Unlimited Queries 
            If user null -> isPro={false} -> 2 Query Limit
        */}
        <HeroSection isPro={!!user} />
      </div>
    </div>
  );
}
