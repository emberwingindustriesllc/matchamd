import React from 'react';
import { Link } from 'react-router-dom';
import { ExternalLink, FileText, Video, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

const typeIcons = {
  website: LinkIcon,
  document: FileText,
  video: Video,
  default: ExternalLink
};

const FALLBACK_URLS = {
  nrmp: 'https://www.nrmp.org/match-data-analytics/residency-data-reports/',
  fsmb: 'https://www.fsmb.org/usmle/',
  oet: 'https://oet.com/',
  freida: 'https://freida.ama-assn.org/',
  ecfmg: 'https://www.ecfmg.org/certification-pathways/',
  imgreddit: 'https://www.reddit.com/r/IMGreddit/',
  anking: 'https://www.ankihub.net/',
};

/** Internal path = starts with / but is not a full URL */
export function isInternalPath(url) {
  return Boolean(url && typeof url === 'string' && url.startsWith('/') && !url.startsWith('//') && !url.startsWith('http'));
}

/** Validate and normalize external URL with safe fallback */
export function resolveSafeExternalUrl(rawUrl, title = '') {
  const trimmed = String(rawUrl || '').trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    return trimmed;
  }
  const lower = `${trimmed} ${title}`.toLowerCase();
  if (lower.includes('freida')) return FALLBACK_URLS.freida;
  if (lower.includes('nrmp') || lower.includes('charting')) return FALLBACK_URLS.nrmp;
  if (lower.includes('fsmb')) return FALLBACK_URLS.fsmb;
  if (lower.includes('oet')) return FALLBACK_URLS.oet;
  if (lower.includes('imgreddit') || lower.includes('reddit')) return FALLBACK_URLS.imgreddit;
  if (lower.includes('anki') || lower.includes('anking')) return FALLBACK_URLS.anking;
  return FALLBACK_URLS.ecfmg;
}

export function openExternalUrlSafely(e, rawUrl, title = '') {
  const safeUrl = resolveSafeExternalUrl(rawUrl, title);
  try {
    const win = window.open(safeUrl, '_blank', 'noopener,noreferrer');
    if (win) {
      if (e) e.preventDefault();
      return;
    }
  } catch {
    // Allow default <a target="_blank"> navigation or copy fallback
  }
  if (!rawUrl || (!String(rawUrl).startsWith('http://') && !String(rawUrl).startsWith('https://'))) {
    if (e) e.preventDefault();
    try {
      navigator.clipboard?.writeText(safeUrl);
      toast.info(`Opened fallback resource (${safeUrl})`);
    } catch {}
    window.location.assign(safeUrl);
  }
}

function InnerLink({ url, title, type, description }) {
  if (isInternalPath(url)) {
    return (
      <Link
        to={url}
        className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/80 hover:border-[#10B981] dark:hover:border-[#4ADE80] hover:shadow-md transition-all"
      >
        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-sm">
          <LinkIcon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-slate-800 dark:text-white group-hover:text-[#10B981] dark:group-hover:text-[#4ADE80] transition-colors truncate">
            {title}
          </h4>
          {description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{description}</p>
          )}
        </div>
      </Link>
    );
  }

  // External link — open in new tab with safe fallback
  const Icon = typeIcons[type] || typeIcons.default;
  const safeHref = resolveSafeExternalUrl(url, title);

  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => openExternalUrlSafely(e, safeHref, title)}
      className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-[#1E293B] border border-slate-200 dark:border-slate-700/80 hover:border-[#10B981] dark:hover:border-[#4ADE80] hover:shadow-md transition-all"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-sm">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-800 dark:text-white group-hover:text-[#10B981] dark:group-hover:text-[#4ADE80] transition-colors truncate">
          {title}
        </h4>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{description}</p>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#10B981] dark:group-hover:text-[#4ADE80] transition-colors flex-shrink-0" />
    </a>
  );
}

export default function ResourceLink({ title, url, type = 'website', description }) {
  return <InnerLink url={url} title={title} type={type} description={description} />;
}