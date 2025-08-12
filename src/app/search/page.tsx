"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import ProtectedRoute from "../ProtectedRoute";

// Shadcn components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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

  async function handleSelect(id: string) {
    setSelectedId(id);
    const compoundDoc = await getDoc(doc(db, "phytocompounds", id));
    if (compoundDoc.exists()) {
      setSelectedCompound(compoundDoc.data() as Phytocompound);
    } else {
      setSelectedCompound(null);
    }
  }

  function handleCancel() {
    setSelectedCompound(null);
    setSelectedId(null);
  }

  const filteredJsonList = jsonList.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Search Phytocompounds</h1>

        <div className="mb-6 flex justify-between items-center">
          <Input
            type="text"
            placeholder="Search compounds..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full max-w-sm"
          />
          <Link href="/request">
            <Button variant="link">Make a docking request</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Compound List */}
          <Card>
            <CardHeader>
              <CardTitle>Compound List</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <ul className="space-y-1">
                  {filteredJsonList.length === 0 && <p className="text-sm text-muted-foreground p-2">No entries found.</p>}
                  {filteredJsonList.map(({ id, name }) => (
                    <li key={id}>
                      <Button
                        variant="ghost"
                        onClick={() => handleSelect(id)}
                        className={`w-full justify-start text-left ${id === selectedId ? "bg-accent" : ""}`}
                      >
                        {name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Selected Compound Details */}
          <Card>
            <CardHeader>
              <CardTitle>Compound Details</CardTitle>
            </CardHeader>
            <CardContent className="min-h-[400px]">
              {selectedCompound ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold">{selectedCompound.name}</h3>
                    <Separator className="my-2" />
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong className="text-foreground">Molecular Formula:</strong> {selectedCompound.molecularFormula || "-"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong className="text-foreground">Molecular Weight:</strong> {selectedCompound.molecularWeight || "-"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong className="text-foreground">IUPAC Name:</strong> {selectedCompound.iupacName || "-"}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      <strong className="text-foreground">SMILES:</strong> {selectedCompound.smiles || "-"}
                    </p>
                  </div>

                  <div className="space-y-2 mt-4">
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Link 1:</strong>{" "}
                      {selectedCompound.link1 ? (
                        <a href={selectedCompound.link1} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          {selectedCompound.link1}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong className="text-foreground">Link 2:</strong>{" "}
                      {selectedCompound.link2 ? (
                        <a href={selectedCompound.link2} target="_blank" rel="noreferrer" className="text-blue-600 underline">
                          {selectedCompound.link2}
                        </a>
                      ) : (
                        "-"
                      )}
                    </p>
                  </div>

                  <Button onClick={handleCancel} variant="destructive" className="mt-4">
                    Cancel Selection
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Select a compound from the list to see details here.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}