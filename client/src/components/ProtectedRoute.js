import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ element }) => {
  // if there is a user, then the user is logged in
  // this app does not hve differnt levers of authorization
  // either:
  //    the user is logged in, user.data !== null, authorized
  //    the user is not logged in, user.data === null, NOT authrized
  const user = useSelector(state => state.user);
  const isLoggedIn = user.data;

  return isLoggedIn ? element : <Navigate to='/login' />
}

export default ProtectedRoute;