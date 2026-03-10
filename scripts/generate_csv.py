#!/usr/bin/env python3
"""
Generate demo CSV files with realistic hierarchical netlist data for DRAM design.
"""

import argparse
import csv
import random
import sys
from typing import List, Dict, Any


# Default column definitions matching CsvRow type
DEFAULT_HEADERS = (
    "tree,hier_LV:int,parent_master,master,multiple:int,"
    "xprobe,assigned,vnets,D/S/B:int,DNW:int,G:int,"
    "switch_type:int,psw_detected:int,psw_used:int,tg:int,"
    "cmos_drv,vnets_group,is_short:int"
)

MASTERS = ["M_CORE", "M_IO", "M_PERI", "M_SA", "M_WL", "M_BL"]
VNETS = ["VDD", "VSS", "VDDQ", "VSSQ", "VEXT", "VON", "VOFF"]
VNETS_GROUPS = ["GRP_CORE", "GRP_IO", "GRP_PERI", "GRP_SA"]
CMOS_DRVS = ["NMOS", "PMOS", "CMOS", "INV", "BUF"]
XPROBES = ["", "XP_TOP", "XP_CORE", "XP_IO"]
ASSIGNED_VALS = ["", "AUTO", "MANUAL", "FIXED"]


def generate_hierarchical_tree(bank_id: int, net_id: int) -> str:
    """Generate a hierarchical tree name like _DRAM_CORE.BANK0.net1"""
    return f"_DRAM_CORE.BANK{bank_id}.net{net_id}"


def generate_row_data(row_num: int, column_types: Dict[str, str]) -> Dict[str, Any]:
    """Generate a single row of data based on column types."""
    row = {}
    bank_id = (row_num // 10) % 4

    for col_name, col_type in column_types.items():
        if col_name == "tree":
            row[col_name] = generate_hierarchical_tree(bank_id, row_num + 1)
        elif col_name == "hier_LV":
            row[col_name] = random.choice([1, 2, 3])
        elif col_name == "parent_master":
            row[col_name] = random.choice(["TOP", "SUB1", "SUB2"])
        elif col_name == "master":
            row[col_name] = random.choice(MASTERS)
        elif col_name == "multiple":
            row[col_name] = random.choice([1, 2, 4])
        elif col_name == "xprobe":
            row[col_name] = random.choice(XPROBES)
        elif col_name == "assigned":
            row[col_name] = random.choice(ASSIGNED_VALS)
        elif col_name == "vnets":
            row[col_name] = random.choice(VNETS)
        elif col_name == "D/S/B":
            row[col_name] = random.randint(0, 8)
        elif col_name == "DNW":
            row[col_name] = random.choice([0, 1])
        elif col_name == "G":
            row[col_name] = random.randint(0, 4)
        elif col_name == "switch_type":
            row[col_name] = random.choice([0, 1, 2])
        elif col_name == "psw_detected":
            row[col_name] = random.choice([0, 1])
        elif col_name == "psw_used":
            row[col_name] = random.choice([0, 1])
        elif col_name == "tg":
            row[col_name] = random.choice([0, 1])
        elif col_name == "cmos_drv":
            row[col_name] = random.choice(CMOS_DRVS)
        elif col_name == "vnets_group":
            row[col_name] = random.choice(VNETS_GROUPS)
        elif col_name == "is_short":
            row[col_name] = random.choice([0, 1])
        elif col_type == "int":
            row[col_name] = random.randint(0, 100)
        elif col_type == "float":
            row[col_name] = round(random.uniform(0.0, 100.0), 2)
        elif col_type == "string":
            row[col_name] = random.choice(VNETS)
        else:
            row[col_name] = ""

    return row


def parse_headers(headers_str: str) -> Dict[str, str]:
    """
    Parse header string into dictionary of column_name: column_type.
    Format: "Name:type,Name:type,..." where type is optional (defaults to string).
    """
    headers = {}
    for header in headers_str.split(","):
        header = header.strip()
        if ":" in header:
            name, col_type = header.split(":", 1)
            headers[name.strip()] = col_type.strip()
        else:
            headers[header] = "string"
    return headers


def generate_csv(
    headers: Dict[str, str],
    row_count: int,
    output_file: str,
) -> None:
    """Generate CSV file with specified headers and row count."""
    try:
        with open(output_file, 'w', newline='') as f:
            writer = csv.DictWriter(f, fieldnames=headers.keys())
            writer.writeheader()

            for row_num in range(row_count):
                row = generate_row_data(row_num, headers)
                writer.writerow(row)

        print(f"Successfully generated {output_file}")
        print(f"  - Headers: {', '.join(headers.keys())}")
        print(f"  - Rows: {row_count}")
    except IOError as e:
        print(f"Error writing to {output_file}: {e}", file=sys.stderr)
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(
        description="Generate demo CSV files with hierarchical netlist data"
    )
    parser.add_argument(
        "--headers",
        default=DEFAULT_HEADERS,
        help="Comma-separated header definitions with optional types (e.g., 'Name:type'). ",
    )
    parser.add_argument(
        "--rows",
        type=int,
        default=100,
        help="Number of rows to generate (default: 100)",
    )
    parser.add_argument(
        "--output",
        default="demo-data.csv",
        help="Output CSV file path (default: demo-data.csv)",
    )

    args = parser.parse_args()

    # Validate row count
    if args.rows <= 0:
        print(f"Error: rows must be greater than 0", file=sys.stderr)
        sys.exit(1)

    # Parse headers
    headers = parse_headers(args.headers)
    if not headers:
        print(f"Error: no headers specified", file=sys.stderr)
        sys.exit(1)

    # Ensure tree column exists for hierarchical data
    if "tree" not in headers:
        headers["tree"] = "string"

    # Generate CSV
    generate_csv(headers, args.rows, args.output)


if __name__ == "__main__":
    main()
