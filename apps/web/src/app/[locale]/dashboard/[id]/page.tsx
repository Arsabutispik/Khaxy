import { redirect } from "@/i18n/navigation";

type ServerDashboardProps = {
  params: Promise<{
    // This is the standard Next.js object passed to a Page Component
    locale: string;
    id: string;
  }>;
};

export default async function ServerDashboard({
  params,
}: ServerDashboardProps) {
  redirect({
    href: `/dashboard/${(await params).id}/home`,
    locale: (await params).locale,
  });
}
