/**
 * Input validation and sanitization utilities
 * Prevents XSS, injection attacks, and ensures data integrity
 */

// Email validation with strict RFC 5322 compliance
export function validateEmail(email: string): { valid: boolean; error?: string } {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required' };
  }

  const trimmedEmail = email.trim();
  
  if (trimmedEmail.length === 0) {
    return { valid: false, error: 'Email cannot be empty' };
  }

  if (trimmedEmail.length > 254) {
    return { valid: false, error: 'Email is too long' };
  }

  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(trimmedEmail)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true };
}

// Password validation with comprehensive security requirements
export function validatePassword(password: string): { 
  valid: boolean; 
  error?: string;
  strength?: 'weak' | 'medium' | 'strong';
} {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }

  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long' };
  }

  if (password.length > 128) {
    return { valid: false, error: 'Password is too long (max 128 characters)' };
  }

  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  if (!hasUppercase) {
    return { valid: false, error: 'Password must contain at least one uppercase letter' };
  }

  if (!hasLowercase) {
    return { valid: false, error: 'Password must contain at least one lowercase letter' };
  }

  if (!hasNumber) {
    return { valid: false, error: 'Password must contain at least one number' };
  }

  if (!hasSpecial) {
    return { valid: false, error: 'Password must contain at least one special character' };
  }

  // Check for common weak passwords
  const commonPasswords = ['password', '12345678', 'qwerty', 'abc123', 'password123'];
  if (commonPasswords.some(weak => password.toLowerCase().includes(weak))) {
    return { valid: false, error: 'Password is too common. Please choose a stronger password' };
  }

  // Calculate password strength
  let strength: 'weak' | 'medium' | 'strong' = 'medium';
  const criteriaCount = [hasUppercase, hasLowercase, hasNumber, hasSpecial].filter(Boolean).length;
  
  if (password.length >= 12 && criteriaCount === 4) {
    strength = 'strong';
  } else if (password.length < 10 || criteriaCount < 4) {
    strength = 'weak';
  }

  return { valid: true, strength };
}

// Sanitize snippet title to prevent XSS
export function sanitizeSnippetTitle(title: string): string {
  if (!title || typeof title !== 'string') {
    return '';
  }

  return title
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 200); // Limit length
}

// Sanitize snippet description
export function sanitizeDescription(description: string): string {
  if (!description || typeof description !== 'string') {
    return '';
  }

  return description
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .slice(0, 1000); // Limit length
}

// Sanitize code content (preserve code but escape dangerous patterns)
export function sanitizeCode(code: string): string {
  if (!code || typeof code !== 'string') {
    return '';
  }

  // For code, we want to preserve most characters but limit length
  // and remove null bytes which can cause issues
  return code
    .replace(/\0/g, '') // Remove null bytes
    .slice(0, 100000); // Limit to 100KB
}

// Sanitize folder name
export function sanitizeFolderName(name: string): string {
  if (!name || typeof name !== 'string') {
    return '';
  }

  return name
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/[/\\]/g, '') // Remove path separators
    .slice(0, 50); // Limit length
}

// Validate snippet language
export function validateLanguage(language: string): boolean {
  const validLanguages = [
    'javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'csharp',
    'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'html', 'css',
    'sql', 'bash', 'powershell', 'json', 'yaml', 'markdown', 'plaintext'
  ];

  return validLanguages.includes(language.toLowerCase());
}

// Validate folder color
export function validateFolderColor(color: string): boolean {
  const validColors = ['emerald', 'blue', 'purple', 'pink', 'orange', 'red'];
  return validColors.includes(color.toLowerCase());
}

// Sanitize search query to prevent injection
export function sanitizeSearchQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }

  return query
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/[;'"\\]/g, '') // Remove SQL-like characters
    .slice(0, 100); // Limit length
}

// Validate UUID format
export function validateUUID(uuid: string): boolean {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

// Rate limiting helper - tracks attempts in memory
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  identifier: string,
  maxAttempts: number = 5,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [key, value] of rateLimitStore.entries()) {
      if (value.resetAt < now) {
        rateLimitStore.delete(key);
      }
    }
  }

  if (!record || record.resetAt < now) {
    // First attempt or window expired
    const resetAt = now + windowMs;
    rateLimitStore.set(identifier, { count: 1, resetAt });
    return { allowed: true, remaining: maxAttempts - 1, resetAt };
  }

  if (record.count >= maxAttempts) {
    // Rate limit exceeded
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(identifier, record);
  return { allowed: true, remaining: maxAttempts - record.count, resetAt: record.resetAt };
}
