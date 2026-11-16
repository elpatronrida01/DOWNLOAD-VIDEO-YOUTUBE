export interface DiagnosticLog {
  requestId: string;
  stage: 'input_validation' | 'ssrf_check' | 'metadata_extract' | 'upstream_fetch' | 'media_synthesis' | 'archive_stream' | 'client_stream';
  platform?: string;
  url?: string;
  httpStatus?: number;
  message: string;
  error?: string;
  timestamp: string;
}

export function generateRequestId(prefix = 'dl'): string {
  const rand = Math.random().toString(36).substring(2, 8);
  const time = Date.now().toString(36);
  return `${prefix}_${time}_${rand}`;
}

export function sanitizeErrorDetails(err: any): string {
  if (!err) return 'Unknown server error.';
  const message = typeof err === 'string' ? err : err.message || 'Processing error.';
  // Mask potential tokens, keys, passwords, or internal URLs
  return message
    .replace(/(bearer\s+)[a-zA-Z0-9_\-\.]+/gi, '$1[REDACTED]')
    .replace(/(key=)[a-zA-Z0-9_\-]+/gi, '$1[REDACTED]')
    .replace(/(token=)[a-zA-Z0-9_\-]+/gi, '$1[REDACTED]')
    .slice(0, 300);
}

export function logDiagnostic(log: DiagnosticLog): void {
  const sanitized = {
    ...log,
    url: log.url ? log.url.split('?')[0].slice(0, 80) : undefined,
    error: log.error ? sanitizeErrorDetails(log.error) : undefined,
  };
  console.log(`[DIAGNOSTIC] ${JSON.stringify(sanitized)}`);
}
