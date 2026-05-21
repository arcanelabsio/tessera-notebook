import type { SceneType } from "../content/types";

const LABEL: Record<SceneType, string> = {
  feature: "FEATURE",
  incident: "INCIDENT",
  support: "SUPPORT",
  decision: "DECISION",
};

export function SceneTypeBadge({ sceneType }: { sceneType: SceneType }) {
  return (
    <span className={`badge badge--${sceneType}`}>[ {LABEL[sceneType]} ]</span>
  );
}
