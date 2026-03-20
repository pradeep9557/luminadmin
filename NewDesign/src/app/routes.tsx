import { createBrowserRouter } from "react-router";
import { RootLayout } from "./layouts/RootLayout";
import { Dashboard } from "./pages/Dashboard";
import { Users } from "./pages/Users";
import { Orders } from "./pages/Orders";
import { Services } from "./pages/Services";
import { Analytics } from "./pages/Analytics";
import { SubscriptionPlans } from "./pages/SubscriptionPlans";
import { Products } from "./pages/Products";
import { Settings } from "./pages/Settings";
import { Notifications } from "./pages/Notifications";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "users", Component: Users },
      { path: "orders", Component: Orders },
      { path: "services", Component: Services },
      { path: "subscriptions", Component: SubscriptionPlans },
      { path: "products", Component: Products },
      { path: "analytics", Component: Analytics },
      { path: "settings", Component: Settings },
      { path: "notifications", Component: Notifications },
      { path: "*", Component: NotFound },
    ],
  },
]);