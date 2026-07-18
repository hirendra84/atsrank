"use client";

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Logo from "../components/Logo";
import Icons8Icon from "../components/Icons8Icon";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scansRemaining, setScansRemaining] = useState<number | null>(null);
  
  // Progress state
  const [progress, setProgress] = useState(0);
  const [analyzingText, setAnalyzingText] = useState("Initializing...");
  
  // FAQ state
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const logoutHandler = () => {
      setFile(null);
      setResults(null);
    };
    window.addEventListener("userLoggedOut", logoutHandler);
    return () => window.removeEventListener("userLoggedOut", logoutHandler);
  }, []);

  const fToken = (token: string) => `Bearer ${token}`;


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Please upload a PDF file.");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    // Force authentication
    const token = localStorage.getItem("atsrank_token");
    if (!token) {
      window.dispatchEvent(new Event("openAuthModal"));
      return;
    }

    if (!file) return;
    setLoading(true);
    setProgress(0);
    setError(null);
    setResults(null);
    setAnalyzingText("Uploading document...");

    // Start progress simulation (assumes ~8 seconds for analysis)
    const estimatedTimeMs = 8000;
    const intervalMs = 100;
    const increment = 95 / (estimatedTimeMs / intervalMs); // reach 95% in estimated time

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 20) setAnalyzingText("Parsing PDF structure...");
        else if (prev < 50) setAnalyzingText("Evaluating ATS compliance...");
        else if (prev < 80) setAnalyzingText("Analyzing technical skills...");
        else setAnalyzingText("Finalizing score...");

        const next = prev + increment;
        return next > 95 ? 95 : next; // Cap at 95%
      });
    }, intervalMs);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const response = await axios.post(`${apiUrl}/api/analyze`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: fToken(token)
        },
      });
      
      // On success
      clearInterval(progressInterval);
      setProgress(100);
      setAnalyzingText("Analysis Complete!");
      
      setTimeout(() => {
        setResults(response.data);
        if (response.data.scans_remaining !== undefined) {
          window.dispatchEvent(new CustomEvent("scansUpdated", { detail: response.data.scans_remaining }));
        }
        setLoading(false);
      }, 600);

    } catch (err: any) {
      clearInterval(progressInterval);
      console.error(err);
      setError(err.response?.data?.detail || "An error occurred during analysis. Make sure the backend is running.");
      setLoading(false);
    }
  };

  const calculateTotalScore = (scores: any) => {
    if (!scores) return 0;
    let total = 0;
    let max = 0;
    Object.values(scores).forEach((val: any) => {
      total += Math.min(val.score, val.max);
      max += val.max;
    });
    return Math.round((total / max) * 100) || 0;
  };

  const faqs = [
    {
      q: "How does the ATS Scanner evaluate my resume?",
      a: "Our scanner parses the structural markup, font parameters, section titles, and text semantics of your PDF. It checks this parsed information against optimal applicant tracking layouts used by Workday, Lever, and Greenhouse to identify syntax errors, hierarchy bugs, or missing sections."
    },
    {
      q: "Why do you need my GitHub profile URL?",
      a: "For technical candidates, we look beyond the text. Linking your GitHub allows us to review active projects, inspect complexity patterns, check code quality and commit trends, and aggregate stars and contributions. This allows us to assign an independent technical weight score."
    },
    {
      q: "Is my resume data stored on your servers?",
      a: "No. AtsRank runs fully stateless analyses. We parse the file in-memory, generate the AI evaluation, return the output, and discard the uploaded binary. Only your profile details and scan balance are stored in our secure database."
    },

  ];

  return (
    <div className="bg-slate-50 text-slate-900 font-sans relative overflow-x-hidden flex-grow">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-blue-50/70 via-indigo-50/20 to-transparent -z-10 rounded-full blur-3xl" />

      {/* Main content wrapper */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        
        {/* Hero Banner */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-50 rounded-full border border-blue-200 uppercase tracking-wider inline-flex items-center gap-1">
              <Icons8Icon name="sparkles" size={12} className="animate-pulse" />
              Advanced ATS Auditor
            </span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mt-5 mb-5 text-slate-900">
            Is your resume <span className="text-blue-600">ATS-ready?</span>
          </h2>
          <p className="text-base md:text-lg text-slate-650 max-w-2xl mx-auto leading-relaxed">
            Upload your resume and get an instant deep assessment. We audit styling compliance, scan your GitHub project quality, and provide direct, actionable improvement steps.
          </p>
        </div>

        {/* Dynamic File Uploader Dashboard */}
        {!results && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200/80 rounded-3xl p-8 text-center shadow-xl shadow-slate-200/50"
          >
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 transition-all cursor-pointer group ${
                file 
                  ? "border-blue-500 bg-blue-50/30" 
                  : "border-slate-300 hover:border-blue-400 hover:bg-slate-50/50"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".pdf"
              />
              
              {file ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-blue-100/70 border border-blue-200 flex items-center justify-center text-blue-600 shadow-md">
                    <Icons8Icon name="document" size={32} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-slate-800">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB • Ready to analyze</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100/70 flex items-center justify-center text-slate-500 transition-colors group-hover:text-blue-500">
                    <Icons8Icon name="upload" size={32} />
                  </div>
                  <div>
                    <p className="font-semibold text-lg text-slate-800">Click or drag PDF here</p>
                    <p className="text-xs text-slate-500">Only PDF files are supported • Max 5MB</p>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-5 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-3 justify-center">
                <Icons8Icon name="warning" size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {loading ? (
              <div className="mt-8 max-w-md mx-auto text-left bg-slate-50 border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="flex justify-between items-end mb-3">
                  <span className="text-sm font-bold text-slate-700 animate-pulse">{analyzingText}</span>
                  <span className="text-sm font-black text-blue-600">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 w-full bg-slate-200/80 rounded-full overflow-hidden shadow-inner relative">
                  <motion.div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ ease: "linear", duration: 0.1 }}
                  >
                    {/* Shimmer effect inside progress bar */}
                    <div className="absolute inset-0 w-full h-full bg-white/20 animate-shimmer"></div>
                  </motion.div>
                </div>
                <p className="text-xs text-slate-500 mt-3 text-center">Please don't close this window...</p>
              </div>
            ) : (
              <div className="mt-8">
                <button 
                  onClick={handleAnalyze}
                  disabled={!file}
                  className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-white transition-all flex items-center justify-center gap-2 mx-auto ${
                    !file 
                      ? "bg-slate-300 cursor-not-allowed" 
                      : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95"
                  }`}
                >
                  Start Analysis
                  <Icons8Icon name="chevron-right" size={20} className="brightness-0 invert" />
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* Analysis Results view */}
        <AnimatePresence>
          {results && results.evaluation && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-slate-800">Auditing Summary</h3>
                <button 
                  onClick={() => {setResults(null); setFile(null);}}
                  className="text-sm font-semibold text-blue-650 hover:text-blue-800 flex items-center gap-1 transition-colors"
                >
                  Analyze another resume
                  <Icons8Icon name="arrow-right" size={14} />
                </button>
              </div>

              {/* Score Overview */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                    <circle 
                      cx="50" cy="50" r="45" fill="none" stroke="#2563eb" strokeWidth="8" 
                      strokeDasharray={`${calculateTotalScore(results.evaluation.scores) * 2.83} 283`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-slate-800">{calculateTotalScore(results.evaluation.scores)}</span>
                    <span className="text-xs font-bold text-slate-500 uppercase mt-1">ATS Score</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 w-full">
                  <ScoreCard 
                    title="Open Source" 
                    icon={<Icons8Icon name="code" size={18} />} 
                    score={results.evaluation.scores.open_source?.score || 0} 
                    max={results.evaluation.scores.open_source?.max || 35} 
                  />
                  <ScoreCard 
                    title="Self Projects" 
                    icon={<Icons8Icon name="briefcase" size={18} />} 
                    score={results.evaluation.scores.self_projects?.score || 0} 
                    max={results.evaluation.scores.self_projects?.max || 30} 
                  />
                  <ScoreCard 
                    title="Production" 
                    icon={<Icons8Icon name="layout" size={18} />} 
                    score={results.evaluation.scores.production?.score || 0} 
                    max={results.evaluation.scores.production?.max || 25} 
                  />
                  <ScoreCard 
                    title="Tech Skills" 
                    icon={<Icons8Icon name="star" size={18} />} 
                    score={results.evaluation.scores.technical_skills?.score || 0} 
                    max={results.evaluation.scores.technical_skills?.max || 10} 
                  />
                </div>
              </div>

              {/* Strengths & Weaknesses Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strengths */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                  <h4 className="text-lg font-bold flex items-center gap-2 mb-4 text-emerald-700">
                    <Icons8Icon name="check" size={20} />
                    Key Strengths
                  </h4>
                  <ul className="space-y-3">
                    {results.evaluation.key_strengths?.map((strength: string, i: number) => (
                      <li key={i} className="flex gap-3 text-slate-700 text-sm">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">{i+1}</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                  <h4 className="text-lg font-bold flex items-center gap-2 mb-4 text-amber-600">
                    <Icons8Icon name="warning" size={20} />
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-3">
                    {results.evaluation.areas_for_improvement?.map((area: string, i: number) => (
                      <li key={i} className="flex gap-3 text-slate-700 text-sm">
                        <span className="shrink-0 w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold">{i+1}</span>
                        <span>{area}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              {/* Evidence Section */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200/80 p-6">
                <h4 className="text-lg font-bold mb-4 text-slate-800">Detailed Element Checklist</h4>
                <div className="space-y-4">
                  {Object.entries(results.evaluation.scores).map(([key, val]: [string, any]) => (
                    <div key={key} className="border-l-2 border-blue-200 pl-4 py-1.5">
                      <p className="font-bold text-slate-800 capitalize">{key.replace('_', ' ')}</p>
                      <p className="text-sm text-slate-650 mt-1 leading-relaxed">{val.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Bento Grid on Landing Page */}
        <section className="mt-24 border-t border-slate-200 pt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Full Suite Capabilities</h3>
            <p className="text-sm text-slate-500 mt-2 max-w-lg mx-auto">
              Our analyzer looks beyond raw strings. We audit the technical artifacts connected to your professional identity.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 transition-all shadow-sm">
              <Icons8Icon name="shield" size={32} className="mb-3" />
              <h4 className="font-bold text-lg text-slate-900">ATS Compatibility Audit</h4>
              <p className="text-slate-650 text-sm mt-2 leading-relaxed">
                Checks font elements, header compliance, metadata consistency, and structure hierarchy matching popular enterprise applicant trackers.
              </p>
            </div>
            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 transition-all shadow-sm">
              <Icons8Icon name="code" size={32} className="mb-3" />
              <h4 className="font-bold text-lg text-slate-900">GitHub Project Verification</h4>
              <p className="text-slate-650 text-sm mt-2 leading-relaxed">
                Evaluates repository maturity, parses project packages, checks contribution charts, and links real-world evidence to your projects.
              </p>
            </div>
            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 transition-all shadow-sm">
              <Icons8Icon name="layout" size={32} className="mb-3" />
              <h4 className="font-bold text-lg text-slate-900">Live Production Scans</h4>
              <p className="text-slate-655 text-sm mt-2 leading-relaxed">
                Checks SSL certification, domain availability, loading times, responsive styling issues, and integration layers of your listed site URLs.
              </p>
            </div>
            <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 transition-all shadow-sm">
              <Icons8Icon name="sparkles" size={32} className="mb-3" />
              <h4 className="font-bold text-lg text-slate-900">Line-by-Line Suggestions</h4>
              <p className="text-slate-655 text-sm mt-2 leading-relaxed">
                Provides actionable checklist instructions, custom targeted keywords, and bullet point rewrite guides powered by Gemini 1.5.
              </p>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/features" className="text-sm font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1.5 transition-colors">
              Explore deep auditing process
              <Icons8Icon name="chevron-right" size={16} />
            </Link>
          </div>
        </section>


        {/* FAQs Accordion */}
        <section className="mt-20 border-t border-slate-200 pt-20 mb-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-slate-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-sm text-slate-800">{faq.q}</span>
                  <Icons8Icon 
                    name="chevron-down"
                    size={16} 
                    className={`text-slate-400 transition-transform ${faqOpen === index ? "transform rotate-180 text-blue-600" : ""}`} 
                  />
                </button>
                <AnimatePresence>
                  {faqOpen === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-slate-100 px-6 py-4 bg-slate-50/50"
                    >
                      <p className="text-slate-600 text-xs leading-relaxed">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}

function ScoreCard({ title, icon, score, max }: { title: string, icon: React.ReactNode, score: number, max: number }) {
  const percentage = Math.min(100, Math.round((score / max) * 100));
  
  return (
    <div className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
      <div className="flex items-center gap-2 text-slate-600 mb-2 font-bold text-xs uppercase tracking-wider">
        {icon}
        {title}
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-black text-slate-800">{Math.min(score, max)}</span>
        <span className="text-xs text-slate-500 font-medium">/ {max}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-200/80 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-500 rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
