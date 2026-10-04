export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

export function isReviewerAccount(user?: { email?: string } | null): boolean {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return email === 'reviewer@matchamd.com' || email === 'google-reviewer@matchamd.com' || email.startsWith('reviewer+');
}