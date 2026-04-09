"use client";

import * as React from "react";
import Link from "next/link";

import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function AuthButtons() {
  const [signedIn, setSignedIn] = React.useState<boolean>(false);

  React.useEffect(() => {
    let alive = true;

    async function init() {
      if (!supabase) return;
      const { data } = await supabase.auth.getSession();
      if (!alive) return;
      setSignedIn(Boolean(data.session));
    }

    void init();

    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSignedIn(Boolean(session));
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!supabase) return null;

  return signedIn ? (
    <Button
      variant="outline"
      onClick={async () => {
        await supabase.auth.signOut();
      }}
    >
      Salir
    </Button>
  ) : (
    <Button asChild>
      <Link href="/login">Ingresar</Link>
    </Button>
  );
}

