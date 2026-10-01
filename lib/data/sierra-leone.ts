/**
 * Sierra Leone's districts and their chiefdoms, by region - from nawehub-web
 * (types/demographs/data.ts), with "gowahun" corrected to Ngowahun (Bombali).
 */
export interface District {
  name: string;
  region: string;
  chiefdoms: string[];
}

export const DISTRICTS: District[] = [
  { name: "Kailahun", region: "East", chiefdoms: ["Dea", "Jahn", "Jawie", "Kissi Kama", "Kissi Teng", "Kissi Tongi", "Kpeje Bongre", "Kpeje West", "Luawa", "Malema", "Mandu", "Njaluahun", "Penguia", "Upper Bambara", "Yawei"] },
  { name: "Kenema", region: "East", chiefdoms: ["Dama", "Dodo", "Gaura", "Gorama Mende", "Kandu Leppiama", "Kenema City", "Koya", "Langrama", "Lower Bambara", "Malegohun", "Niawa", "Nomo", "Nongowa", "Simbaru", "Small Bo", "Tunkia", "Wandor"] },
  { name: "Kono", region: "East", chiefdoms: ["Faima", "Gbane", "Gbane Kandor", "Gbense", "Goroma Kono", "Kamara", "Koidu City", "Lei", "Mafindor", "Nimikoro", "Nimiyama", "Sandor", "Soa", "Tankora", "Toli"] },
  { name: "Bombali", region: "North", chiefdoms: ["Biriwa", "Bombali Shebora", "Bombali Siari", "Gbanti", "Gbendembu", "Kamaranka", "Magbaimba Ndorwahun", "Makani City", "Makari", "Mara", "Ngowahun", "Paki Masabong", "Safroko Limba"] },
  { name: "Falaba", region: "North", chiefdoms: ["Delemandugu", "Dembelia", "Dembelia-Sinkunia", "Folosaba", "Kamadu Yiraia", "Kebelia", "Kulor Saradu", "Mongo", "Morifindugu", "Neya", "Nyedu", "Sulima", "Wollay Barawa"] },
  { name: "Koinadugu", region: "North", chiefdoms: ["Diang", "Gbonkobon Kayaka", "Kalian", "Kamukeh", "Kasunko KaKellian", "Nieni", "Sengbe", "Tamiso", "Wara Wara Bafodia", "Wara Wara Yagala"] },
  { name: "Tonkolili", region: "North", chiefdoms: ["Dansogoia", "Gbonkolenkeni/Masankong", "Kafe", "Kalanthuba", "Kholifa Mabang", "Kholifa Mamuntha/ Mayosso", "Kholifa Rowala", "Kunike Barina", "Kunike Folawusu", "Kunike Sanda", "Malal", "Mayeppoh", "Poli", "Sambaya", "Simiria", "Tane", "Yele", "Yoni Mabanta", "Yoni Mamaila"] },
  { name: "Kambia", region: "North West", chiefdoms: ["Bramaia", "Dixon", "Gbinle", "Khonimaka", "Magbema", "Mambolo", "Masungbala", "Munu Thalla", "Samu", "Tonko Limba"] },
  { name: "Karena", region: "North West", chiefdoms: ["Buya", "Dibia", "Gbanti", "Libeisaygahun/Gbombahun", "Mafonda Makerembay", "Romende", "Safroko", "Sanda Loko", "Sanda Magbolontor", "Sanda Tendaran", "Sella Limba", "Tambakha Simibungie", "Tambakha Yobangie"] },
  { name: "Port Loko", region: "North West", chiefdoms: ["Bakeh Loko", "Bureh", "Kaffu Bullom", "Kamasondo", "Kasseh", "Koya", "Loko Masama", "Maconteh", "Maforki", "Makama", "Marampa", "Masimera", "Port Loko City", "Thainkatopa"] },
  { name: "Bo", region: "South", chiefdoms: ["Badjia", "Bagbo", "Bagbwe(Bagbe)", "Bo City", "Boama", "Bongor", "Bumpe Ngao", "Gbo", "Jaiama", "Kakua", "Komboya", "Lugbu", "Niawa Lenga", "Selenga", "Tikonko", "Valunia", "Wonde"] },
  { name: "Bonthe", region: "South", chiefdoms: ["Bendu-Cha", "Bonthe Urban", "Bum", "Dema", "Imperri", "Jong", "Kpanda Kemo", "Kwamebai Krim", "Nongoba", "Sittia", "Sogbeni", "Yawbeko"] },
  { name: "Moyamba", region: "South", chiefdoms: ["Bagruwa", "Banta", "Bumpeh", "Dasse", "Fakunya", "Kagboro", "Kaiyamba", "Kamajei", "Kongbora", "Kori", "Kowa", "Ribbi", "Timdale", "Upper Banta"] },
  { name: "Pujehun", region: "South", chiefdoms: ["Barri", "Galliness", "Kabonde", "Kpaka", "Makpele", "Malen", "Mano Sakrim", "Panga", "Panga krim", "Pejeh (Futa peje)", "Perri", "Soro Gbema", "Sowa", "Yakemu Kpukumu"] },
  { name: "Western Area Rural", region: "West", chiefdoms: ["Koya", "Mountain Rural", "Waterloo Rural", "York Rural"] },
  { name: "Western Area Urban", region: "West", chiefdoms: ["Central 1", "Central 2", "East 1", "East 2", "East 3", "West 1", "West 2", "West 3"] },
].sort((a, b) => a.name.localeCompare(b.name));

/** Chiefdoms of a district (case-insensitive); empty for an unknown district. */
export function chiefdomsOf(district: string | null | undefined): string[] {
  if (!district) return [];
  const key = district.trim().toLowerCase();
  return DISTRICTS.find((d) => d.name.toLowerCase() === key)?.chiefdoms ?? [];
}

/** The canonical spelling of a district typed before these became dropdowns, if it matches one. */
export function canonicalDistrict(value: string | null | undefined): string {
  if (!value) return "";
  const key = value.trim().toLowerCase();
  return DISTRICTS.find((d) => d.name.toLowerCase() === key)?.name ?? "";
}
