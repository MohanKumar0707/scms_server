import React, { useState } from "react";

function ComplaintForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  // input change handle
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // form submit handle
  const handleSubmit = async (e) => {
    e.preventDefault(); // page reload stop

    await fetch("http://localhost:3000/complaint", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(formData)
    });

    alert("Complaint submitted successfully");

    // clear form
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="name"
        placeholder="Name"
        required
        value={formData.name}
        onChange={handleChange}
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        value={formData.email}
        onChange={handleChange}
      />

      <textarea
        name="message"
        placeholder="Complaint"
        required
        value={formData.message}
        onChange={handleChange}
      ></textarea>

      <button type="submit">Submit</button>
    </form>
  );
}

export default ComplaintForm;
