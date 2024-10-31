// src/pages/Register.jsx
import React, { useState } from 'react';

const Register = () => {
  const [studentData, setStudentData] = useState({
    studentId: '',       // New field for student ID
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    contactNumber: '',
    department: '',
    course: '',
    yearLevel: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setStudentData({ ...studentData, [name]: value });
  };

  const handleRegister = (e) => {
    e.preventDefault();
    // Logic to register the student (e.g., call an API to save student data)
    console.log('Registering student with data:', studentData);
  };

  return (
    <div>
      <h2>Student Registration</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          name="studentId"
          value={studentData.studentId}
          onChange={handleChange}
          placeholder="Student ID"
          required
        />
        <input
          type="text"
          name="firstName"
          value={studentData.firstName}
          onChange={handleChange}
          placeholder="First Name"
          required
        />
        <input
          type="text"
          name="lastName"
          value={studentData.lastName}
          onChange={handleChange}
          placeholder="Last Name"
          required
        />
        <input
          type="email"
          name="email"
          value={studentData.email}
          onChange={handleChange}
          placeholder="Email"
          required
        />
        <input
          type="password"
          name="password"
          value={studentData.password}
          onChange={handleChange}
          placeholder="Password"
          required
        />
        <input
          type="text"
          name="contactNumber"
          value={studentData.contactNumber}
          onChange={handleChange}
          placeholder="Contact Number"
        />
        <input
          type="text"
          name="department"
          value={studentData.department}
          onChange={handleChange}
          placeholder="Department"
          required
        />
        <input
          type="text"
          name="course"
          value={studentData.course}
          onChange={handleChange}
          placeholder="Course"
          required
        />
        <input
          type="number"
          name="yearLevel"
          value={studentData.yearLevel}
          onChange={handleChange}
          placeholder="Year Level"
          required
        />
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
