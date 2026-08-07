/**
 * TEMPORARY pilot-test flag — gates the dashboard map-vs-card-grid A/B
 * comparison screen (see components/DashboardABTest.tsx and its use in
 * app/dashboard/page.tsx). Once the pilot group's feedback picks a winning
 * design, either extend that design site-wide or delete this flag along with
 * DashboardABTest, DashboardCardGrid, and the branch that reads it.
 */
export function isDashboardAbTestEnabled(): boolean {
  return process.env.ENABLE_DASHBOARD_AB_TEST === "true";
}
