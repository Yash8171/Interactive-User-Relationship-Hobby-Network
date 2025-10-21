import React, { useRef } from "react";
import GraphView from "./components/GraphView";
import Sidebar from "./components/Sidebar";
import UserForm from "./components/UserForm";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  const graphRef = useRef<{ reload: () => void }>(null);

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ width: 320, padding: 8 }}>
        <UserForm />
        <Sidebar onGraphUpdate={() => graphRef.current?.reload()} />
      </div>
      <div style={{ flex: 1 }}>
        <GraphView ref={graphRef} />
      </div>
      <ToastContainer />
    </div>
  );
}
