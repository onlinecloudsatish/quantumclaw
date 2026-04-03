const SQL_KEYWORDS = [
  "SELECT", "INSERT", "UPDATE", "DELETE", "DROP", "CREATE", "ALTER", "EXEC", 
  "UNION", "--", "/*", "*/", ";", " xp_", " sp_"
];

export function sanitizeSqlInput(input: string): string {
  let sanitized = input;
  
  // Escape single quotes
  sanitized = sanitized.replace(/'/g, "''");
  
  // Remove SQL keywords (case insensitive)
  for (const keyword of SQL_KEYWORDS) {
    const regex = new RegExp(keyword, "gi");
    sanitized = sanitized.replace(regex, "");
  }
  
  return sanitized;
}

export function validateSqlIdentifier(identifier: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier);
}
