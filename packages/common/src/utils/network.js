const dns = require('dns').promises;
const net = require('net');

let cachedIp = null;
let lastFetch = 0;

async function getPublicIp() {
    const now = Date.now();
    if (cachedIp && (now - lastFetch < 3600000)) {
        return cachedIp;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch('https://api.ipify.org?format=json', {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error('Failed to fetch IP');
        const data = await response.json();
        cachedIp = data.ip;
        lastFetch = now;
        return cachedIp;
    } catch (error) {
        console.error("Error fetching public IP:", error.message);
        return "Unavailable";
    }
}

/**
 * Convert a dotted-decimal IPv4 address string to a 32-bit unsigned integer.
 * @param {string} ip - IPv4 address in dotted-decimal notation (e.g., '192.168.1.1')
 * @returns {number} 32-bit unsigned integer representation of the IPv4 address
 */
function ipv4ToInt(ip) {
  return ip.split(".").reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
}

/**
 * Check if an IPv4 address falls within any restricted or reserved IP range.
 * Blocks loopback (127.0.0.0/8), RFC-1918 private ranges (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16),
 * link-local and cloud metadata (169.254.0.0/16), and unspecified (0.0.0.0/8) addresses to prevent SSRF attacks.
 * @param {string} ip - IPv4 address to validate
 * @returns {boolean} True if the IP is restricted, false otherwise
 */
function isRestrictedIPv4(ip) {
  const n = ipv4ToInt(ip);
  // Loopback 127.0.0.0/8
  if (n >= ipv4ToInt("127.0.0.0") && n <= ipv4ToInt("127.255.255.255")) return true;
  // RFC-1918: 10.0.0.0/8
  if (n >= ipv4ToInt("10.0.0.0") && n <= ipv4ToInt("10.255.255.255")) return true;
  // RFC-1918: 172.16.0.0/12
  if (n >= ipv4ToInt("172.16.0.0") && n <= ipv4ToInt("172.31.255.255")) return true;
  // RFC-1918: 192.168.0.0/16
  if (n >= ipv4ToInt("192.168.0.0") && n <= ipv4ToInt("192.168.255.255")) return true;
  // Link-local / cloud instance metadata (AWS, GCP, Azure): 169.254.0.0/16
  if (n >= ipv4ToInt("169.254.0.0") && n <= ipv4ToInt("169.254.255.255")) return true;
  // Unspecified: 0.0.0.0/8
  if (n >= ipv4ToInt("0.0.0.0") && n <= ipv4ToInt("0.255.255.255")) return true;
  // CGNAT (Carrier-Grade NAT): 100.64.0.0/10
  if (n >= ipv4ToInt("100.64.0.0") && n <= ipv4ToInt("100.127.255.255")) return true;
  // Documentation / TEST-NETs: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24
  if (n >= ipv4ToInt("192.0.2.0") && n <= ipv4ToInt("192.0.2.255")) return true;
  if (n >= ipv4ToInt("198.51.100.0") && n <= ipv4ToInt("198.51.100.255")) return true;
  if (n >= ipv4ToInt("203.0.113.0") && n <= ipv4ToInt("203.0.113.255")) return true;
  // Multicast: 224.0.0.0/4
  if (n >= ipv4ToInt("224.0.0.0") && n <= ipv4ToInt("239.255.255.255")) return true;
  // Reserved / Future use: 240.0.0.0/4
  if (n >= ipv4ToInt("240.0.0.0") && n <= ipv4ToInt("255.255.255.255")) return true;
  // Broadcast: 255.255.255.255
  if (n === ipv4ToInt("255.255.255.255")) return true;

  return false;
}

/**
 * Check if an IPv6 address falls within any restricted or reserved range.
 * Blocks loopback (::1), unspecified (::), link-local (fe80::/10), IPv6 Unique Local Addresses (fc00::/7),
 * and IPv4-mapped IPv6 addresses that resolve to restricted IPv4 ranges to prevent SSRF attacks.
 * @param {string} ip - IPv6 address to validate
 * @returns {boolean} True if the IP is restricted, false otherwise
 */
function isRestrictedIPv6(ip) {
  const expanded = ip.replace(/^\[|\]$/g, "").toLowerCase();
  // IPv6 loopback ::1
  if (expanded === "::1" || expanded === "0:0:0:0:0:0:0:1") return true;
  // IPv6 unspecified ::
  if (expanded === "::" || expanded === "0:0:0:0:0:0:0:0") return true;
  
  // IPv4-mapped IPv6 addresses (::ffff:x.x.x.x) or hex format
  if (expanded.startsWith("::ffff:") || expanded.startsWith("0:0:0:0:0:ffff:")) {
    const v4Part = expanded.split(':').pop();
    if (v4Part.includes('.')) {
      if (isRestrictedIPv4(v4Part)) return true;
    } else {
      // Hex representation
      const hexStr = v4Part.padStart(8, '0');
      const ip4Str = [
        parseInt(hexStr.substring(0, 2), 16),
        parseInt(hexStr.substring(2, 4), 16),
        parseInt(hexStr.substring(4, 6), 16),
        parseInt(hexStr.substring(6, 8), 16)
      ].join('.');
      if (isRestrictedIPv4(ip4Str)) return true;
    }
  }

  // IPv6 link-local fe80::/10 (fe80: through febf:)
  if (/^fe[89ab]/.test(expanded)) return true;
  // IPv6 ULA (Unique Local Address) fc00::/7
  if (expanded.startsWith("fc") || expanded.startsWith("fd")) return true;
  return false;
}

/**
 * Check if an IP address (either IPv4 or IPv6) is restricted or falls within a reserved range.
 * Delegates to isRestrictedIPv4() or isRestrictedIPv6() based on the IP version.
 * @param {string} ip - IP address to validate
 * @returns {boolean} True if the IP is restricted, false otherwise
 */
function isRestrictedIP(ip) {
  if (net.isIPv4(ip)) return isRestrictedIPv4(ip);
  if (net.isIPv6(ip)) return isRestrictedIPv6(ip);
  return false;
}

/**
 * Validate a URI to ensure it does not target restricted hosts or IP ranges (SSRF prevention).
 * Performs DNS resolution on hostnames to check both A and AAAA records against restricted ranges.
 * Blocks loopback, RFC-1918 private ranges, cloud metadata endpoints, and other reserved IP ranges.
 * @async
 * @param {string} uri - The URI to validate
 * @returns {Promise<boolean>} True if the URI is safe to connect to, false if it targets a restricted host
 */
const isSafeUri = async (uri) => {
  try {
    const parsed = new URL(uri);
    const host = parsed.hostname.replace(/^\[|\]$/g, "").toLowerCase();

    // Block well-known loopback and internal hostnames
    const blockedHostnames = ["localhost", "metadata.google.internal"];
    if (blockedHostnames.includes(host)) return false;

    // Reject mongodb+srv:// URIs as they perform hidden SRV/TXT discovery
    // We cannot safely validate all targets without resolving SRV records
    if (uri.toLowerCase().includes("mongodb+srv://")) return false;

    // If the host is a bare IPv4 or IPv6 address, check all restricted ranges
    if (net.isIPv4(host) || net.isIPv6(host)) {
      return !isRestrictedIP(host);
    }

    // For hostnames, perform DNS resolution to check both A and AAAA records
    const [ipv4Result, ipv6Result] = await Promise.allSettled([
      dns.resolve4(host),
      dns.resolve6(host),
    ]);

    const resolved = [
      ...(ipv4Result.status === "fulfilled" ? ipv4Result.value : []),
      ...(ipv6Result.status === "fulfilled" ? ipv6Result.value : []),
    ];

    // If no addresses resolved, treat as unsafe
    if (resolved.length === 0) return false;

    // Check all resolved addresses for restricted ranges
    if (resolved.some((addr) => isRestrictedIP(addr))) return false;

    return true;
  } catch (e) {
    return false;
  }
};

module.exports = { getPublicIp, isSafeUri };
