"use client";
export const dynamic = "force-dynamic";
import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
  deleteDoc,
  addDoc,
  setDoc,
  query as fsQuery,
  where,
} from "firebase/firestore";
import { ref, get, onValue } from "firebase/database";
import { db } from "@/lib/firebase";
import { rtdb } from "@/lib/firebase";
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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Search, Handshake } from "lucide-react";

// --------------------
// Types
// --------------------
type Phytocompound = {
  name: string;
  molecularFormula?: string | null;
  molecularWeight?: string | null;
  iupacName?: string | null;
  smiles?: string | null;
  link1?: string | null;
  link2?: string | null;
  sourcestring?: string | null;

  // new fields
  categories?: string[];
  weight?: boolean;
  plantSource?: boolean; // presence flag
  plantName?: string | null;
  animalSource?: boolean; // presence flag
  animalName?: string | null;
};

type JsonEntry = {
  id: string;
  name: string;
  categories?: string[];
  weight?: boolean;
  plantSource?: boolean;
  plantName?: string | null;
  animalSource?: boolean;
  animalName?: string | null;
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

type RTDBData = {
  id: string;
  [key: string]: any;
};

type CategoryDoc = {
  id: string;
  name: string;
};

// --------------------
// Inline ProtectedRoute (simple guard using useAuth)
// --------------------
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-2 text-lg font-medium">Access denied</p>
          <p className="text-sm text-muted-foreground">
            You must be signed in to view this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// --------------------
// Inline Navbar
// --------------------
function AdminNavbar({
  view,
  setView,
}: {
  view: string;
  setView: (v: any) => void;
}) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
      <nav className="mt-4 md:mt-0">
        <ul className="flex flex-wrap justify-center gap-2">
          <li>
            <Button
              onClick={() => setView("phytocompounds")}
              variant={view === "phytocompounds" ? "default" : "outline"}
            >
              Phytocompounds
            </Button>
          </li>
          <li>
            <Button
              onClick={() => setView("requests")}
              variant={view === "requests" ? "default" : "outline"}
            >
              Requests
            </Button>
          </li>
          <li>
            <Button
              onClick={() => setView("users")}
              variant={view === "users" ? "default" : "outline"}
            >
              Users
            </Button>
          </li>
          <li>
            <Button
              onClick={() => setView("rtdb")}
              variant={view === "rtdb" ? "default" : "outline"}
            >
              RTDB
            </Button>
          </li>
          <li>
            <Button
              onClick={() => setView("categories")}
              variant={view === "categories" ? "default" : "outline"}
            >
              Categories
            </Button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

// --------------------
// MultiSelectDropdown (local)
// --------------------
function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  label,
}: {
  options: CategoryDoc[];
  selected: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  function toggleOption(name: string) {
    if (selected.includes(name)) onChange(selected.filter((s) => s !== name));
    else onChange([...selected, name]);
  }

  return (
    <div className="relative" ref={ref}>
      {label && <div className="text-sm font-medium mb-1">{label}</div>}
      <button
        type="button"
        onClick={() => setOpen((s) => !s)}
        className="w-full text-left rounded-md border border-gray-300 bg-white py-2 px-3 flex items-center justify-between"
      >
        <div className="truncate">
          {selected.length === 0 ? (
            <span className="text-sm text-gray-500">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-2">
              {selected.map((s) => (
                <span
                  key={s}
                  className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <svg
          className={`ml-2 h-4 w-4 transform transition-transform ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 12a1 1 0 01-.707-.293l-4-4a1 1 0 111.414-1.414L10 9.586l3.293-3.293a1 1 0 011.414 1.414l-4 4A1 1 0 0110 12z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-white shadow-lg max-h-56 overflow-auto">
          <div className="p-2">
            {options.map((opt) => (
              <label
                key={opt.id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.name)}
                  onChange={() => toggleOption(opt.name)}
                  className="h-4 w-4"
                />
                <span className="text-sm">{opt.name}</span>
              </label>
            ))}
            {options.length === 0 && (
              <div className="text-sm text-gray-500 p-2">No categories</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --------------------
// AdminPage main
// --------------------
export default function AdminPage() {
  const { user, loading } = useAuth();

  const [view, setView] = useState<
    "phytocompounds" | "requests" | "users" | "rtdb" | "categories"
  >("phytocompounds");

  // Categories
  const [categories, setCategories] = useState<CategoryDoc[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categorySearchTerm, setCategorySearchTerm] = useState("");

  // Phytocompounds
  const [jsonList, setJsonList] = useState<JsonEntry[]>([]);
  const [selectedCompound, setSelectedCompound] =
    useState<Phytocompound | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editMode, setEditMode] = useState(false);

  // RTDB
  const [rtdbData, setRtdbData] = useState<RTDBData[]>([]);
  const [rtdbPath, setRtdbPath] = useState("userLogs");
  const [rtdbLoading, setRtdbLoading] = useState(false);
  const [rtdbError, setRtdbError] = useState<string | null>(null);
  const [rtdbSearchTerm, setRtdbSearchTerm] = useState("");

  // Users & requests
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);

  // Form (note plantName & animalName default to empty string)
  const form = useForm<Phytocompound>({
    defaultValues: {
      name: "",
      molecularFormula: "",
      molecularWeight: "",
      iupacName: "",
      smiles: "",
      link1: "",
      link2: "",
      categories: [],
      sourcestring: "",
      weight: false,
      plantSource: false, // checkbox
      plantName: "", // string input
      animalSource: false, // checkbox
      animalName: "", // string input
    },
  });

  // -------------------------
  // Categories functions
  // -------------------------
  async function fetchCategories() {
    if (!user) return;
    setCategoriesLoading(true);
    try {
      const q = collection(db, "categories");
      const querySnapshot = await getDocs(q);
      const categoryList = querySnapshot.docs.map((d) => ({
        id: d.id,
        name: (d.data() as any).name as string,
      }));
      setCategories(categoryList);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function addCategory() {
    if (!newCategory.trim()) {
      alert("Please enter a category name");
      return;
    }
    const processedCategoryName = newCategory.trim().toUpperCase();
    try {
      setCategoriesLoading(true);
      const q = fsQuery(
        collection(db, "categories"),
        where("name", "==", processedCategoryName)
      );
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        alert("Category already exists");
        return;
      }
      await addDoc(collection(db, "categories"), {
        name: processedCategoryName,
      });
      setNewCategory("");
      await fetchCategories();
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category");
    } finally {
      setCategoriesLoading(false);
    }
  }

  async function deleteCategory(idToDelete: string, nameToDelete: string) {
    if (!confirm(`Are you sure you want to delete "${nameToDelete}"?`)) {
      return;
    }
    try {
      await deleteDoc(doc(db, "categories", idToDelete));
      await fetchCategories();
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Failed to delete category");
    }
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearchTerm.toLowerCase())
  );

  useEffect(() => {
    if (!loading && user) {
      fetchCategories();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  // -------------------------
  // RTDB functions
  // -------------------------
  async function fetchRTDBData() {
    if (!rtdbPath.trim()) {
      setRtdbError("Please enter a valid path");
      return;
    }
    setRtdbLoading(true);
    setRtdbError(null);
    try {
      const dbRef = ref(rtdb, rtdbPath);
      const snapshot = await get(dbRef);
      if (snapshot.exists()) {
        const data = snapshot.val();
        let dataArray: RTDBData[] = [];
        if (Array.isArray(data)) {
          dataArray = data.map((item, index) => ({
            id: index.toString(),
            ...item,
          }));
        } else if (typeof data === "object" && data !== null) {
          dataArray = Object.keys(data).map((key) => ({
            id: key,
            ...data[key],
          }));
        } else {
          dataArray = [{ id: "value", data: data }];
        }
        setRtdbData(dataArray);
      } else {
        setRtdbData([]);
        setRtdbError("No data found at this path");
      }
    } catch (error) {
      console.error("Error fetching RTDB data:", error);
      setRtdbError("Failed to fetch data. Check the path and try again.");
      setRtdbData([]);
    } finally {
      setRtdbLoading(false);
    }
  }

  useEffect(() => {
    if (view === "rtdb" && rtdbPath.trim()) {
      const dbRef = ref(rtdb, rtdbPath);
      const unsubscribe = onValue(
        dbRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.val();
            let dataArray: RTDBData[] = [];
            if (Array.isArray(data)) {
              dataArray = data.map((item, index) => ({
                id: index.toString(),
                ...item,
              }));
            } else if (typeof data === "object" && data !== null) {
              dataArray = Object.keys(data).map((key) => ({
                id: key,
                ...data[key],
              }));
            } else {
              dataArray = [{ id: "value", data: data }];
            }
            setRtdbData(dataArray);
            setRtdbError(null);
          } else {
            setRtdbData([]);
          }
        },
        (error) => {
          console.error("RTDB listener error:", error);
          setRtdbError("Real-time connection failed");
        }
      );
      return () => unsubscribe();
    }
  }, [view, rtdbPath]);

  const filteredRtdbData = rtdbData.filter((item) => {
    if (!rtdbSearchTerm) return true;
    const searchLower = rtdbSearchTerm.toLowerCase();
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  const rtdbColumns = React.useMemo(() => {
    if (rtdbData.length === 0) return [];
    const allKeys = new Set<string>();
    rtdbData.forEach((item) => {
      Object.keys(item).forEach((key) => allKeys.add(key));
    });
    return Array.from(allKeys).sort();
  }, [rtdbData]);

  // -------------------------
  // Json list (phytocompound names)
  // -------------------------
  async function fetchJsonList() {
    try {
      const colRef = collection(db, "jsonCollection");
      const snapshot = await getDocs(colRef);
      const list: JsonEntry[] = snapshot.docs.map((d) => {
        const data = d.data() as any;
        return {
          id: d.id,
          name: data.name || "",
          categories: data.categories || [],
          weight: data.weight || false,
          plantSource: data.plantSource || false,
          plantName: data.plantName || null,
          animalSource: data.animalSource || false,
          animalName: data.animalName || null,
        };
      });
      setJsonList(list);
    } catch (error) {
      console.error("Error fetching jsonCollection:", error);
    }
  }

  useEffect(() => {
    if (view === "phytocompounds") fetchJsonList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  // -------------------------
  // Select / Edit compound
  // -------------------------
  async function handleSelect(id: string) {
    try {
      setSelectedId(id);
      const compoundDoc = await getDoc(doc(db, "phytocompounds", id));
      if (compoundDoc.exists()) {
        const data = compoundDoc.data() as Phytocompound;
        setSelectedCompound(data);
        // set form values; ensure categories is array, plant/animal names are strings
        form.reset({
          ...data,
          categories: data.categories ?? [],
          weight: !!data.weight,
          plantSource: !!data.plantSource,
          plantName: data.plantName ?? "",
          sourcestring: data.sourcestring ?? "",
          animalSource: !!data.animalSource,
          animalName: data.animalName ?? "",
        });
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
      if (selectedId === id) clearSelection();
      await fetchJsonList();
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
      categories: [],
      sourcestring: "",
      weight: false,
      plantSource: false,
      plantName: "",
      animalSource: false,
      animalName: "",
    });
    setEditMode(false);
  }

  // -------------------------
  // Add or update compound
  // -------------------------
  async function onSubmit(data: Phytocompound) {
    if (!data.name) {
      alert("Name is required");
      return;
    }

    try {
      if (!Array.isArray(data.categories)) data.categories = [];

      // Normalize names: if source flag false, set name to null
      const payload = {
        name: data.name,
        molecularFormula: data.molecularFormula || null,
        molecularWeight: data.molecularWeight || null,
        iupacName: data.iupacName || null,
        smiles: data.smiles || null,
        link1: data.link1 || null,
        link2: data.link2 || null,
        categories: data.categories || [],
        weight: !!data.weight,
        sourcestring: data.sourcestring || null,
        plantSource: true,
        plantName: data.plantName || null,
        animalSource: true,
        animalName: data.animalName || null,
      };

      if (editMode && selectedId) {
        await updateDoc(doc(db, "phytocompounds", selectedId), payload);
        await updateDoc(doc(db, "jsonCollection", selectedId), payload);
        alert("Updated successfully");
        await fetchJsonList();
        clearSelection();
        return;
      }

      const compoundRef = await addDoc(
        collection(db, "phytocompounds"),
        payload
      );
      await setDoc(doc(db, "jsonCollection", compoundRef.id), payload);

      alert("Added successfully");
      await fetchJsonList();
      clearSelection();
    } catch (error) {
      console.error("Error adding/updating compound:", error);
      alert("Failed to save compound");
    }
  }

  const filteredJsonList = jsonList.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // -------------------------
  // Requests logic
  // -------------------------
  async function fetchRequests() {
    if (!user) return;
    try {
      const snapshot = await getDocs(collection(db, "requests"));
      const list: Request[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
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

  // -------------------------
  // Users logic
  // -------------------------
  async function fetchUsers() {
    if (!user) return;
    try {
      const snapshot = await getDocs(collection(db, "users"));
      const list: User[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as any),
      })) as User[];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, user, loading]);

  // -------------------------
  // Utilities
  // -------------------------
  function formatTimestamp(ts: any) {
    if (!ts || !ts.toDate) return "-";
    return ts.toDate().toLocaleString();
  }

  function formatValue(value: any): string {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object") return JSON.stringify(value);
    if (typeof value === "number" && value.toString().length === 13) {
      try {
        return new Date(value).toLocaleString();
      } catch {
        return String(value);
      }
    }
    return String(value);
  }

  const filteredUsers = users.filter((u) => {
    if (!userSearchTerm) return true;
    const s = userSearchTerm.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(s) ||
      (u.id || "").toLowerCase().includes(s)
    );
  });

  // -------------------------
  // Views
  // -------------------------
  const rtdbView = (
    <>
      <h1 className="text-2xl font-bold mb-4">Realtime Database Viewer</h1>

      <div className="mb-4 space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Database Path
            </label>
            <Input
              type="text"
              placeholder="Enter path (e.g., userLogs, users, data/items)"
              value={rtdbPath}
              onChange={(e) => setRtdbPath(e.target.value)}
            />
          </div>
          <Button onClick={fetchRTDBData} disabled={rtdbLoading}>
            {rtdbLoading ? "Loading..." : "Fetch Data"}
          </Button>
        </div>

        {rtdbData.length > 0 && (
          <div>
            <Input
              type="text"
              placeholder="Search in data..."
              value={rtdbSearchTerm}
              onChange={(e) => setRtdbSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}
      </div>

      {rtdbError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <p className="text-red-800">{rtdbError}</p>
        </div>
      )}

      {rtdbLoading ? (
        <div className="text-center py-8">
          <p>Loading data from Realtime Database...</p>
        </div>
      ) : filteredRtdbData.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {rtdbData.length === 0
              ? "No data found. Try a different path or check your database."
              : "No data matches your search criteria."}
          </p>
        </div>
      ) : (
        <div className="overflow-auto max-h-[600px] border rounded-lg">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                {rtdbColumns.map((column) => (
                  <th
                    key={column}
                    className="border border-gray-300 px-4 py-2 text-left font-medium text-gray-700"
                  >
                    {column === "id"
                      ? "Log ID"
                      : column === "userId"
                      ? "User ID"
                      : column === "datetime"
                      ? "Date & Time"
                      : column === "timestamp"
                      ? "Timestamp"
                      : column === "action"
                      ? "Action"
                      : column.charAt(0).toUpperCase() + column.slice(1)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredRtdbData.map((row, index) => (
                <tr key={row.id || index} className="hover:bg-gray-50">
                  {rtdbColumns.map((column) => (
                    <td
                      key={column}
                      className="border border-gray-300 px-4 py-2 text-sm"
                      title={formatValue(row[column])}
                    >
                      <div
                        className={`${
                          column === "userId" || column === "id"
                            ? "max-w-xs"
                            : "max-w-sm"
                        } truncate`}
                      >
                        {column === "action" ? (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              row[column] === "sign_in"
                                ? "bg-green-100 text-green-800"
                                : row[column] === "sign_out"
                                ? "bg-red-100 text-red-800"
                                : row[column] === "sign_up"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {formatValue(row[column])}
                          </span>
                        ) : (
                          formatValue(row[column])
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {rtdbData.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Showing {filteredRtdbData.length} of {rtdbData.length} records
          {rtdbSearchTerm && ` (filtered by "${rtdbSearchTerm}")`}
        </div>
      )}
    </>
  );

  const phytocompoundsView = (
    <>
      <h1 className="text-2xl font-bold mb-4">Phytocompounds Manager</h1>

      <div className="flex items-center gap-4 mb-4">
        <input
          type="text"
          placeholder="Search compounds..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2 rounded w-full max-w-sm"
        />
        <Button onClick={() => fetchJsonList()}>Refresh</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* JSON list */}
        <div className="md:w-1/3 w-full border p-4 rounded max-h-[520px] overflow-auto">
          <h2 className="font-semibold mb-2">JSON Entries</h2>
          {filteredJsonList.length === 0 && <p>No entries found.</p>}
          <ul>
            {filteredJsonList.map(({ id, name, categories: cats }) => (
              <li key={id} className="flex justify-between items-center py-1">
                <button
                  onClick={() => handleSelect(id)}
                  className={`text-left flex-grow ${
                    id === selectedId
                      ? "font-bold text-blue-600"
                      : "text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{name}</span>
                    {cats && cats.length > 0 && (
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded ml-2">
                        {cats.join(", ")}
                      </span>
                    )}
                  </div>
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
        <div className="md:w-2/3 w-full border p-4 rounded">
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

              <FormField
                control={form.control}
                name="sourcestring"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sources</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* NEW: Styled MultiSelect dropdown + chips */}
              <FormField
                control={form.control}
                name="categories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <FormControl>
                      <MultiSelectDropdown
                        options={categories}
                        selected={Array.isArray(field.value) ? field.value : []}
                        onChange={(arr) => field.onChange(arr)}
                        placeholder="Select categories..."
                        label={undefined}
                      />
                    </FormControl>
                    <p className="text-xs text-gray-500 mt-1">
                      Choose one or more categories (selected shown as chips).
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* weight checkbox, plant/animal presence checkboxes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        id="weight"
                        type="checkbox"
                        checked={!!field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="weight" className="text-sm">
                        <p>&gt; 500 g/mol</p>
                      </label>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="plantSource"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        id="plantSource"
                        type="checkbox"
                        checked={true}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <label htmlFor="plantSource" className="text-sm">
                        Plant source
                      </label>
                    </div>
                  )}
                />

                <FormField
                  control={form.control}
                  name="animalSource"
                  render={({ field }) => (
                    <div className="flex items-center gap-2">
                      <input
                        id="animalSource"
                        type="checkbox"
                        checked={true} // Always checked
                        readOnly // Prevent user interaction
                        className="h-4 w-4"
                      />
                      <label htmlFor="animalSource" className="text-sm">
                        Filter using other properties
                      </label>
                    </div>
                  )}
                />
              </div>

              {/* Plant/Animal name inputs (strings) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="plantName"
                  render={({ field }) => {
                    const plantSource = form.getValues("plantSource");
                    return (
                      <FormItem>
                        <FormLabel>Plant Source Name</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder={"Enter plant name"}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />

                <FormField
                  control={form.control}
                  name="animalName"
                  render={({ field }) => {
                    const animalSource = form.getValues("animalSource");
                    return (
                      <FormItem>
                        <FormLabel>Label : Ornamental or Medicinal</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ""}
                            placeholder={
                              animalSource
                                ? "Copy Paste the exact text in the label"
                                : "Copy Paste the exact text in the label"
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <div className="flex items-center gap-4">
                <Button type="submit">
                  {editMode ? "Save Changes" : "Add Compound"}
                </Button>
                {editMode && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearSelection}
                  >
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

  const categoriesView = (
    <>
      <h1 className="text-2xl font-bold mb-4">Categories Management</h1>

      <div className="mb-6 space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">
              Add New Category
            </label>
            <Input
              type="text"
              placeholder="Enter category name..."
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && addCategory()}
            />
            <p className="text-xs text-gray-500 mt-1">
              Category will be capitalized and trimmed automatically
            </p>
          </div>
          <Button
            onClick={addCategory}
            disabled={categoriesLoading || !newCategory.trim()}
          >
            Add Category
          </Button>
        </div>

        {categories.length > 0 && (
          <div>
            <Input
              type="text"
              placeholder="Search categories..."
              value={categorySearchTerm}
              onChange={(e) => setCategorySearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
        )}
      </div>

      {categoriesLoading ? (
        <div className="text-center py-8">
          <p>Loading categories...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">
            {categories.length === 0
              ? "No categories found. Add your first category above."
              : "No categories match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-800">
                  {category.name}
                </span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteCategory(category.id, category.name)}
                  className="ml-2"
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              Categories Summary
            </h3>
            <p className="text-blue-700">
              Total Categories: <strong>{categories.length}</strong>
              {categorySearchTerm && (
                <span>
                  {" "}
                  | Showing: <strong>{filteredCategories.length}</strong>{" "}
                  filtered results
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </>
  );

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
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  User Email
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  User ID
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Protein Target
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Ligand Target
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Active Site Docking
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Blind Docking
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Created At
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    {req.userEmail || "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {req.userId || "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {req.proteinTarget || "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {req.ligandTarget || "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {req.activeSiteDocking ? "Yes" : "No"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {req.blindDocking ? "Yes" : "No"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatTimestamp(req.createdAt)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <select
                      value={req.status}
                      onChange={(e) =>
                        updateRequestStatus(req.id, e.target.value)
                      }
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

  const usersView = (
    <>
      <h1 className="text-2xl font-bold mb-4">Users</h1>

      <div className="mb-4">
        <Input
          type="text"
          placeholder="Search by name or ID..."
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {filteredUsers.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="overflow-auto max-h-[500px] border rounded p-4">
          <table className="min-w-full table-auto border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  ID
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Name
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Email
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Admin
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Created At
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Salutation
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Location
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Role
                </th>
                <th className="border border-gray-300 px-4 py-2 text-left text-black">
                  Organization
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{u.id}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {u.name || "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {u.email || "-"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {u.admin ? "Yes" : "No"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {formatTimestamp(u.createdAt)}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {u.salutation}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {u.location}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {u.role}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {u.organization}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  // -------------------------
  // Render
  // -------------------------
  return (
    <ProtectedRoute>
      <div className="min-h-screen p-8 bg-gray-50 text-gray-800">
        <AdminNavbar view={view} setView={setView} />

        <main className="container mx-auto max-w-7xl">
          {view === "phytocompounds" && phytocompoundsView}
          {view === "requests" && requestsView}
          {view === "users" && usersView}
          {view === "rtdb" && rtdbView}
          {view === "categories" && categoriesView}
        </main>
      </div>
    </ProtectedRoute>
  );
}
