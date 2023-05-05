import React, { useState } from 'react';
import './NotFound.css';
import { useNavigate } from 'react-router-dom';

export function NotFound() {
    const [sec, setSeconds] = useState(5);
    console.log(sec);
    const navigate = useNavigate();
    var countdown = setTimeout(() => {
        setSeconds(sec - 1);

        if (sec === 0) {
            clearTimeout(countdown)
            navigate("/home");
        }
    }, 1000)


    return (
        <div>
            <div id='countdown_text' >Not found. Redirect to home in {sec}...</div>
        </div>
    );

}