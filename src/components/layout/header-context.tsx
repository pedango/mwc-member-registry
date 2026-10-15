"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";

export type HeaderHeading = {
  title: string;
  description?: string;
};

const HeaderHeadingContext = createContext<{
  heading: HeaderHeading | null;
  setHeading: (heading: HeaderHeading | null) => void;
}>({
  heading: null,
  setHeading: () => {},
});

export function HeaderHeadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [heading, setHeading] = useState<HeaderHeading | null>(null);
  const value = useMemo(() => ({ heading, setHeading }), [heading]);
  return (
    <HeaderHeadingContext.Provider value={value}>
      {children}
    </HeaderHeadingContext.Provider>
  );
}

export function useHeaderHeading() {
  return useContext(HeaderHeadingContext).heading;
}

export function SetHeaderHeading({
  title,
  description,
}: HeaderHeading) {
  const { setHeading } = useContext(HeaderHeadingContext);

  useLayoutEffect(() => {
    setHeading({ title, description });
    return () => setHeading(null);
  }, [title, description, setHeading]);

  return null;
}
