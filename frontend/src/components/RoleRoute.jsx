import {Navigate} from "react-router-dom";

const RoleRoute = ({role,children}) =>{
    const userRole = localStorage.getItem("role");
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (["doctor", "pharmacist"].includes(role) && user && user.is_approved === false) {
        return <Navigate to="/pending-approval"/>;
    }

    if(userRole !== role){
        return <Navigate to="/login"/>;
    }

    return children;

};

export default RoleRoute;
