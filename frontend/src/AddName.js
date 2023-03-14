import axios from 'axios';
import { useState } from "react";

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJuYXRhc29ibEBtYWlsLnJ1IiwiaWF0IjoxNjc2NTg4MDU0fQ.8XZV2VzgApb2a8DLnlji38rzdGDY9tQOmKQaCmEhF4c'

const AddName = (props) => {
console.log("addname render")
    const [name, setName] = useState();

    const handleClick = () => {
        axios.post('/api/profile/name', {name}, { headers: {
            'Authorization': `Bearer ${JWT}`,
            'Accept' : 'application/json',
            'Content-Type': 'application/json'
        }}).then(res => {
            console.log("res ", res)
            setName(res.name);
        })
        .catch(err => console.log(err))

        
    }
    return (
        <div>
            <label>Name: </label>
            <input 
                type={'text'} 
                value={name} 
                onChange={(e) => setName(e.target.value)}
            />
            <button onClick={handleClick}>Next</button>
        </div>
    )
}

export default AddName;