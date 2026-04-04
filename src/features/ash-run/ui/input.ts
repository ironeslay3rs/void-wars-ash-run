import type { InputBits } from "../core/types";

export function createEmptyInput(): InputBits {
  return {
    left: false,
    right: false,
    jump: false,
    jumpPressed: false,
    dash: false,
    dashPressed: false,
    attack: false,
    attackPressed: false,
    unstable: false,
    unstablePressed: false,
  };
}
