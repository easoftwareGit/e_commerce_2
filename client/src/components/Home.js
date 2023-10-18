import React from "react";
import { homeId } from "./Header/MenuItems";

const Home = (props) => {

  const { setActiveMenuItem } = props;  

  setActiveMenuItem(homeId);

  return (
    <div>
      <p className="h2 m-2">Home</p>
      <p className="h5 m-2">Welcome to our website!</p>
    </div>
  );
};

export default Home;