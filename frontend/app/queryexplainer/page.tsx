"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";
import { useAuthStore } from "@/lib/store/useAuthStore";
import { useHistory } from "@/components/hooks/useHistory";
import {
  Loader2,
  PanelLeftClose,
  PanelLeft,
  X,
  History,
  Database,
  Filter,
  GitMerge,
  Calculator,
  FileOutput,
  AlertTriangle,
  CheckCircle2,
  Lock,
  LogOut,
  Table,
  Boxes,
} from "lucide-react";

// --- Types based on your JSON structure ---
interface ExplainResponse {
  summary: {
    purpose: string;
    complexity_level: string;
  };
  detailed_analysis: {
    tables_involved: string[];
    filters_applied: string[];
    joins: string[];
    aggregation: {
      grouping_criteria: string;
      metrics_calculated: string;
    };
    final_output: string;
  };
  risks_and_notes: string[];
}

// --- Helper Utilities ---
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}

const GUEST_LIMIT = 2;

function QueryExplainerContent({ isPro: initialIsPro }: { isPro?: boolean }) {
  // --- 1. AUTH & STORE ---
  const { user, logout } = useAuthStore();
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

  // --- 2. STATE ---
  const [input, setInput] = useState("");
  const [result, setResult] = useState<ExplainResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);

  const searchParams = useSearchParams();

  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt) {
      setInput(prompt);
      // Optional: trigger the API call automatically if prompt exists
    }
  }, [searchParams]);

  // Sync Status State
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "done">(
    "idle",
  );

  // --- 3. SYNC & FETCH LOGIC (RESTORED) ---
  useEffect(() => {
    const syncAndFetchStrategy = async () => {
      // Exit if user is not logged in or app hasn't hydrated yet
      if (!user || !isLoaded) return;

      // A. SYNC STRATEGY: If guest history exists, sync it first
      if (history.length > 0 && syncStatus === "idle") {
        setSyncStatus("syncing");
        try {
          console.log("User logged in with guest history. Syncing...");

          // 1. Send local history to backend
          await fetch("/explained_queries/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ guestHistory: history }),
          });

          // 2. Clear local storage immediately so we don't duplicate
          clearHistory();
          setSyncStatus("done");
          setTimeout(() => setSyncStatus("idle"), 3000);
        } catch (error) {
          console.error("Sync failed", error);
          setSyncStatus("idle");
        }
      }

      // B. FETCH STRATEGY: Always fetch fresh DB data when logged in
      try {
        if (syncStatus !== "syncing") {
          const res = await fetch("/explained_queries/get");
          if (res.ok) {
            const data = await res.json();
            // Ensure we handle the response correctly (array vs object)
            setDbHistory(Array.isArray(data) ? data : []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch DB history", err);
      }
    };

    syncAndFetchStrategy();
  }, [user, syncStatus]);

  // --- 4. HANDLERS ---
  const handleLogout = async () => {
    await logout();
    setDbHistory([]); // Clear DB history visually on logout
  };

  const handleExplain = async () => {
    if (!input.trim()) return;

    // --- GUEST LIMIT CHECK ---
    if (!isPro && history.length >= GUEST_LIMIT) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Call the FastAPI endpoint
      const response = await fetch(
        "https://justanothergptwrapper-ak03.onrender.com/explainquery",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sql_query: input }),
        },
      );

      if (!response.ok) throw new Error("Failed to explain query");

      const data: ExplainResponse = await response.json();
      setResult(data);

      // Save to database if user is signed in
      if (isPro) {
        try {
          await fetch("/explained_queries/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              original_query: input,
              explanation: data,
            }),
          });
        } catch (saveError) {
          console.error("Failed to save explained query to DB", saveError);
        }
      }

      // Always add to history state for immediate feedback
      addToHistory(
        input,
        "EXPLAIN",
        data.summary.purpose,
        undefined,
        data,
        isPro,
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- 5. UI COMPONENTS ---

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden relative selection:bg-indigo-100 selection:text-indigo-900">
      {/* --- SIDEBAR --- */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:relative lg:z-auto",
          sidebarOpen
            ? "translate-x-0 shadow-2xl lg:shadow-none w-80"
            : "-translate-x-full lg:translate-x-0 lg:w-0 lg:overflow-hidden",
        )}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2 font-bold text-slate-800 text-lg">
            <span>
              Query<span className="text-black/80"> Explainer</span>
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="hidden lg:block text-slate-400 hover:text-slate-600"
          >
            <PanelLeftClose className="w-5 h-5" />
          </button>
        </div>

        {/* New Query Button */}
        <div className="p-6">
          <button
            onClick={() => {
              setInput("");
              setResult(null);
            }}
            className="w-full flex items-center justify-center gap-2 bg-blue-800 text-white px-4 py-3 rounded-bl-2xl rounded-tr-2xl font-medium shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
          >
            New Explanation
          </button>

          {/* Guest Limit Indicator */}
          {!isPro && isLoaded && (
            <div className="mt-4 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 flex justify-between items-center">
              <span className="text-xs font-semibold text-slate-500">
                Guest Usage
              </span>
              <span
                className={cn(
                  "text-xs font-bold",
                  history.length >= GUEST_LIMIT
                    ? "text-red-600"
                    : "text-slate-700",
                )}
              >
                {history.length} / {GUEST_LIMIT}
              </span>
            </div>
          )}
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="flex items-center gap-2 px-3 mb-3 text-xs font-bold uppercase text-slate-400 tracking-wider">
            <History className="w-3 h-3" /> Recent Queries
          </div>
          <div className="space-y-1">
            {[...dbHistory, ...history].map((item: any) => (
              <div key={item.id} className="relative group flex items-center">
                <button
                  onClick={async () => {
                    setInput(item.original_query || item.query);
                    setResult(null);

                    // 1. Try Local Data First
                    if (item.processedData) {
                      setResult(item.processedData);
                    }
                    // 2. Fallback: Fetch from API
                    else {
                      try {
                        const res = await fetch(
                          `/explained_queries/get?id=${item.id}`,
                        );
                        if (res.ok) {
                          const data = await res.json();

                          // --- FIX: Handle Array vs Object Response ---
                          if (Array.isArray(data)) {
                            // If API returns list, find the specific item
                            const found = data.find(
                              (x: any) => x.id === item.id,
                            );
                            // Use 'processedData' or 'explanation' depending on what API sends
                            setResult(
                              found
                                ? found.processedData || found.explanation
                                : null,
                            );
                          } else {
                            // If API returns single object
                            setResult(
                              data.processedData || data.explanation || data,
                            );
                          }
                        }
                      } catch (err) {
                        console.error("Error loading item", err);
                      }
                    }
                    if (window.innerWidth < 1024) setSidebarOpen(false);
                  }}
                  className="flex-1 text-left group p-3 rounded-lg border border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm transition-all"
                >
                  <p className="truncate text-sm font-medium text-slate-700 w-48">
                    {item.original_query || item.query}
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block ">
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeHistoryItem(item.id);
                  }}
                  className="ml-2 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded transition-opacity opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* --- OVERLAY FOR MOBILE --- */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="h-16  bg-white/80 backdrop-blur-md flex items-center justify-between px-6 z-20 sticky top-0">
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <PanelLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-lg font-bold text-black hidden md:block">
              {user
                ? `Welcome back, ${user.full_name}`
                : "Get your query explained"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-800">
                    {user.full_name}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-full transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-white bg-black px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </header>

        {/* Scrollable Workspace */}
        <div className="flex-1 overflow-y-auto p-4 bg-white md:p-8 w-full">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* 1. INPUT CARD */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-300">
              <div className="p-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <Database className="w-4 h-4" />
                  <span className="font-bold">Input SQL Query</span>
                </div>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Paste your complex SQL query here to analyze..."
                className="w-full h-32 p-5 bg-transparent border-none focus:ring-0 text-sm font-mono text-slate-700 placeholder:text-slate-300 resize-none outline-none leading-relaxed"
                spellCheck={false}
              />
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button
                  onClick={handleExplain}
                  disabled={loading || !input}
                  className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-200"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {loading ? "Analyzing..." : "Explain Logic"}
                </button>
              </div>
            </div>

            {/* 2. RESULTS DASHBOARD */}
            {result && result.summary && (
              <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
                {/* A. Summary Header Card */}
                <div className="bg-linear-to-t from-slate-900 via-slate-700 to-slate-500 rounded-2xl p-6 md:p-8 text-white shadow-xl shadow-slate-300 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h2 className="text-2xl font-bold tracking-tight">
                          Query Analysis
                        </h2>
                        <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed">
                          {result.summary.purpose || "No summary available."}
                        </p>
                      </div>
                      <div className="shrink-0">
                        <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-bl-2xl rounded-tr-2xl flex flex-col items-center">
                          <span className=" uppercase font-bold tracking-wider text-white">
                            Complexity
                          </span>
                          <span className="text-lg font-bold">
                            {result.summary.complexity_level || "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* B. Detailed Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Card: Tables */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                        <Table className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-slate-800">
                        Tables Involved
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {result.detailed_analysis.tables_involved.map(
                        (table, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm text-slate-600 bg-slate-50 p-2 rounded-md border border-slate-100"
                          >
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                            {table}
                          </li>
                        ),
                      )}
                    </ul>
                  </div>

                  {/* Card: Filters */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                        <Filter className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-slate-800">
                        Filters & Logic
                      </h3>
                    </div>
                    <ul className="space-y-2">
                      {result.detailed_analysis.filters_applied.length > 0 ? (
                        result.detailed_analysis.filters_applied.map(
                          (filter, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-sm text-slate-600"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                              {filter}
                            </li>
                          ),
                        )
                      ) : (
                        <li className="text-sm text-slate-400 italic">
                          No specific filters applied.
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Card: Joins */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                        <GitMerge className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-slate-800">
                        Join Strategy
                      </h3>
                    </div>
                    <div className="space-y-3">
                      {result.detailed_analysis.joins.map((join, idx) => (
                        <div
                          key={idx}
                          className="text-sm text-slate-600 p-3 bg-violet-50/50 rounded-lg border border-violet-100"
                        >
                          {join}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card: Aggregation */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm md:col-span-2 lg:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                        <Boxes className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-slate-800">
                        Aggregation & Grouping
                      </h3>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Grouping By
                        </span>
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {
                            result.detailed_analysis.aggregation
                              .grouping_criteria
                          }
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Metrics
                        </span>
                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {
                            result.detailed_analysis.aggregation
                              .metrics_calculated
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Card: Final Output */}
                  <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 shadow-sm flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm">
                        <FileOutput className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-indigo-900">
                        Final Output
                      </h3>
                    </div>
                    <p className="text-sm text-indigo-800 leading-relaxed flex-1">
                      {result.detailed_analysis.final_output}
                    </p>
                  </div>
                </div>

                {/* C. Risks Section */}
                {result.risks_and_notes.length > 0 && (
                  <div className="bg-amber-50 rounded-2xl border border-amber-200 p-5">
                    <div className="flex items-start gap-4">
                      <div className="p-2 bg-amber-100 text-amber-700 rounded-lg mt-1">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="space-y-3 w-full">
                        <h3 className="font-semibold text-amber-900">
                          Notes & Potential Risks
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {result.risks_and_notes.map((note, idx) => (
                            <div
                              key={idx}
                              className="flex gap-2 text-sm text-amber-800 bg-white/60 p-2 rounded-md border border-amber-100/50"
                            >
                              <span className="text-amber-500 font-bold">
                                •
                              </span>
                              {note}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* --- LIMIT MODAL --- */}
      {showLimitModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">
              Guest Limit Reached
            </h3>
            <p className="text-slate-500 mt-2 text-sm">
              You've reached the free limit of {GUEST_LIMIT} queries. Sign in to
              analyze unlimited queries.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link
                href="/auth/signin"
                className="bg-blue-800 text-white py-2.5 rounded-xl font-medium hover:bg-blue-900 block w-full"
              >
                Sign In / Sign Up
              </Link>
              <button
                onClick={() => setShowLimitModal(false)}
                className="text-slate-500 text-sm hover:text-slate-800 py-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QueryExplainer(props: { isPro?: boolean }) {
  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-blue-800" />
          <span className="ml-2 font-medium">Loading Explainer...</span>
        </div>
      }
    >
      <QueryExplainerContent {...props} />
    </Suspense>
  );
}
