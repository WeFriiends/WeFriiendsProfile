import {
    useEffect,
    useState
} from 'react';

import AddDob from './AddDob';
import AddName from './AddName';
import axios from 'axios';

const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJuYXRhc29ibEBtYWlsLnJ1IiwiaWF0IjoxNjc2NTg4MDU0fQ.8XZV2VzgApb2a8DLnlji38rzdGDY9tQOmKQaCmEhF4c'

const ProfileBuilder = () => {
    const [profile, setProfile] = useState(null);
    const [jwt, setJwt] = useState(null);
    const [dob, setDob] = useState();
   
    useEffect(() => {
        getProfile();
    }, []);

    const getProfile = async() => {
        axios.get("/api/profile", { headers: {
            'Authorization': `Bearer ${JWT}`,
            'Accept' : 'application/json',
            'Content-Type': 'application/json'
        }}).then(res => {
            console.log("response ", res.data.profile);
            setProfile(res.data.profile)
        }).catch(err => console.log(err))
    }
   
    return (
        <div>
            <AddName/>
            <AddDob />
        </div>
    )
}

export default ProfileBuilder;