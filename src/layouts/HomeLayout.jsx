import React from "react";
import { Navbar, Footer } from "@components";
import { Outlet, useLocation } from "react-router-dom";


const HomeLayout = () => {

  return (
    <main>
      <span className="z-[1000] top-0 bg-light-default text-dark-default dark:bg-dark-default dark:text-light-default">
      <Navbar />
      </span>
      <div>
        <Outlet />
      </div>
   
      <span>
        <Footer />
      </span>
    </main>
  );
};

export default HomeLayout;

