import { redirect } from "next/navigation";
export default async function LegacyAffiliatePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  redirect(`/network/affiliates/${encodeURIComponent(code)}`);
}
