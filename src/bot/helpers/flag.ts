// FIFA/IOC 3-letter code → ISO 3166-1 alpha-2. ENG/SCO use GB subdivision tags;
// FWC/CC are special collections with no nation.
const ISO2_BY_CODE: Record<string, string> = {
  ALG: "DZ", ARG: "AR", AUS: "AU", AUT: "AT", BEL: "BE", BIH: "BA",
  BRA: "BR", CAN: "CA", CIV: "CI", COD: "CD", COL: "CO", CPV: "CV",
  CRO: "HR", CUW: "CW", CZE: "CZ", ECU: "EC", EGY: "EG", ESP: "ES",
  FRA: "FR", GER: "DE", GHA: "GH", HAI: "HT", IRN: "IR", IRQ: "IQ",
  JOR: "JO", JPN: "JP", KOR: "KR", KSA: "SA", MAR: "MA", MEX: "MX",
  NED: "NL", NOR: "NO", NZL: "NZ", PAN: "PA", PAR: "PY", POR: "PT",
  QAT: "QA", RSA: "ZA", SEN: "SN", SUI: "CH", SWE: "SE", TUN: "TN",
  TUR: "TR", URU: "UY", USA: "US", UZB: "UZ",
};

function regionalIndicator(iso2: string): string {
  return iso2
    .toUpperCase()
    .split("")
    .map((c) => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join("");
}

function subdivisionFlag(subdivision: string): string {
  const TAG_BASE = 0xe0000;
  const tags = subdivision
    .toLowerCase()
    .split("")
    .map((c) => String.fromCodePoint(TAG_BASE + c.charCodeAt(0)))
    .join("");
  return "\u{1F3F4}" + tags + "\u{E007F}";
}

const SPECIAL_FLAGS: Record<string, string> = {
  ENG: subdivisionFlag("gbeng"),
  SCO: subdivisionFlag("gbsct"),
  FWC: "🏆",
  CC: "🥤",
};

export function countryFlag(code: string): string {
  if (SPECIAL_FLAGS[code]) return SPECIAL_FLAGS[code];
  const iso2 = ISO2_BY_CODE[code];
  return iso2 ? regionalIndicator(iso2) : "";
}
