export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-6 mt-auto text-center text-slate-500 text-xs">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-8">
        <p>© 2026 VAI Radiology Phase 2 Assessment.</p>
        <div className="flex gap-4">
          <span>Press <kbd className="bg-slate-800 px-1 rounded text-slate-300 font-mono">?</kbd> for shortcuts</span>
        </div>
      </div>
    </footer>
  );
}
