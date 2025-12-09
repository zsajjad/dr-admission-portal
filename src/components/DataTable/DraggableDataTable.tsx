import React, { useCallback, useEffect, useState } from 'react';

import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { DragIndicator } from '@mui/icons-material';
import { GridColDef, GridRow, GridRowProps } from '@mui/x-data-grid';

import { TooltipRowData } from '@/components/DataTable/InfoTooltipColumn';

import { DataTable, DataTableProps } from './index';

// Provide drag handle via context so the drag icon inside the cell can act as the handle
type DragHandleValue = { handleProps: React.HTMLAttributes<HTMLElement> } | null;
const DragHandleContext = React.createContext<DragHandleValue>(null);

// Props extend your existing DataTable props but require getRowId, and allow onReorder callback
export type RowMoveDetail<T> = {
  row: T;
  fromIndex: number;
  toIndex: number;
  overId: string | number;
  direction: 'up' | 'down';
};

export type DraggableTableProps<T extends Partial<TooltipRowData>> = DataTableProps<T> & {
  getRowId: (row: T) => string | number;
  onReorder?: (rows: T[]) => void;
  onRowMove?: (detail: RowMoveDetail<T>) => void;
};

// Row slot override with dnd-kit useSortable
const SortableRow = (props: GridRowProps) => {
  const { rowId } = props;
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(rowId) });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
  };
  const handleProps: React.HTMLAttributes<HTMLElement> = {
    ...(attributes as unknown as React.HTMLAttributes<HTMLElement>),
    ...((listeners as unknown as React.HTMLAttributes<HTMLElement>) || {}),
  };
  return (
    <DragHandleContext.Provider value={{ handleProps }}>
      <GridRow ref={setNodeRef} {...props} style={{ ...props.style, ...style }} />
    </DragHandleContext.Provider>
  );
};

export function DraggableDataTable<T extends Partial<TooltipRowData>>({
  rows,
  columns,
  getRowId,
  onReorder,
  onRowMove,
  isLoading,
  height,
  ...rest
}: DraggableTableProps<T>) {
  const [newRows, setNewRows] = useState<T[]>(rows);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => {
    setNewRows(rows);
  }, [rows]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const idToIndex = (id: string | number) => newRows.findIndex((r) => String(getRowId(r)) === String(id));
      const oldIndex = idToIndex(String(active.id));
      const newIndex = idToIndex(String(over.id));
      if (oldIndex === -1 || newIndex === -1) return;

      const movedRow = newRows[oldIndex];
      const reordered = arrayMove(newRows, oldIndex, newIndex);
      setNewRows(reordered);
      onReorder?.(reordered);
      onRowMove?.({
        row: movedRow,
        fromIndex: oldIndex,
        toIndex: newIndex,
        overId: String(over.id),
        direction: newIndex < oldIndex ? 'up' : 'down',
      });
    },
    [newRows, getRowId, onReorder, onRowMove],
  );

  // Prepend a drag handle column
  const dragColumn: GridColDef = {
    field: '__drag__',
    headerName: '',
    width: 48,
    sortable: false,
    filterable: false,
    resizable: false,
    disableColumnMenu: true,
    renderCell: () => (
      <DragHandleContext.Consumer>
        {(value) => (
          <span
            {...(value?.handleProps || {})}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{ display: 'inline-flex', alignItems: 'center', touchAction: 'none' }}
          >
            <DragIndicator sx={{ color: 'text.secondary', cursor: 'grab', '&:active': { cursor: 'grabbing' } }} />
          </span>
        )}
      </DragHandleContext.Consumer>
    ),
  };

  const columnsWithDrag: GridColDef[] = [dragColumn, ...columns];

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={newRows.map((r) => String(getRowId(r)))} strategy={verticalListSortingStrategy}>
        <DataTable
          rows={newRows as T[]}
          columns={columnsWithDrag}
          getRowId={getRowId as (row: T) => string | number}
          isLoading={isLoading}
          height={height}
          disableRowSelectionOnClick
          slots={{ row: SortableRow }}
          {...rest}
        />
      </SortableContext>
    </DndContext>
  );
}
