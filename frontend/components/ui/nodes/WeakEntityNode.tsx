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

export default function WeakEntityNode({ data }: any) {
  return (
    <div style={{ width: 150, height: 70, position: "relative" }}>
      {/* Target Handle: Centered */}
      <Handle
        type="target"
        position={Position.Left}
        style={handleStyle}
        isConnectable={true}
      />

      <svg width={150} height={70} style={{ overflow: "visible" }}>
        {/* Outer Rectangle */}
        <rect
          x="2"
          y="2"
          width="146"
          height="66"
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
        {/* Inner Rectangle */}
        <rect
          x="8"
          y="8"
          width="134"
          height="54"
          fill="none"
          stroke="black"
          strokeWidth="1"
        />
        <foreignObject x="10" y="20" width="130" height="30">
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
              fontWeight: "bold",
              fontSize: "14px",
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
