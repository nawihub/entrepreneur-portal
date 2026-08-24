/**
 * Mirrors `businessTypes` from the old nawehub-web business registration
 * form (types/business.ts) - same names and hint copy, so entrepreneurs who
 * used that flow see the same guidance here. businessEntityType is a plain
 * string field on the wire (BusinessMetaDto.businessEntityType), so these
 * names are sent as-is.
 */
export interface BusinessEntityType {
  name: string;
  hints: string[];
}

export const BUSINESS_ENTITY_TYPES: BusinessEntityType[] = [
  {
    name: "Sole Proprietorship",
    hints: [
      "Owned and run by a single individual",
      "No legal separation between owner and business — the owner holds full personal liability for debts and obligations",
    ],
  },
  {
    name: "Partnership",
    hints: [
      "Involves two or more individuals sharing ownership, profits, and liabilities.",
      "1. General Partnership – all partners are equally liable.",
      "2. Limited Partnership – includes general partners (full liability) and limited partners whose liability is capped to their investment.",
    ],
  },
  {
    name: "Private Limited Company (Ltd or LLC)",
    hints: [
      "• Most commonly used business structure for small to medium enterprises.",
      "• Offers limited liability to shareholders.",
      "• Shares are not publicly traded.",
      "• Minimum one shareholder and typically two directors; no legal minimum capital but a nominal share capital is common.",
    ],
  },
  {
    name: "Public Limited Company (PLC)",
    hints: [
      "• Can offer shares to the public and generally has no restrictions on share transfers.",
      "• Subject to stricter disclosure, governance, and higher capital requirements.",
    ],
  },
  {
    name: "Company Limited by Guarantee (CLG)",
    hints: [
      "• Designed for non-profits, charities, or social enterprises.",
      "• Has no share capital; members' liability is limited to a predetermined amount they guarantee.",
      "• Profits are reinvested to further the organization's objectives, not distributed.",
    ],
  },
  {
    name: "Unlimited Company",
    hints: [
      "• Members bear unlimited liability for debts.",
      "• This structure is less common and typically only used where such liability is required to instill creditor confidence.",
    ],
  },
  {
    name: "Foreign Company Operations",
    hints: [
      "Foreign-based companies may operate in Sierra Leone under two primary forms:",
      "• Branch Office – an extension of the parent company, not a separate legal entity, making the parent directly liable.",
      "• Subsidiary – a locally incorporated, separate legal entity.",
    ],
  },
];
