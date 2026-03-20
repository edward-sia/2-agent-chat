export type PatternId =
  | "agents-as-tools"
  | "handoff"
  | "structured-handoff"
  | "code-router"
  | "parallel"
  | "feedback-loop";

export type DemoResult = {
  finalOutput: string;
  trace: string[];
  notes: string[];
};

export type PatternDefinition = {
  id: PatternId;
  title: string;
  analogy: string;
  whoDecides: "The model decides" | "Your code decides";
  summary: string;
  whenToUse: string;
  defaultTask: string;
  run: (task: string) => Promise<DemoResult>;
};
