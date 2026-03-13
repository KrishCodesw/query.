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

export default function RelationshipNode({ data }: any) {
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
        {/* Diamond (Polygon) for Relationship */}
        {/* Points calculated for 120x60 box with padding for stroke */}
        <polygon
          points="60,2 118,30 60,58 2,30"
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
        {/* ForeignObject input is smaller to fit inside the diamond shape */}
        <foreignObject x="25" y="20" width="70" height="20">
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
              fontWeight: "500",
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
