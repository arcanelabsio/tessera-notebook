import { Route, Routes } from "react-router-dom";
import { Masthead } from "./components/Masthead";
import { Footer } from "./components/Footer";
import { SearchOverlay } from "./components/SearchOverlay";
import { ShortcutsDialog } from "./components/ShortcutsDialog";
import { Archive } from "./routes/Archive";
import { Concepts } from "./routes/Concepts";
import { Home } from "./routes/Home";
import { SeasonIndex } from "./routes/SeasonIndex";
import { Episode } from "./routes/Episode";
import { NotFound } from "./routes/NotFound";
import { Saved } from "./routes/Saved";
import { ReadingProgressProvider } from "./state/ReadingProgress";

export default function App() {
  return (
    <ReadingProgressProvider>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <Masthead />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/archive" element={<Archive />} />
        <Route path="/concepts" element={<Concepts />} />
        <Route path="/saved" element={<Saved />} />
        {/* Season-id is constrained to "season-N" to avoid swallowing other top-level paths */}
        <Route path="/:season" element={<SeasonIndex />} />
        <Route path="/:season/:slug" element={<Episode />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
      <SearchOverlay />
      <ShortcutsDialog />
    </ReadingProgressProvider>
  );
}
