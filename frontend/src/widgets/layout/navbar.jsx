import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  Navbar as MTNavbar,
  MobileNav,
  Typography,
  IconButton,
} from "@material-tailwind/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";

export function Navbar({ brandName, routes, action }) {
  const [openNav, setOpenNav] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => window.innerWidth >= 960 && setOpenNav(false);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const navList = (
    <ul className="mb-4 mt-2 flex flex-col gap-2 lg:mb-0 lg:mt-0 lg:flex-row lg:items-center lg:gap-6">
      {routes.map(({ name, path, icon, href, target }) => (
        <Typography
          key={path} // Utiliser path comme clé pour plus d'unicité
          as="li"
          variant="small"
          className="capitalize list-none"
        >
          {href ? (
            <a
              href={href}
              target={target}
              className="flex items-center gap-1 p-1 font-bold hover:opacity-80"
              rel="noreferrer"
            >
              {icon && React.createElement(icon, { className: "w-4 h-4 mr-1" })}
              {name}
            </a>
          ) : (
            <Link
              to={path}
              target={target}
              className="flex items-center gap-1 p-1 font-bold hover:opacity-80"
            >
              {icon && React.createElement(icon, { className: "w-4 h-4 mr-1" })}
              {name}
            </Link>
          )}
        </Typography>
      ))}
    </ul>
  );

  return (
    <MTNavbar color="" className="p-3  bg-purple-800" >
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="hover:opacity-80">
          <Typography variant="h5" className="cursor-pointer font-bold">
            {brandName}
          </Typography>
        </Link>
        <div className="flex items-center gap-8">
        <div className="hidden lg:block ">{navList}</div>
        
        <div className="hidden lg:flex items-center gap-4">
          {React.cloneElement(action, {
            className: "text-sm font-medium  text-white hover:opacity-80",
          })}
        </div>

        <IconButton
          variant="text"
          size="sm"
          className="ml-auto lg:hidden text-white hover:bg-transparent"
          onClick={() => setOpenNav(!openNav)}
        >
          {openNav ? (
            <XMarkIcon className="h-6 w-6" />
          ) : (
            <Bars3Icon className="h-6 w-6" />
          )}
        </IconButton>
      </div>
      </div>

      <MobileNav open={openNav} className="bg-white shadow-lg">
        <div className="container mx-auto py-4">
          {navList}
          <div className="mt-4">
            {React.cloneElement(action, {
              className: "w-full text-center",
            })}
          </div>
        </div>
      </MobileNav>
    </MTNavbar>
  );
}

Navbar.defaultProps = {
  brandName: "Finova",
  action: (
    <a
      href=""
      target="_blank"
    >
    </a>
  ),
};

Navbar.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  action: PropTypes.node,
};

Navbar.displayName = "/src/widgets/layout/navbar.jsx";

export default Navbar;
