#!/bin/bash
# Run the CSV generator with sensible defaults

set -e

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Default values
ROWS=100
OUTPUT="demo-data.csv"
HEADERS="Net,Group:int,Vnet1:string,Vnet2:string"

# Parse command-line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --rows)
            ROWS="$2"
            shift 2
            ;;
        --output)
            OUTPUT="$2"
            shift 2
            ;;
        --headers)
            HEADERS="$2"
            shift 2
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --rows N              Number of rows to generate (default: 100)"
            echo "  --output FILE         Output file path (default: demo-data.csv)"
            echo "  --headers HEADERS     CSV headers with types (default: 'Net,Group:int,Vnet1:string,Vnet2:string')"
            echo "  --help                Show this help message"
            echo ""
            echo "Example:"
            echo "  $0 --rows 1000 --output large-data.csv"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Run the generator
python3 "$SCRIPT_DIR/generate_csv.py" \
    --rows "$ROWS" \
    --output "$OUTPUT" \
    --headers "$HEADERS"
