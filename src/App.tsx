import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AddItemPage } from "./routes/AddItemPage";
import { FridgePage } from "./routes/FridgePage";
import { HomePage } from "./routes/HomePage";
import { RecipesPage } from "./routes/RecipesPage";
import { SettingsPage } from "./routes/SettingsPage";
import { StatsPage } from "./routes/StatsPage";

export function App(): JSX.Element {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/add" element={<AddItemPage />} />
        <Route path="/fridge" element={<FridgePage />} />
        <Route path="/recipes" element={<RecipesPage />} />
        <Route path="/squad" element={<Navigate to="/recipes" replace />} />
        <Route path="/stats" element={<StatsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
