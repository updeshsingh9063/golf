export type HatStatus = "available" | "sold" | "reserved";

export type HatNumber = {
  number: number;
  status: HatStatus;
  charity: string | null;
  ownerLabel: string | null;
};

const sold: Record<number, string> = {
  1: "Community Food Share",
  4: "Wednesday Pantry",
  7: "Second Harvest Kitchen",
  11: "Community Food Share",
  18: "Fairway Food Bank",
  22: "Second Harvest Kitchen",
  31: "Fairway Food Bank",
  42: "Wednesday Pantry",
  55: "Community Food Share",
  68: "Second Harvest Kitchen"
};

const reserved = new Set([9, 13, 27, 36, 49, 60]);

export const editionCount = 72;

export const hats: HatNumber[] = Array.from({ length: editionCount }, (_, index) => {
  const number = index + 1;
  const charity = sold[number] ?? null;

  return {
    number,
    status: charity ? "sold" : reserved.has(number) ? "reserved" : "available",
    charity,
    ownerLabel: charity ? `Owner ${String(number).padStart(2, "0")}` : null
  };
});

export const charities = [
  "Community Food Share",
  "Wednesday Pantry",
  "Second Harvest Kitchen",
  "Fairway Food Bank"
];

export const stats = {
  available: hats.filter((hat) => hat.status === "available").length,
  sold: hats.filter((hat) => hat.status === "sold").length,
  reserved: hats.filter((hat) => hat.status === "reserved").length,
  total: hats.length
};
