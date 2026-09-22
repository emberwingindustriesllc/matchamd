import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Download,
  Printer,
  Copy,
  Check,
  Database
} from 'lucide-react';
import {
  generateProfileSummaryText,
  exportProfileAsJSON,
  exportFullUserDataArchive,
  printProfileCV
} from '@/utils/profileExporter';

export default function ExportProfileModal({ open, onOpenChange, profile, user }) {
  const [copied, setCopied] = useState(false);

  const summaryText = generateProfileSummaryText(profile, user);

  const handleCopy = () => {
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl max-w-lg max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-700 dark:text-teal-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                Export & Download Candidate Data
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Print your CV, export formatted summaries, or download your complete user data archive.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-3 my-3">
          <Button
            onClick={() => printProfileCV(profile, user)}
            className="rounded-2xl h-auto py-3.5 flex-col gap-1.5 bg-gradient-to-br from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800 text-white shadow-md shadow-teal-600/20"
          >
            <Printer className="w-5 h-5" />
            <span className="text-xs font-semibold">Print / PDF CV</span>
          </Button>

          <Button
            onClick={() => exportProfileAsJSON(profile, user)}
            variant="outline"
            className="rounded-2xl h-auto py-3.5 flex-col gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
          >
            <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-xs font-semibold">Profile JSON</span>
          </Button>

          <Button
            onClick={handleCopy}
            variant="outline"
            className="rounded-2xl h-auto py-3.5 flex-col gap-1.5 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <Copy className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            )}
            <span className="text-xs font-semibold">{copied ? 'Copied!' : 'Copy Summary'}</span>
          </Button>
        </div>

        {/* Full User Data Archive (GDPR / Privacy Portability) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-900 dark:to-indigo-950/30 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Complete User Data Archive
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Download all saved programs, checklists, rank list, interviews, and budget data in one JSON package.
            </p>
          </div>
          <Button
            onClick={() => exportFullUserDataArchive(profile, user)}
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shrink-0 gap-1.5 rounded-xl shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Download Archive
          </Button>
        </div>

        {/* Text Preview */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Plain Text Preview (LOR Packet Ready)
            </span>
            <span className="text-[11px] text-slate-400">Attach to emails for writers</span>
          </div>
          <pre className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap max-h-52">
            {summaryText}
          </pre>
        </div>

        <div className="pt-2 flex justify-end">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl text-slate-500"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
