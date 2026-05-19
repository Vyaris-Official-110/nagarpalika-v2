import Counter from "../models/Counter.js";

export async function generateRegistrationId(tenantId) {
  const year = new Date().getFullYear();
  const key = `reg-${tenantId.toLowerCase()}-${year}`;

  const counter = await Counter.findOneAndUpdate(
    { key },
    { $inc: { seq: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const seq = String(counter.seq).padStart(7, "0");
  return `RP-${tenantId.toUpperCase()}-${year}-${seq}`;
}
