import dns from 'dns';

const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY || '';
const ABUSEIPDB_API_KEY = process.env.ABUSEIPDB_API_KEY || '';

export interface LookupResult {
  query: string;
  type: 'url' | 'ip' | 'domain';
  isSafe: boolean;
  score: number; // 0 to 100 indicating risk
  provider: string;
  details: any;
}

// Extract domain name from URL
function getDomainFromUrl(urlStr: string): string {
  try {
    const cleaned = urlStr.trim();
    const withProtocol = cleaned.match(/^https?:\/\//i) ? cleaned : `http://${cleaned}`;
    const parsed = new URL(withProtocol);
    return parsed.hostname || cleaned;
  } catch {
    return urlStr.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];
  }
}

// 1. VirusTotal Domain/URL Reputation Check
export async function scanUrlWithVirusTotal(target: string): Promise<LookupResult> {
  const domain = getDomainFromUrl(target);
  
  if (!VIRUSTOTAL_API_KEY) {
    // Return simulated lookup report
    return simulateVirusTotalScan(target, domain);
  }

  try {
    const response = await fetch(`https://www.virustotal.com/api/v3/domains/${domain}`, {
      method: 'GET',
      headers: {
        'x-apikey': VIRUSTOTAL_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`VirusTotal API returned ${response.status}`);
    }

    const data: any = await response.json();
    const stats = data?.data?.attributes?.last_analysis_stats || {};
    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const totalVendors = Object.keys(data?.data?.attributes?.last_analysis_results || {}).length || 90;
    
    const score = totalVendors > 0 ? Math.round(((malicious + suspicious) / totalVendors) * 100) : 0;
    const isSafe = malicious === 0 && suspicious <= 1;

    return {
      query: target,
      type: 'url',
      isSafe,
      score: score > 100 ? 100 : score,
      provider: 'VirusTotal API (Live)',
      details: {
        domain,
        categories: data?.data?.attributes?.categories || {},
        reputation: data?.data?.attributes?.reputation || 0,
        registrar: data?.data?.attributes?.registrar || 'Unknown',
        stats: {
          malicious,
          suspicious,
          harmless: stats.harmless || 0,
          undetected: stats.undetected || 0,
          total: totalVendors
        }
      }
    };
  } catch (error: any) {
    console.error('VirusTotal scan failed, falling back to simulation:', error.message);
    return simulateVirusTotalScan(target, domain, `Live check failed: ${error.message}`);
  }
}

// 2. AbuseIPDB Reputation Check
export async function checkIpWithAbuseIPDB(ipAddress: string): Promise<LookupResult> {
  if (!ABUSEIPDB_API_KEY) {
    return simulateAbuseIPDBCheck(ipAddress);
  }

  try {
    const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ipAddress)}&maxAgeInDays=90&verbose=true`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Key': ABUSEIPDB_API_KEY,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`AbuseIPDB API returned ${response.status}`);
    }

    const json: any = await response.json();
    const data = json?.data || {};
    
    const score = data.abuseConfidenceScore || 0;
    const isSafe = score < 20;

    return {
      query: ipAddress,
      type: 'ip',
      isSafe,
      score,
      provider: 'AbuseIPDB API (Live)',
      details: {
        ipAddress: data.ipAddress,
        countryCode: data.countryCode,
        countryName: data.countryName || 'Unknown',
        isp: data.isp || 'Unknown',
        domain: data.domain || 'Unknown',
        usageType: data.usageType || 'Unknown',
        totalReports: data.totalReports || 0,
        lastReportedAt: data.lastReportedAt || null
      }
    };
  } catch (error: any) {
    console.error('AbuseIPDB check failed, falling back to simulation:', error.message);
    return simulateAbuseIPDBCheck(ipAddress, `Live check failed: ${error.message}`);
  }
}

// --- Simulators ---

function simulateVirusTotalScan(target: string, domain: string, errorNote?: string): LookupResult {
  const lowercaseDomain = domain.toLowerCase();
  
  // Custom mock rules
  let malicious = 0;
  let suspicious = 0;
  let registrar = 'GoDaddy Operating Company, LLC';
  let reputation = 75;

  if (lowercaseDomain.includes('verify') || lowercaseDomain.includes('update-card') || lowercaseDomain.includes('secure-login') || lowercaseDomain.includes('win-prize')) {
    malicious = 7;
    suspicious = 3;
    registrar = 'Reg-Name Cheap (Simulated)';
    reputation = -45;
  } else if (lowercaseDomain.includes('hack') || lowercaseDomain.includes('malware') || lowercaseDomain.includes('phish')) {
    malicious = 18;
    suspicious = 5;
    registrar = 'Tucows Domains Inc. (Simulated)';
    reputation = -90;
  }

  const harmless = 65 - malicious - suspicious;
  const stats = { malicious, suspicious, harmless, undetected: 15, total: 80 };
  const score = Math.round(((malicious + suspicious) / stats.total) * 100);
  const isSafe = malicious === 0;

  return {
    query: target,
    type: 'url',
    isSafe,
    score,
    provider: 'VirusTotal API (Local Simulation' + (errorNote ? ` - ${errorNote}` : '') + ')',
    details: {
      domain,
      registrar,
      reputation,
      categories: {
        'Forcepoint': isSafe ? 'Information Technology' : 'Phishing and Fraud',
        'Sophos': isSafe ? 'Business' : 'Spam/Spyware'
      },
      stats
    }
  };
}

function simulateAbuseIPDBCheck(ipAddress: string, errorNote?: string): LookupResult {
  // Simple check logic based on IP patterns
  const lastOctet = parseInt(ipAddress.split('.').pop() || '0', 10);
  
  let score = 0;
  let totalReports = 0;
  let countryCode = 'IN';
  let countryName = 'India';
  let isp = 'Reliance Jio Infocomm Limited';
  let usageType = 'Fixed Line ISP';

  // Odd octets represent some threats
  if (lastOctet > 200) {
    score = 85;
    totalReports = 142;
    countryCode = 'CN';
    countryName = 'China';
    isp = 'Chinanet Network Service';
    usageType = 'Data Center/Web Hosting/Transit';
  } else if (lastOctet > 150) {
    score = 45;
    totalReports = 23;
    countryCode = 'RU';
    countryName = 'Russia';
    isp = 'Rostelecom';
    usageType = 'Commercial';
  } else if (lastOctet === 66 || lastOctet === 77) {
    score = 95;
    totalReports = 482;
    countryCode = 'US';
    countryName = 'United States';
    isp = 'Amazon Technologies Inc.';
    usageType = 'Data Center/Web Hosting/Transit';
  }

  return {
    query: ipAddress,
    type: 'ip',
    isSafe: score < 20,
    score,
    provider: 'AbuseIPDB API (Local Simulation' + (errorNote ? ` - ${errorNote}` : '') + ')',
    details: {
      ipAddress,
      countryCode,
      countryName,
      isp,
      domain: isp.toLowerCase().replace(/\s+/g, '') + '.com',
      usageType,
      totalReports,
      lastReportedAt: totalReports > 0 ? new Date(Date.now() - 3600000 * 2).toISOString() : null
    }
  };
}
