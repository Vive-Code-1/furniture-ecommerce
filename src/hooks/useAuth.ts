// Backwards-compatible re-export — auth state lives in AuthContext now,
// so all components share a single subscription / role query.
export { useAuth } from "@/contexts/AuthContext";
