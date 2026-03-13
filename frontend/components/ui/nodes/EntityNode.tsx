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
  zIndex: 10, // Ensure handles sit above the SVG for easy clicking
};

export default function EntityNode({ data }: any) {
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
        {/* Rectangle for Entity */}
        <rect
          x="2"
          y="2"
          width="116"
          height="56"
          fill="white"
          stroke="black"
          strokeWidth="2"
          rx="4" // Optional: slightly rounded corners
        />
        <foreignObject x="5" y="15" width="110" height="30">
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
              fontSize: "14px",
              fontWeight: "bold",
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
