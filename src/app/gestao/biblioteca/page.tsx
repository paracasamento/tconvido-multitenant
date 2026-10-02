import { ThemeLibraryManager } from "@/components/gestao/ThemeLibraryManager";
import { getThemeLibrary } from "@/lib/theme-library-server";
import { requirePlatformAdmin } from "@/lib/sessions";

export default async function GestaoBibliotecaPage() {
  await requirePlatformAdmin("/gestao/biblioteca");
  const kits = await getThemeLibrary({ includeInactive: true });
  return <ThemeLibraryManager kits={kits} />;
}
