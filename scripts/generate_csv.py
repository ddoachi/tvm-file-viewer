#!/usr/bin/env python3
"""
Generate demo CSV files with realistic hierarchical netlist data for DRAM design.
"""

import argparse
import csv
import random
import sys
from typing import List, Dict, Any


def generate_hierarchical_net(instance_id: int, bank_id: int, net_id: int) -> str:
    """Generate a hierarchical net name like _DRAM_CORE.BANK0.net1"""
    return f"_DRAM_CORE.BANK{bank_id}.net{net_id}"


def generate_row_data(row_num: int, column_types: Dict[str, str]) -> Dict[str, Any]:
    """Generate a single row of data based on column types."""
    row = {}

    for col_name, col_type in column_types.items():
        if col_name == "Net":
            # Generate hierarchical net names
            bank_id = (row_num // 10) % 4  # Distribute across 4 banks
            net_id = row_num + 1
            row[col_name] = generate_hierarchical_net(0, bank_id, net_id)
        elif col_name == "Group":
            # Generate group numbers (1-4 based on bank)
            row[col_name] = (row_num // 10) % 4 + 1
        elif col_type == "int":
            row[col_name] = random.randint(1, 100)
        elif col_type == "float":
            row[col_name] = round(random.uniform(0.0, 100.0), 2)
        elif col_type == "string":
            # Voltage rail names
            voltage_rails = ["VDD", "VSS", "VDDQ", "VSSQ", "VEXT", "VON", "VOFF"]
            row[col_name] = random.choice(voltage_rails)
        else:
            row[col_name] = ""

    return row


def parse_headers(headers_str: str) -> Dict[str, str]:
    """
    Parse header string into dictionary of column_name: column_type.
    Format: "Name:type,Name:type,..." where type is optional (defaults to string).
    Example: "Net,Group:int,Vnet1:string,Vnet2:string"
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
        default="Net,Group:int,Vnet1:string,Vnet2:string",
        help="Comma-separated header definitions with optional types (e.g., 'Name:type'). "
             "Default: 'Net,Group:int,Vnet1:string,Vnet2:string'",
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

    # Ensure Net column exists for hierarchical data
    if "Net" not in headers:
        headers["Net"] = "string"

    # Generate CSV
    generate_csv(headers, args.rows, args.output)


if __name__ == "__main__":
    main()
