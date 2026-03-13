// src/er/graphBuilder.ts

export const buildElkGraph = (nodes: any[], edges: any[]) => {
  // 1. Identify Core vs Satellite nodes
  const coreNodes = nodes.filter((n) =>
    ["entity", "weakEntity", "relationship", "isa"].includes(n.type)
  );
  const attributeNodes = nodes.filter((n) =>
    ["attribute", "multivaluedAttribute"].includes(n.type)
  );
  const coreNodeIds = new Set(coreNodes.map((n) => n.id));

  // 2. Map Attributes to Parents
  const parentToAttributes: Record<string, string[]> = {};
  const attributeParentMap: Record<string, string> = {};

  edges.forEach((e) => {
    let attrId, parentId;
    if (attributeNodes.find((a) => a.id === e.source) && coreNodeIds.has(e.target)) {
      attrId = e.source;
      parentId = e.target;
    } else if (attributeNodes.find((a) => a.id === e.target) && coreNodeIds.has(e.source)) {
      attrId = e.target;
      parentId = e.source;
    }

    if (attrId && parentId) {
      attributeParentMap[attrId] = parentId;
      if (!parentToAttributes[parentId]) parentToAttributes[parentId] = [];
      parentToAttributes[parentId].push(attrId);
    }
  });

  // 3. Construct the Graph for ELK
  // We calculate dimensions HERE, not in the layout file.
  const elkChildren = coreNodes.map((n) => {
    const attrCount = parentToAttributes[n.id]?.length || 0;
    const requiredRadius = 120 + attrCount * 20;
    const boxSize = requiredRadius * 2;

    return {
      id: n.id,
      width: boxSize,
      height: boxSize,
      layoutOptions: {
        desiredRadius: requiredRadius.toString(), // Store as string for ELK
      },
    };
  });

  const elkEdges = edges
    .filter((e) => coreNodeIds.has(e.source) && coreNodeIds.has(e.target))
    .map((e) => ({
      id: e.id,
      sources: [e.source],
      targets: [e.target],
    }));

  return {
    graph: {
      id: "root",
      layoutOptions: {
        "elk.algorithm": "stress",
        "elk.stress.desiredEdgeLength": "200",
        "elk.spacing.nodeNode": "100",
      },
      children: elkChildren,
      edges: elkEdges,
    },
    // Return these maps so layout.ts can use them for positioning
    parentToAttributes,
    attributeParentMap,
    attributeNodes,
  };
};
