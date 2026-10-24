import { TabFrame } from "@/components/ui/TabFrame";

/**
 * The four tab screens (06 E6.1). The tab bar shows here and on a signed-in
 * course page: inside a station, a task or a turn it is replaced by the top
 * bar. A glass sidebar on Regular width.
 */
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return <TabFrame>{children}</TabFrame>;
}
