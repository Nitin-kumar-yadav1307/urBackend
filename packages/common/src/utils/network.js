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
 * Parses mongodb:// and mongodb+srv:// URIs properly, extracting all hosts.
 * @async
 * @param {string} uri - The URI to validate
 * @returns {Promise<{isSafe: boolean, resolvedIps?: Object, reason?: string}>} Object containing safety status and resolved IPs for DNS rebinding protection
 */
const isSafeUri = async (uri) => {
  try {
    let hostsToResolve = [];
    const lowerUri = uri.toLowerCase();

    // Custom parsing for mongodb:// and mongodb+srv://
    if (lowerUri.startsWith("mongodb://") || lowerUri.startsWith("mongodb+srv://")) {
        const isSrv = lowerUri.startsWith("mongodb+srv://");
        const withoutScheme = uri.substring(isSrv ? 14 : 10);
        
        // Remove auth
        let withoutAuth = withoutScheme;
        const atIndex = withoutScheme.indexOf('@');
        if (atIndex !== -1) {
            withoutAuth = withoutScheme.substring(atIndex + 1);
        }
        
        // Extract host part (before / or ?)
        let hostPart = withoutAuth;
        const slashIndex = withoutAuth.indexOf('/');
        const questionIndex = withoutAuth.indexOf('?');
        let endIdx = -1;
        if (slashIndex !== -1 && questionIndex !== -1) endIdx = Math.min(slashIndex, questionIndex);
        else if (slashIndex !== -1) endIdx = slashIndex;
        else if (questionIndex !== -1) endIdx = questionIndex;
        
        if (endIdx !== -1) {
            hostPart = withoutAuth.substring(0, endIdx);
        }

        const rawHosts = hostPart.split(',');

        if (isSrv) {
            // Only one host allowed in SRV
            if (rawHosts.length > 1) return { isSafe: false, reason: "Multiple hosts in SRV" };
            let srvHost = rawHosts[0];
            const portIdx = srvHost.indexOf(':');
            if (portIdx !== -1) srvHost = srvHost.substring(0, portIdx);
            
            // Resolve SRV records to find underlying hosts
            try {
                const srvRecords = await dns.resolveSrv(`_mongodb._tcp.${srvHost}`);
                hostsToResolve = srvRecords.map(r => r.name);
            } catch (err) {
                return { isSafe: false, reason: "SRV resolution failed" };
            }
        } else {
            // Multiple hosts for replica sets
            hostsToResolve = rawHosts.map(h => {
                let host = h;
                // Handle IPv6 literal [2001:db8::1]:27017 or just [2001:db8::1]
                if (host.startsWith('[')) {
                    const closeIdx = host.indexOf(']');
                    return host.substring(1, closeIdx);
                }
                const portIdx = host.indexOf(':');
                return portIdx !== -1 ? host.substring(0, portIdx) : host;
            });
        }
    } else {
        // Standard URL parsing for other schemes
        const parsed = new URL(uri);
        hostsToResolve = [parsed.hostname.replace(/^\[|\]$/g, "")];
    }

    const blockedHostnames = ["localhost", "metadata.google.internal"];
    const resolvedIps = {};

    for (const host of hostsToResolve) {
        const lowerHost = host.toLowerCase();
        if (blockedHostnames.includes(lowerHost)) return { isSafe: false, reason: "Blocked hostname" };

        if (net.isIPv4(lowerHost) || net.isIPv6(lowerHost)) {
            if (isRestrictedIP(lowerHost)) return { isSafe: false, reason: "Restricted IP" };
            resolvedIps[lowerHost] = [lowerHost];
            continue;
        }

        // For hostnames, perform DNS resolution to check both A and AAAA records
        const [ipv4Result, ipv6Result] = await Promise.allSettled([
            dns.resolve4(lowerHost),
            dns.resolve6(lowerHost),
        ]);

        const resolved = [
            ...(ipv4Result.status === "fulfilled" ? ipv4Result.value : []),
            ...(ipv6Result.status === "fulfilled" ? ipv6Result.value : []),
        ];

        // If no addresses resolved, treat as unsafe
        if (resolved.length === 0) return { isSafe: false, reason: "No addresses resolved" };

        // Check all resolved addresses for restricted ranges
        if (resolved.some((addr) => isRestrictedIP(addr))) return { isSafe: false, reason: "Resolves to restricted IP" };

        resolvedIps[lowerHost] = resolved;
    }

    return { isSafe: true, resolvedIps };
  } catch (e) {
    return { isSafe: false, reason: e.message };
  }
};

/**
 * Creates a custom DNS lookup function for Node/Mongoose that strictly enforces
 * connections only to the pre-validated IP addresses. Prevents DNS Rebinding attacks.
 * @param {Object} resolvedIps - Dictionary mapping hostnames to arrays of validated IPs
 * @returns {Function} Custom lookup function compatible with net.Socket/Mongoose
 */
const createSafeLookup = (resolvedIps) => {
    return (hostname, options, callback) => {
        const cb = typeof options === 'function' ? options : callback;
        const opts = typeof options === 'object' ? options : {};
        const lowerHost = hostname.toLowerCase();
        
        if (net.isIP(lowerHost)) {
            if (isRestrictedIP(lowerHost)) {
                return cb(new Error(`DNS Rebinding Protection: IP literal ${hostname} is restricted.`));
            }
            if (opts.all) {
                return cb(null, [{ address: lowerHost, family: net.isIPv6(lowerHost) ? 6 : 4 }]);
            }
            return cb(null, lowerHost, net.isIPv6(lowerHost) ? 6 : 4);
        }

        let addrs = resolvedIps[lowerHost];
        
        if (addrs && addrs.length > 0) {
            if (opts.family === 4) {
                addrs = addrs.filter(ip => net.isIPv4(ip));
            } else if (opts.family === 6) {
                addrs = addrs.filter(ip => net.isIPv6(ip));
            }

            if (addrs.length === 0) {
                return cb(new Error(`DNS Rebinding Protection: No addresses match requested family ${opts.family} for ${hostname}`));
            }

            if (opts.all) {
                const formatted = addrs.map(ip => ({
                    address: ip,
                    family: net.isIPv6(ip) ? 6 : 4
                }));
                return cb(null, formatted);
            }
            
            const ip = addrs[0];
            return cb(null, ip, net.isIPv6(ip) ? 6 : 4);
        } else {
            cb(new Error(`DNS Rebinding Protection: Host ${hostname} was not pre-validated or resolved to an unsafe IP.`));
        }
    };
};

module.exports = { getPublicIp, isSafeUri, createSafeLookup };
