import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import PulseSpinner from "../../../assets/common/spinner";
import { API_URL } from "../../../env";
import { toast } from "react-toastify";

const UserTableScreen = () => {
  const navigate = useNavigate();
  const [userList, setUserList] = useState([]);
  const [userFilter, setUserFilter] = useState([]);
  const [loading, setLoading] = useState(true);

  const searchUser = (text) => {
    if (text === "") {
      setUserFilter(userList);
    } else {
      setUserFilter(
        userList.filter((user) =>
          user.name.toLowerCase().includes(text.toLowerCase())
        )
      );
    }
  };

  const fetchAdmins = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}users/admins`);
      setUserList(response.data);
      setUserFilter(response.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();

    // Set interval to fetch data every 10 seconds
    const interval = setInterval(() => {
      fetchAdmins();
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [fetchAdmins]);

  const updateRole = async (id) => {
    setLoading(true);

    try {
      const res = await axios.put(`${API_URL}users/admins/updateRole/${id}`);

      toast.success("User role updated!");
      fetchAdmins()

    } catch (err) {

      // Show a specific error if it's about the last admin
      if (err.response?.status === 400 && err.response?.data?.message.includes("MIN")) {
        toast.error("THERE MUST BE ATLEAST ONE ADMIN REMAINING!");
      } else {
        toast.error("Failed to update user role");
      }

    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "200px",
    },
    {
      name: "Contact Number",
      selector: (row) => row.contactNumber || "N/A",
      sortable: true,
    },
    {
      name: "Email",
      selector: (row) => row.email || "N/A",
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => updateRole(row._id)}
          className="text-red-600 hover:text-red-800"
        >
          REMOVE AS AN ADMIN
        </button>
      ),
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: "#0B607E",
        color: "white",
      },
    },
    rows: {
      style: {
        backgroundColor: "#F9FAFB",
      },
      highlightOnHoverStyle: {
        backgroundColor: "#E5E7EB",
        transition: "all 0.3s ease",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {loading ? (
          <PulseSpinner />
      ) : (
        <>
          {/* Header */}
          <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admins</h1>
          </div>

          {/* Search Input */}
          <div className="mt-6">
            <div className="flex mb-4">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search Name"
                  className="border rounded-md p-2 w-full"
                  onChange={(e) => searchUser(e.target.value)}
                  onKeyUp={(e) => searchUser(e.target.value)}
                />
              </div>
            </div>

            {/* Data Table */}
            <DataTable
              columns={columns}
              data={userFilter}
              customStyles={customStyles}
              pagination
              highlightOnHover
            />
          </div>
        </>
      )}
    </div>
  );
};

export default UserTableScreen;
