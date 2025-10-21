import React, { useEffect, useCallback, useMemo, useImperativeHandle, forwardRef } from "react";
import ReactFlow, { Node, Edge, Background, Controls, addEdge, Connection, useNodesState, useEdgesState } from "reactflow";
import "reactflow/dist/style.css";
import api from "../api";
import { toast } from "react-toastify";
import CustomNode from "./CustomNode";
import { CustomNodeData } from "../types";

interface GraphViewHandle {
  reload: () => void;
}

const GraphView = forwardRef<GraphViewHandle>((props, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<CustomNodeData>[]>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge[]>([]);

  const nodeTypes = useMemo(() => ({ customNode: CustomNode }), []);

  const handleHobbyDrop = useCallback(
    async (nodeId: string, hobby: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      try {
        const ageMatch = node.data.label.match(/\((\d+)\)/);
        const updatedHobbies = Array.from(new Set([...(node.data.hobbies || []), hobby]));

        await api.put(`/users/${nodeId}`, {
          username: node.data.label.split(" ")[0],
          age: Number(ageMatch?.[1] ?? 0),
          hobbies: updatedHobbies,
        });

        toast.success(`Added hobby "${hobby}" to ${node.data.label.split(" ")[0]}`);
        await load(); // reload nodes after update
      } catch {
        toast.error("Failed to add hobby");
      }
    },
    [nodes]
  );

  const load = useCallback(async () => {
    try {
      const res = await api.get("/graph");
      setNodes((prevNodes) =>
        res.data.nodes.map((n: any) => {
          const existing = prevNodes.find((node) => node.id === n.id);
          return {
            id: n.id,
            type: "customNode",
            position: existing ? existing.position : { x: Math.random() * 800, y: Math.random() * 500 },
            data: {
              id: n.id,
              label: `${n.username} (${n.age})`,
              popularity: n.popularityScore,
              hobbies: n.hobbies,
              onHobbyDrop: handleHobbyDrop,
            },
          };
        })
      );
      setEdges(
        res.data.edges.map((e: any) => ({
          id: `${e.source}-${e.target}`,
          source: e.source,
          target: e.target,
          animated: true,
        }))
      );
    } catch (err) {
      console.error("Failed to load graph", err);
      toast.error("Failed to load graph");
    }
  }, [setNodes, setEdges, handleHobbyDrop]);

  const onConnect = useCallback(
    async (params: Connection) => {
      const { source, target } = params;
      if (!source || !target) return;
      try {
        await api.post(`/users/${source}/link`, { targetId: target });
        toast.success("Users linked successfully!");
        setEdges((eds) => addEdge(params, eds));
        await load();
      } catch (err: any) {
        if (err.response?.status === 409) toast.error("Users are already connected!");
        else toast.error("Failed to link users!");
      }
    },
    [setEdges, load]
  );

  useImperativeHandle(ref, () => ({
    reload: load,
  }));

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div style={{ height: "90vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodesDraggable
      >
        <Background />
        <Controls />
      </ReactFlow>
    </div>
  );
});

export default GraphView;
