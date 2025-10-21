import React, { useState } from "react";
import api from "../api";
import { toast } from "react-toastify";

export default function UserForm() {
  const [username, setUsername] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [hobbies, setHobbies] = useState("");

  const submit = async () => {
    if (!username || age === "" || isNaN(Number(age))) { toast.error("Invalid input"); return; }
    try {
      await api.post("/users", { username, age: Number(age), hobbies: hobbies ? hobbies.split(",").map(s => s.trim()) : [] });
      toast.success("User created");
      setUsername(""); setAge(""); setHobbies("");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Error");
    }
  };

  return (
    <div>
      <h3>Create User</h3>
      <input value={username} onChange={e => setUsername(e.target.value)} placeholder="username" />
      <input value={String(age)} onChange={e => setAge(Number(e.target.value))} placeholder="age" />
      <input value={hobbies} onChange={e => setHobbies(e.target.value)} placeholder="comma separated hobbies" />
      <button onClick={submit}>Create</button>
    </div>
  );
}
