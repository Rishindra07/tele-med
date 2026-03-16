import {Navigate} from "react-router-dom";

const RoleRoute = ({role,children}) =>{
    const userRole = localStorage.getItem("role");

    if(userRole !== role){
        return <Navigate to="/login"/>;
    }

    return children;

};

export default RoleRoute;