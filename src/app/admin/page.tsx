"use client";

import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
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

export default function PhytocompoundsPage() {
  const [jsonList, setJsonList] = useState<JsonEntry[]>([]);
  const [selectedCompound, setSelectedCompound] = useState<Phytocompound | null>(null);
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

  // Fetch JSON entries on mount and after updates
  async function fetchJsonList() {
    const colRef = collection(db, "jsonCollection");
    const snapshot = await getDocs(colRef);
    const list: JsonEntry[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
    }));
    setJsonList(list);
  }

  useEffect(() => {
    fetchJsonList();
  }, []);

  // Fetch full compound details on select
  async function handleSelect(id: string) {
    setSelectedId(id);
    const compoundDoc = await getDoc(doc(db, "phytocompounds", id));
    if (compoundDoc.exists()) {
      const data = compoundDoc.data() as Phytocompound;
      setSelectedCompound(data);
      form.reset(data);
      setEditMode(true); // <-- Set edit mode true on select
    } else {
      setSelectedCompound(null);
      setEditMode(false);
      setSelectedId(null);
    }
  }

  // Delete JSON entry and optionally the compound doc
  async function handleDelete(id: string) {
    await deleteDoc(doc(db, "jsonCollection", id));
    // Optionally: await deleteDoc(doc(db, "phytocompounds", id));

    if (selectedId === id) {
      clearSelection();
    }
    fetchJsonList();
  }

  // Clear selection and reset form to creation mode (empty form)
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
    setEditMode(false); // <-- Set edit mode false on clear
  }

  // Add new compound + JSON entry or update existing
  async function onSubmit(data: Phytocompound) {
    if (!data.name) {
      alert("Name is required");
      return;
    }

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
  }

  const filteredJsonList = jsonList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
    <div className="p-6 max-w-5xl mx-auto">
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
                <Button type="submit">{editMode ? "Save Changes" : "Add Compound"}</Button>
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
    </div>
    </ProtectedRoute>
  );
}
