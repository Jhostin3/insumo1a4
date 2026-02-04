import { supabase } from '../../core/supabase/client.supabase';

export const AuthService = {
  async signUp(email: string, password: string, firstName: string, lastName: string) {
    // El perfil se crea automáticamente via trigger en auth.users
    // Pasamos first_name y last_name como metadata para uso futuro
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) throw error;
    return data;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
};
