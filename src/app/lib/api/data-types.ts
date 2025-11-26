export async function getDataTypes(): Promise<string[]> {
  const res = await fetch("/api/data-types");
  if (!res.ok) throw new Error("Failed to fetch data types");
  return res.json();
}
