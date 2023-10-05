import React from "react";
import { homeId } from "./Header/MenuItems";

const Home = (props) => {

  const { setActiveMenuItem } = props;  

  setActiveMenuItem(homeId);

  return (
    <div>
      <h2>Home</h2>
      <p>Welcome to our website!</p>
    </div>
  );
};

export default Home;