import { authClient } from "@/lib/auth-client";

function emitLocalMutation(resource: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent("codepocket:vault-mutated", { detail: { resource } })
  );
  if ("BroadcastChannel" in window) {
    try {
      const ch = new BroadcastChannel("codepocket-vault-sync");
      ch.postMessage({ resource, at: Date.now() });
      ch.close();
    } catch {
      // Ignore BroadcastChannel errors
    }
  }
}

type Filter = {
  column: string;
  op: string;
  value: any;
};

class QueryBuilder<T = any[]> implements PromiseLike<{ data: T; count: number | null; error: any }> {
  private table: string;
  private action: "select" | "insert" | "update" | "delete" = "select";
  private selectColumns: string = "*";
  private selectOptions?: any;
  private payload: any = null;
  private filters: Filter[] = [];
  private orderColumn?: string;
  private orderAscending: boolean = true;
  private isSingle: boolean = false;
  private isMaybeSingle: boolean = false;
  private limitCount?: number;

  constructor(table: string) {
    this.table = table;
  }

  select(columns: string = "*", options?: any) {
    this.action = "select";
    this.selectColumns = columns;
    this.selectOptions = options;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push({ column, op: "eq", value });
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push({ column, op: "neq", value });
    return this;
  }

  is(column: string, value: any) {
    this.filters.push({ column, op: "is", value });
    return this;
  }

  not(column: string, op: string, value: any) {
    this.filters.push({ column, op: "not", value });
    return this;
  }

  in(column: string, values: any[]) {
    this.filters.push({ column, op: "in", value: values });
    return this;
  }

  order(column: string, options: { ascending?: boolean } = {}) {
    this.orderColumn = column;
    this.orderAscending = options.ascending ?? true;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  range(_from: number, _to: number) {
    return this;
  }

  single(): QueryBuilder<any> {
    this.isSingle = true;
    return this as unknown as QueryBuilder<any>;
  }

  maybeSingle(): QueryBuilder<any> {
    this.isMaybeSingle = true;
    return this as unknown as QueryBuilder<any>;
  }

  insert(values: any) {
    this.action = "insert";
    this.payload = values;
    return this;
  }

  update(values: any) {
    this.action = "update";
    this.payload = values;
    return this;
  }

  delete() {
    this.action = "delete";
    return this;
  }

  private getIdFilter(): string | null {
    const idFilter = this.filters.find((f) => f.column === "id" && f.op === "eq");
    return idFilter ? String(idFilter.value) : null;
  }

  private async execute(): Promise<{ data: any; count: number | null; error: any }> {
    try {
      const id = this.getIdFilter();

      // 1. SNIPPETS TABLE
      if (this.table === "snippets") {
        if (this.action === "insert") {
          const res = await fetch("/api/snippets", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.payload),
          });
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          emitLocalMutation("snippets");
          return { data: json.snippet, count: 1, error: null };
        }

        if (this.action === "update") {
          if (!id) return { data: null, count: null, error: { message: "ID required for update" } };
          const res = await fetch(`/api/snippets/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.payload),
          });
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          emitLocalMutation("snippets");
          return { data: json.snippet, count: 1, error: null };
        }

        if (this.action === "delete") {
          if (!id) return { data: null, count: null, error: { message: "ID required for delete" } };
          const isDeletedFilter = this.filters.some((f) => f.column === "deleted_at" && f.op === "not");
          const url = isDeletedFilter ? `/api/snippets/${id}?permanent=true` : `/api/snippets/${id}`;
          const res = await fetch(url, { method: "DELETE" });
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          emitLocalMutation("snippets");
          return { data: json, count: 1, error: null };
        }

        if (this.action === "select") {
          if (id) {
            const res = await fetch(`/api/snippets/${id}`);
            const json = await res.json();
            if (!res.ok) return { data: null, count: null, error: { message: json.error } };
            return { data: json.snippet, count: 1, error: null };
          }

          const params = new URLSearchParams();
          const folderFilter = this.filters.find((f) => f.column === "folder_id" && f.op === "eq");
          if (folderFilter) params.set("folder_id", folderFilter.value);

          const favFilter = this.filters.find((f) => f.column === "is_favorite" && f.op === "eq");
          if (favFilter) params.set("is_favorite", String(favFilter.value));

          const deletedFilter = this.filters.find((f) => f.column === "deleted_at" && f.op === "not");
          if (deletedFilter) params.set("deleted", "true");

          const res = await fetch(`/api/snippets?${params.toString()}`);
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };

          let list: any[] = json.snippets || [];
          if (this.isSingle || this.isMaybeSingle) {
            return { data: list[0] || null, count: list.length ? 1 : 0, error: null };
          }
          return { data: list, count: list.length, error: null };
        }
      }

      // 2. FOLDERS TABLE
      if (this.table === "folders") {
        if (this.action === "insert") {
          const res = await fetch("/api/folders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.payload),
          });
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          emitLocalMutation("folders");
          return { data: json.folder, count: 1, error: null };
        }

        if (this.action === "update") {
          if (!id) return { data: null, count: null, error: { message: "ID required for update" } };
          const res = await fetch(`/api/folders/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.payload),
          });
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          emitLocalMutation("folders");
          return { data: json, count: 1, error: null };
        }

