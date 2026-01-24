"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
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

// --- Components ---

const ToolCard = ({
  title,
  description,

  delay,
}: {
  title: string;
  description: string;

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

    <div className="mt-6 flex items-center text-sm font-medium text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0">
      Try now <ArrowRight size={16} className="ml-2" />
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
      <section className="relative pt-16 pb-15 lg:pt-48 lg:pb-20">
        <div className="absolute inset-0 -z-10 bg-[radial-linear(ellipse_at_top,_var(--tw-linear-stops))] from-blue-900/20 via-[#05050A] to-[#05050A]" />

        <div className="mx-auto max-w-7xl px-6 text-center">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400"
          >
            Powered by Gemini 2.5
          </motion.div> */}

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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex justify-center gap-4"
          >
            {/* <button className="rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:scale-105 transition-all">
              NL To SQL
            </button>
            <button className="rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:scale-105 transition-all">
              Query Explainer
            </button>
            <button className="rounded-full bg-blue-600 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 hover:scale-105 transition-all">
              Query Corrector
            </button> */}
          </motion.div>
        </div>
      </section>

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
              <div className="absolute inset-1 rounded-lg  overflow-hidden z-10">
                {/* --- PLACE ALL YOUR VIDEO UI & CONTENT HERE --- */}

                {/* Mock Video UI */}
                <div className="absolute top-0 left-0 right-0 h-10 bg-white/5 flex items-center px-4 gap-2 border-b border-white/5 z-20 backdrop-blur-sm">
                  <div className="h-3 w-3 rounded-full bg-red-500/50" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                  <div className="h-3 w-3 rounded-full bg-green-500/50" />
                  <div className="ml-4 h-5 w-64 rounded bg-white/5" />
                </div>

                {/* Video Placeholder */}
                <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-[#0f172a] to-[#020617]">
                  <div className="text-center relative z-0">
                    {/* ... rest of your content ... */}
                  </div>
                </div>
              </div>
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
              delay={0.1}
            />
            <ToolCard
              title="Query Corrector"
              description="Have a broken query? Paste it here. We identify syntax errors, logical flaws, and schema mismatches, then auto-fix them in milliseconds."
              delay={0.2}
            />
            <ToolCard
              title="Query Explainer"
              description="Demystify complex JOINs and subqueries. Get a plain English breakdown of what any SQL snippet is actually doing to your database."
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
