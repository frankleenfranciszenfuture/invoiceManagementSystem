import React from "react";
import { Route } from "react-router-dom";

import SettingsDashboard from "./SettingsDashboard";
import SettingsLayout from "./SettingsLayout";
import { settingsItems } from "../settings/settingsData";

/* =========================================================
   Use inside your <Routes> in App.jsx:

   <Routes>
       {/* ...your other routes... *\/}
       {SettingsRoutes()}
   </Routes>

   (Call it as a function, not <SettingsRoutes />, because
   <Routes> only accepts <Route> elements as direct children.)
========================================================= */
export default function SettingsRoutes() {
    return (
        <>
            {/* All Settings grid page (no sidebar) */}
            <Route path="/settings" element={<SettingsDashboard />} />

            {/* Every settings page opens inside the sidebar layout */}
            <Route element={<SettingsLayout />}>
                {settingsItems.map(({ path, component: Page }) => (
                    <Route key={path} path={path} element={<Page />} />
                ))}
            </Route>
        </>
    );
}