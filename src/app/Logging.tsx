import { ref, push, serverTimestamp } from "firebase/database";
import { rtdb } from "@/lib/firebase";

// Helper function to get current IST date-time string
function getISTDateTimeString(): string {
  const date = new Date();

  // Convert to milliseconds and add IST offset (+5:30 hours)
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in ms
  const istTime = new Date(date.getTime() + istOffset);

  // Format to something like: "11 Aug 2025, 14:05:30 IST"
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  };

  return istTime.toLocaleString("en-IN", options) + " IST";
}

type LogAction = 
  | "sign_in"
  | "sign_up"
  | "search"
  | "request_docking"
  | "sign_out"
  | string;

interface LogEntry {
  userId: string;
  action: LogAction;
  details?: Record<string, any>;
}

export async function logUserAction({
  userId,
  action,
  details = {},
}: LogEntry): Promise<void> {
  if (!userId || !action) {
    throw new Error("userId and action are required");
  }

  try {
    const logsRef = ref(rtdb, "userLogs");
    const datetimeIST = getISTDateTimeString();
    console.log("function reached")
    await push(logsRef, {
      userId,
      action,
      details,
      timestamp: serverTimestamp(),
      datetime: datetimeIST,  // human-readable IST time string
    });
  } catch (error) {
    console.error("Failed to log user action:", error);
  }
}
