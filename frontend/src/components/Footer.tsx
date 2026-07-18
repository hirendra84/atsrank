import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-white py-12 border-t border-slate-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          
          {/* Left Column: Logo */}
          <div className="flex justify-center md:justify-start">
            <Logo className="h-6 w-auto" />
          </div>
          
          {/* Center Column: Links */}
          <div className="flex justify-center gap-6 text-sm text-slate-500 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <Link href="/features" className="hover:text-blue-600 transition-colors">Features</Link>
          </div>

          {/* Right Column: Copyright & Attribution */}
          <div className="flex flex-col items-center md:items-end gap-1.5">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} AtsRank. All rights reserved.
            </p>
            <p className="text-slate-400 text-xs flex items-center gap-1">
              Made with ❤️ by{" "}
              <a 
                href="https://hirendra.dev" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-blue-500 hover:text-blue-600 font-medium hover:underline transition-colors"
              >
                Hirendra.dev
              </a>
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
}
