import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Button,
  TextField,
  Modal,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogActions,
} from "@mui/material";
import { Close as CloseIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { styled } from "@mui/system";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance.js";
import Dashboard from "../Dashboard";

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
  },
}));

const StyledLink = styled(Link)({
  textDecoration: "none",
  color: "inherit",
});

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "white",
  boxShadow: 24,
  p: 4,
  borderRadius: "10px",
  width: "400px",
};

const ClassroomT = () => {
  const [classes, setClasses] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [newClass, setNewClass] = useState({ title: "", color: "linear-gradient(135deg, #607d8b, #455a64)", description: "" });
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const userResponse = (await axiosInstance.get("/api/v1/users/me")).data;
      setUser(userResponse.data?.user || null);

      const classesResponse = (await axiosInstance.get("/api/v1/teachers/classes")).data;
      setClasses(classesResponse.data?.classes || []);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddClass = async () => {
    if (!newClass.title.trim() || !newClass.description.trim()) {
      setError("Classroom Title and Description cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear previous error
      const res = (await axiosInstance.post("/api/v1/teachers/classes", newClass)).data;

      setClasses((prev) => [...prev, res.data.classroom]);
      setSnackbar({ open: true, message: "Class added successfully!", severity: "success" });
      setNewClass({ title: "", color: "linear-gradient(135deg, #607d8b, #455a64)", description: "" });
      setOpenModal(false);
    } catch (err) {
      console.error("Error adding class:", err);
      setSnackbar({ open: true, message: "Failed to add class!", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classroomId) => {
    try {
      await axiosInstance.post(`/api/v1/teachers/classes/${classroomId}/delete`);
      setClasses(classes.filter((classItem) => classItem.classroomId !== classroomId));
      setSnackbar({ open: true, message: "Class deleted successfully!", severity: "success" });
    } catch (err) {
      console.error("Error deleting class:", err);
      setSnackbar({ open: true, message: "Failed to delete class!", severity: "error" });
    } finally {
      setDeleteConfirmOpen(false);
      setClassToDelete(null);
    }
  };

  const handleOpenDeleteDialog = (classroomId) => {
    setClassToDelete(classroomId);
    setDeleteConfirmOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ open: false, message: "", severity: "success" });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setError(""); // Clear error message
    setNewClass({ title: "", color: "linear-gradient(135deg, #607d8b, #455a64)", description: "" }); // Reset the input fields
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

        <Box display="flex" justifyContent="flex-end" mb={3}>
          <Button onClick={() => setOpenModal(true)} variant="contained" color="secondary">
            + Add Class
          </Button>
        </Box>

        <Grid container spacing={4}>
          {classes.map((classItem, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <StyledCard color={classItem.color} component={StyledLink} to={`/teachers/classes/${classItem.classroomId}`} state={classItem}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                      {classItem.title}
                    </Typography>
                    <IconButton onClick={(e) => { e.preventDefault(); handleOpenDeleteDialog(classItem.classroomId); }} sx={{ color: "white" }}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </StyledCard>
            </Grid>
          ))}
        </Grid>

        <Modal open={openModal} onClose={handleCloseModal}>
          <Box sx={{ ...modalStyle }}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="h6">Add New Classroom</Typography>
              <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
            </Box>

            {/* Error message */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Classroom Title"
              value={newClass.title}
              onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
              sx={{ my: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={newClass.description}
              onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
            />
            <Button onClick={handleAddClass} variant="contained" sx={{ mt: 2 }} disabled={loading}>
              {loading ? "Adding..." : "Add Class"}
            </Button>
          </Box>
        </Modal>


        <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
          <DialogTitle>Are you sure you want to delete this class?</DialogTitle>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button onClick={() => handleDeleteClass(classToDelete)} color="error">Delete</Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleSnackbarClose}>
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default ClassroomT;
