import React from 'react';
import { ExternalLink, FileText, Video, Link as LinkIcon } from 'lucide-react';

const typeIcons = {
  website: LinkIcon,
  document: FileText,
  video: Video,
  default: ExternalLink
};

export default function ResourceLink({ title, url, type = 'website', description }) {
  const Icon = typeIcons[type] || typeIcons.default;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md transition-all"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
          {title}
        </h4>
        {description && (
          <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{description}</p>
        )}
      </div>
      <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
    </a>
  );
}