// Maintenance details asked on FBT weekly / biweekly PMs (see backend utils/pm_checklists.py).

export const MAINTENANCE_TYPE_LABELS = { preventive: "Preventive", corrective: "Corrective" };
export const COMMODITY_QUESTION = "If any commodity is replaced, describe conditions and location";
export const DOWNTIME_QUESTION = "Downtime while performing maintenance";
export const NO_COMMODITY = "None";

/** 90 -> "1 h 30 min" */
export function formatMinutes(minutes) {
  if (minutes === null || minutes === undefined || minutes === "") return "";
  const total = Number(minutes);
  if (!Number.isFinite(total)) return "";
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  if (!hours) return `${mins} min`;
  return mins ? `${hours} h ${mins} min` : `${hours} h`;
}

export function hasDetails(record) {
  return Boolean(record?.maintenance_type) || (record?.activation_counter ?? null) !== null;
}

/** [label, value] pairs for display; empty when the record has no details. */
export function detailRows(record) {
  if (!hasDetails(record)) return [];
  return [
    ["Maintenance type", MAINTENANCE_TYPE_LABELS[record.maintenance_type] || "—"],
    ["Activation counter", record.activation_counter != null ? Number(record.activation_counter).toLocaleString() : "—"],
    [COMMODITY_QUESTION, record.commodity_replacement || "—"],
    [DOWNTIME_QUESTION, record.downtime_minutes != null ? formatMinutes(record.downtime_minutes) : "—"],
  ];
}

export const DETAIL_CSV_HEADER = [
  "Maintenance Type",
  "Activation Counter",
  "Commodity Replaced (condition & location)",
  "Downtime (min)",
];

export function detailCsvCells(record) {
  return [
    MAINTENANCE_TYPE_LABELS[record.maintenance_type] || "",
    record.activation_counter ?? "",
    record.commodity_replacement || "",
    record.downtime_minutes ?? "",
  ];
}
