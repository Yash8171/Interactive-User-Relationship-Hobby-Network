import React from "react";
import { Handle, Position } from "reactflow";
import { CustomNodeData } from "../types";

interface CustomNodeProps {
  data: CustomNodeData;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data }) => {
  const popularityPercent = Math.min(data.popularity * 10, 100);

  // Drop handler at the node level
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const hobby = event.dataTransfer.getData("text/plain");
    if (hobby && data.onHobbyDrop) {
      data.onHobbyDrop(data.id, hobby);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      style={{
        padding: 12,
        borderRadius: 10,
        border: "2px solid #333",
        background: `linear-gradient(135deg, #f0f0f0 ${popularityPercent}%, ${
          data.popularity > 5 ? "#c8f7c5" : "#c5d8f7"
        } 0%)`,
        minWidth: 120,
        maxWidth: 220,
        textAlign: "center",
        fontWeight: 500,
        boxShadow: "2px 2px 8px rgba(0,0,0,0.2)",
        position: "relative",
        userSelect: "none",
        cursor: "pointer",
      }}
    >
      {/* Top handle for linking */}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#ff6666", width: 14, height: 14, borderRadius: "50%" }}
      />

      {/* Label and hobbies */}
      <div>
        <div>{data.label}</div>
        <div style={{ marginTop: 4, display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
          {data.hobbies?.map((hobby) => (
            <span
              key={hobby}
              style={{
                fontSize: 10,
                margin: 2,
                padding: "2px 4px",
                background: "#eee",
                borderRadius: 4,
              }}
            >
              {hobby}
            </span>
          ))}
        </div>
      </div>

      {/* Popularity bar */}
      <div
        style={{
          height: 6,
          background: "#ccc",
          borderRadius: 3,
          overflow: "hidden",
          marginTop: 6,
        }}
      >
        <div style={{ width: `${popularityPercent}%`, height: "100%", background: "#4caf50" }} />
      </div>

      {/* Bottom handle for linking */}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#4caf50", width: 14, height: 14, borderRadius: "50%" }}
      />
    </div>
  );
};

export default CustomNode;
