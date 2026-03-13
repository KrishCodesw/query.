import { Handle, Position } from "@xyflow/react";

// CSS to force the handle to the absolute center
const handleStyle = {
  left: "50%",
  top: "50%",
  transform: "translate(-50%, -50%)",
  opacity: 0, // Hide the dot so the line looks like it touches the text
  width: 10,
  height: 10,
  position: "absolute" as const, // Ensure it ignores the standard flow
  border: "none",
  background: "transparent",
};

export default function AttributeNode({ data }: any) {
  return (
    <div style={{ width: 120, height: 60, position: "relative" }}>
      {/* FIX: Use Position.Left (or Top) but override with CSS */}
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        isConnectable={true}
      />

      <svg width={120} height={60} style={{ overflow: "visible" }}>
        <ellipse
          cx="60"
          cy="30"
          rx="56"
          ry="26"
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
        <foreignObject x="10" y="15" width="100" height="30">
          <input
            className="nodrag"
            value={data.label}
            onChange={(evt) => data.onChange?.(evt.target.value)}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              textAlign: "center",
              fontSize: "12px",
              outline: "none",
            }}
          />
        </foreignObject>
      </svg>

      {/* FIX: Same here for Source handle */}
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        isConnectable={true}
      />
    </div>
  );
}
