import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode"
import { API_URL } from "../env";

export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const loginUser = async (user, dispatch) => {
    try {
        const response = await fetch(`${API_URL}users/login`, {
            method: "POST",
            body: JSON.stringify(user),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });
        const data = await response.json();
        
        if (response.ok && data.success && typeof data.token === "string") {
            const token = data.token;
            localStorage.setItem("jwt", token); // Ensure token is stored as a string
            const decoded = jwtDecode(token); // Decode the JWT token
            dispatch(setCurrentUser(decoded, user)); // Dispatch the decoded user data to store
            return { success: true, role: decoded.role }; // Pass role back to caller
            
          }
           else {
            return { success: false, message: data.message };
        }
    } catch (error) {
        console.error("Login error:", error);
        return { success: false, message: "NETWORK_ERROR" };
    }
};



export const setCurrentUser = (decoded, user) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
        userProfile: user
    };
};


export const getUserProfile = (id) => {
    fetch(`${baseURL}users/${id}`, {
        method: "GET",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    })
    .then((res) => res.json())
    .then((data) => console.log(data));
}

export const logoutUser = (dispatch) => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("lastVisitedPath");
    dispatch(setCurrentUser({}));
    dispatch(resetFormFields()); 
}

export const RESET_FORM_FIELDS = "RESET_FORM_FIELDS";

export const resetFormFields = () => {
    return {
        type: RESET_FORM_FIELDS
    }
}
