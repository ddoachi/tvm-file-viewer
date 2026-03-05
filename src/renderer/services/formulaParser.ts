/**
 * Formula Parser for Boolean Logic
 *
 * Parses boolean formulas like "A || (B && C)" where A, B, C are variable names
 * Supports operators: && (AND), || (OR), ! (NOT)
 * Supports parentheses for grouping
 */

export interface ParseResult {
  isValid: boolean;
  error?: string;
  evaluate?: (variables: Map<string, boolean>) => boolean;
}

type TokenType = 'VAR' | 'AND' | 'OR' | 'NOT' | 'LPAREN' | 'RPAREN' | 'EOF';

interface Token {
  type: TokenType;
  value: string;
  position: number;
}

class Lexer {
  private pos = 0;
  private input: string;

  constructor(input: string) {
    this.input = input;
  }

  private peek(): string {
    return this.pos < this.input.length ? this.input[this.pos] : '';
  }

  private advance(): string {
    return this.input[this.pos++];
  }

  private skipWhitespace(): void {
    while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
      this.pos++;
    }
  }

  nextToken(): Token {
    this.skipWhitespace();

    if (this.pos >= this.input.length) {
      return { type: 'EOF', value: '', position: this.pos };
    }

    const start = this.pos;
    const char = this.peek();

    // Parentheses
    if (char === '(') {
      this.advance();
      return { type: 'LPAREN', value: '(', position: start };
    }
    if (char === ')') {
      this.advance();
      return { type: 'RPAREN', value: ')', position: start };
    }

    // NOT operator
    if (char === '!') {
      this.advance();
      return { type: 'NOT', value: '!', position: start };
    }

    // AND operator (&&)
    if (char === '&' && this.input[this.pos + 1] === '&') {
      this.advance();
      this.advance();
      return { type: 'AND', value: '&&', position: start };
    }

    // OR operator (||)
    if (char === '|' && this.input[this.pos + 1] === '|') {
      this.advance();
      this.advance();
      return { type: 'OR', value: '||', position: start };
    }

    // Variable (A-Z, AA, AB, etc.)
    if (/[A-Z]/.test(char)) {
      let varName = '';
      while (this.pos < this.input.length && /[A-Z]/.test(this.input[this.pos])) {
        varName += this.advance();
      }
      return { type: 'VAR', value: varName, position: start };
    }

    throw new Error(`Unexpected character '${char}' at position ${start}`);
  }
}

class Parser {
  private lexer: Lexer;
  private currentToken: Token;

  constructor(input: string) {
    this.lexer = new Lexer(input);
    this.currentToken = this.lexer.nextToken();
  }

  private advance(): void {
    this.currentToken = this.lexer.nextToken();
  }

  private expect(type: TokenType): void {
    if (this.currentToken.type !== type) {
      throw new Error(
        `Expected ${type} but got ${this.currentToken.type} at position ${this.currentToken.position}`
      );
    }
    this.advance();
  }

  // Grammar:
  // expression := orExpr
  // orExpr := andExpr ('||' andExpr)*
  // andExpr := notExpr ('&&' notExpr)*
  // notExpr := '!' notExpr | primary
  // primary := '(' expression ')' | VAR

  parse(): (variables: Map<string, boolean>) => boolean {
    const expr = this.parseOrExpr();
    if (this.currentToken.type !== 'EOF') {
      throw new Error(`Unexpected token ${this.currentToken.value} at position ${this.currentToken.position}`);
    }
    return expr;
  }

  private parseOrExpr(): (variables: Map<string, boolean>) => boolean {
    let left = this.parseAndExpr();

    while (this.currentToken.type === 'OR') {
      this.advance();
      const right = this.parseAndExpr();
      const prevLeft = left;
      left = (vars) => prevLeft(vars) || right(vars);
    }

    return left;
  }

  private parseAndExpr(): (variables: Map<string, boolean>) => boolean {
    let left = this.parseNotExpr();

    while (this.currentToken.type === 'AND') {
      this.advance();
      const right = this.parseNotExpr();
      const prevLeft = left;
      left = (vars) => prevLeft(vars) && right(vars);
    }

    return left;
  }

  private parseNotExpr(): (variables: Map<string, boolean>) => boolean {
    if (this.currentToken.type === 'NOT') {
      this.advance();
      const expr = this.parseNotExpr();
      return (vars) => !expr(vars);
    }

    return this.parsePrimary();
  }

  private parsePrimary(): (variables: Map<string, boolean>) => boolean {
    if (this.currentToken.type === 'LPAREN') {
      this.advance();
      const expr = this.parseOrExpr();
      this.expect('RPAREN');
      return expr;
    }

    if (this.currentToken.type === 'VAR') {
      const varName = this.currentToken.value;
      this.advance();
      return (vars) => vars.get(varName) ?? false;
    }

    throw new Error(
      `Unexpected token ${this.currentToken.type} at position ${this.currentToken.position}`
    );
  }
}

/**
 * Parse a boolean formula and return a validation result
 * @param formula - Formula string like "A || (B && C)"
 * @param validVariables - Set of valid variable names (e.g., ["A", "B", "C"])
 * @returns ParseResult with validation status and evaluator function
 */
export function parseFormula(formula: string, validVariables?: Set<string>): ParseResult {
  if (!formula || formula.trim() === '') {
    return {
      isValid: false,
      error: 'Formula cannot be empty',
    };
  }

  try {
    const parser = new Parser(formula);
    const evaluator = parser.parse();

    // Extract variables used in formula
    if (validVariables) {
      const usedVars = extractVariables(formula);
      const invalidVars = usedVars.filter(v => !validVariables.has(v));

      if (invalidVars.length > 0) {
        return {
          isValid: false,
          error: `Invalid variables: ${invalidVars.join(', ')}. Available: ${Array.from(validVariables).join(', ')}`,
        };
      }
    }

    return {
      isValid: true,
      evaluate: evaluator,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Parse error',
    };
  }
}

/**
 * Extract all variable names from a formula
 */
function extractVariables(formula: string): string[] {
  const vars: string[] = [];
  const regex = /\b([A-Z]+)\b/g;
  let match;

  while ((match = regex.exec(formula)) !== null) {
    if (!vars.includes(match[1])) {
      vars.push(match[1]);
    }
  }

  return vars;
}

/**
 * Generate variable name from index (A, B, C, ..., Z, AA, AB, ...)
 */
export function indexToVariable(index: number): string {
  let result = '';
  let num = index;

  while (num >= 0) {
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26) - 1;
    if (num < 0) break;
  }

  return result;
}
