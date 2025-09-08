"use client";
export const dynamic = "force-dynamic";

import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";

// shadcn/ui / radix Select components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { Search, Handshake } from "lucide-react";

// Types
type JsonEntry = {
  id: string;
  name: string;
  categories: string[];
  plantName?: string | null;
  animalName?: string | null;
  weight?: boolean;
};

type Phytocompound = {
  id?: string;
  name: string;
  molecularFormula?: string | null;
  molecularWeight?: string | null;
  iupacName?: string | null;
  smiles?: string | null;
  link1?: string | null;
  link2?: string | null;
  categories?: string[];
  plantName?: string | null;
  animalName?: string | null;
  weight?: boolean;
};

// Plant / Animal categories (for dropdown filter)
const PLANT_CATEGORIES = ["Tree", "Shrub", "Herb", "Climber", "Creeper"];
const ANIMAL_CATEGORIES = ["Mammal", "Bird", "Fish", "Reptile", "Amphibian", "Insect"];

export default function SearchPage() {
  // Lists
  const [jsonList, setJsonList] = useState<JsonEntry[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Selected compound
  const [selectedCompound, setSelectedCompound] = useState<Phytocompound | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filters / UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [weightFilter, setWeightFilter] = useState<string>("all");
  const [selectedPlantCategory, setSelectedPlantCategory] = useState<string>("all");
  const [selectedAnimalCategory, setSelectedAnimalCategory] = useState<string>("all");

  // Loading / error
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch JSON list
  async function fetchJsonList() {
    setIsLoading(true);
    try {
      const q = query(collection(db, "jsonCollection"), orderBy("name"));
      const snap = await getDocs(q);

      const list: JsonEntry[] = snap.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name || "",
          categories: (data.categories as string[]) || [],
          plantName: data.plantName ?? null,
          animalName: data.animalName ?? null,
          weight: data.weight ?? undefined,
        };
      });

      setJsonList(list);
    } catch (err) {
      console.error("fetchJsonList error", err);
      setError("Failed to fetch list");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchCategories() {
    try {
      const snap = await getDocs(collection(db, "categories"));
      const cats = snap.docs.map((d) => (d.data() as any).name as string).filter(Boolean);
      setCategories(cats);
    } catch (err) {
      console.error("fetchCategories error", err);
    }
  }

  useEffect(() => {
    fetchJsonList();
    fetchCategories();
  }, []);

  // Detailed fetch
  async function handleSelect(id: string) {
    setIsLoading(true);
    setError(null);
    setSelectedId(id);
    setSelectedCompound(null);

    try {
      const d = await getDoc(doc(db, "phytocompounds", id));
      if (d.exists()) {
        const data = d.data() as any;
        setSelectedCompound({ id: d.id, name: data.name || "", ...data } as Phytocompound);
      } else {
        setError("Details not found");
      }
    } catch (err) {
      console.error("handleSelect error", err);
      setError("Failed to fetch compound details");
    } finally {
      setIsLoading(false);
    }
  }

  function clearSelection() {
    setSelectedCompound(null);
    setSelectedId(null);
    setError(null);
  }

  // Filter helpers
  function matchesPlantCategory(entry: JsonEntry) {
    if (selectedPlantCategory === "all") return true;
    return entry.plantName?.toLowerCase() === selectedPlantCategory.toLowerCase();
  }

  function matchesAnimalCategory(entry: JsonEntry) {
    if (selectedAnimalCategory === "all") return true;
    return entry.animalName?.toLowerCase() === selectedAnimalCategory.toLowerCase();
  }

  const filteredJsonList = jsonList.filter((item) => {
    const search = searchTerm.trim().toLowerCase();
    const matchesSearch =
      search === "" ||
      item.name.toLowerCase().includes(search) ||
      (item.categories || []).some((c) => c.toLowerCase().includes(search));

    const matchesCategory =
      selectedCategory === "all"
        ? true
        : (item.categories || []).includes(selectedCategory);

    const matchesWeight =
      weightFilter === "all"
        ? true
        : weightFilter === "with"
        ? Boolean(item.weight)
        : weightFilter === "without"
        ? !item.weight
        : true;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesWeight &&
      matchesPlantCategory(item) &&
      matchesAnimalCategory(item)
    );
  });

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-background text-foreground px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary text-center mb-8">
          Search Phytocompounds
        </h1>

        {/* Search + Request Button */}
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search compounds or categories..."
              className="pl-10 h-12"
            />
          </div>

          <Link href="/request">
            <Button className="h-10 px-6 shadow-md hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5">
              <Handshake className="mr-2 h-5 w-5" /> Make a docking request
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div>
            <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v || "all")}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Category" /></SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={weightFilter} onValueChange={(v) => setWeightFilter(v || "all")}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Weight" /></SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="with"><p>&gt; 500 g/mol</p></SelectItem>
                <SelectItem value="without"><p>&lt; 500 g/mol</p></SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={selectedPlantCategory} onValueChange={(v) => setSelectedPlantCategory(v || "all")}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Plant category" /></SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Plant Categories</SelectItem>
                {PLANT_CATEGORIES.map((pc) => (
                  <SelectItem key={pc} value={pc}>{pc}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Select value={selectedAnimalCategory} onValueChange={(v) => setSelectedAnimalCategory(v || "all")}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Animal category" /></SelectTrigger>
              <SelectContent className="z-50">
                <SelectItem value="all">All Animal Categories</SelectItem>
                {ANIMAL_CATEGORIES.map((ac) => (
                  <SelectItem key={ac} value={ac}>{ac}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Compound List */}
          <Card className="rounded-xl shadow-lg border border-border">
            <CardHeader><CardTitle>Compound List</CardTitle></CardHeader>
            <CardContent>
              <ScrollArea className="h-[440px]">
                <ul className="space-y-1">
                  {isLoading && <li className="p-4 text-sm text-muted-foreground">Loading...</li>}
                  {!isLoading && filteredJsonList.length === 0 && <li className="p-4 text-sm text-muted-foreground">No entries found.</li>}
                  {!isLoading && filteredJsonList.map((entry) => (
                    <li key={entry.id} className="flex items-center justify-between">
                      <button
                        onClick={() => handleSelect(entry.id)}
                        className={`py-2 px-2 text-left w-full hover:bg-accent/20 rounded ${selectedId === entry.id ? "bg-accent/40" : ""}`}
                      >
                        <div className="font-medium">{entry.name}</div>
                        <div className="text-xs text-muted-foreground">{entry.categories.join(", ")}</div>
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Compound Details */}
          <Card className="rounded-xl shadow-lg border border-border">
            <CardHeader><CardTitle>Compound Details</CardTitle></CardHeader>
            <CardContent>
              {isLoading && <div className="text-sm text-muted-foreground">Loading...</div>}
              {error && <div className="text-sm text-destructive">{error}</div>}
              {!isLoading && !error && selectedCompound && (
                <div className="space-y-3 text-sm">
                  <div className="text-lg font-semibold">{selectedCompound.name}</div>
                  {selectedCompound.categories && <div className="text-xs text-muted-foreground">{selectedCompound.categories.join(", ")}</div>}
                  {selectedCompound.molecularFormula && <div><strong>Molecular Formula:</strong> {selectedCompound.molecularFormula}</div>}
                  {selectedCompound.molecularWeight && <div><strong>Weight:</strong> {selectedCompound.molecularWeight}</div>}
                  {selectedCompound.iupacName && <div><strong>IUPAC:</strong> {selectedCompound.iupacName}</div>}
                  {selectedCompound.smiles && <div><strong>SMILES:</strong> {selectedCompound.smiles}</div>}
                  {selectedCompound.plantName && <div><strong>Plant:</strong> {selectedCompound.plantName}</div>}
                  {selectedCompound.animalName && <div><strong>Animal:</strong> {selectedCompound.animalName}</div>}
                  {selectedCompound.link1 && <div><strong>Link 1:</strong> <a href={selectedCompound.link1} target="_blank" rel="noreferrer" className="text-primary underline">{selectedCompound.link1}</a></div>}
                  {selectedCompound.link2 && <div><strong>Link 2:</strong> <a href={selectedCompound.link2} target="_blank" rel="noreferrer" className="text-primary underline">{selectedCompound.link2}</a></div>}
                  <Separator className="my-2" />
                  <Button variant="outline" onClick={clearSelection}>Close</Button>
                </div>
              )}
              {!isLoading && !error && !selectedCompound && <div className="text-sm text-muted-foreground">Select a compound to view details.</div>}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
