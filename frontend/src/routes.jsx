import { Home, SignIn, SignUp, Register} from "@/pages";
import FinanceResources from "./pages/FinanceResources";
import Verify2FA from "./pages/verify-2fa";

export const routes = [
  {
    name: "home",
    path: "/home",
    element: <Home />,
  },
  {
    name: "Sign In",
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    name: "Register now",
    path: "/register",
    element: <Register />,
  },{
    name: "Sign Up",
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    name: "Resources",
    path: "/FinanceResources",
    element: <FinanceResources />,
  },
  {
    name: "Verify 2FA",
    path: "/verify-2fa",
    element: <Verify2FA />,
  },
];

export default routes;
