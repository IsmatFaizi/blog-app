import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";
import { Auth } from "aws-amplify";
import { useState, useEffect } from "react";

const Profile = () =>{
    const [user, setUser] = useState();  
    
    useEffect(()=>{
        checkUser();
    },[]);
    const checkUser = async ()=>{
        const user = await Auth.currentAuthenticatedUser();
        setUser(user);
        console.log(user);
    }
    if (!user) {
        console.log('error');
        return null
    }     
  
    return (
    <div>
            <h1 className="text-3xl font-semibold
            tracking-wide met-6">Profile</h1>
            <h1 className="font-medium text-gray-500 my-2"
            >Username: {user.username}</h1>
            <p className="text-sm text-gray-500 mb-6"
            >E-mail: {user.attributes.email}</p>
            <AmplifySignOut />
    </div>
    )
}

export default withAuthenticator(Profile)