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

export default function MultivaluedAttributeNode({ data }: any) {
  return (
    <div style={{ width: 120, height: 60, position: "relative" }}>
      {/* Target Handle: Centered */}
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        isConnectable={true}
      />

      <svg width={120} height={60} style={{ overflow: "visible" }}>
        {/* Outer Ellipse */}
        <ellipse
          cx="60"
          cy="30"
          rx="58"
          ry="28"
          fill="white"
          stroke="black"
          strokeWidth="1"
        />
        {/* Inner Ellipse */}
        <ellipse
          cx="60"
          cy="30"
          rx="52"
          ry="22"
          fill="none"
          stroke="black"
          strokeWidth="1"
        />

        <foreignObject x="15" y="15" width="90" height="30">
          <input
            className="nodrag"
            value={data.label}
            onChange={(evt) => data.onChange?.(evt.target.value)}
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "transparent",
              textAlign: "center",
              fontSize: "12px",
              outline: "none",
            }}
          />
        </foreignObject>
      </svg>

      {/* Source Handle: Centered */}
      <Handle
        type="source"
        position={Position.Right}
        style={handleStyle}
        isConnectable={true}
      />
    </div>
  );
}
