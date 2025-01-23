import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import PulseSpinner from "../../../assets/common/spinner";
import { API_URL } from "../../../env";

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

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}users`);
      const customers = response.data.filter(user => user.role === 'Customer'); // Filter users with role 'customer'
      setUserList(customers);
      setUserFilter(customers);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const columns = [
    {
      name: "Image",
      selector: (row) => (
        <img
          src={
            row.customerDetails?.images?.[0] || "https://via.placeholder.com/150"
          }
          alt="User"
          className="w-10 h-10 rounded-full"
        />
      ),
      width: "100px",
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
      width: "200px",
    },
    {
      name: "Address",
      selector: (row) => `${row.street}, ${row.barangay}, ${row.city}`,
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <button
          onClick={() => navigate(`/admin/users/read/${row._id}`)}
          className="text-blue-600 hover:text-blue-800"
        >
          View
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
      <div className="bg-[#0B607E] text-white p-4 rounded-lg flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">ePharmacy</h1>
        </div>
        <button
          className="bg-white text-[#0B607E] px-4 py-2 rounded-md font-medium"
          onClick={() => navigate("/screens/Admin/Users/CreateUser")}
        >
          Create User
        </button>
      </div>

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

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <PulseSpinner />
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={userFilter}
            customStyles={customStyles}
            pagination
            highlightOnHover
          />
        )}
      </div>
    </div>
  );
};

export default UserTableScreen;
