"use client";

import type { ReactNode } from "react";
import type { BuyersRecord } from "../model";

/** Isolated row renderer for the buyers feature. Edit this file to change this feature's row only. */
export default function RecordRow({ row, columns, renderValue }: {
  row: BuyersRecord;
  columns: { key: string; label: string }[];
  renderValue: (value: unknown, fieldKey: string) => ReactNode;
}) {
  return <tr data-record-id={row.id}>{columns.map((column) => <td key={column.key}>{renderValue(row[column.key], column.key)}</td>)}</tr>;
}
