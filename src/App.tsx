import { Route, Routes } from "react-router-dom";
import { Masthead } from "./components/Masthead";
import { Footer } from "./components/Footer";
import { Home } from "./routes/Home";
import { SeasonIndex } from "./routes/SeasonIndex";
import { Episode } from "./routes/Episode";
import { DocsIndex } from "./routes/DocsIndex";
import { Doc } from "./routes/Doc";
import { NotFound } from "./routes/NotFound";
import { ReadingProgressProvider } from "./state/ReadingProgress";

export default function App() {
  return (
    <ReadingProgressProvider>
      <Masthead />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Static routes go before dynamic so the matcher prefers them */}
        <Route path="/docs" element={<DocsIndex />} />
        <Route path="/docs/:slug" element={<Doc />} />
        {/* Season-id is constrained to "season-N" to avoid swallowing other top-level paths */}
        <Route path="/:season" element={<SeasonIndex />} />
        <Route path="/:season/:slug" element={<Episode />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Footer />
    </ReadingProgressProvider>
  );
}
