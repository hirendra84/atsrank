import React from "react";

// Mapping of icon names to Icons8 STATIC ID numbers
export const ICONS8_STATIC_MAP = {
  upload: "14090",
  file: "14086",
  document: "itfLfGAHyRna",
  check: "HBR0c_yZeXyu",
  checkmark: "HBR0c_yZeXyu",
  warning: "16251",
  caution: "16251",
  "chevron-right": "15822",
  star: "16101",
  briefcase: "14200",
  code: "16786",
  layout: "14148",
  lock: "14307",
  mail: "22028",
  logout: "22112",
  close: "16248",
  x: "16248",
  "shield-alert": "23223",
  sparkles: "mplkGsOVjD8X",
  shield: "16172",
  zap: "17439",
  info: "14093",
  "arrow-right": "14914",
  help: "16140",
  "chevron-down": "15818",
  "chevron-left": "15820",
  google: "17935",
  github: "16318"
};

// Animated counterparts
export const ICONS8_ANIMATED_MAP: Partial<Record<keyof typeof ICONS8_STATIC_MAP, string>> = {
  file: "BE676BWP0ogI",
  document: "D8D65y6Vy5bY",
  check: "ZBQJIdqe73bi",
  checkmark: "on7XTTyTAsLM",
  warning: "K39HZ9lwqjSk",
  caution: "zHqriwlFOo3J",
  star: "GgIerIRW6je7",
  briefcase: "8xgb1iOnvMa7",
  code: "mcCRHk2xvR7f",
  lock: "fu4OChmjxQuT",
  mail: "mXcvtsj8e1Ug",
  logout: "arrojWw9F5j5",
  close: "OnvcRudMyrz9",
  x: "OnvcRudMyrz9",
  sparkles: "iH4tJvSyj9uA",
  shield: "Ql1XRnC3qUpG",
  zap: "Nb8usNzXUMhX",
  info: "Plgmgi7oHlL6",
  "arrow-right": "2AtD6zJXrMwz",
  help: "E4FAF4hA9ugF",
  google: "mf4ZGGJQaEqm",
  github: "akG4VRhAoSii",
  upload: "rQHPcf1HLSWR"
};

export type Icons8IconName = keyof typeof ICONS8_STATIC_MAP;

interface Icons8IconProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src" | "alt"> {
  name: Icons8IconName;
  size?: number;
}

export default function Icons8Icon({ name, size = 24, className = "", ...props }: Icons8IconProps) {
  const animatedId = ICONS8_ANIMATED_MAP[name];
  const staticId = ICONS8_STATIC_MAP[name];
  
  if (!staticId && !animatedId) {
    console.warn(`Icons8Icon: name "${name}" not found in ICONS8_MAP.`);
    return null;
  }

  // Use animated GIF if available, otherwise fallback to static PNG
  const src = animatedId
    ? `https://img.icons8.com/?id=${animatedId}&format=gif&size=${size * 2}`
    : `https://img.icons8.com/?id=${staticId}&format=png&size=${size * 2}`;

  return (
    <img 
      src={src} 
      alt={name} 
      className={`inline-block object-contain shrink-0 ${className}`}
      style={{ width: size, height: size, ...props.style }}
      {...props}
    />
  );
}
