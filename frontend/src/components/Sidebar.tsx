// frontend/src/components/Sidebar.tsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { toast } from "react-toastify";

interface SidebarProps {
  onGraphUpdate?: () => void; // callback to reload graph
}

export default function Sidebar({ onGraphUpdate }: SidebarProps) {
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [newHobby, setNewHobby] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
  try {
    const res = await api.get("/users");
    setUsers(res.data);

    // Ensure hobbies are typed as string[]
    const allHobbies: string[] = Array.from(
      new Set(
        res.data.flatMap((u: any) => u.hobbies as string[])
      )
    );

    setHobbies(allHobbies);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch users");
  }
}


  // Add hobby to a specific user (first user for demo)
  async function addHobbyToFirst() {
    if (!users.length) return toast.error("No users available");
    const user = users[0];
    const updatedHobbies = Array.from(new Set([...(user.hobbies || []), newHobby]));

    try {
      await api.put(`/users/${user.id}`, {
        username: user.username,
        age: user.age,
        hobbies: updatedHobbies,
      });
      toast.success(`Added hobby "${newHobby}" to ${user.username}`);
      setNewHobby("");
      fetchData(); // refresh hobbies

      if (onGraphUpdate) onGraphUpdate(); // refresh graph
    } catch (err) {
      console.error(err);
      toast.error("Failed to add hobby");
    }
  }

  return (
    <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8, width: 220 }}>
      <h3>Hobbies</h3>
      <ul style={{ paddingLeft: 16 }}>
        {hobbies.map((h) => (
          <li
            key={h}
            draggable
            onDragStart={(e) => e.dataTransfer.setData("text/plain", h)}
            style={{
              cursor: "grab",
              background: "#eee",
              marginBottom: 4,
              padding: "4px 8px",
              borderRadius: 4,
              userSelect: "none",
            }}
          >
            {h}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 12 }}>
        <input
          value={newHobby}
          onChange={(e) => setNewHobby(e.target.value)}
          placeholder="Add new hobby"
          style={{ width: "140px", padding: 4 }}
        />
        <button onClick={addHobbyToFirst} style={{ marginLeft: 8, padding: "4px 8px" }}>
          Add
        </button>
      </div>
    </div>
  );
}
