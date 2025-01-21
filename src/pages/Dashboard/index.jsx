import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsersBetweenLines, faSquareParking, faCarSide, faCommentDots, faCartFlatbed } from '@fortawesome/free-solid-svg-icons';
import employee from "@assets/employee.png";
import admin from "@assets/admin.png";


const Dashboard = () => {

 
  return (
    <div className="bg-orange-100">
      <div className="flex flex-col text-center mt-4">
        <img className="mx-auto rounded-full" width="200px" src={admin} alt="" /><br></br>
        <h1 className="text-2xl xl:text-3xl text-orange-600 font-extrabold">ADMIN DASHBOARD</h1><br></br>
        <div className="border-b-4 border-orange-600 w-full mx-auto "></div>
      </div>
      <div>
          <h1 className="text-2xl xl:text-3xl font-extrabold text-center mt-4">
                    System Analytics
         </h1>
      <div className="stats shadow ml-8 mt-4">
      <div className="stat" style={{ background: "#fc5e03", width: '400px' }}>
          <div className="stat-figure text-primary">
          <FontAwesomeIcon icon={faUsersBetweenLines} style={{ color: "#ffffff" }} size="2x" />
          </div>
          <div className="stat-title">Total Barangays</div>
          <div className="stat-value text-primary"></div>
         
        </div>

        <div className="stat" style={{ background: "#ffd3ad", width: '400px' }}>
          <div className="stat-figure text-secondary">
          <FontAwesomeIcon icon={faSquareParking} style={{ color: "#fc5e03" }} size="2x" />
          </div>
          <div className="stat-title">Total Parking Spaces</div>
          <div className="stat-value text-secondary"></div>
        
        </div>

        <div className="stat" style={{ background: "#ffb463",width: '400px' }}>
          <div className="stat-figure text-secondary">
          <FontAwesomeIcon icon={faCarSide} style={{ color: "#ffffff" }} size="2x" />
          </div>
          <div className="stat-title">Total Parking Slots</div>
          <div className="stat-value text-secondary"></div>
         
        </div>
      </div>
      </div>
      <div>
          <h1 className="text-2xl xl:text-3xl font-extrabold text-center mt-4">
                    User Analytics
         </h1>
      <div className="stats shadow ml-8 mt-4">
        <div className="stat" style={{ background: "#ffb463", width: '400px' }}>
          <div className="stat-figure text-secondary">
          <FontAwesomeIcon icon={faCarSide} style={{ color: "#ffffff" }} size="2x" />
          </div>
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-secondary"></div>
         
        </div>
        <div className="stat" style={{ background: "#ffd3ad", width: '400px' }}>
          <div className="stat-figure text-secondary">
          <FontAwesomeIcon icon={faCommentDots} style={{ color: "#fc5e03" }} size="2x" />
          </div>
          <div className="stat-title">Total Feedbacks</div>
          <div className="stat-value text-secondary"></div>
         
        </div>
        <div className="stat" style={{ background: "#fc5e03", width: '400px' }}>
          <div className="stat-figure text-secondary">
          <FontAwesomeIcon icon={faCartFlatbed} style={{ color: "#ffffff" }} size="2x" />
          </div>
          <div className="stat-title">Total Transactions</div>
          <div className="stat-value text-secondary"></div>
        </div>    
      </div>
      </div>
 
  <div className="flex flex-wrap mt-4">
  </div>
 </div>
  );
}

export default Dashboard;
