import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loginId } from './MenuItems';
import { Modal } from 'bootstrap';
import ModalMsg from './ModalMsg';

const LogOut = props => {

  const { baseApi, setActiveMenuItem, showNotRegisteredMenu } = props;

  const navigate = useNavigate();
  
  const [modalInfo, setModalInfo] = useState({
    title: "title",
    message: "message"
  })

  const showModal = (title, message) => {    
    setModalInfo({
      title: title,
      message: message
    })
    var myModal = new Modal(document.getElementById('modalPopup'))
    myModal.show();
  }

  const logoutUser = async () => {
    const loggedOutEnd = "/login"

    // const response = await fetch(`${baseApi}/auth/logout`)

    try {
      const response = await axios({
        method: 'get',
        withCredentials: true,
        url: `${baseApi}/auth/logout`,
      });
      if (response.status === 205) {        
        navigate(loggedOutEnd);          
        showNotRegisteredMenu();
        setActiveMenuItem(loginId);
      } else {
        console.log('Logout - Non error return, but not status 205');
        showModal("Internal Error", "Something went wrong");          
      }
    } catch (err) {
      if (err.message) {
        console.log(err.message)
      } else if (err.response.data.message) {
        console.log(err.response.data.message)
      } else {
        console.log('Logout - unknown error')
      }
      showModal("Internal Error", "Something went wrong");  
    }

    // const response = await fetch(`${baseApi}/auth/logout`, {
    //   method: "GET",
    //   headers: {
    //     'Accept': 'application/json',
    //     'Content-Type': 'application/json',
    //   },
    //   credentials: 'include'
    // });

    // try {
    //   if (response.url.endsWith(loggedOutEnd)) {
    //     navigate(loggedOutEnd);
    //     showNotRegisteredMenu();
    //     setActiveMenuItem(loginId);
    //   } else {
    //     showModal("Server error", "Cound not logout");
    //     console.error('Logout request failed with status:', response.status);
    //   }
    // } catch (err) {
    //   console.error(err.message);
    // }
    
  }

  useEffect(() => {
    logoutUser()
  }, []);

  return (
    <div>
      {/* modal popup message */}
      <ModalMsg
        modalId="modalPopup"
        title={modalInfo.title}
        message={modalInfo.message}
      />

      {null}
    </div>
  );
};

export default LogOut;