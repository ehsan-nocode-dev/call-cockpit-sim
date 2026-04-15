import React, { useState, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, ChevronUp, ChevronDown, Eye, EyeOff, X, Plus, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  filterOptions?: string[];
  render?: (row: T) => React.ReactNode;
  getValue?: (row: T) => string | number;
  defaultVisible?: boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  idKey: keyof T;
  title: string;
  onAdd?: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (id: string) => void;
  renderExpandedRow?: (row: T) => React.ReactNode;
  isAdmin?: boolean;
}

type SortDir = 'asc' | 'desc';

function DataTable<T extends Record<string, any>>({
  data, columns, idKey, title, onAdd, onEdit, onDelete, isAdmin = true,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [visibleCols, setVisibleCols] = useState<Set<string>>(() => {
    const set = new Set<string>();
    columns.forEach(c => {
      if (c.defaultVisible !== false) set.add(c.key);
    });
    return set;
  });
  const [showColMenu, setShowColMenu] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const toggleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }, [sortKey]);

  const toggleCol = useCallback((key: string) => {
    setVisibleCols(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        if (next.size > 1) next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters(prev => {
      if (!value) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: value };
    });
  }, []);

  const activeColumns = useMemo(() => columns.filter(c => visibleCols.has(c.key)), [columns, visibleCols]);
  const filterableCols = useMemo(() => columns.filter(c => c.filterable && c.filterOptions?.length), [columns]);

  const filteredData = useMemo(() => {
    let result = data;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(row =>
        columns.some(col => {
          const val = col.getValue ? col.getValue(row) : row[col.key];
          return val != null && String(val).toLowerCase().includes(q);
        })
      );
    }

    // Filters
    Object.entries(filters).forEach(([key, value]) => {
      if (!value) return;
      const col = columns.find(c => c.key === key);
      result = result.filter(row => {
        const val = col?.getValue ? col.getValue(row) : row[key];
        return String(val).toLowerCase() === value.toLowerCase();
      });
    });

    // Sort
    if (sortKey) {
      const col = columns.find(c => c.key === sortKey);
      result = [...result].sort((a, b) => {
        const aVal = col?.getValue ? col.getValue(a) : a[sortKey];
        const bVal = col?.getValue ? col.getValue(b) : b[sortKey];
        const aStr = aVal != null ? String(aVal) : '';
        const bStr = bVal != null ? String(bVal) : '';
        const cmp = aStr.localeCompare(bStr, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [data, search, filters, sortKey, sortDir, columns]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-surface-1" style={{ background: 'hsl(var(--surface-1))' }}>
        <h2 className="text-sm font-semibold text-foreground mr-2">{title}</h2>
        <span className="text-xs text-muted-foreground">{filteredData.length} / {data.length}</span>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative w-56">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search..."
            className="h-8 pl-7 text-xs bg-surface-2"
            style={{ background: 'hsl(var(--surface-2))' }}
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filters toggle */}
        {filterableCols.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)} className="h-8 text-xs gap-1">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {Object.keys(filters).length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-primary/20 text-primary">
                {Object.keys(filters).length}
              </span>
            )}
          </Button>
        )}

        {/* Column visibility */}
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowColMenu(!showColMenu)} className="h-8 text-xs gap-1">
            <Eye className="w-3.5 h-3.5" />
            Columns
          </Button>
          {showColMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowColMenu(false)} />
              <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded border border-border p-2 space-y-1 shadow-lg" style={{ background: 'hsl(var(--popover))' }}>
                <div className="text-xs font-medium text-muted-foreground mb-1">Show / Hide Columns</div>
                {columns.map(col => (
                  <label key={col.key} className="flex items-center gap-2 text-xs text-foreground cursor-pointer hover:bg-accent/10 rounded px-1 py-0.5">
                    <input
                      type="checkbox"
                      checked={visibleCols.has(col.key)}
                      onChange={() => toggleCol(col.key)}
                      className="rounded border-border"
                    />
                    {col.label}
                  </label>
                ))}
                <div className="flex gap-1 pt-1 border-t border-border mt-1">
                  <button
                    onClick={() => setVisibleCols(new Set(columns.map(c => c.key)))}
                    className="text-[10px] text-primary hover:underline"
                  >Show All</button>
                  <span className="text-muted-foreground text-[10px]">|</span>
                  <button
                    onClick={() => setVisibleCols(new Set(columns.slice(0, 2).map(c => c.key)))}
                    className="text-[10px] text-primary hover:underline"
                  >Minimal</button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Add button */}
        {isAdmin && onAdd && (
          <Button size="sm" onClick={onAdd} className="h-8 text-xs gap-1">
            <Plus className="w-3.5 h-3.5" /> Add
          </Button>
        )}
      </div>

      {/* Filter bar */}
      {showFilters && filterableCols.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border flex-wrap" style={{ background: 'hsl(var(--surface-1))' }}>
          {filterableCols.map(col => (
            <div key={col.key} className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground uppercase">{col.label}:</span>
              <select
                value={filters[col.key] || ''}
                onChange={e => setFilter(col.key, e.target.value)}
                className="h-6 text-xs rounded border border-border px-1 bg-surface-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                style={{ background: 'hsl(var(--surface-2))' }}
              >
                <option value="">All</option>
                {col.filterOptions!.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          ))}
          {Object.keys(filters).length > 0 && (
            <button onClick={() => setFilters({})} className="text-[10px] text-destructive hover:underline ml-2">
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="dense-table w-full">
          <thead>
            <tr>
              {activeColumns.map(col => (
                <th
                  key={col.key}
                  onClick={col.sortable !== false ? () => toggleSort(col.key) : undefined}
                  className={col.sortable !== false ? 'cursor-pointer select-none' : ''}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && sortKey === col.key && (
                      sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
              {isAdmin && (onEdit || onDelete) && <th className="w-20">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={activeColumns.length + (isAdmin ? 1 : 0)} className="text-center text-muted-foreground py-8">
                  No results found
                </td>
              </tr>
            ) : (
              filteredData.map(row => (
                <tr key={String(row[idKey])}>
                  {activeColumns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(row) : (
                        <span className="text-foreground">{row[col.key] != null ? String(row[col.key]) : '—'}</span>
                      )}
                    </td>
                  ))}
                  {isAdmin && (onEdit || onDelete) && (
                    <td>
                      <div className="flex items-center gap-1">
                        {onEdit && (
                          <button onClick={() => onEdit(row)} className="text-muted-foreground hover:text-primary p-0.5">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(String(row[idKey]))} className="text-muted-foreground hover:text-destructive p-0.5">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
