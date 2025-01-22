import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsersBetweenLines,
  faTags,
  faPills,
  faHospital,
  faBarcode,
  faClipboardCheck
} from "@fortawesome/free-solid-svg-icons";

const Dashboard = () => {
  return (
    <div className="bg-primary-t4 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex flex-col text-center mt-4">
        <h1 className="text-2xl xl:text-3xl text-primary-default font-extrabold">
          ADMIN DASHBOARD
        </h1>
      </div>

      {/* Total Analytics */}
      <div>
        <div className="flex flex-wrap justify-center gap-4 mt-6">
          {/* Total Barangays */}
          <div
            className="stat bg-primary-default text-primary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faUsersBetweenLines} size="2x" />
            <div className="stat-title mt-2">Total Users</div>
            <div className="stat-value text-lg">--</div>
          </div>

          {/* Total Parking Spaces */}
          <div
            className="stat bg-primary-variant text-primary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faHospital} size="2x" />
            <div className="stat-title mt-2">Total Pharmacies</div>
            <div className="stat-value text-lg">--</div>
          </div>

          {/* Total Parking Slots */}
          <div
            className="stat bg-primary-accent text-primary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faPills} size="2x" />
            <div className="stat-title mt-2">Total Medicines</div>
            <div className="stat-value text-lg">--</div>
          </div>

          {/* Total Users */}
          <div
            className="stat bg-secondary-default text-secondary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faTags} size="2x" />
            <div className="stat-title mt-2">Total Categories</div>
            <div className="stat-value text-lg">--</div>
          </div>

          {/* Total Feedbacks */}
          <div
            className="stat bg-secondary-variant text-secondary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faBarcode} size="2x" />
            <div className="stat-title mt-2">Scanned Medicines</div>
            <div className="stat-value text-lg">--</div>
          </div>

          {/* Total Transactions */}
          <div
            className="stat bg-secondary-accent text-secondary-t5 flex flex-col justify-center items-center rounded-lg shadow-lg"
            style={{ flex: "1 1 14%", maxWidth: "14%", minHeight: "180px" }}
          >
            <FontAwesomeIcon icon={faClipboardCheck} size="2x" />
            <div className="stat-title mt-2">Pending Pharmacies</div>
            <div className="stat-value text-lg">--</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
