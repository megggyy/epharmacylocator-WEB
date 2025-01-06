
import React from "react";
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from "react-router-dom";
import { RootLayout, NotFound, Welcome, HomeLayoutBlock } from "@/layouts";
import { useMediaQuery } from "react-responsive";
import { MobileChecker } from "@components";
// import RootLayout from "./layouts/RootLayout"
// import HomeLayout from "./layouts/HomeLayout"
// import Welcome from "./layouts/Welcome"
// import NotFound from "./layouts/NotFound"

const MOBILE_BREAKPOINT = 767;
const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="/" element={<RootLayout />}>
      <Route element={<HomeLayoutBlock />}>
        <Route index element={<Welcome />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Route>
  )
);

export default function App() {
  const isMobile = useMediaQuery({ maxWidth: MOBILE_BREAKPOINT });
  return (
    <>
      {isMobile ? (
        <MobileChecker />
      ) : (
        <RouterProvider router={router} />
      )}
    </>
  );
}
