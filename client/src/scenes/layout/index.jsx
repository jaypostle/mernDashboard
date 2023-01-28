import React, { useEffect, useState } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import NavBar from "components/NavBar";
import Sidebar from "components/Sidebar";
import { useGetUserQuery } from "state/api";
import axios from "axios";

function Layout() {
  const isNonMobile = useMediaQuery("(min-width: 600px"); // gives us a boolean, if min width is achieved
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const userId = useSelector((state) => state.global.userId); // this gets info from redux toolkit (not query)
  const { data } = useGetUserQuery(userId);

  console.log(userId);
  console.log(process.env.REACT_APP_BASE_URL);

  console.log(data);

  // useEffect(() => {
  //   console.log(data);
  //   // fetchData(userId);
  // }, []);

  // This is used to test react query route
  const fetchData = async (userId) => {
    try {
      const { data } = await axios.get(
        `http://localhost:5001/general/user/${userId}`
      );

      console.log(data);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Box display={isNonMobile ? "flex" : "block"} width="100%" height="100%">
      <Sidebar
        user={data || {}} // this creates the component when data is initially undefined
        isNonMobile={isNonMobile}
        drawerWidth="250px"
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />

      <Box flexGrow={1}>
        <NavBar
          user={data || {}}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Outlet />
      </Box>
    </Box>
  );
}

export default Layout;
