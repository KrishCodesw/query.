import { Handle, Position } from "@xyflow/react";

// CSS to force the handle to the absolute center
const handleStyle = {
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  opacity: 0,
  width: 10,
  height: 10,
  position: "absolute" as const,
  border: "none",
  background: "transparent",
  zIndex: 10,
};

export default function ISANode({ data }: any) {
  return (
    <div style={{ width: 80, height: 60, position: "relative" }}>
      {/* Target Handle: Centered */}
      <Handle
        type="target"
        position={Position.Top}
        style={handleStyle}
        isConnectable={true}
      />

      <svg width={80} height={60} style={{ overflow: "visible" }}>
        {/* Triangle (ISA Hierarchy) */}
        <polygon
          points="40,2 78,58 2,58"
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
        <foreignObject x="10" y="32" width="60" height="25">
          <input
            className="nodrag"
            value={data?.label || "ISA"}
            onChange={(evt) => data?.onChange?.(evt.target.value)}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "transparent",
              textAlign: "center",
              fontSize: "12px",
              fontWeight: "bold",
              outline: "none",
            }}
          />
        </foreignObject>
      </svg>

      {/* Source Handle: Centered */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={handleStyle}
        isConnectable={true}
      />
    </div>
  );
}
