"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
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

export default function SearchPage() {
  const [jsonList, setJsonList] = useState<JsonEntry[]>([]);
  const [selectedCompound, setSelectedCompound] = useState<Phytocompound | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch JSON entries on mount
  async function fetchJsonList() {
    const colRef = collection(db, "jsonCollection");
    const snapshot = await getDocs(colRef);
    const list: JsonEntry[] = snapshot.docs.map(doc => ({
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
      setSelectedCompound(compoundDoc.data() as Phytocompound);
    } else {
      setSelectedCompound(null);
    }
  }

  // Cancel current selection
  function handleCancel() {
    setSelectedCompound(null);
    setSelectedId(null);
  }

  // Filter JSON list by search term
  const filteredJsonList = jsonList.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Search Phytocompounds</h1>

          <div className="mb-4">
      <Link
        href="/request"
        className="text-blue-600 underline hover:text-blue-800"
      >
        Go to Request Page
      </Link>
    </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search compounds..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        className="border p-2 rounded mb-4 w-full max-w-sm"
      />

      <div className="flex gap-6">
        {/* JSON List */}
        <div className="w-1/3 border p-4 rounded max-h-[400px] overflow-auto">
          <h2 className="font-semibold mb-2">Compound List</h2>
          {filteredJsonList.length === 0 && <p>No entries found.</p>}
          <ul>
            {filteredJsonList.map(({ id, name }) => (
              <li key={id} className="py-1 cursor-pointer hover:bg-gray-100 rounded">
                <button
                  onClick={() => handleSelect(id)}
                  className={`text-left w-full ${
                    id === selectedId ? "font-bold text-blue-600" : "text-gray-700"
                  }`}
                >
                  {name}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Selected Compound Details */}
        <div className="w-2/3 border p-4 rounded min-h-[400px]">
          {selectedCompound ? (
            <>
              <h2 className="font-semibold mb-4">Compound Details</h2>
              <p><strong>Name:</strong> {selectedCompound.name}</p>
              <p><strong>Molecular Formula:</strong> {selectedCompound.molecularFormula || "-"}</p>
              <p><strong>Molecular Weight:</strong> {selectedCompound.molecularWeight || "-"}</p>
              <p><strong>IUPAC Name:</strong> {selectedCompound.iupacName || "-"}</p>
              <p><strong>SMILES:</strong> {selectedCompound.smiles || "-"}</p>
              <p>
                <strong>Link 1:</strong>{" "}
                {selectedCompound.link1 ? (
                  <a href={selectedCompound.link1} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    {selectedCompound.link1}
                  </a>
                ) : (
                  "-"
                )}
              </p>
              <p>
                <strong>Link 2:</strong>{" "}
                {selectedCompound.link2 ? (
                  <a href={selectedCompound.link2} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                    {selectedCompound.link2}
                  </a>
                ) : (
                  "-"
                )}
              </p>

              <button
                onClick={handleCancel}
                className="mt-6 bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel Selection
              </button>
            </>
          ) : (
            <p className="text-gray-500">Select a compound from the list to see details here.</p>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  );
}
