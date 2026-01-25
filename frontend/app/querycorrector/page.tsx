"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Copy,
  Check,
  Loader2,
  PanelLeftClose,
  PanelLeft,
  X,
  HomeIcon,
  Plus,
  History,
  ArrowRight,
  Menu,
  Sparkles,
  Lock,
  ShieldCheck,
  Terminal,
  LayoutDashboard,
  LogOut,
  User,
  CheckCircle2,
} from "lucide-react";
import { useHistory } from "@/components/hooks/useHistory";

// --- REMOVED THE TOP-LEVEL searchParams CALL HERE ---

// Helper for conditional classes
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

const GUEST_LIMIT = 2;

function QueryCorrectorContent({ isPro: initialIsPro }: { isPro?: boolean }) {
  // --- 1. MOVED HOOK INSIDE THE COMPONENT ---
  const searchParams = useSearchParams();

  // --- 2. AUTH & STORE HOOKS ---
  const { user, logout } = useAuthStore();

  // Determine Pro status: True if passed as prop OR if user is logged in
  const isPro = initialIsPro || !!user;

  const {
    history,
    dbHistory,
    setDbHistory,
    addToHistory,
    removeHistoryItem,
    clearHistory,
    isLoaded,
  } = useHistory();

  // --- 3. STATE ---
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<{
    original: string;
    corrected: string;
    type: string;
    changes_made: string[];
    risk_level: string;
    confidence?: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done">(
    "idle",
  );

  // Optional: Handle URL params if you want to support ?prompt=...
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setInput(prompt);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchDbHistory = async () => {
      if (user && isLoaded) {
        try {
          const res = await fetch("/api/corrected_queries/get");
          const data = await res.json();
          setDbHistory(data.reverse()); // latest first
        } catch (err) {
          console.error("Failed to fetch DB history", err);
        }
      }
    };
    fetchDbHistory();
  }, [user, isLoaded]);

  // --- 4. SYNC LOGIC ---
  useEffect(() => {
    const syncGuestData = async () => {
      if (user && isLoaded && history.length > 0 && syncStatus === "idle") {
        setSyncStatus("syncing");
        try {
          console.log("User logged in. Syncing guest data...");
          await fetch("/api/queries/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guestHistory: history }),
          });
          clearHistory();
          setSyncStatus("done");
          setTimeout(() => setSyncStatus("idle"), 3000);
        } catch (error) {
          console.error("Sync failed", error);
          setSyncStatus("idle");
        }
      }
    };
    syncGuestData();
  }, [user, history, isLoaded, clearHistory, syncStatus]);

  // --- 5. HANDLERS ---
  const handleLogout = async () => {
    await logout();
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;

    if (!isPro && history.length >= GUEST_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);
    setOutput(null);

    try {
      const response = await fetch(
        "https://justanothergptwrapper-ak03.onrender.com/correctquery",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql_query: input }),
        },
      );

      if (!response.ok) throw new Error("Failed to fetch corrected query");

      const rawData = await response.json();

      const processedData = {
        original: rawData.original_query || rawData.original || input,
        corrected:
          rawData.corrected_query ||
          rawData.corrected ||
          "-- No correction returned --",
        type: rawData.type || "Unknown",
        changes_made: rawData.changes_made || [],
        risk_level: rawData.risk_level || "low",
        confidence: rawData.confidence || 0,
      };

      if (isPro) {
        try {
          await fetch("/api/corrected_queries/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              original_query: processedData.original,
              corrected_query: processedData.corrected,
              type: processedData.type,
              risk_level: processedData.risk_level,
              confidence: processedData.confidence,
              changes_made: processedData.changes_made,
            }),
          });
          addToHistory(
            input,
            "CORRECT",
            processedData.corrected,
            undefined,
            processedData,
          );
        } catch (saveError) {
          console.error("Failed to save query to DB", saveError);
        }
      } else {
        if (history.length < GUEST_LIMIT) {
          addToHistory(
            input,
            "CORRECT",
            processedData.corrected,
            undefined,
            processedData,
          );
        } else {
          setShowLimitModal(true);
        }
      }

      setOutput(processedData);
    } catch (err) {
      console.error(err);
      setOutput({
        original: input,
        corrected: "-- Error connecting to server --",
        type: "error",
        changes_made: ["Connection Failed"],
        risk_level: "critical",
      });
    } finally {
      setLoading(false);
    }
  };

  const mergedHistory = [...dbHistory, ...history];

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden relative">
      {/* --- SIDEBAR --- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:z-auto",
          sidebarOpen
            ? "translate-x-0 shadow-2xl lg:shadow-none w-80"
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden",
        )}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span>SQL Corrector</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="hidden lg:block text-slate-400 hover:text-slate-600 transition-colors"
            title="Collapse Sidebar"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <button
            onClick={() => {
              setInput("");
              setOutput(null);
            }}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white px-4 py-3 rounded-xl font-medium shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" /> New Query
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          <div>
            <div className="flex items-center gap-2 px-3 mb-2 text-xs font-semibold uppercase text-slate-400 tracking-wider">
              <History className="w-3 h-3" />
              {isPro ? "History" : `History (${history.length}/${GUEST_LIMIT})`}
            </div>

            <div className="space-y-1">
              {/* --- FIX: Use mergedHistory.length instead of History.length --- */}
              {mergedHistory.length === 0 && (
                <div className="px-3 py-4 text-center text-sm text-slate-400 italic">
                  No queries yet.
                </div>
              )}
              {mergedHistory.map((item: any) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setInput(item.original_query);
                    setOutput({
                      original: item.original_query,
                      corrected: item.corrected_query,
                      type: item.type || "Unknown",
                      changes_made: item.changes_made || [],
                      risk_level: item.risk_level || "low",
                      confidence: item.confidence || 0,
                    });
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className="group flex flex-col p-3 rounded-lg border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start w-full">
                    <p className="truncate text-sm font-medium text-slate-700 w-11/12">
                      {item.original_query}
                    </p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeHistoryItem(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1">
                    {new Date(item.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xs z-20 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* --- DYNAMIC AUTH HEADER --- */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                title="Open Sidebar"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              // LOGGED IN STATE
              <>
                <div className="flex items-center gap-2 text-sm text-slate-700 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                  <Link
                    href="/"
                    className="text-sm flex gap-2 items-center font-medium   text-black px-1 py-2 rounded-full  transition-colors"
                  >
                    <HomeIcon className="w-4 h-4" /> Home
                  </Link>
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="font-medium max-w-[100px] truncate">
                    {user.full_name || "User"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </>
            ) : (
              // GUEST STATE
              <>
                <span className="hidden md:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 mr-2">
                  Guest Mode ({history.length}/{GUEST_LIMIT})
                </span>
                <Link
                  href="/auth/signin"
                  className="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 w-full min-w-0">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Input Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-medium text-slate-600">
                  Input SQL
                </span>
              </div>
              <div className="p-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="SELECT * FROM users WHERE..."
                  className="w-full h-32 md:h-40 p-4 bg-transparent border-none focus:ring-0 text-sm md:text-base font-mono text-slate-700 placeholder:text-slate-300 resize-none outline-none"
                />
              </div>
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={loading || !input}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm shadow-indigo-200"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {loading ? "Optimizing..." : "Fix & Optimize"}
                </button>
              </div>
            </div>

            {/* Results Section */}
            {output && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Metrics Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-xs text-slate-400 font-medium uppercase">
                      Risk Level
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className={cn(
                          "px-2 py-0.5 rounded text-xs font-bold border capitalize",
                          getRiskColor(output.risk_level),
                        )}
                      >
                        {output.risk_level}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-xs text-slate-400 font-medium uppercase">
                      Type
                    </span>
                    <span className="text-sm font-semibold text-slate-700 capitalize mt-1 truncate">
                      {output.type.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-xs text-slate-400 font-medium uppercase">
                      Confidence
                    </span>
                    <span className="text-sm font-semibold text-slate-700 mt-1">
                      {output.confidence
                        ? `${(output.confidence * 100).toFixed(0)}%`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <span className="text-xs text-slate-400 font-medium uppercase">
                      Changes
                    </span>
                    <span className="text-sm font-semibold text-slate-700 mt-1">
                      {output.changes_made.length} Applied
                    </span>
                  </div>
                </div>

                {/* Code Comparison */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Original */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">
                      Before
                    </span>
                    <div className="relative rounded-xl overflow-hidden bg-[#1e1e1e] shadow-lg border border-slate-800 ring-1 ring-white/10 group">
                      <div className="absolute top-3 right-3 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() =>
                            copyToClipboard(output.original, "original")
                          }
                          className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md text-white/70 hover:text-white"
                        >
                          {copiedKey === "original" ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        language="sql"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: "1rem",
                          background: "transparent",
                          fontSize: "0.8rem",
                          lineHeight: "1.5",
                          wordBreak: "break-word", // Break long words if needed
                          whiteSpace: "pre-wrap", // Wrap text naturally
                        }}
                        codeTagProps={{
                          style: {
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          },
                        }}
                        wrapLines={true}
                      >
                        {output.original}
                      </SyntaxHighlighter>
                    </div>
                  </div>

                  {/* Corrected */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider ml-1 flex items-center gap-2">
                      After <ArrowRight className="w-3 h-3" />
                    </span>
                    <div className="relative rounded-xl overflow-hidden bg-[#1e1e1e] shadow-lg shadow-indigo-500/10 border border-indigo-500/30 group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500  opacity-50"></div>
                      <div className="absolute top-3 right-3 opacity-100 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={() =>
                            copyToClipboard(output.corrected, "corrected")
                          }
                          className="flex items-center gap-1.5 px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-md text-xs font-medium transition-colors shadow-lg"
                        >
                          {copiedKey === "corrected" ? (
                            <Check className="w-3.5 h-3.5" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedKey === "corrected" ? "Copied" : ""}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        language="sql"
                        style={vscDarkPlus}
                        customStyle={{
                          margin: 0,
                          padding: "1.5rem",
                          background: "transparent",
                          fontSize: "0.85rem",
                          lineHeight: "1.5",
                          wordBreak: "break-word", // Break long words if needed
                          whiteSpace: "pre-wrap", // Wrap text naturally
                        }}
                        codeTagProps={{
                          style: {
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          },
                        }}
                        wrapLines={true}
                      >
                        {output.corrected}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>

                {/* Change Log */}
                {output.changes_made.length > 0 && (
                  <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                    <h4 className="text-sm font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> Corrections made :
                    </h4>
                    <ul className="space-y-1">
                      {output.changes_made.map((change, i) => (
                        <li
                          key={i}
                          className="text-sm text-indigo-700 flex items-start gap-2"
                        >
                          <span className="mt-1.5 w-1 h-1 bg-indigo-400 rounded-full" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- SYNC TOAST --- */}
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

      {/* --- LIMIT MODAL --- */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Guest Limit Reached
            </h3>
            <p className="text-slate-500 mt-2 text-sm">
              You've reached the free limit of {GUEST_LIMIT} queries. Sign in to
              continue correcting queries.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/auth/signin"
                className="bg-indigo-600 text-white py-2.5 rounded-xl font-medium hover:bg-indigo-700 block w-full"
              >
                Sign In / Sign Up
              </Link>
              <button
                onClick={() => setShowLimitModal(false)}
                className="text-slate-500 text-sm hover:text-slate-800 py-2"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QueryCorrectorPage(props: any) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <QueryCorrectorContent {...props} />
    </Suspense>
  );
}
