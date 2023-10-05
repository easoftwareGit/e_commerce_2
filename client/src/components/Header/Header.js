import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import MenuItems, { loginId, registerId, logoutId } from "../Header/MenuItems";

const store = require('../../store/store');

const Header2 = forwardRef((props, ref) => {

  const [navItems, setNavItems] = useState(MenuItems);

  const selectorData = useSelector((state) => state.user.data)
  const [user, setUser] = useState({selectorData});

  // The component instance will be extended
  // with whatever you return from the callback passed
  // as the second argument
  useImperativeHandle(ref, () => {   
    return {
      setMenuItemActive(menuItemId) {
        setActive(menuItemId)
      },
      showRegisteredMenu() {
        showRegistered()
      },
      showNotRegisteredMenu() {
        showNotRegistered()
      }
    }
  }); 

  const showNotRegistered = () => {
    const updatedNavItems = [...navItems];
    for (let i = 0; i < updatedNavItems.length; i++) {
      const item = updatedNavItems[i];
      item.visible = true;
      if (item.id === logoutId) {
        item.visible = false;
      }      
    }
    setNavItems(updatedNavItems);
  }

  const showRegistered = () => {
    const updatedNavItems = [...navItems];
    for (let i = 0; i < updatedNavItems.length; i++) {
      const item = updatedNavItems[i];
      item.visible = true;
      if (item.id === loginId || item.id === registerId) {
        item.visible = false;
      }      
    }
    setNavItems(updatedNavItems);
  }

  const setActive = (navItemId) => {
    const updatedNavItems = [...navItems];
    for (let i = 0; i < updatedNavItems.length; i++) {
      const item = updatedNavItems[i];
      item.active = false;
      if (item.id === navItemId) {
        item.active = true;
      }      
    }
    setNavItems(updatedNavItems);
  }

  useEffect(() => {
    setUser(selectorData)    
    if (user) {
      showNotRegistered()
    } else {
      showRegistered()
    }
  }, [selectorData])

  const handleClick = (navItem) => {
    setActive(navItem.id);
  }

  const linkClassProps = (navItem) => {
    const baseText = 'flex-sm-fill text-sm-center nav-link active'    
    if (navItem.active) {
      return `"${baseText} reverse" aria-current="page"`;
    } else {
      return `"${baseText}"`;
    }    
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/">My Website</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="nav nav-pills flex-column flex-sm-row">
            {/* <li class="nav-item">
              <Link class="flex-sm-fill text-sm-center nav-link active" aria-current="page" to="/">Home</Link>  
            </li>
            <li class="nav-item">
              <Link class="flex-sm-fill text-sm-center nav-link" to="/about">About</Link>
            </li>
            <li class="nav-item">
              <Link class="flex-sm-fill text-sm-center nav-link" to="/contact">Contact</Link>
            </li> */}
            {/* {this.state.navItems.map(navItem => ( */}
            {navItems.filter(navItem => navItem.visible).map(navItem => (
              <li className="nav-item" key={navItem.id}>
                <Link
                  className={linkClassProps(navItem)}
                  to={navItem.href}
                  onClick={() => handleClick(navItem)}
                >
                  {navItem.linkText}
                </Link>
              </li>
            ))}
          </ul>            
        </div>
      </div>
    </nav>
  )
});

export default Header2;