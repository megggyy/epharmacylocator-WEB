import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthGlobal from "../../context/AuthGlobal";
import { loginUser } from "../../context/AuthActions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../env";
import epharmacylogoblue from "@assets/epharmacylogoblue.png";
import loginbanner from "@assets/loginbanner.png";

const LoginScreen = () => {
  const { state, dispatch } = useContext(AuthGlobal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    let errorMessages = {};
    if (!email) errorMessages.email = "EMAIL IS REQUIRED";
    if (!password) errorMessages.password = "PASSWORD IS REQUIRED";
    return errorMessages;
  };

  const handleSubmit = async () => {
    const user = { email: email.trim(), password: password.trim() };
    const validationErrors = validate();
    setErrors(validationErrors);

    if (email === "" || password === "") {
      return;
    }

    try {
      const response = await loginUser(user, dispatch);

      if (response.message === "USER_NOT_VERIFIED") {
        const res = await axios.post(`${API_URL}/users/reVerifyOTP`, { email });
        navigate(`/verify-otp?userId=${res.data.userId}`);
      }

      if (response.success) {
        const role = response.role;
        switch (role) {
          case "Customer":       
            setTimeout(() => {
                navigate("/");
            }, 1500); // Adjust as needed
            break;
          case "PharmacyOwner":
            const token = localStorage.getItem("jwt");
            const decoded = jwtDecode(token);
            const userId = decoded?.userId;

            const { data } = await axios.get(`${API_URL}users/${userId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });

            if (data.pharmacyDetails?.approved) {
                setTimeout(() => {
                    navigate("/dashboard/pharmacyowner");
                }, 1500); 
            } else {
              localStorage.removeItem("jwt");
              dispatch({ type: "LOGOUT_USER" });
              toast.error("Pharmacy not approved. Redirecting to approval status.");
              setTimeout(() => {
                navigate("/pharmacy-status");
              }, 1500);
            }
            break;
          case "Admin":
            setTimeout(() => {
                navigate("/dashboard/admin");
            }, 1500); 
            break;
          default:
            navigate("/");
        }
        toast.success("Login successful");
      } else {
        switch (response.message) {
          case "EMAIL_NOT_FOUND":
            toast.error("Email not found. Please check your email and try again.");
            break;
          case "USER_NOT_VERIFIED":
            toast.error("You are not verified. Redirecting to verification page.");
            break;
          case "NETWORK_ERROR":
            toast.error("Unable to connect to the server. Please try again later.");
            break;
          case "INCORRECT_PASSWORD":
            toast.error("Incorrect password");
            break;
          default:
            toast.error("Login failed. Please try again later.");
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center min-h-screen bg-primary-t4">
    <ToastContainer />
     <div className="flex justify-center flex-1 max-w-screen-xl m-0 bg-white shadow-xl sm:m-10 sm:rounded-lg">
     {/* Form Section */}
        <div className="p-6 lg:w-1/4 xl:w-5/12 sm:p-12">
          <div className="flex flex-col items-center mb-8">
            <img
              src={epharmacylogoblue}
              alt="ePharmacy Logo"
              className="w-24 h-24 mb-4"
            />
            <h1 className="text-2xl font-bold text-gray-800">ePharmacy</h1>
          </div>
          <h2 className="text-xl font-semibold text-center text-gray-700">
            Welcome back!
          </h2>
          <p className="text-sm text-center text-gray-500 mb-6">
            Log in to your account
          </p>
          <div className="mb-4">
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email}</p>
            )}
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                id="showPassword"
                onChange={() => setShowPassword(!showPassword)}
                className="mt-1"
              />
              <label
                htmlFor="showPassword"
                className="ml-2 text-sm text-gray-700 cursor-pointer"
              >
                Show Password
              </label>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password}</p>
            )}
            <button
              onClick={handleSubmit}
              className="w-full px-4 py-3 mt-4 font-semibold text-white transition-all duration-300 bg-primary-variant rounded-lg hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
            >
              Log In
            </button>
          </div>
          <div className="flex justify-center items-center mt-4">
            <span className="text-gray-600 text-sm">Don't have an account?</span>
            <button
                onClick={() => navigate("/SignUpRole")}
                className="text-primary-default text-sm ml-1 hover:underline"
            >
                Sign Up
            </button>
            </div>
        </div>
        {/* Image Section */}
        <div className="flex-1 hidden text-center bg-gray-100 lg:flex">
          <div className="flex items-center justify-center">
            <img
              src={loginbanner}
              alt="Login Illustration"
              className="object-cover h-full w-ful24 rounded-md"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
