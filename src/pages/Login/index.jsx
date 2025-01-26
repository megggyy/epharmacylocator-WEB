import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthGlobal from "../../context/AuthGlobal";
import { loginUser } from "../../context/AuthActions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from 'react-responsive-modal';
import 'react-responsive-modal/styles.css';
import { jwtDecode } from "jwt-decode";
import { API_URL } from "../../env";
import epharmacylogoblue from "@assets/epharmacylogoblue.png";
import loginbanner2 from "@assets/loginbanner2.png";

const LoginScreen = () => {
  const { state, dispatch } = useContext(AuthGlobal);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const [otp, setOtp] = useState(new Array(4).fill(""));
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  const [ResetOTPModal, setResetOTPModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [emailExists, setEmailExists] = useState(false);


  const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const validate = () => {
    let errorMessages = {};
    if (!email) errorMessages.email = "EMAIL IS REQUIRED";
    if (!password) errorMessages.password = "PASSWORD IS REQUIRED";
    if (!newPassword) errorMessages.newPassword = "PASSWORD IS REQUIRED";
    if (!confirmPassword) errorMessages.confirmPassword = "PASSWORD IS REQUIRED";
    if (newPassword.length < 8)
      errorMessages.newPassword = "PASSWORD MUST BE AT LEAST 8 CHARACTERS";
    if (confirmPassword.length < 8)
      errorMessages.confirmPassword = "PASSWORD MUST BE AT LEAST 8 CHARACTERS";
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
        try {
          const res = await fetch(`${API_URL}users/reVerifyOTP`, {
            method: "POST",
            body: JSON.stringify({ email }),
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          });

          const data = await res.json();

          if (res.ok && data.exists) {
            console.log("OTP sent successfully:", data);
            setUserId(data.userId);
            setIsOtpModalOpen(true);
          } else {
            toast.error("Unable to send OTP. Please check your email and try again.");
          }
        } catch (err) {
          console.error("Error during OTP re-verification:", err);
          toast.error("An unexpected error occurred while sending OTP.");
        }
      }

      if (response.success) {
        // Store authentication data in localStorage
        const authData = {
          authenticated: true,
          user: { role: response.role }, // Include user role
        };
        localStorage.setItem("auth", JSON.stringify(authData));

        const role = response.role;
        switch (role) {
          case "Customer":
            setTimeout(() => {
              navigate("/");
            }, 1500); 
            toast.success("Login successful");
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
                  navigate("/pharmacy-owner");
                }, 1500);
                toast.success("Login successful");
              } else {
                // If the pharmacy is not approved, redirect without showing login success
                localStorage.removeItem("jwt");
                localStorage.removeItem("auth");
                dispatch({ type: "LOGOUT_USER" });
                toast.info("Pharmacy not approved. Redirecting to approval status.");
                setTimeout(() => {
                  navigate("/pharmacy-status");
                }, 1500);
              }
              break;
            case "Admin":
              setTimeout(() => {
                navigate("/admin");
              }, 1500);
              toast.success("Login successful");
              break;
            default:
              navigate("/");
          }
        } else {
        switch (response.message) {
          case "EMAIL_NOT_FOUND":
            toast.error("Email not found. Please check your email and try again.");
            break;
          case "NETWORK_ERROR":
            toast.error("Unable to connect to the server. Please try again later.");
            break;
          case "USER_NOT_VERIFIED":
            toast.info("You are not verified. An OTP has been sent to your email.");
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

  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to the next input field
    if (element.nextSibling) {
      element.nextSibling.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpValue = otp.join(""); // Combine OTP digits into a single string
    if (otpValue.length !== 4) {
      toast.error("Please enter a valid 4-digit OTP.");
      return;
    }

    try {
      // Replace with your OTP verification API call
      const response = await axios.post(`${API_URL}users/verifyOTP`, {
        userId,
        otp: otpValue,
      });
      if (response.status === 200) {
        setIsOtpModalOpen(false);
        toast.success("OTP verified successfully!");
        // setIsResetPasswordModalOpen(true);
      }
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const checkEmailExists = async () => {

    try {

      if (!forgotEmail) {
        toast.error("Email is required.");
        return;
      }

      console.log(forgotEmail)
      const res = await axios.post(`${API_URL}users/checkEmail`, { email: forgotEmail });

      console.log(res.data) 
      if (res.data.exists) {
        if (res.data.otpStatus === 'PENDING') {
          setEmailExists(true);
          setUserId(res.data.userId)
          toast.info("An OTP has been sent to your email.");
          handleResetOtp()
        }
      }
      else {
        toast.error("EMAIL NOT FOUND! PLEASE REGISTER FIRST.");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleResetOtp = async () => {
    const otpValue = otp.join(""); // Combine OTP digits into a single string
    if (otpValue.length !== 4) {
      return;
    }
    try {
      // Replace with your OTP verification API call
      const response = await axios.post(`${API_URL}users/resetOTP`, {
        userId,
        otp: otpValue,
      });
      if (response.status === 200) {
        toast.success("OTP verified successfully! Redirecting to reset password.");
        setResetOTPModal(false)
        setIsResetPasswordModalOpen(true);
      }
    } catch (error) {
      toast.error("Invalid OTP. Please try again.");
    }
  };

  const handleResetPassword = async () => {

    if (newPassword !== confirmPassword) {
      toast.error("PASSWORDS DO NOT MATCH");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}users/resetPassword`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword, confirmPassword }),
    });

      if (response.status === 200) {
        setIsResetPasswordModalOpen(false)
        toast.success("PASSWORD UPDATED. PLEASE LOG IN AGAIN.");
        localStorage.removeItem("jwt");
        navigate('/login');
      } else {
        setErrors({ general: response.data.message || "An error occurred." });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("AN ERROR OCCURRED. PLEASE TRY AGAIN.");
    } finally {
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
          <div className="flex justify-center items-center mt-4">
            <button
              onClick={() => setResetOTPModal(true)}
              className="text-primary-default text-sm ml-1 hover:underline"
            >
              Forgot Password
            </button>
          </div>
        </div>

        {/* OTP Modal */}
        <Modal open={isOtpModalOpen} onClose={() => setIsOtpModalOpen(false)} center>
          <h2 className="text-xl font-bold text-center">OTP Verification</h2>
          <p className="text-center text-gray-600">Enter the 4-digit OTP sent to your email or phone.</p>
          <div className="flex justify-center gap-2 my-4">
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                onChange={(e) => handleOtpChange(e.target, index)}
                onFocus={(e) => e.target.select()}
                className="w-10 h-12 text-center border border-gray-300 rounded-md"
              />
            ))}
          </div>
          <button
            onClick={handleVerifyOtp}
            className="w-full bg-primary-variant text-white p-3 rounded-md mt-4"
          >
            Verify OTP
          </button>
        </Modal>

        {/* Forgot Password Modal */}
        <Modal open={ResetOTPModal} onClose={() => setResetOTPModal(false)} center>
          <h2 className="text-xl font-bold text-center">Verify Email</h2>
          <p className="text-center text-gray-600">
            Enter your email address to check if it exists. If it does, we will send you an OTP.
          </p>
          <div className="mt-4">
            <input
              type="email"
              placeholder="Email Address"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={checkEmailExists}
              className="w-full bg-primary-variant text-white p-3 rounded-md mt-4"
            >
              Check Email
            </button>
          </div>

          {emailExists && (
            <>
              <h3 className="text-lg font-semibold text-center mt-4">OTP Verification</h3>
              <p className="text-center text-gray-600">Enter the 4-digit OTP sent to your email.</p>
              <div className="flex justify-center gap-2 my-4">
                {otp.map((data, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={data}
                    onChange={(e) => handleOtpChange(e.target, index)}
                    onFocus={(e) => e.target.select()}
                    className="w-10 h-12 text-center border border-gray-300 rounded-md"
                  />
                ))}
              </div>
              <button
                onClick={handleResetOtp}
                className="w-full bg-primary-variant text-white p-3 rounded-md mt-4"
              >
                Verify OTP
              </button>
            </>
          )}
        </Modal>

        {/* Reset Password Modal */}
        <Modal open={isResetPasswordModalOpen} onClose={() => setIsResetPasswordModalOpen(false)} center>
          <h2 className="text-xl font-bold text-center">Reset Password</h2>
          <p className="text-center text-gray-600">Enter and confirm your new password.</p>
          <div className="mt-4">
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword}</p>
            )}</div>
          <div className="mt-4">
            <input
              type="password"
              placeholder="Retype Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>
            )}
          </div>
          <button
            onClick={handleResetPassword}
            className="w-full bg-primary-variant text-white p-3 rounded-md mt-4"
          >
            Reset Password
          </button>
        </Modal>

        {/* Image Section */}
        <div className="flex-1 hidden text-center bg-gray-100 lg:flex">
          <div className="flex items-center justify-center">
            <img
              src={loginbanner2}
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
