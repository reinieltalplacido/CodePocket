// lib/logger.ts
// Utility for logging events to the admin monitoring system

type LogEvent = {
  eventType: string;
  category: 'auth' | 'snippet' | 'group' | 'error' | 'security';
  metadata?: Record<string, any>;
  userId?: string;
};

export async function logEvent({
  eventType,
  category,
  metadata = {},
  userId,
}: LogEvent): Promise<void> {
  try {
    // Don't block the main thread - fire and forget
    fetch('/api/logs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event_type: eventType,
        event_category: category,
        metadata,
        user_id: userId,
      }),
    }).catch((error) => {
      // Silently fail - don't break user experience if logging fails
      console.error('Failed to log event:', error);
    });
  } catch (error) {
    // Silently fail
    console.error('Failed to log event:', error);
  }
}

// Convenience functions for common log types
export const logger = {
  auth: {
    signup: (userId: string, metadata?: Record<string, any>) =>
      logEvent({ eventType: 'signup', category: 'auth', userId, metadata }),
    
    login: (userId: string, metadata?: Record<string, any>) =>
      logEvent({ eventType: 'login', category: 'auth', userId, metadata }),
    
    logout: (userId: string) =>
      logEvent({ eventType: 'logout', category: 'auth', userId }),
    
    oauthAttempt: (provider: string, metadata?: Record<string, any>) =>
      logEvent({ eventType: 'oauth_attempt', category: 'auth', metadata: { provider, ...metadata } }),
    
    failedLogin: (email: string, reason: string) =>
      logEvent({ eventType: 'failed_login', category: 'security', metadata: { email, reason } }),
  },
  
  snippet: {
    create: (userId: string, snippetId: string) =>
      logEvent({ eventType: 'snippet_create', category: 'snippet', userId, metadata: { snippetId } }),
    
    edit: (userId: string, snippetId: string) =>
      logEvent({ eventType: 'snippet_edit', category: 'snippet', userId, metadata: { snippetId } }),
    
    delete: (userId: string, snippetId: string) =>
      logEvent({ eventType: 'snippet_delete', category: 'snippet', userId, metadata: { snippetId } }),
  },
  
  group: {
    create: (userId: string, groupId: string) =>
      logEvent({ eventType: 'group_create', category: 'group', userId, metadata: { groupId } }),
    
    join: (userId: string, groupId: string) =>
      logEvent({ eventType: 'group_join', category: 'group', userId, metadata: { groupId } }),
  },
  
  error: (errorMessage: string, metadata?: Record<string, any>) =>
    logEvent({ eventType: 'error', category: 'error', metadata: { errorMessage, ...metadata } }),
};
