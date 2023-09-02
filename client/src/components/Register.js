import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { homeId } from './MenuItems';
import { Modal } from 'bootstrap';
import ModalMsg from './ModalMsg';

const string = require("string-sanitizer");
const { phone } = require('phone');

const Register = props => {

  const { baseApi, setActiveMenuItem, showRegisteredMenu} = props;
  
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm: ''
  });

  const [formErrors, setFormErrors] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfiorm] = useState(false);
  const [modalInfo, setModalInfo] = useState({
    title: "title",
    message: "message"
  })
  let sanitized = {}  

  const validateForm = () => {
    let errors = {};
    let isValid = true;

    sanitized = {};

    // first name
    if (!formData.first_name.trim()) {
      errors.first_name = 'First Name is required';
      isValid = false;
    } else {
      errors.first_name = '';
      sanitized.first_name = string.sanitize.keepUnicode(formData.first_name);
    }

    // last name
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last Name is required';
      isValid = false;
    } else {
      errors.last_name = '';
      sanitized.last_name = string.sanitize.keepUnicode(formData.last_name);
    }

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

    // phone
    if (!formData.phone.trim()) { 
      errors.phone = 'Phone is required';
      isValid = false;
    } else {
      const phoneCheck = phone(formData.phone);
      if (!phoneCheck.isValid) {
        errors.phone = 'Phone not valid'
        isValid = false 
      } else {
        errors.phone = '';
        sanitized.phone = phoneCheck.phoneNumber;
      }      
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
    
    // confirm
    if (!formData.confirm.trim()) {
      errors.confirm = 'Confirm password is required';
      isValid = false;
    } else if (!string.validate.isPassword8to15(formData.confirm)) {
      errors.confirm = 'Password not in a valid format: at least 1 lower case, 1 UPPER case, 1 digit, 1 special character';
      isValid = false;
    } else {
      errors.confirm = '';
    }

    // compare password and confirmation
    if (errors.password === '' && errors.confirm === '') {
      if (formData.password !== formData.confirm) {
        errors.confirm = 'Passwords do not match'
        isValid = false;
      } else {
        sanitized.password = formData.password;        
      }
    }

    setFormErrors(errors);
    return isValid;
  }

  const cancelButtonClicked = () => {
    navigate('/');    
    setActiveMenuItem(homeId);
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // {
  //   "first_name": "Mike",
  //   "last_name": "Blue",
  //   "email": "mike@email.com",
  //   "phone": "+8006661212",
  //   "password": "7hxk@ZSOLdY%4AD"
  // } 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try { 
        const response = await fetch(`${baseApi}/auth/register`, {        
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sanitized)
        });

        // successfull register
        if (response.status === 200) {
          // navigate back to home page
          navigate('/');          
          showRegisteredMenu();
          setActiveMenuItem(homeId);
        } else if (response.status === 409) {
          setFormErrors({
            ...formErrors,
            email: "Email has been already used"
          });
          showModal("Invalid Data", "Email has been already used");          
        } else {
          console.error('Register request failed with status:', response.status);
        }        
      } catch (err) {
        console.error(err.message);
      }

    } else {  
      showModal("Invalid Data", "Registration data is invalid. Enter valid data to register.");
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

  const toggleConfirmVisibility = () => {
    setShowConfiorm(!showConfirm);
  }  

  return (
    <div>
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
            <label for="inputFirstName" class="form-label">
              First Name
            </label>
            <input
              type="text"
              class={`form-control ${formErrors.first_name && "is-invalid"}`}
              id="inputFirstName"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
            />
            <div class="invalid-feedback">{formErrors.first_name}</div>
          </div>
        </div>
        <div class="row m-3">
          <div class="col-md-4">
            <label for="inputLastName" class="form-label">
              Last Name
            </label>
            <input
              type="text"
              class={`form-control ${formErrors.last_name && "is-invalid"}`}
              id="inputLastName"
              name="last_name"
              onChange={handleInputChange}
            />
            <div class="invalid-feedback">{formErrors.last_name}</div>
          </div>
        </div>
        <div class="row m-3">
          <div class="col-md-4">
            <label for="inputEmail" class="form-label">
              Email
            </label>
            <input
              type="text"
              class={`form-control ${formErrors.email && "is-invalid"}`}
              id="inputEmail"
              name="email"
              onChange={handleInputChange}
            />
            <div class="invalid-feedback">{formErrors.email}</div>
          </div>
        </div>
        <div class="row m-3">
          <div class="col-md-4">
            <label for="inputPhone" class="form-label">
              Phone
            </label>
            <input
              type="text"
              class={`form-control ${formErrors.phone && "is-invalid"}`}
              id="inputPhone"
              name="phone"
              onChange={handleInputChange}
            />
            <div class="invalid-feedback">{formErrors.phone}</div>
          </div>
        </div>
        <div class="row m-3">
          <div class="col-md-4">
            <label for="inputPassword" class="form-label">
              Password
            </label>
            <div class="input-group">
              <input
                type={showPassword ? "text" : "password"}
                class={`form-control ${formErrors.password && "is-invalid"}`}
                id="inputPassword"
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
        <div class="row m-3">
          <div class="col-md-4">
            <label for="inputConfirm" class="form-label">
              Confirm Password
            </label>
            <div class="input-group">
              <input
                type={showConfirm ? "text" : "password"}
                class={`form-control ${formErrors.confirm && "is-invalid"}`}
                id="inputConfirm"
                name="confirm"
                onChange={handleInputChange}
              />
              <button
                class="btn btn-outline-secondary"
                type="button"
                onClick={toggleConfirmVisibility}
              >
                {showConfirm ? "Hide" : "Show"}
              </button>
              <div class="invalid-feedback">{formErrors.confirm}</div>
            </div>
          </div>
        </div>
        <div class="btn-toolbar mt-4 ms-4">
          <button type="submit" id="btnSubmit" class="btn btn-primary me-3">
            Register
          </button>
          <button
            type="button"
            id="btnCancel"
            class="btn btn-danger"
            onClick={cancelButtonClicked}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default Register;