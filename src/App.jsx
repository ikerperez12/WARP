import { Suspense } from "react";
import { I18nProvider } from "./i18n/I18nProvider.jsx";
import { ThemeProvider } from "./theme/ThemeProvider.jsx";
import { LenisProvider } from "./lib/LenisProvider.jsx";
import Shell from "./Shell.jsx";
import LoaderOverlay from "./components/LoaderOverlay.jsx";
import Preloader from "./components/Preloader.jsx";

export default function App() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <LenisProvider>
          <Preloader>
            <Suspense fallback={<LoaderOverlay />}>
              <Shell />
            </Suspense>
          </Preloader>
        </LenisProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
