
import { supabase } from '@/integrations/supabase/client';

export type AuthError = {
  message: string;
}

export async function signUp(email: string, password: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signUp({ 
    email, 
    password,
  });
  
  return { 
    error: error ? { message: error.message } : null 
  };
}

export async function signIn(email: string, password: string): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signInWithPassword({ 
    email, 
    password,
  });
  
  return { 
    error: error ? { message: error.message } : null 
  };
}

export async function signOut(): Promise<{ error: AuthError | null }> {
  const { error } = await supabase.auth.signOut();
  
  return { 
    error: error ? { message: error.message } : null 
  };
}

export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
