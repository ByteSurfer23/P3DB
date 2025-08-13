"use client";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

// Shadcn components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Search, Handshake } from "lucide-react";

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

// Note: This component assumes ProtectedRoute is correctly configured and wraps the content.
// The code has been updated to use the same stylistic approach from previous pages.
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
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl mx-auto"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary text-center mb-8">
          Search Phytocompounds
        </h1>

        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search compounds..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 h-12 rounded-lg shadow-md focus-visible:ring-1 focus-visible:ring-primary"
            />
          </div>
          <Link href="/request">
            <Button size="default" className="h-10 px-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <Handshake className="mr-2 h-5 w-5" />
              Make a docking request
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Compound List */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="rounded-xl shadow-lg border border-border">
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
                          className={`w-full justify-start text-left hover:bg-accent/50 transition-colors duration-200 ${id === selectedId ? "bg-accent hover:bg-accent" : ""}`}
                        >
                          {name}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>

          {/* Selected Compound Details */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="rounded-xl shadow-lg border border-border">
              <CardHeader>
                <CardTitle>Compound Details</CardTitle>
              </CardHeader>
              <CardContent className="min-h-[400px]">
                <AnimatePresence mode="wait">
                  {selectedCompound ? (
                    <motion.div
                      key={selectedId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div>
                        <h3 className="text-2xl font-bold text-primary">{selectedCompound.name}</h3>
                        <Separator className="my-4" />
                        
                        <div className="space-y-3">
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">
                              <strong className="text-foreground">Molecular Formula:</strong> {selectedCompound.molecularFormula || "-"}
                            </p>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">
                              <strong className="text-foreground">Molecular Weight:</strong> {selectedCompound.molecularWeight || "-"}
                            </p>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">
                              <strong className="text-foreground">IUPAC Name:</strong> {selectedCompound.iupacName || "-"}
                            </p>
                          </div>
                          <div className="bg-muted p-3 rounded-lg">
                            <p className="text-sm">
                              <strong className="text-foreground">SMILES:</strong> {selectedCompound.smiles || "-"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4">
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Link 1:</strong>{" "}
                          {selectedCompound.link1 ? (
                            <a href={selectedCompound.link1} target="_blank" rel="noreferrer" className="text-primary hover:underline hover:underline-offset-4">
                              {selectedCompound.link1}
                            </a>
                          ) : (
                            "-"
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          <strong className="text-foreground">Link 2:</strong>{" "}
                          {selectedCompound.link2 ? (
                            <a href={selectedCompound.link2} target="_blank" rel="noreferrer" className="text-primary hover:underline hover:underline-offset-4">
                              {selectedCompound.link2}
                            </a>
                          ) : (
                            "-"
                          )}
                        </p>
                      </div>

                      <Button onClick={handleCancel} variant="destructive" className="w-full mt-4 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                        Cancel Selection
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="flex items-center justify-center h-full"
                    >
                      <p className="text-base text-muted-foreground text-center">
                        Select a compound from the list to see details here.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
