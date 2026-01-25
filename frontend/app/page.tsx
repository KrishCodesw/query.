"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import {
  // ... existing imports
  Lock, // Add this
  GitMerge,
  Globe,
  Code2,
  Box,
  Layers, // Add this (or RefreshCcw)
} from "lucide-react";

import {
  Database,
  Sparkles,
  Search,
  Zap,
  ShieldCheck,
  ArrowRight,
  Terminal,
  Cpu,
} from "lucide-react";

const QuickTrialChat = () => {
  const [prompt, setPrompt] = React.useState("");
  const [activeTool, setActiveTool] = React.useState("nl2sql");

  const tools = [
    { id: "nl2sql", name: "NL2SQL", path: "/nl2sql" },
    { id: "querycorrector", name: "Corrector", path: "/querycorrector" },
    { id: "queryexplainer", name: "Explainer", path: "/queryexplainer" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="mx-auto mt-12 max-w-2xl w-full px-4"
    >
      <div className="relative rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl shadow-2xl">
        {/* Tool Selector Tabs */}
        <div className="flex gap-1 mb-2 p-1">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTool === tool.id
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              {tool.name}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="relative flex items-center">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Ask our ${activeTool} agent...`}
            className="w-full bg-transparent px-4 py-4 text-sm text-white outline-hidden placeholder:text-gray-600"
          />
          <Link
            href={`${tools.find((t) => t.id === activeTool)?.path}?prompt=${encodeURIComponent(prompt)}`}
            className="absolute right-2 p-2 rounded-xl bg-blue-600 text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
          >
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-gray-500">
        Try: "Find all users who joined in the last 30 days"
      </p>
    </motion.div>
  );
};

// --- Components ---

const ToolCard = ({
  title,
  description,
  href,
  delay,
}: {
  title: string;
  description: string;
  href: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-8 hover:border-blue-500/50 hover:bg-white/10 transition-all duration-300"
  >
    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl group-hover:bg-blue-500/30 transition-all" />

    <h3 className="mb-3 text-xl font-semibold text-white">{title}</h3>
    <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">
      {description}
    </p>

    <div className="mt-6 flex items-center text-sm font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2.5 group-hover:translate-x-0">
      <Link
        href={href}
        className="mt-6 inline-flex items-center text-sm font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2.5 group-hover:translate-x-0 cursor-pointer"
      >
        Try now <ArrowRight size={16} className="ml-2" />
      </Link>
    </div>
  </motion.div>
);

const FeatureItem = ({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: any;
}) => (
  <div className="flex flex-col p-6 rounded-2xl border border-white/5 bg-white/2 hover:bg-white/5 transition-colors">
    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
      <Icon size={20} />
    </div>
    <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
    <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
  </div>
);

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Animation Hooks
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Transform for the video container (Scale up and un-tilt)
  const rotateX = useTransform(smoothProgress, [0, 1], [45, 0]);
  const scale = useTransform(smoothProgress, [0, 1], [0.8, 1]);
  const opacity = useTransform(smoothProgress, [0, 0.5], [0.6, 1]);
  return (
    <div className="min-h-screen bg-[#05050A] text-white selection:bg-blue-500/30 overflow-x-hidden font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#05050A]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
            {/* <Database className="text-blue-500" /> */}
            GET<span className="text-blue-500">SQL</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-400">
            {/* <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#metrics" className="hover:text-white transition-colors">
              Performance
            </a>
            <a
              href="#how-it-works"
              className="hover:text-white transition-colors"
            >
              Docs
            </a> */}
          </div>
          <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-gray-200 transition-colors">
            <a href="/auth/signin"> Get Started</a>
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      {/* Hero Section */}
      <section className="relative pt-16 pb-15 lg:pt-36 lg:pb-20 overflow-hidden">
        {/* --- START BACKGROUND GRAPHICS --- */}
        <div className="absolute inset-0 -z-10">
          {/* 1. The Main Deep Blue Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/30 via-[#05050A] to-[#05050A]" />

          {/* 2. The Subtle Grid (Fades out at the bottom) */}
          <div
            className="absolute inset-0 opacity-[0.15]"
            style={{
              backgroundImage: `linear-gradient(to right, #3b82f6 1px, transparent 1px), 
                          linear-gradient(to bottom, #3b82f6 1px, transparent 1px)`,
              backgroundSize: "4rem 4rem",
              maskImage:
                "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 50% at 50% 0%, #000 70%, transparent 100%)",
            }}
          />

          {/* 3. The Animated Soft Orb */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute left-1/2 top-[-10%] -translate-x-1/2 h-[600px] w-[1000px] rounded-full bg-blue-600/10 blur-[120px]"
          />
        </div>
        {/* --- END BACKGROUND GRAPHICS --- */}

        <div className="mx-auto max-w-7xl px-6 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto p-2 max-w-4xl text-5xl font-bold tracking-tight md:text-7xl bg-clip-text text-transparent bg-linear-to-b from-white to-white/60"
          >
            Stop Hallucinating.
            <br /> Start Querying.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed"
          >
            The schema-aware SQL agent that actually understands your database
            structure. Zero friction, zero hallucinations.
          </motion.p>
        </div>
      </section>
      <QuickTrialChat />
      {/* Scroll Animated Video Section */}
      {/* IMPROVED Scroll Animated Video Section */}
      <div ref={containerRef} className="relative h-[120vh] -mb-20">
        {/* Sticky container centers the video in the viewport */}
        <div className="sticky top-0 flex h-screen items-center justify-center  overflow-hidden px-6">
          {/* Perspective wrapper is CRITICAL for 3D effect */}
          <div className="relative w-full  max-w-5xl [perspective:1000px]">
            <motion.div
              style={{
                scale,
                rotateX,
                opacity,
                transformStyle: "preserve-3d",
              }}
              // 1. Removed static borders, kept layout/shadow classes
              className="relative aspect-video w-full overflow-hidden rounded-2xl shadow-2xl shadow-blue-900/20"
            >
              {/* 2. THE RUNNING BORDER LAYER: Spins behind the content */}
              <div className="absolute inset-[-50%] bg-[conic-gradient(from_0deg,#f59e0b,#ef4444,#8b5cf6,#3b82f6,#10b981,#f59e0b)] animate-[spin_2s_linear_infinite]" />

              {/* 3. THE CONTENT LAYER: Creates the "mask" with inset-1 (4px thickness) */}
              {/* <div className="absolute inset-1 rounded-lg  overflow-hidden z-10"> */}
              {/* --- PLACE ALL YOUR VIDEO UI & CONTENT HERE --- */}

              {/* Mock Video UI */}

              {/* Video Placeholder */}
              <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-[#0f172a] to-[#020617]">
                <div className="text-center relative z-0">
                  {/* ... rest of your content ... */}
                  <video
                    src="/master.mp4"
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-cover" // Optional: Ensures it fills the space
                  />
                </div>
              </div>
              {/* </div> */}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Tools Orchestration Section */}
      <section className="py-24 bg-[#05050A]">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Convert • Correct • Explain
            </h2>
            {/* <p className="mt-4 text-gray-400">
              Everything you need to interact with your data, orchestrated into
              one seamless workflow.
            </p> */}
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <ToolCard
              title="NL2SQL Generator"
              description="Transforms natural language into precise SQL queries. It doesn't just guess; it reads your schema to ensure valid table and column references every time."
              href="/nl2sql"
              delay={0.1}
            />
            <ToolCard
              title="Query Corrector"
              description="Have a broken query? Paste it here. We identify syntax errors, logical flaws, and schema mismatches, then auto-fix them in milliseconds."
              href="/querycorrector"
              delay={0.2}
            />
            <ToolCard
              title="Query Explainer"
              description="Demystify complex JOINs and subqueries. Get a plain English breakdown of what any SQL snippet is actually doing to your database."
              href="/queryexplainer"
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Metrics / 
      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#05050A] py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-gray-500 text-sm">
          <p>&copy; devPals</p>
        </div>
      </footer>
    </div>
  );
}
