import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@material-ui/core';
import Lottie from 'react-lottie';
import animation from '../lotties/Animation.json';


const Loader = (props) => {

  const navigate = useNavigate();
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animation,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };

  const containerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (sessionStorage.getItem('token') === "" || sessionStorage.getItem('token') == null || sessionStorage.getItem('token') === undefined) {

        navigate('/signin');
      } else {
        navigate('/app/dashboard');
      }
    }, 3200);
    return () => clearTimeout(timer);

  },);

  return (
    <div style={containerStyle}>
      <Lottie
        options={defaultOptions}
        height={350}
        width={500}
      />
    </div>
  );
}
export default Loader;