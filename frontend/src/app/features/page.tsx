"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import Logo from "../../components/Logo";
import Icons8Icon from "../../components/Icons8Icon";

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState("ats");

  const features = [
    {
      id: "ats",
      title: "ATS Compatibility Scan",
      subtitle: "Pass through HR screening systems effortlessly",
      icon: <Icons8Icon name="shield" size={24} />,
      description: "Applicant Tracking Systems (ATS) reject over 75% of resumes before a human recruiter even sees them. Our advanced scanner parses your formatting, headings, contact info, and structural keywords to guarantee compliance with top systems like Workday, Greenhouse, and Lever.",
      bullets: [
        "Checks section heading structures and hierarchy",
        "Scans for ATS-friendly fonts and formatting patterns",
        "Identifies missing contact info, social links, or key headers",
        "Recommends keyword injection based on targeted roles"
      ],
      color: "from-blue-50 to-indigo-50/30",
    },
    {
      id: "github",
      title: "GitHub Contribution Analyzer",
      subtitle: "Verify open-source impact & skill set",
      icon: <Icons8Icon name="code" size={24} />,
      description: "Recruiters want evidence of coding capability. By pasting your GitHub links, our system fetches repository size, star counts, commit activity, and language distributions to rate your technical output and public contributions.",
      bullets: [
        "Evaluates repository maturity, stars, and forks",
        "Analyzes codebase contribution graph and consistency",
        "Verifies language fluency based on actual code bytes",
        "Detects production-ready public packages or libraries"
      ],
      color: "from-purple-50 to-pink-50/30",
    },
    {
      id: "production",
      title: "Production-Ready Audits",
      subtitle: "Rate your hosted application standards",
      icon: <Icons8Icon name="layout" size={24} />,
      description: "Did you just build a local sandbox, or did you deploy a real product? We scan your project URLs to verify live hosting (Vercel, AWS, Netlify), check SSL certificate status, measure domain authority, and audit frontend performance/lighthouse stats.",
      bullets: [
        "Verifies deployment status on live servers",
        "Audits responsive layouts and asset optimization",
        "Evaluates custom domain usage and security compliance",
        "Verifies database or backend integration completeness"
      ],
      color: "from-emerald-50 to-teal-50/30",
    },
    {
      id: "suggestions",
      title: "Actionable Feedback",
      subtitle: "Detailed roadmap to secure more interviews",
      icon: <Icons8Icon name="sparkles" size={24} />,
      description: "A score is only useful if you know how to improve it. Our LLM-powered feedback engine breaks down your resume's weaknesses into clear, bite-sized checklists so you can immediately rewrite description bullets and update tech stacks.",
      bullets: [
        "Generates tailored action items to rewrite bullet points",
        "Provides precise keyword recommendations for target roles",
        "Scores section by section: Experience, Projects, Skills",
        "Recommends code refactoring and project improvements"
      ],
      color: "from-amber-50 to-orange-50/30",
    }
  ];

  const currentFeature = features.find(f => f.id === activeTab) || features[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-transparent -z-10 rounded-full blur-3xl" />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="hover:opacity-90 transition-opacity">
            <Logo />
          </Link>
          <div className="flex items-center gap-6">
            <nav className="flex gap-6 text-sm font-medium text-slate-600">
              <Link href="/features" className="text-blue-600 hover:text-blue-600 transition-colors">Features</Link>
            </nav>
            <div className="h-4 w-[1px] bg-slate-200" />
            <Link 
              href="/"
              className="text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 px-4 py-1.5 rounded-xl transition-all shadow-md shadow-blue-500/20 active:scale-95 animate-pulse"
            >
              Analyze Now
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-4 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full border border-blue-200 uppercase tracking-wider">
            Features & Capabilities
          </span>
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl md:text-5xl font-extrabold mt-5 mb-5 tracking-tight text-slate-900"
        >
          What does AtsRank analyze?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg text-slate-650 max-w-2xl mx-auto leading-relaxed"
        >
          We go beyond simple keyword-matching. Our platform runs code verification, live deployment audits, and ATS-compatibility pipelines to build a realistic picture of your talent.
        </motion.p>
      </section>

      {/* Interactive Tabs Section */}
      <section className="max-w-6xl mx-auto px-4 pb-24">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Tab Selector */}
          <div className="lg:col-span-5 space-y-3">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveTab(feature.id)}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex gap-4 items-center ${
                  activeTab === feature.id 
                    ? "bg-white border-blue-500 shadow-md shadow-blue-500/5" 
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">{feature.title}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{feature.subtitle}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Active Tab Showcase Card */}
          <div className="lg:col-span-7">
            <motion.div
              key={currentFeature.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200/80 rounded-3xl p-8 md:p-10 relative overflow-hidden shadow-xl shadow-slate-200/50"
            >
              <div className={`absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br ${currentFeature.color} rounded-full blur-[80px] -z-10`} />
              
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                  {currentFeature.icon}
                </div>
                <div>
                  <span className="text-xs text-blue-600 font-bold uppercase tracking-wider">Module Spotlight</span>
                  <h3 className="text-2xl font-extrabold text-slate-900 mt-0.5">{currentFeature.title}</h3>
                </div>
              </div>

              <p className="text-slate-700 leading-relaxed mb-8 text-base">
                {currentFeature.description}
              </p>

              <div className="border-t border-slate-100 pt-8">
                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4">Key Audits Performed:</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {currentFeature.bullets.map((bullet, idx) => (
                    <div key={idx} className="flex gap-3 text-sm text-slate-700 items-start">
                      <Icons8Icon name="check" size={20} className="shrink-0 mt-0.5" />
                      <span>{bullet}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing / CTA Section */}
      <section className="bg-slate-100/55 border-y border-slate-200 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_800px_at_center,rgba(59,130,246,0.03),transparent)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Ready to test your resume?</h3>
          <p className="text-slate-650 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of developers grading their projects, repositories, and resume formats before applying to remote jobs.
          </p>
            <Link 
              href="/"
              className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 inline-flex items-center justify-center gap-2"
            >
              Start Free Scan
              <Icons8Icon name="chevron-right" size={20} className="brightness-0 invert" />
            </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo className="h-6 w-auto" />
          <p className="text-slate-500 text-xs">
            © {new Date().getFullYear()} AtsRank. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/features" className="hover:text-blue-600 transition-colors">Features</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
