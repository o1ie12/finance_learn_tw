/** Props every step view takes. The task panel owns the draft and 「送出」. */
export interface StepViewProps<S, D> {
  step: S;
  value: D;
  onChange(next: D): void;
  /**
   * Keyboard confirm (Enter): same as pressing 「送出」. Pass the newest
   * draft when the change has not reached state yet.
   */
  onConfirm(next?: D): void;
  disabled?: boolean;
  /** Id of the step's prompt heading; names the step's main group. */
  promptId: string;
}
