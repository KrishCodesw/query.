// src/er/layout.ts
import ELK from "elkjs/lib/elk.bundled.js";
import { buildElkGraph } from "./graphBuilder"; // Import the helper

const elk = new ELK();

export async function layoutGraph(nodes: any[], edges: any[]) {
  // 1. Use the Builder to prepare the graph
  const { graph, parentToAttributes, attributeParentMap, attributeNodes } = buildElkGraph(nodes, edges);

  try {
    // 2. Run ELK
    const layout = await elk.layout(graph);
    const finalNodes: any[] = [];

    // 3. Process Results
    layout.children?.forEach((n: any) => {
      const radius = parseFloat(n.layoutOptions?.desiredRadius || "120");
      const centerX = n.x + n.width / 2;
      const centerY = n.y + n.height / 2;

      // Place Core Node (Entity) in the center
      finalNodes.push({
        id: n.id,
        position: { x: centerX - 70, y: centerY - 35 },
      });

      // Place Satellite Nodes (Attributes) in orbit
      const satellites = parentToAttributes[n.id] || [];
      if (satellites.length > 0) {
        const orbitRadius = radius - 40;
        const stepAngle = (2 * Math.PI) / satellites.length;

        satellites.forEach((attrId, index) => {
          const angle = index * stepAngle;
          finalNodes.push({
            id: attrId,
            position: {
              x: centerX + orbitRadius * Math.cos(angle) - 50,
              y: centerY + orbitRadius * Math.sin(angle) - 25,
            },
          });
        });
      }
    });

    // Handle Orphans
    attributeNodes.forEach((attr) => {
      if (!attributeParentMap[attr.id]) {
        finalNodes.push({ id: attr.id, position: { x: 0, y: 0 } });
      }
    });

    return finalNodes;
  } catch (error) {
    console.error("Layout Error:", error);
    return nodes.map((n, i) => ({ id: n.id, position: { x: i * 50, y: i * 50 } }));
  }
}
