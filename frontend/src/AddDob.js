import { useEffect, useState } from "react";

import axios from 'axios';

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJuYXRhc29ibEBtYWlsLnJ1IiwiaWF0IjoxNjc2NTg4MDU0fQ.8XZV2VzgApb2a8DLnlji38rzdGDY9tQOmKQaCmEhF4c'

const AddDob = () => {

    const [dob, setDob] = useState();
    const [day, setDay] = useState();
    const [month, setMonth] = useState();
    const [year, setYear] = useState();
    

    const handleClick = () => {
        axios.post('/api/profile/dob', {day, month, year}, { headers: {
            'Authorization': `Bearer ${JWT}`,
            'Accept' : 'application/json',
            'Content-Type': 'application/json'
        }}).then(res => console.log("dob added ", res))
        .catch(err => console.log(err))

        
    }
    return (
        <div>
        {dob}
            <label>Day: </label>
            <input 
                type={'text'} 
                value={day} 
                onChange={(e) => setDay(e.target.value)}
            />
            <label>Month: </label>
            <input 
                type={'text'} 
                value={month} 
                onChange={(e) => setMonth(e.target.value)}
            />
            <label>Year: </label>
            <input 
                type={'text'} 
                value={year} 
                onChange={(e) => setYear(e.target.value)}
            />
            <button onClick={handleClick}>Next</button>
        </div>
    )
}

export default AddDob;