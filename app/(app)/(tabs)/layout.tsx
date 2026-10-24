import { TabBar } from "@/components/ui/TabBar";
import s from "./tabs.module.css";

/**
 * The four tab screens (06 E6.1). The tab bar shows here and nowhere else:
 * inside a station, a task or a turn it is replaced by the top bar. A left
 * rail on Regular width.
 */
export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.frame}>
      <div className={s.screen}>{children}</div>
      <TabBar />
    </div>
  );
}
