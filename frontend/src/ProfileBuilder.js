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
    const [step, setStep] = useState('name');
    const [isLoading, setIsLoading] = useState(true);
   
    useEffect(() => {
        getProfile();
    }, []);

    const changeStep = () => {
        setStep('dob')
    }

    const getProfile = async() => {
        try {
            const res= await axios.get("/api/profile", { headers: {
                'Authorization': `Bearer ${JWT}`,
                'Accept' : 'application/json',
                'Content-Type': 'application/json'
            }})
                console.log("response ", res.data.profile);
                setProfile(res.data.profile);
        } catch(e) {
            console.log(e)
        }
        setIsLoading(false);
    }
   
    return (

        <>
        {
            isLoading ? "Loading ..." :  <div>
            
            {
                step === 'name' ?   <AddName name={profile.name} changeStep={changeStep}/> : null
            }
          
            {
                step === 'dob' ?   <AddDob /> : null
            }
          
        </div>
        }
        </>
       
    )
}

export default ProfileBuilder;