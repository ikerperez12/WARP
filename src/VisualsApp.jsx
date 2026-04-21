import { Suspense } from "react";
import { I18nProvider } from "./i18n/I18nProvider.jsx";
import { ThemeProvider } from "./theme/ThemeProvider.jsx";
import { LenisProvider } from "./lib/LenisProvider.jsx";
import LoaderOverlay from "./components/LoaderOverlay.jsx";
import VisualsPage from "./VisualsPage.jsx";

export default function VisualsApp() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <LenisProvider>
          <Suspense fallback={<LoaderOverlay />}>
            <VisualsPage />
          </Suspense>
        </LenisProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
