import type { Route } from "./+types/home";
import { LandingPage } from "../pages/landing-page";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Amora — Platform Undangan Pernikahan Digital" },
    { name: "description", content: "Platform pembuatan website undangan pernikahan digital eksklusif, modern, dan interaktif by Ratival." },
  ];
}

export default function Home() {
  return <LandingPage />;
}
