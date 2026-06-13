import { useCallback, useState } from "react";

/**
 * Shared selection hook for admin tables.
 * Replaces duplicated toggleSelect/toggleAll logic across admin pages.
 */
export function useSelection<T extends { id: string }>(rows: T[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    setSelected((prev) =>
      prev.size === rows.length && rows.length > 0
        ? new Set()
        : new Set(rows.map((r) => r.id))
    );
  }, [rows]);

  const clear = useCallback(() => setSelected(new Set()), []);

  const allChecked = selected.size === rows.length && rows.length > 0;

  return { selected, setSelected, toggleSelect, toggleAll, clear, allChecked };
}
