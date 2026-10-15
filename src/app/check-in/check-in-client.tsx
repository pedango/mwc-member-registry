"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Search, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/shared/Avatar";
import { Logo } from "@/components/shared/Logo";
import { AssemblyBadge } from "@/components/ui/badge";

type Match = {
  id: string;
  name: string;
  assembly: "ENGLISH" | "LOCAL";
  photoUrl?: string | null;
  alreadyCheckedIn: boolean;
};

type Done = {
  name: string;
  alreadyCheckedIn: boolean;
};

export function CheckInClient({ serviceLabel }: { serviceLabel: string }) {
  const [query, setQuery] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<Match | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const trimmed = query.trim();

  useEffect(() => {
    if (trimmed.length < 3) {
      setMatches([]);
      setSearching(false);
      return;
    }

    const handle = window.setTimeout(async () => {
      setSearching(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/check-in/search?q=${encodeURIComponent(trimmed)}`
        );
        const json = await res.json();
        setMatches(json.members ?? []);
      } catch {
        setError("Unable to search right now. Try again.");
        setMatches([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => window.clearTimeout(handle);
  }, [trimmed]);

  const emptyHint = useMemo(() => {
    if (trimmed.length < 3) return "Type at least 3 letters of your name.";
    if (searching) return null;
    if (matches.length === 0) return "No member matched that name. See an usher.";
    return null;
  }, [trimmed.length, searching, matches.length]);

  async function confirm(member: Match) {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId: member.id }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Check-in failed. See an usher.");
        return;
      }
      setDone({
        name: json.name ?? member.name,
        alreadyCheckedIn: Boolean(json.alreadyCheckedIn),
      });
      setSelected(null);
      setQuery("");
      setMatches([]);
    } catch {
      setError("Check-in failed. See an usher.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-10 2xl:max-w-lg">
        <div className="mb-8 flex justify-center">
          <Logo className="h-auto w-36" alt="Mamprobi Worship Center" />
        </div>
        <div className="surface p-6 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" aria-hidden="true" />
          <h1 className="mt-4 text-section font-semibold text-primary">
            {done.alreadyCheckedIn ? "Already marked present" : "Attendance recorded"}
          </h1>
          <p className="mt-2 text-base font-medium text-foreground">{done.name}</p>
          <p className="mt-1 type-caption">{serviceLabel}</p>
          <Button
            className="mt-6 w-full"
            onClick={() => {
              setDone(null);
              setError(null);
            }}
          >
            Check in someone else
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8 pb-[max(2.5rem,env(safe-area-inset-bottom))] sm:px-5 sm:py-10 2xl:max-w-lg">
      <div className="mb-6 flex justify-center">
        <Logo className="h-auto w-36" alt="Mamprobi Worship Center" />
      </div>
      <div className="mb-6 text-center">
        <h1 className="text-title text-primary">Sunday Attendance</h1>
        <p className="mt-1.5 type-body text-muted-foreground">{serviceLabel}</p>
        <p className="mt-3 text-sm text-muted-foreground">
          Enter your full name, confirm it is you, then tap I&apos;m here.
        </p>
      </div>

      <label className="label-caps mb-2 block" htmlFor="check-in-name">
        Full name
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="check-in-name"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelected(null);
            setError(null);
          }}
          placeholder="e.g. Kwame Mensah"
          className="h-12 pl-9"
          autoComplete="name"
          autoFocus
        />
      </div>

      <div className="mt-4 min-h-16">
        {searching ? (
          <p className="flex items-center gap-2 type-caption">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Searching…
          </p>
        ) : emptyHint ? (
          <p className="type-caption">{emptyHint}</p>
        ) : (
          <ul className="space-y-2">
            {matches.map((member) => {
              const isSelected = selected?.id === member.id;
              return (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(member)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition-ui ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border bg-card hover:border-primary/30"
                    }`}
                  >
                    <Avatar src={member.photoUrl} name={member.name} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-foreground">
                        {member.name}
                      </span>
                      <span className="mt-1 inline-flex">
                        <AssemblyBadge assembly={member.assembly} />
                      </span>
                    </span>
                    {member.alreadyCheckedIn ? (
                      <span className="shrink-0 text-caption text-success">Present</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selected ? (
        <div className="mt-6 surface p-4">
          <p className="type-caption">Confirm this is you</p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar src={selected.photoUrl} name={selected.name} size="lg" />
            <div>
              <p className="font-semibold text-foreground">{selected.name}</p>
              <AssemblyBadge assembly={selected.assembly} />
            </div>
          </div>
          {selected.alreadyCheckedIn ? (
            <p className="mt-3 text-sm text-success">
              This member is already marked present today.
            </p>
          ) : (
            <Button
              className="mt-4 w-full"
              onClick={() => confirm(selected)}
              disabled={submitting}
              aria-busy={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                <>
                  <UserRound className="h-4 w-4" aria-hidden="true" />
                  I&apos;m here
                </>
              )}
            </Button>
          )}
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
