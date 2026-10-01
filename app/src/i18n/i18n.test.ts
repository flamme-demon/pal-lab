import { expect, test } from "bun:test";
import { getLocale, setLocale, t, tr, matchesText, gameName } from "./index";
import game from "./game-fr.json";
import pack from "../../../crates/pal-data/vendor/extracted-game-data.json";

test("language switch translates menus and preserves unknown user text", () => {
  const previous = getLocale();
  setLocale("fr");
  expect(t("Save plan")).toBe("Enregistrer le plan");
  expect(t("Save Inspector")).toBe("Mes Pals");
  expect(t("My custom Anubis goal 100/100/100")).toBe("My custom Anubis goal 100/100/100");
  expect(t("toString")).toBe("toString");
  expect(matchesText("__proto__", "__proto__")).toBe(true);
  expect(tr(100)).toBe(100);
  setLocale("en");
  expect(t("Save plan")).toBe("Save plan");
  expect(t("Save Inspector")).toBe("Save Inspector");
  setLocale(previous);
});

test("In-game names use stable IDs and bilingual accent-insensitive search", () => {
  const previous = getLocale();
  setLocale("fr");
  expect(gameName("Legend", "Legend")).toBe("Légende");
  expect(t("Serenity")).toBe("Sérénité");
  expect(t("Demon’s Hand")).toBe("Main du Démon");
  expect(matchesText("legende", "Legend")).toBe(true);
  expect(matchesText("sérénité", "Serenity")).toBe(true);
  expect(matchesText("swift", "Swift")).toBe(true);
  setLocale("en");
  expect(gameName("Legend", "Legend")).toBe("Legend");
  expect(matchesText("serenite", "Serenity")).toBe(true);
  setLocale(previous);
});

test("interpolated UI messages preserve parameters, slots and spacing", () => {
  const previous = getLocale();
  setLocale("fr");
  expect(t("Remove {0}", ["My named Pal"])).toBe("Retirer My named Pal");
  expect(t(" Lv ")).toBe(" Niv. ");
  expect(t("{0} minimum IV", ["HP"])).toBe("IV minimum de HP");
  expect(t("Unknown {0}", [100])).toBe("Unknown 100");
  setLocale(previous);
});

test("every ranked partner description retains the exact rank slots", () => {
  const translations = game as Record<string, string>;
  let count = 0;
  for (const species of Object.values(pack.species)) {
    const template = species.partner_skill?.template;
    if (!template) continue;
    const key = template.replace(/\s+/g, " ").trim();
    const translated = translations[key];
    expect(typeof translated).toBe("string");
    expect((translated?.match(/\{\d+\}/g) ?? []).sort()).toEqual((template.match(/\{\d+\}/g) ?? []).sort());
    count++;
  }
  expect(count > 200).toBe(true);
});
