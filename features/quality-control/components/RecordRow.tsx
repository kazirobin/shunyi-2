"use client";

import type { ReactNode } from "react";
import type { QualityControlRecord } from "../model";

/** Isolated row renderer for the quality-control feature. Edit this file to change this feature's row only. */
export default function RecordRow({ row, columns, renderValue }: {
  row: QualityControlRecord;
  columns: { key: string; label: string }[];
  renderValue: (value: unknown, fieldKey: string) => ReactNode;
}) {
  return <tr data-record-id={row.id}>{columns.map((column) => <td key={column.key}>{renderValue(row[column.key], column.key)}</td>)}</tr>;
}
