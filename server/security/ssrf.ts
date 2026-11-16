import { URL } from 'url';
import net from 'net';

/**
 * Checks if an IP string is within a private, loopback, or link-local range.
 */
function isPrivateIp(ip: string): boolean {
  if (net.isIPv4(ip)) {
    const parts = ip.split('.').map(Number);
    // 127.0.0.0/8 (Loopback)
    if (parts[0] === 127) return true;
    // 10.0.0.0/8 (Private)
    if (parts[0] === 10) return true;
    // 172.16.0.0/12 (Private)
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    // 192.168.0.0/16 (Private)
    if (parts[0] === 192 && parts[1] === 168) return true;
    // 169.254.0.0/16 (Link-Local, AWS/GCP metadata)
    if (parts[0] === 169 && parts[1] === 254) return true;
    // 0.0.0.0/8 (Current network)
    if (parts[0] === 0) return true;
    return false;
  }

  if (net.isIPv6(ip)) {
    const normalized = ip.toLowerCase();
    // ::1 loopback
    if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
    // Unique local address fc00::/7
    if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;
    // Link-local address fe80::/10
    if (normalized.startsWith('fe8') || normalized.startsWith('fe9') || normalized.startsWith('fea') || normalized.startsWith('feb')) return true;
    return false;
  }

  return false;
}

/**
 * Validates a target URL against SSRF attacks.
 * Rejects non-HTTP(S) schemes, private network hostnames, localhost, and metadata IPs.
 */
export function validateUrlForSSRF(urlString: string): { isValid: boolean; error?: string; parsedUrl?: URL } {
  try {
    const parsed = new URL(urlString);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are permitted.' };
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check blocked hostnames
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname === 'metadata.google.internal' ||
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return { isValid: false, error: 'Access to private and internal hostnames is prohibited.' };
    }

    // If hostname is directly an IP address
    if (net.isIP(hostname)) {
      if (isPrivateIp(hostname)) {
        return { isValid: false, error: 'Access to internal IP ranges is prohibited.' };
      }
    }

    return { isValid: true, parsedUrl: parsed };
  } catch {
    return { isValid: false, error: 'Malformed or invalid URL.' };
  }
}
