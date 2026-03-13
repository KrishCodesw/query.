"use client";
import { useEffect, useCallback } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState, // These are the hooks causing the 'never' error
  useEdgesState,
  Controls,
  Background,
  type Node, // FIX: Import 'type' explicitly
  type Edge,
  type Connection,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";

import { exportSvg } from "./export/exportSvg";
import { parseER } from "./er/parser";
import { layoutGraph } from "./er/layout";

import EntityNode from "./nodes/EntityNode";
import WeakEntityNode from "./nodes/WeakEntityNode";
import RelationshipNode from "./nodes/RelationshipNode";
import AttributeNode from "./nodes/AttributeNode";
import ISANode from "./nodes/ISANode";
import MultivaluedAttributeNode from "./nodes/MultivaluedAttributeNode";

const nodeTypes = {
  entity: EntityNode,
  weakEntity: WeakEntityNode,
  relationship: RelationshipNode,
  attribute: AttributeNode,
  isa: ISANode,
  multivaluedAttribute: MultivaluedAttributeNode,
};

export default function Diagram({ data }: { data: any }) {
  // FIX 1: Add <Node> generic to prevent 'never[]' error
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);

  // FIX 2: Add <Edge> generic
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  useEffect(() => {
    async function build() {
      if (!data) return;
      const parsed = parseER(data);
      const layoutResult =
        (await layoutGraph(parsed.nodes, parsed.edges)) || [];

      const rfNodes: Node[] = parsed.nodes.map((n: any) => {
        const layoutNode = layoutResult.find((p: any) => p.id === n.id);
        return {
          id: n.id,
          type: n.type,
          position: layoutNode?.position || { x: 0, y: 0 },
          data: { label: n.label, ...n.data },
        };
      });

      const rfEdges: Edge[] = parsed.edges.map((e: any) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: "straight", // Keeps lines clean
        style: { stroke: "#333", strokeWidth: 1.5 },
      }));

      setNodes(rfNodes);
      setEdges(rfEdges);
    }

    if (data) build();
  }, [data, setNodes, setEdges]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        defaultEdgeOptions={{ type: "straight" }}
      >
        <Background gap={20} size={1} />
        <Controls />
      </ReactFlow>
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <button onClick={exportSvg}>Export SVG</button>
      </div>
    </div>
  );
}