        if (this.action === "delete") {
          if (!id) return { data: null, count: null, error: { message: "ID required for delete" } };
          const res = await fetch(`/api/folders/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          emitLocalMutation("folders");
          return { data: json, count: 1, error: null };
        }

        if (this.action === "select") {
          if (id) {
            const res = await fetch(`/api/folders/${id}`);
            const json = await res.json();
            if (!res.ok) return { data: null, count: null, error: { message: json.error } };
            return { data: json.folder, count: 1, error: null };
          }

          const res = await fetch("/api/folders");
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          const list: any[] = json.folders || [];
          return { data: list, count: list.length, error: null };
        }
      }

      // 3. API_KEYS TABLE
      if (this.table === "api_keys") {
        if (this.action === "insert") {
          const res = await fetch("/api/api-keys", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.payload),
          });
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          emitLocalMutation("api-keys");
          return { data: json.key, count: 1, error: null };
        }

        if (this.action === "delete") {
          if (!id) return { data: null, count: null, error: { message: "ID required for delete" } };
          const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          emitLocalMutation("api-keys");
          return { data: json, count: 1, error: null };
        }

        if (this.action === "select") {
          const res = await fetch("/api/api-keys");
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          const list: any[] = json.keys || [];
          return { data: list, count: list.length, error: null };
        }
      }

      // 4. PROFILES TABLE
      if (this.table === "profiles") {
        if (this.action === "select") {
          const res = await fetch("/api/profile");
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          return { data: json.profile, count: 1, error: null };
        }

        if (this.action === "update" || this.action === "insert") {
          const res = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.payload),
          });
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          emitLocalMutation("profile");
          return { data: json.profile, count: 1, error: null };
        }
      }

      // 5. LOGS TABLE
      if (this.table === "logs") {
        if (this.action === "insert") {
          const res = await fetch("/api/logs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(this.payload),
          });
          const json = await res.json();
          if (!res.ok) return { data: null, count: null, error: { message: json.error } };
          return { data: json.log, count: 1, error: null };
        }
      }

      return { data: null, count: null, error: null };
    } catch (err: any) {
      return { data: null, count: null, error: { message: err.message || "Request failed" } };
    }
  }

  then<TResult1 = { data: T; count: number | null; error: any }, TResult2 = never>(
    onfulfilled?: ((value: { data: T; count: number | null; error: any }) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | null
  ): Promise<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const supabase = {
  auth: {
    getUser: async () => {
      try {
        const sessionRes = await authClient.getSession();
        if (sessionRes?.data?.user) {
          const u = sessionRes.data.user;
          return {
            data: {
              user: {
                id: u.id,
                email: u.email,
                user_metadata: {
                  username: (u as any).username || u.name,
                  name: u.name,
                },
              },
            },
            error: null,
          };
        }
        return { data: { user: null }, error: null };
      } catch (err: any) {
        return { data: { user: null }, error: { message: err.message } };
      }
    },

    getSession: async () => {
      try {
        const sessionRes = await authClient.getSession();
        if (sessionRes?.data?.session) {
          return {
            data: {
              session: {
                access_token: sessionRes.data.session.token,
                user: sessionRes.data.user,
              },
            },
            error: null,
          };
        }
        return { data: { session: null }, error: null };
      } catch (err: any) {
        return { data: { session: null }, error: { message: err.message } };
      }
    },

    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const res = await authClient.signIn.email({ email, password });
      if (res.error) {
        return { data: { user: null, session: null }, error: { message: res.error.message || "Invalid credentials" } };
      }
      return { data: { user: res.data?.user, session: res.data }, error: null };
    },

    signUp: async ({ email, password, options }: { email: string; password: string; options?: any }) => {
      const username = options?.data?.username || email.split("@")[0];
      const res = await authClient.signUp.email({
        email,
        password,
        name: username,
      });
      if (res.error) {
        return { data: { user: null, session: null }, error: { message: res.error.message || "Sign up failed" } };
      }
      return { data: { user: res.data?.user, session: res.data }, error: null };
    },

    signOut: async (): Promise<{ error: { message: string } | null }> => {
      try {
        await authClient.signOut();
        return { error: null };
      } catch (err: any) {
        return { error: { message: err.message || "Failed to sign out" } };
      }
    },

    signInWithOAuth: async ({ provider, options }: { provider: string; options?: any }): Promise<{ error: { message: string } | null }> => {
      try {
        const res = await authClient.signIn.social({
          provider: provider as any,
          callbackURL: options?.redirectTo || "/dashboard",
        });
        if (res?.error) {
          return {
            error: {
              message: res.error.message || "Google sign-in is not configured yet",
            },
          };
        }
        return { error: null };
      } catch (err: any) {
        return { error: { message: err.message || "Failed to initialize social login" } };
      }
    },

    resetPasswordForEmail: async (_email: string, _options?: any): Promise<{ data: any; error: { message: string } | null }> => {
      return { data: {}, error: null };
    },

    updateUser: async (_attributes: any): Promise<{ data: any; error: { message: string } | null }> => {
      return { data: {}, error: null };
    },

    onAuthStateChange: (_callback: any) => {
      return {
        data: {
          subscription: {
            unsubscribe: () => {},
          },
        },
      };
    },
  },

  from: (table: string) => new QueryBuilder(table),

  channel: (_name: string) => {
    const channelObj = {
      on: (
        _event: string,
        _filterOrCb: any,
        _callback?: (payload: { new: any; old: any; [key: string]: any }) => void
      ) => channelObj,
      subscribe: (..._args: any[]) => channelObj,
      unsubscribe: (..._args: any[]) => {},
    };
    return channelObj;
  },

  removeChannel: (_channel: any) => {},
  removeAllChannels: () => {},
};
