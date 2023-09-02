import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { homeId } from './MenuItems';
import { Modal } from 'bootstrap';
import ModalMsg from './ModalMsg';

const string = require("string-sanitizer");

const LogIn = props => {

  const { baseApi, setActiveMenuItem, showRegisteredMenu } = props;

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: "title",
    message: "message"
  })
  let sanitized = {}  

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    sanitized = {};

    // email
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!string.validate.isEmail(formData.email)) {
      errors.email = 'Email is not valid';
      isValid = false;
    } else {
      errors.email = '';
      sanitized.email = formData.email;
    }

    // password
    if (!formData.password.trim()) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (!string.validate.isPassword8to15(formData.password)) {
      errors.password = 'Password not in a valid format: at least 1 lower case, 1 UPPER case, 1 digit, 1 special character';
      isValid = false;
    } else {
      errors.password = '';        
    }

    setFormErrors(errors);
    return isValid;
  }

  const googleButtonClicked = () => {
    // showModal("Information", "Google login button clicked");
    navigate('http://localhost:5000/api/auth/google');
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

// {
//   "email": "mike@email.com",
//   "password": "7hxk@ZSOLdY%4AD"
// } 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try { 
        const loginBody = {
          email: sanitized.email,
          password: formData.password
        }
        const response = await fetch(`${baseApi}/auth/login`, {        
          method: "POST",
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },           
          body: JSON.stringify(loginBody)          
        });

        // successfull login
        const loggedInRedirectEnd = "/products"
        const failRedirectEnd = "/login"
        if (response.url.endsWith(loggedInRedirectEnd)) {
          // navigate back to home page
          navigate(loggedInRedirectEnd);          
          showRegisteredMenu();
          setActiveMenuItem(homeId);
        } else if (response.url.endsWith(failRedirectEnd)) {
          showModal("Invalid Data", "Incorrect email or password");
        } else {
          console.error('Login request failed with status:', response.status);
        }        
      } catch (err) {
        console.error(err.message);
      }
    } else {  
      showModal("Invalid Data", "Login data is invalid. Enter valid data to login.");
    }
  }  

  const showModal = (title, message) => {
    
    setModalInfo({
      title: title,
      message: message
    })
    var myModal = new Modal(document.getElementById('modalPopup'))
    myModal.show();
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  }

  return (
    <div>
      <h2>Log In</h2>
      <p>Log in to the web site</p>

      {/* modal popup message */}
      <ModalMsg
        modalId="modalPopup"
        title={modalInfo.title}
        message={modalInfo.message}
      />

      {/* form */}
      <form onSubmit={handleSubmit}>
        <div class="row m-3">
          <div class="col-md-4">
            <label for="loginEmail" class="form-label">
              Email
            </label>
            <input
              type="text"
              class={`form-control ${formErrors.email && "is-invalid"}`}
              id="loginEmail"
              name="email"
              onChange={handleInputChange}
            />
            <div class="invalid-feedback">{formErrors.email}</div>
          </div>
        </div>
        <div class="row m-3">
          <div class="col-md-4">
            <label for="loginPassword" class="form-label">
              Password
            </label>
            <div class="input-group">
              <input
                type={showPassword ? "text" : "password"}
                class={`form-control ${formErrors.password && "is-invalid"}`}
                id="loginPassword"
                name="password"
                onChange={handleInputChange}
              />
              <button
                class="btn btn-outline-secondary"
                type="button"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
              <div class="invalid-feedback">{formErrors.password}</div>
            </div>
          </div>
        </div>
        <div class="btn-toolbar mt-4 ms-4">
          <button type="submit" id="btnSubmit" class="btn btn-primary me-3">
            Log In
          </button>
          <button
            type="button"
            id="btnGoogle"
            class="btn btn-secondary"
            onClick={googleButtonClicked}
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-google"
            viewBox="0 0 16 16"
          >
            <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
          </svg>{" "}
            Log in with Google
          </button>
        </div>
      </form>
    </div>
  );
};

// html for svg google icon
 

export default LogIn;