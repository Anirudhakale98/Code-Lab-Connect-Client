import React, { useState, useEffect } from "react";
import {
  AppBar, Toolbar, Grid, Card, CardContent, Avatar, Typography,
  Box, Button, TextField, Modal, IconButton
} from "@mui/material";
import { Close as CloseIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { styled } from "@mui/system";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import Dashboard from "../Dashboard";
import axiosInstance from "../../utils/axiosInstance.js";

const StyledCard = styled(Card)(({ color }) => ({
  background: color,
  color: "white",
  height: "180px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  borderRadius: "15px",
  boxShadow: "0 8px 20px rgba(0, 0, 0, 0.2)",
  transition: "transform 0.3s, box-shadow 0.3s",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.3)",
    cursor: "pointer", // Add cursor pointer to indicate clickable
  },
}));

const Classroom = () => {
  const [classes, setClasses] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [classroomId, setClassroomId] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userResponse = (await axiosInstance.get("/api/v1/users/me")).data;
        setUser(userResponse.data.user);

        const classesResponse = (await axiosInstance.get("/api/v1/students/classes")).data;
        setClasses(classesResponse.data || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleJoinClass = async () => {
    if (!classroomId.trim()) {
      setError("Class Code cannot be empty.");
      return;
    }
    try {
      const res = (await axiosInstance.post("/api/v1/students/join", { classroomId })).data;
      if (res.data) {
        setClasses((prevClasses) => [...prevClasses, res.data]);
      }
      setClassroomId("");
      setError("");
      setOpenModal(false);
    } catch (err) {
      setError("Failed to join class. Please check the class code.");
      console.error("Error joining class:", err);
    }
  };

  const handleDeleteClass = async (classroomId) => {
    try {
      const deletedClassRes = (await axiosInstance.post(`/api/v1/students/classes/${classroomId}/delete`)).data;
      setClasses((prevClasses) => prevClasses.filter((c) => c.classroomId !== classroomId));
    } catch (err) {
      console.error("Error deleting class:", err);
    }
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setClassroomId(""); // Clear the class code input field
    setError(""); // Clear any existing error message
  };

  const handleCardClick = (classroomId) => {
    navigate(`/students/classes/${classroomId}`); // Navigate to the class page
  };

  if (!user) return <Typography>Loading...</Typography>;

  return (
    <Box display="flex">
      <Dashboard user={user} classes={classes} />
      <Box flexGrow={1} p={3} sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <AppBar position="static" color="primary" sx={{ borderRadius: "10px", mb: 3 }}>
          <Toolbar>
            <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: "bold" }}>
              Code-Lab-Connect
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Join Class Button */}
        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button onClick={() => setOpenModal(true)} variant="contained" color="secondary">
            + Join Classroom
          </Button>
        </Box>

        {/* Displaying Joined Classes */}
        <Grid container spacing={4}>
          {classes.map((classItem, index) => (
            <Grid item xs={12} sm={6} md={4} key={classItem.classroomId || index}>
              <StyledCard
                color={classItem.color}
                onClick={() => handleCardClick(classItem.classroomId)} // Handle navigation
              >
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
                      {classItem.title}
                    </Typography>
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent card click when delete icon is clicked
                        handleDeleteClass(classItem.classroomId);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="subtitle1">{classItem.teacher}</Typography>
                </CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" px={2} pb={2}>
                  <Avatar sx={{ bgcolor: "#ffffff", color: "#000", fontWeight: "bold" }}>
                    {classItem.title[0]}
                  </Avatar>
                  <Typography variant="body2" sx={{ fontStyle: "italic", color: "rgba(244, 236, 236, 0.9)" }}>
                    {classItem.description}
                  </Typography>
                </Box>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        {/* Modal for Joining a Class */}
        <Modal open={openModal} onClose={handleModalClose}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", bgcolor: "white", p: 4, borderRadius: "10px", boxShadow: 24, width: "400px" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Join a Classroom</Typography>
              <IconButton onClick={handleModalClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            <TextField
              fullWidth
              label="Class Code"
              variant="outlined"
              sx={{ mb: 2 }}
              value={classroomId}
              onChange={(e) => setClassroomId(e.target.value)}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Box display="flex" justifyContent="flex-end" mt={2}>
              <Button onClick={handleJoinClass} variant="contained" color="primary">
                Join Classroom
              </Button>
            </Box>
          </Box>
        </Modal>

      </Box>
    </Box>
  );
};

export default Classroom;
