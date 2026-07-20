export const URSSAF_RATE_PRESETS: {
  key: string;
  label: string;
  cotisationRateBps: number;
  versementLiberatoireRateBps: number;
}[] = [
  {
    key: "BIC_VENTE",
    label: "Vente de marchandises (BIC)",
    cotisationRateBps: 1230,
    versementLiberatoireRateBps: 100,
  },
  {
    key: "BIC_SERVICES",
    label: "Prestations de services (BIC)",
    cotisationRateBps: 2120,
    versementLiberatoireRateBps: 170,
  },
  {
    key: "BNC",
    label: "Professions libérales (BNC)",
    cotisationRateBps: 2560,
    versementLiberatoireRateBps: 220,
  },
  {
    key: "CIPAV",
    label: "Professions libérales (CIPAV)",
    cotisationRateBps: 2320,
    versementLiberatoireRateBps: 220,
  },
];
