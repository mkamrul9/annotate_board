export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 mt-auto text-center text-slate-500 text-xs transition-colors duration-300">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-8">
        <p>© 2026 VAI Radiology Phase 2 Assessment.</p>
        <div className="flex gap-4">
          <span className="flex items-center gap-1.5">Press <kbd className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">?</kbd> for shortcuts</span>
        </div>
      </div>
    </footer>
  );
}
