import { type AppType } from "next/app";
// import "flowbite";
import { api } from "~/utils/api";

import "~/styles/globals.css";

import Script from "next/script";
import { Component } from "react";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps}></Component>
    </>
  );
};

export default api.withTRPC(MyApp);
