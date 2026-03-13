// srcconst model = json.conceptual_er_model || json;
import type { ERNode, EREdge } from "./types";

export function parseER(json: any) {
  const nodes: ERNode[] = [];
  const edges: EREdge[] = [];

  const model = json.conceptual_er_model || json;
  
  if (!model || !model.entities) {
    console.warn("parseER: No entities found in data", json);
    return { nodes: [], edges: [] }; 
  }

  /* ---------- ENTITIES ---------- */

  model.entities.forEach((e: any) => {
    const entityType =
      e.type === "weak" ? "weakEntity" : "entity";

    nodes.push({
      id: e.name,
      type: entityType,
      label: e.name,
      data: e,
    });

    /* ---------- ATTRIBUTES ---------- */

    e.attributes.forEach((a: any) => {
      const attrId = `${e.name}_${a.name}`;

      // Multivalued vs normal
      const attrType =
        a.type === "multivalued"
          ? "multivalued"
          : "attribute";

      // Parent attribute
      nodes.push({
        id: attrId,
        type: attrType,
        label: a.name,
        data: a,
      });

      edges.push({
        id: `edge_${attrId}`,
        source: e.name,
        target: attrId,
      });

      // Composite attributes
      if (a.type === "composite") {
        a.components?.forEach((c: string) => {
          const cid = `${attrId}_${c}`;

          nodes.push({
            id: cid,
            type: "attribute",
            label: c,
          });

          edges.push({
            id: `edge_${cid}`,
            source: attrId,
            target: cid,
          });
        });
      }
    });
  });

  /* ---------- RELATIONSHIPS ---------- */

  model.relationships.forEach((r: any) => {
    nodes.push({
      id: r.name,
      type: "relationship",
      label: r.name,
      data: r,
    });

    r.entities.forEach((ent: any) => {
      edges.push({
        id: `${r.name}_${ent.name}`,
        source: r.name,
        target: ent.name,
        label: ent.cardinality, // ✅ already safe
      });
    });
  });

  /* ---------- WEAK ENTITY IDENTIFYING ---------- */

  model.relationships
    .filter((r: any) => r.type === "identifying")
    .forEach((r: any) => {
      r.entities.forEach((ent: any) => {
        if (ent.participation === "total") {
          edges.push({
            id: `weak_${r.name}_${ent.name}`,
            source: r.name,
            target: ent.name,
            label: "ID",
          });
        }
      });
    });

  /* ---------- ISA ---------- */

  model.specializations.forEach((s: any) => {
    const isaId = `ISA_${s.superclass}`;

    nodes.push({
      id: isaId,
      type: "isa",
      label: "ISA",
      data: s,
    });

    // Superclass
    edges.push({
      id: `${isaId}_${s.superclass}`,
      source: isaId,
      target: s.superclass,
    });

    // Subclasses
    s.subclasses.forEach((sub: string) => {
      edges.push({
        id: `${isaId}_${sub}`,
        source: isaId,
        target: sub,
      });
    });
  });

  return { nodes, edges };
}
