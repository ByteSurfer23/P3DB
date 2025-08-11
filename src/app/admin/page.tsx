"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  addDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useForm } from "react-hook-form";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ProtectedRoute from "../ProtectedRoute";

import { useAuth } from "@/context/AuthContext";

type Phytocompound = {
  name: string;
  molecularFormula?: string | null;
  molecularWeight?: string | null;
  iupacName?: string | null;
  smiles?: string | null;
  link1?: string | null;
  link2?: string | null;
};

type JsonEntry = {
  id: string;
  name: string;
};

type Request = {
  id: string;
  activeSiteDocking: boolean;
  blindDocking: boolean;
  createdAt: any;
  ligandTarget: string;
  proteinTarget: string;
  status: string;
  userEmail: string;
  userId: string;
};

type User = {
  id: string;
  admin?: boolean;
  createdAt?: any;
  email?: string;
  location?: string;
  name?: string;
  organization?: string;
  role?: string;
  salutation?: string;
  password?: string;
};

export default function AdminPage() {
  const { user, loading } = useAuth();

  const [view, setView] = useState<"phytocompounds" | "requests" | "users">(
    "phytocompounds"
  );

  // Phytocompounds state & logic (unchanged)
  const [jsonList, setJsonList] = useState<JsonEntry[]>([]);
  const [selectedCompound, setSelectedCompound] = useState<Phytocompound | null>(
    null
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);

  const form = useForm<Phytocompound>({
    defaultValues: {
      name: "",
      molecularFormula: "",
      molecularWeight: "",
      iupacName: "",
      smiles: "",
      link1: "",
      link2: "",
    },
  });

  async function fetchJsonList() {
    try {
      const colRef = collection(db, "jsonCollection");
      const snapshot = await getDocs(colRef);
      const list: JsonEntry[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "",
      }));
      setJsonList(list);
    } catch (error) {
      console.error("Error fetching jsonCollection:", error);
    }
  }

  useEffect(() => {
    if (view === "phytocompounds") fetchJsonList();
  }, [view]);

  async function handleSelect(id: string) {
    try {
      setSelectedId(id);
      const compoundDoc = await getDoc(doc(db, "phytocompounds", id));
      if (compoundDoc.exists()) {
        const data = compoundDoc.data() as Phytocompound;
        setSelectedCompound(data);
        form.reset(data);
        setEditMode(true);
      } else {
        setSelectedCompound(null);
        setEditMode(false);
        setSelectedId(null);
      }
    } catch (error) {
      console.error("Error selecting compound:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteDoc(doc(db, "jsonCollection", id));
      // Optionally: await deleteDoc(doc(db, "phytocompounds", id));
      if (selectedId === id) clearSelection();
      fetchJsonList();
    } catch (error) {
      console.error("Error deleting jsonCollection doc:", error);
    }
  }

  function clearSelection() {
    setSelectedId(null);
    setSelectedCompound(null);
    form.reset({
      name: "",
      molecularFormula: "",
      molecularWeight: "",
      iupacName: "",
      smiles: "",
      link1: "",
      link2: "",
    });
    setEditMode(false);
  }

  async function onSubmit(data: Phytocompound) {
    if (!data.name) {
      alert("Name is required");
      return;
    }

    try {
      if (editMode && selectedId) {
        await updateDoc(doc(db, "phytocompounds", selectedId), data);
        await updateDoc(doc(db, "jsonCollection", selectedId), { name: data.name });
        alert("Updated successfully");
        fetchJsonList();
        clearSelection();
        return;
      }

      const compoundRef = await addDoc(collection(db, "phytocompounds"), data);
      await setDoc(doc(db, "jsonCollection", compoundRef.id), {
        name: data.name,
      });

      alert("Added successfully");
      fetchJsonList();
      clearSelection();
    } catch (error) {
      console.error("Error adding/updating compound:", error);
    }
  }

  const filteredJsonList = jsonList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Requests logic
  const [requests, setRequests] = useState<Request[]>([]);

  async function fetchRequests() {
    if (!user) return;
    try {
      const snapshot = await getDocs(collection(db, "requests"));
      const list: Request[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Request[];
      setRequests(list);
    } catch (error) {
      console.error("Error fetching requests:", error);
    }
  }

  async function updateRequestStatus(id: string, status: string) {
    try {
      await updateDoc(doc(db, "requests", id), { status });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r))
      );
    } catch (error) {
      console.error("Error updating request status:", error);
      alert("Failed to update status. Try again.");
    }
  }

  // Users logic
  const [users, setUsers] = useState<User[]>([]);

  async function fetchUsers() {
    if (!user) return;
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const list: User[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsers(list);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }

  useEffect(() => {
    if (!loading && user) {
      if (view === "requests") fetchRequests();
      else if (view === "users") fetchUsers();
    }
  }, [view, user, loading]);

  // Format Firestore timestamp to readable string
  function formatTimestamp(ts: any) {
    if (!ts || !ts.toDate) return "-";
    return ts.toDate().toLocaleString();
  }

  // Render JSX for each view

  const phytocompoundsView = (
    <>
      <h1 className="text-2xl font-bold mb-4">Phytocompounds Manager</h1>

      <input
        type="text"
        placeholder="Search compounds..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="border p-2 rounded mb-4 w-full max-w-sm"
      />

      <div className="flex gap-6">
        {/* JSON list */}
        <div className="w-1/3 border p-4 rounded max-h-[400px] overflow-auto">
          <h2 className="font-semibold mb-2">JSON Entries</h2>
          {filteredJsonList.length === 0 && <p>No entries found.</p>}
          <ul>
            {filteredJsonList.map(({ id, name }) => (
              <li key={id} className="flex justify-between items-center py-1">
                <button
                  onClick={() => handleSelect(id)}
                  className={`text-left flex-grow ${
                    id === selectedId ? "font-bold text-blue-600" : "text-gray-700"
                  }`}
                >
                  {name}
                </button>
                <button
                  onClick={() => handleDelete(id)}
                  className="text-red-600 ml-2 hover:underline"
                  title="Delete entry"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={clearSelection}
            className="mt-4 w-full bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400"
          >
            Clear Selection
          </button>
        </div>

        {/* Compound details + form */}
        <div className="w-2/3 border p-4 rounded">
          <h2 className="font-semibold mb-4">
            {editMode ? "Edit Compound" : "Add New Compound"}
          </h2>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} required />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="molecularFormula"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Molecular Formula</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="molecularWeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Molecular Weight</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="iupacName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IUPAC Name</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="smiles"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SMILES</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link 1</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="link2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link 2</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center gap-4">
                <Button type="submit">
                  {editMode ? "Save Changes" : "Add Compound"}
                </Button>
                {editMode && (
                  <Button type="button" variant="outline" onClick={clearSelection}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </>
  );

  // Requests View
  const requestsView = (
    <>
      <h1 className="text-2xl font-bold mb-4">Requests Management</h1>

      {requests.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <div className="overflow-auto max-h-[500px] border rounded p-4">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">User Email</th>
                <th className="border border-gray-300 px-4 py-2 text-left">User ID</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Protein Target</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Ligand Target</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Active Site Docking</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Blind Docking</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Created At</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{req.userEmail || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{req.userId || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{req.proteinTarget || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{req.ligandTarget || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{req.activeSiteDocking ? "Yes" : "No"}</td>
                  <td className="border border-gray-300 px-4 py-2">{req.blindDocking ? "Yes" : "No"}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatTimestamp(req.createdAt)}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={req.status}
                      onChange={(e) => updateRequestStatus(req.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                      <option value="in review">In Review</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  // Users View
  const usersView = (
    <>
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      {users.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-auto max-h-[500px] border rounded p-4">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Email</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Admin</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Created At</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Location</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Organization</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Salutation</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{user.name || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.admin ? "Yes" : "No"}</td>
                  <td className="border border-gray-300 px-4 py-2">{formatTimestamp(user.createdAt)}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.location || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.organization || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.role || "-"}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.salutation || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-6xl mx-auto">
        <nav className="mb-6 flex gap-4">
          <Button
            variant={view === "phytocompounds" ? "default" : "outline"}
            onClick={() => setView("phytocompounds")}
          >
            Phytocompounds
          </Button>
          <Button
            variant={view === "requests" ? "default" : "outline"}
            onClick={() => setView("requests")}
          >
            Requests
          </Button>
          <Button
            variant={view === "users" ? "default" : "outline"}
            onClick={() => setView("users")}
          >
            Users
          </Button>
        </nav>

        {view === "phytocompounds" && phytocompoundsView}
        {view === "requests" && requestsView}
        {view === "users" && usersView}
      </div>
    </ProtectedRoute>
  );
}
