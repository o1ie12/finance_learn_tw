import { TabBar } from "@/components/ui/TabBar";
import s from "@/app/(app)/(tabs)/tabs.module.css";

/** The tab screens' frame: the screen beside the sidebar (the floating tab bar on a phone). */
export function TabFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={s.frame}>
      <div className={s.screen}>{children}</div>
      <TabBar />
    </div>
  );
}
