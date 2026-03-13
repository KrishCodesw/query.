// src/er/types.ts

export type ERNodeType =
  | "entity"
  | "weakEntity"
  | "relationship"
  | "attribute"
  | "multivalued"
  | "isa";

export interface ERNode {
  id: string;
  type: ERNodeType;
  label: string;
  data?: any;
}

export interface EREdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}
   